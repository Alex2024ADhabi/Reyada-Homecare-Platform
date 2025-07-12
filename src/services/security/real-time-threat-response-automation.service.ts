/**
 * Real-Time Threat Response Automation Service
 * Implements automated threat response workflows and incident management
 * Part of Phase 4: Security Hardening - Threat Detection
 */

import { EventEmitter } from "eventemitter3";

// Threat Response Types
export interface ThreatResponse {
  id: string;
  threatId: string;
  responseType: "automated" | "manual" | "hybrid";
  status: "pending" | "executing" | "completed" | "failed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  actions: ResponseAction[];
  timeline: ResponseTimeline[];
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
  effectiveness: number; // 0-100
}

export interface ResponseAction {
  id: string;
  type: "isolate" | "block" | "quarantine" | "alert" | "investigate" | "remediate" | "escalate";
  target: string;
  parameters: Record<string, any>;
  status: "pending" | "executing" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  result?: ActionResult;
  dependencies: string[];
  timeout: number; // seconds
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, any>;
  metrics?: {
    executionTime: number;
    resourcesUsed: string[];
    impact: string;
  };
}

export interface ResponseTimeline {
  timestamp: string;
  event: string;
  details: string;
  actor: "system" | "user" | "automation";
  status: "info" | "warning" | "error" | "success";
}

export interface ResponsePlaybook {
  id: string;
  name: string;
  description: string;
  threatTypes: string[];
  severity: string[];
  conditions: PlaybookCondition[];
  actions: PlaybookAction[];
  enabled: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  usage: {
    timesExecuted: number;
    successRate: number;
    averageExecutionTime: number;
  };
}

export interface PlaybookCondition {
  type: "threat_type" | "severity" | "confidence" | "asset" | "time" | "custom";
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
  value: any;
  weight: number;
}

export interface PlaybookAction {
  id: string;
  type: ResponseAction["type"];
  name: string;
  description: string;
  parameters: Record<string, any>;
  conditions: PlaybookCondition[];
  timeout: number;
  retries: number;
  dependencies: string[];
  rollback?: PlaybookAction;
}

export interface IncidentTicket {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "closed";
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  threatIds: string[];
  responseIds: string[];
  tags: string[];
  comments: IncidentComment[];
  attachments: IncidentAttachment[];
}

export interface IncidentComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: "comment" | "status_change" | "assignment" | "escalation";
}

export interface IncidentAttachment {
  id: string;
  filename: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggers: AutomationTrigger[];
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  cooldown: number; // seconds
  maxExecutions: number;
  executionCount: number;
  lastExecuted?: string;
  createdAt: string;
}

export interface AutomationTrigger {
  type: "threat_detected" | "severity_change" | "time_based" | "manual" | "external";
  parameters: Record<string, any>;
}

export interface AutomationCondition {
  type: "threat_type" | "severity" | "confidence" | "time_window" | "asset_type";
  operator: string;
  value: any;
}

export interface AutomationAction {
  type: "execute_playbook" | "create_ticket" | "send_notification" | "block_ip" | "isolate_system";
  parameters: Record<string, any>;
  delay?: number;
}

export interface ResponseMetrics {
  totalResponses: number;
  automatedResponses: number;
  manualResponses: number;
  averageResponseTime: number;
  successRate: number;
  falsePositiveRate: number;
  escalationRate: number;
  mttr: number; // Mean Time To Resolution
  responsesByType: Record<string, number>;
  responsesBySeverity: Record<string, number>;
}

class RealTimeThreatResponseAutomationService extends EventEmitter {
  private threatResponses: Map<string, ThreatResponse> = new Map();
  private responsePlaybooks: Map<string, ResponsePlaybook> = new Map();
  private incidentTickets: Map<string, IncidentTicket> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private isInitialized = false;
  private responseQueue: string[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private executionEngine: any = null;

  constructor() {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("⚡ Initializing Real-Time Threat Response Automation Service...");

      // Load default playbooks
      await this.loadDefaultPlaybooks();

      // Load automation rules
      await this.loadAutomationRules();

      // Initialize execution engine
      this.initializeExecutionEngine();

      // Start response processing
      this.startResponseProcessing();

      this.isInitialized = true;
      this.emit("service:initialized");

      console.log("✅ Real-Time Threat Response Automation Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Real-Time Threat Response Automation Service:", error);
      throw error;
    }
  }

  /**
   * Trigger automated threat response
   */
  async triggerThreatResponse(
    threatId: string,
    threatData: {
      type: string;
      severity: string;
      confidence: number;
      affectedAssets: string[];
      evidence: any[];
    }
  ): Promise<ThreatResponse> {
    try {
      const responseId = this.generateResponseId();
      const timestamp = new Date().toISOString();

      // Find matching playbooks
      const matchingPlaybooks = await this.findMatchingPlaybooks(threatData);

      // Select best playbook
      const selectedPlaybook = this.selectBestPlaybook(matchingPlaybooks, threatData);

      if (!selectedPlaybook) {
        throw new Error("No suitable playbook found for threat");
      }

      // Create response actions from playbook
      const actions = await this.createResponseActions(selectedPlaybook, threatData);

      const response: ThreatResponse = {
        id: responseId,
        threatId,
        responseType: "automated",
        status: "pending",
        priority: this.determinePriority(threatData.severity),
        actions,
        timeline: [
          {
            timestamp,
            event: "Response Created",
            details: `Automated response created using playbook: ${selectedPlaybook.name}`,
            actor: "system",
            status: "info",
          },
        ],
        createdAt: timestamp,
        effectiveness: 0,
      };

      this.threatResponses.set(responseId, response);

      // Add to processing queue
      this.responseQueue.push(responseId);

      // Update playbook usage
      selectedPlaybook.usage.timesExecuted++;

      this.emit("response:created", response);
      console.log(`⚡ Threat response created: ${responseId} for threat ${threatId}`);

      return response;
    } catch (error) {
      console.error("❌ Failed to trigger threat response:", error);
      throw error;
    }
  }

  /**
   * Execute response action
   */
  async executeResponseAction(responseId: string, actionId: string): Promise<ActionResult> {
    try {
      const response = this.threatResponses.get(responseId);
      if (!response) {
        throw new Error(`Response not found: ${responseId}`);
      }

      const action = response.actions.find(a => a.id === actionId);
      if (!action) {
        throw new Error(`Action not found: ${actionId}`);
      }

      // Check dependencies
      const dependenciesMet = await this.checkActionDependencies(response, action);
      if (!dependenciesMet) {
        throw new Error("Action dependencies not met");
      }

      // Execute action
      action.status = "executing";
      action.startedAt = new Date().toISOString();

      const result = await this.executeAction(action);

      action.status = result.success ? "completed" : "failed";
      action.completedAt = new Date().toISOString();
      action.result = result;

      // Update response timeline
      response.timeline.push({
        timestamp: new Date().toISOString(),
        event: `Action ${result.success ? "Completed" : "Failed"}`,
        details: `${action.type}: ${result.message}`,
        actor: "system",
        status: result.success ? "success" : "error",
      });

      this.emit("action:executed", { response, action, result });
      return result;
    } catch (error) {
      console.error("❌ Failed to execute response action:", error);
      throw error;
    }
  }

  /**
   * Create incident ticket
   */
  async createIncidentTicket(
    threatIds: string[],
    responseIds: string[],
    ticketData: {
      title: string;
      description: string;
      severity: IncidentTicket["severity"];
      assignedTo: string;
      tags?: string[];
    }
  ): Promise<IncidentTicket> {
    try {
      const ticketId = this.generateTicketId();
      const timestamp = new Date().toISOString();

      const ticket: IncidentTicket = {
        id: ticketId,
        title: ticketData.title,
        description: ticketData.description,
        severity: ticketData.severity,
        status: "open",
        assignedTo: ticketData.assignedTo,
        createdBy: "system",
        createdAt: timestamp,
        updatedAt: timestamp,
        threatIds,
        responseIds,
        tags: ticketData.tags || [],
        comments: [],
        attachments: [],
      };

      this.incidentTickets.set(ticketId, ticket);

      this.emit("ticket:created", ticket);
      console.log(`🎫 Incident ticket created: ${ticketId}`);

      return ticket;
    } catch (error) {
      console.error("❌ Failed to create incident ticket:", error);
      throw error;
    }
  }

  /**
   * Create response playbook
   */
  async createResponsePlaybook(
    playbookData: Omit<ResponsePlaybook, "id" | "createdAt" | "updatedAt" | "usage">
  ): Promise<ResponsePlaybook> {
    try {
      const playbookId = this.generatePlaybookId();
      const timestamp = new Date().toISOString();

      const playbook: ResponsePlaybook = {
        ...playbookData,
        id: playbookId,
        createdAt: timestamp,
        updatedAt: timestamp,
        usage: {
          timesExecuted: 0,
          successRate: 0,
          averageExecutionTime: 0,
        },
      };

      this.responsePlaybooks.set(playbookId, playbook);

      this.emit("playbook:created", playbook);
      console.log(`📖 Response playbook created: ${playbook.name}`);

      return playbook;
    } catch (error) {
      console.error("❌ Failed to create response playbook:", error);
      throw error;
    }
  }

  /**
   * Get response metrics
   */
  getResponseMetrics(): ResponseMetrics {
    const responses = Array.from(this.threatResponses.values());
    const tickets = Array.from(this.incidentTickets.values());

    const automated = responses.filter(r => r.responseType === "automated").length;
    const manual = responses.filter(r => r.responseType === "manual").length;

    const completedResponses = responses.filter(r => r.status === "completed");
    const successfulResponses = completedResponses.filter(r => r.effectiveness >= 80);

    const responseTimes = completedResponses
      .filter(r => r.completedAt)
      .map(r => new Date(r.completedAt!).getTime() - new Date(r.createdAt).getTime());

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 1000
      : 0;

    const resolvedTickets = tickets.filter(t => t.status === "resolved" || t.status === "closed");
    const resolutionTimes = resolvedTickets
      .filter(t => t.resolvedAt)
      .map(t => new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime());

    const mttr = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length / 1000 / 60
      : 0;

    const responsesByType: Record<string, number> = {};
    const responsesBySeverity: Record<string, number> = {};

    responses.forEach(response => {
      responsesByType[response.responseType] = (responsesByType[response.responseType] || 0) + 1;
      responsesBySeverity[response.priority] = (responsesBySeverity[response.priority] || 0) + 1;
    });

    return {
      totalResponses: responses.length,
      automatedResponses: automated,
      manualResponses: manual,
      averageResponseTime,
      successRate: completedResponses.length > 0 ? (successfulResponses.length / completedResponses.length) * 100 : 0,
      falsePositiveRate: 2.3, // Simulated
      escalationRate: 15.7, // Simulated
      mttr,
      responsesByType,
      responsesBySeverity,
    };
  }

  /**
   * Get active responses
   */
  getActiveResponses(): ThreatResponse[] {
    return Array.from(this.threatResponses.values())
      .filter(response => response.status === "executing" || response.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get recent incident tickets
   */
  getRecentIncidentTickets(limit: number = 50): IncidentTicket[] {
    return Array.from(this.incidentTickets.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Private helper methods
  private async loadDefaultPlaybooks(): Promise<void> {
    const defaultPlaybooks: Omit<ResponsePlaybook, "id" | "createdAt" | "updatedAt" | "usage">[] = [
      {
        name: "Malware Containment",
        description: "Automated response for malware detection",
        threatTypes: ["malware"],
        severity: ["high", "critical"],
        conditions: [
          { type: "threat_type", operator: "equals", value: "malware", weight: 1.0 },
          { type: "confidence", operator: "greater_than", value: 80, weight: 0.8 },
        ],
        actions: [
          {
            id: "isolate-system",
            type: "isolate",
            name: "Isolate Infected System",
            description: "Isolate the infected system from the network",
            parameters: { method: "network_isolation", duration: 3600 },
            conditions: [],
            timeout: 300,
            retries: 3,
            dependencies: [],
          },
          {
            id: "scan-system",
            type: "investigate",
            name: "Full System Scan",
            description: "Perform comprehensive malware scan",
            parameters: { scan_type: "full", quarantine: true },
            conditions: [],
            timeout: 1800,
            retries: 1,
            dependencies: ["isolate-system"],
          },
          {
            id: "alert-team",
            type: "alert",
            name: "Alert Security Team",
            description: "Notify security team of malware detection",
            parameters: { urgency: "high", channels: ["email", "slack"] },
            conditions: [],
            timeout: 60,
            retries: 2,
            dependencies: [],
          },
        ],
        enabled: true,
        version: "1.0.0",
      },
      {
        name: "DDoS Mitigation",
        description: "Automated DDoS attack response",
        threatTypes: ["ddos"],
        severity: ["medium", "high", "critical"],
        conditions: [
          { type: "threat_type", operator: "equals", value: "ddos", weight: 1.0 },
        ],
        actions: [
          {
            id: "enable-protection",
            type: "block",
            name: "Enable DDoS Protection",
            description: "Activate DDoS protection mechanisms",
            parameters: { protection_level: "high", auto_scale: true },
            conditions: [],
            timeout: 120,
            retries: 2,
            dependencies: [],
          },
          {
            id: "block-ips",
            type: "block",
            name: "Block Attacking IPs",
            description: "Block identified attacking IP addresses",
            parameters: { block_duration: 7200, whitelist_check: true },
            conditions: [],
            timeout: 300,
            retries: 1,
            dependencies: ["enable-protection"],
          },
          {
            id: "scale-infrastructure",
            type: "remediate",
            name: "Scale Infrastructure",
            description: "Auto-scale infrastructure to handle load",
            parameters: { scale_factor: 2, max_instances: 10 },
            conditions: [],
            timeout: 600,
            retries: 1,
            dependencies: [],
          },
        ],
        enabled: true,
        version: "1.0.0",
      },
      {
        name: "Data Breach Response",
        description: "Response to data exfiltration attempts",
        threatTypes: ["data_exfiltration"],
        severity: ["high", "critical"],
        conditions: [
          { type: "threat_type", operator: "equals", value: "data_exfiltration", weight: 1.0 },
          { type: "severity", operator: "in", value: ["high", "critical"], weight: 0.9 },
        ],
        actions: [
          {
            id: "block-transfer",
            type: "block",
            name: "Block Data Transfer",
            description: "Immediately block suspicious data transfers",
            parameters: { block_type: "network", scope: "user_session" },
            conditions: [],
            timeout: 60,
            retries: 3,
            dependencies: [],
          },
          {
            id: "quarantine-user",
            type: "quarantine",
            name: "Quarantine User Account",
            description: "Temporarily suspend user account",
            parameters: { duration: 3600, notify_user: false },
            conditions: [],
            timeout: 120,
            retries: 2,
            dependencies: ["block-transfer"],
          },
          {
            id: "escalate-incident",
            type: "escalate",
            name: "Escalate to CISO",
            description: "Immediately escalate to Chief Information Security Officer",
            parameters: { urgency: "critical", include_evidence: true },
            conditions: [],
            timeout: 300,
            retries: 1,
            dependencies: [],
          },
        ],
        enabled: true,
        version: "1.0.0",
      },
    ];

    for (const playbookData of defaultPlaybooks) {
      await this.createResponsePlaybook(playbookData);
    }
  }

  private async loadAutomationRules(): Promise<void> {
    const defaultRules: Omit<AutomationRule, "id" | "executionCount" | "lastExecuted" | "createdAt">[] = [
      {
        name: "Critical Threat Auto-Response",
        description: "Automatically respond to critical threats",
        enabled: true,
        triggers: [
          { type: "threat_detected", parameters: { severity: "critical" } },
        ],
        conditions: [
          { type: "confidence", operator: "greater_than", value: 90 },
        ],
        actions: [
          { type: "execute_playbook", parameters: { auto_select: true } },
          { type: "create_ticket", parameters: { priority: "critical" } },
        ],
        cooldown: 300,
        maxExecutions: 100,
      },
      {
        name: "High Volume Alert Suppression",
        description: "Suppress duplicate alerts within time window",
        enabled: true,
        triggers: [
          { type: "threat_detected", parameters: {} },
        ],
        conditions: [
          { type: "time_window", operator: "less_than", value: 300 },
        ],
        actions: [
          { type: "send_notification", parameters: { suppress_duplicates: true } },
        ],
        cooldown: 60,
        maxExecutions: 50,
      },
    ];

    for (const ruleData of defaultRules) {
      const rule: AutomationRule = {
        ...ruleData,
        id: this.generateRuleId(),
        executionCount: 0,
        createdAt: new Date().toISOString(),
      };
      this.automationRules.set(rule.id, rule);
    }

    console.log(`🤖 Loaded ${this.automationRules.size} automation rules`);
  }

  private initializeExecutionEngine(): void {
    this.executionEngine = {
      isolate: async (parameters: any) => {
        console.log(`🔒 Isolating system with parameters:`, parameters);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate isolation
        return { success: true, message: "System isolated successfully" };
      },
      block: async (parameters: any) => {
        console.log(`🚫 Blocking with parameters:`, parameters);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate blocking
        return { success: true, message: "Block action completed" };
      },
      quarantine: async (parameters: any) => {
        console.log(`🏥 Quarantining with parameters:`, parameters);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate quarantine
        return { success: true, message: "Quarantine action completed" };
      },
      alert: async (parameters: any) => {
        console.log(`🚨 Sending alert with parameters:`, parameters);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate alert
        return { success: true, message: "Alert sent successfully" };
      },
      investigate: async (parameters: any) => {
        console.log(`🔍 Investigating with parameters:`, parameters);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate investigation
        return { success: true, message: "Investigation completed" };
      },
      remediate: async (parameters: any) => {
        console.log(`🔧 Remediating with parameters:`, parameters);
        await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate remediation
        return { success: true, message: "Remediation completed" };
      },
      escalate: async (parameters: any) => {
        console.log(`📈 Escalating with parameters:`, parameters);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate escalation
        return { success: true, message: "Escalation completed" };
      },
    };

    console.log("⚙️ Execution engine initialized");
  }

  private startResponseProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processResponseQueue();
    }, 5000);

    console.log("⚡ Response processing started");
  }

  private async processResponseQueue(): Promise<void> {
    if (this.responseQueue.length === 0) return;

    const responseId = this.responseQueue.shift();
    if (!responseId) return;

    const response = this.threatResponses.get(responseId);
    if (!response) return;

    try {
      await this.executeResponse(response);
    } catch (error) {
      console.error(`❌ Failed to execute response ${responseId}:`, error);
      response.status = "failed";
    }
  }

  private async executeResponse(response: ThreatResponse): Promise<void> {
    response.status = "executing";

    const startTime = Date.now();
    let successfulActions = 0;

    for (const action of response.actions) {
      try {
        const result = await this.executeResponseAction(response.id, action.id);
        if (result.success) {
          successfulActions++;
        }
      } catch (error) {
        console.error(`❌ Action ${action.id} failed:`, error);
      }
    }

    const executionTime = Date.now() - startTime;
    response.effectiveness = (successfulActions / response.actions.length) * 100;
    response.status = response.effectiveness >= 80 ? "completed" : "failed";
    response.completedAt = new Date().toISOString();

    response.timeline.push({
      timestamp: new Date().toISOString(),
      event: "Response Completed",
      details: `Response ${response.status} with ${response.effectiveness.toFixed(1)}% effectiveness`,
      actor: "system",
      status: response.status === "completed" ? "success" : "error",
    });

    this.emit("response:completed", response);
  }

  private async findMatchingPlaybooks(threatData: any): Promise<ResponsePlaybook[]> {
    const matchingPlaybooks: ResponsePlaybook[] = [];

    for (const playbook of this.responsePlaybooks.values()) {
      if (!playbook.enabled) continue;

      let score = 0;
      let totalWeight = 0;

      for (const condition of playbook.conditions) {
        totalWeight += condition.weight;

        if (this.evaluateCondition(condition, threatData)) {
          score += condition.weight;
        }
      }

      // Require at least 70% condition match
      if (totalWeight > 0 && (score / totalWeight) >= 0.7) {
        matchingPlaybooks.push(playbook);
      }
    }

    return matchingPlaybooks.sort((a, b) => b.usage.successRate - a.usage.successRate);
  }

  private selectBestPlaybook(playbooks: ResponsePlaybook[], threatData: any): ResponsePlaybook | null {
    if (playbooks.length === 0) return null;

    // Select playbook with highest success rate and most recent usage
    return playbooks.reduce((best, current) => {
      const bestScore = best.usage.successRate * 0.7 + (best.usage.timesExecuted > 0 ? 0.3 : 0);
      const currentScore = current.usage.successRate * 0.7 + (current.usage.timesExecuted > 0 ? 0.3 : 0);
      
      return currentScore > bestScore ? current : best;
    });
  }

  private async createResponseActions(playbook: ResponsePlaybook, threatData: any): Promise<ResponseAction[]> {
    return playbook.actions.map(playbookAction => ({
      id: this.generateActionId(),
      type: playbookAction.type,
      target: threatData.affectedAssets[0] || "unknown",
      parameters: { ...playbookAction.parameters, threatData },
      status: "pending",
      dependencies: playbookAction.dependencies,
      timeout: playbookAction.timeout,
    }));
  }

  private determinePriority(severity: string): ThreatResponse["priority"] {
    switch (severity.toLowerCase()) {
      case "critical": return "critical";
      case "high": return "high";
      case "medium": return "medium";
      default: return "low";
    }
  }

  private async checkActionDependencies(response: ThreatResponse, action: ResponseAction): Promise<boolean> {
    if (action.dependencies.length === 0) return true;

    return action.dependencies.every(depId => {
      const dependency = response.actions.find(a => a.id === depId);
      return dependency && dependency.status === "completed";
    });
  }

  private async executeAction(action: ResponseAction): Promise<ActionResult> {
    const executor = this.executionEngine[action.type];
    if (!executor) {
      return {
        success: false,
        message: `No executor found for action type: ${action.type}`,
      };
    }

    try {
      const result = await Promise.race([
        executor(action.parameters),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Action timeout")), action.timeout * 1000)
        ),
      ]);

      return result as ActionResult;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private evaluateCondition(condition: PlaybookCondition, data: any): boolean {
    const value = this.getConditionValue(condition.type, data);
    
    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "greater_than":
        return typeof value === "number" && value > condition.value;
      case "less_than":
        return typeof value === "number" && value < condition.value;
      case "contains":
        return typeof value === "string" && value.includes(condition.value);
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(value);
      default:
        return false;
    }
  }

  private getConditionValue(type: string, data: any): any {
    switch (type) {
      case "threat_type":
        return data.type;
      case "severity":
        return data.severity;
      case "confidence":
        return data.confidence;
      case "asset":
        return data.affectedAssets;
      default:
        return null;
    }
  }

  private generateResponseId(): string {
    return `RSP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTicketId(): string {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePlaybookId(): string {
    return `PBK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRuleId(): string {
    return `RUL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.processingInterval) {
        clearInterval(this.processingInterval);
        this.processingInterval = null;
      }

      this.removeAllListeners();
      console.log("⚡ Real-Time Threat Response Automation Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during threat response automation service shutdown:", error);
    }
  }
}

export const realTimeThreatResponseAutomationService = new RealTimeThreatResponseAutomationService();
export default realTimeThreatResponseAutomationService;