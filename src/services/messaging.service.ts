/**
 * Advanced Messaging Service for Microservices Communication
 * Implements event-driven architecture with message queue system
 * Supports async operations, pub/sub patterns, and service orchestration
 */

import { EventEmitter } from "eventemitter3";
import {
  WEBSOCKET_CONFIG,
  PUBSUB_CHANNELS,
  MESSAGE_TYPES,
  COMMUNICATION_SETTINGS,
} from "../config/messaging.config";
import { crossModuleSync } from "../api/cross-module-sync.api";

// Message Queue Interfaces
export interface QueueMessage {
  id: string;
  type: string;
  payload: any;
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
  source: string;
  destination?: string;
  retryCount: number;
  maxRetries: number;
  ttl?: number;
  correlationId?: string;
  replyTo?: string;
  headers?: Record<string, any>;
  metadata?: {
    traceId?: string;
    spanId?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
  };
}

export interface MessageHandler {
  (message: QueueMessage): Promise<any>;
}

export interface ServiceEndpoint {
  id: string;
  name: string;
  type: "http" | "websocket" | "grpc" | "queue";
  url: string;
  healthCheck: string;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: "linear" | "exponential" | "fixed";
    initialDelay: number;
    maxDelay: number;
  };
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
  };
}

export interface EventPattern {
  pattern: string;
  handler: MessageHandler;
  options?: {
    priority?: "low" | "medium" | "high" | "critical";
    persistent?: boolean;
    exclusive?: boolean;
    autoAck?: boolean;
  };
}

// Advanced Message Queue Implementation
export class MessageQueue extends EventEmitter {
  private queues: Map<string, QueueMessage[]> = new Map();
  private handlers: Map<string, MessageHandler[]> = new Map();
  private deadLetterQueue: QueueMessage[] = [];
  private processing: Map<string, boolean> = new Map();
  private metrics: Map<string, any> = new Map();
  private circuitBreakers: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeQueues();
    this.startProcessing();
    this.setupHealthMonitoring();
  }

  /**
   * Initialize default queues
   */
  private initializeQueues(): void {
    const defaultQueues = [
      "patient.events",
      "clinical.events",
      "compliance.events",
      "notification.events",
      "system.events",
      "integration.events",
      "analytics.events",
    ];

    defaultQueues.forEach((queueName) => {
      this.queues.set(queueName, []);
      this.processing.set(queueName, false);
      this.metrics.set(queueName, {
        messagesProcessed: 0,
        messagesFailedPermanently: 0,
        averageProcessingTime: 0,
        lastProcessedAt: null,
        queueDepth: 0,
      });
    });
  }

  /**
   * Publish message to queue
   */
  async publish(
    queueName: string,
    messageType: string,
    payload: any,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      ttl?: number;
      correlationId?: string;
      replyTo?: string;
      headers?: Record<string, any>;
      metadata?: any;
    } = {},
  ): Promise<string> {
    const messageId = this.generateMessageId();

    const message: QueueMessage = {
      id: messageId,
      type: messageType,
      payload,
      priority: options.priority || "medium",
      timestamp: new Date().toISOString(),
      source: "messaging-service",
      retryCount: 0,
      maxRetries: this.getMaxRetries(options.priority || "medium"),
      ttl: options.ttl,
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      headers: options.headers,
      metadata: {
        traceId: this.generateTraceId(),
        ...options.metadata,
      },
    };

    // Ensure queue exists
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.processing.set(queueName, false);
    }

    // Add to queue with priority ordering
    const queue = this.queues.get(queueName)!;
    this.insertByPriority(queue, message);

    // Update metrics
    const metrics = this.metrics.get(queueName);
    if (metrics) {
      metrics.queueDepth = queue.length;
    }

    // Emit event
    this.emit("message.published", {
      queueName,
      messageId,
      messageType,
      priority: message.priority,
    });

    // Trigger processing
    this.processQueue(queueName);

    return messageId;
  }

  /**
   * Subscribe to message pattern
   */
  subscribe(
    pattern: string,
    handler: MessageHandler,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      persistent?: boolean;
      exclusive?: boolean;
      autoAck?: boolean;
    } = {},
  ): void {
    if (!this.handlers.has(pattern)) {
      this.handlers.set(pattern, []);
    }

    this.handlers.get(pattern)!.push(handler);

    this.emit("subscription.added", {
      pattern,
      handlerCount: this.handlers.get(pattern)!.length,
      options,
    });
  }

  /**
   * Process queue messages
   */
  private async processQueue(queueName: string): Promise<void> {
    if (this.processing.get(queueName)) {
      return; // Already processing
    }

    this.processing.set(queueName, true);
    const queue = this.queues.get(queueName);

    if (!queue || queue.length === 0) {
      this.processing.set(queueName, false);
      return;
    }

    try {
      while (queue.length > 0) {
        const message = queue.shift()!;

        // Check TTL
        if (this.isMessageExpired(message)) {
          this.handleExpiredMessage(message);
          continue;
        }

        const startTime = Date.now();

        try {
          await this.processMessage(message);

          // Update metrics
          const processingTime = Date.now() - startTime;
          this.updateMetrics(queueName, processingTime, true);

          this.emit("message.processed", {
            queueName,
            messageId: message.id,
            processingTime,
          });
        } catch (error) {
          await this.handleMessageError(queueName, message, error);
        }
      }
    } finally {
      this.processing.set(queueName, false);
    }
  }

  /**
   * Process individual message
   */
  private async processMessage(message: QueueMessage): Promise<void> {
    const matchingHandlers = this.findMatchingHandlers(message.type);

    if (matchingHandlers.length === 0) {
      throw new Error(`No handlers found for message type: ${message.type}`);
    }

    // Execute handlers in parallel for better performance
    const handlerPromises = matchingHandlers.map(async (handler) => {
      try {
        const result = await handler(message);

        // Handle reply-to pattern
        if (message.replyTo && result) {
          await this.publish(message.replyTo, `${message.type}.reply`, result, {
            correlationId: message.correlationId,
            headers: { originalMessageId: message.id },
          });
        }

        return result;
      } catch (error) {
        console.error(`Handler error for message ${message.id}:`, error);
        throw error;
      }
    });

    await Promise.all(handlerPromises);
  }

  /**
   * Handle message processing errors
   */
  private async handleMessageError(
    queueName: string,
    message: QueueMessage,
    error: any,
  ): Promise<void> {
    message.retryCount++;

    if (message.retryCount < message.maxRetries) {
      // Calculate backoff delay
      const delay = this.calculateBackoffDelay(message.retryCount);

      // Re-queue with delay
      setTimeout(() => {
        const queue = this.queues.get(queueName);
        if (queue) {
          this.insertByPriority(queue, message);
          this.processQueue(queueName);
        }
      }, delay);

      this.emit("message.retry", {
        queueName,
        messageId: message.id,
        retryCount: message.retryCount,
        delay,
      });
    } else {
      // Move to dead letter queue
      this.deadLetterQueue.push({
        ...message,
        metadata: {
          ...message.metadata,
          failureReason: error.message,
          failedAt: new Date().toISOString(),
        },
      });

      this.updateMetrics(queueName, 0, false);

      this.emit("message.failed", {
        queueName,
        messageId: message.id,
        error: error.message,
        retryCount: message.retryCount,
      });
    }
  }

  /**
   * Find handlers matching message type pattern
   */
  private findMatchingHandlers(messageType: string): MessageHandler[] {
    const matchingHandlers: MessageHandler[] = [];

    for (const [pattern, handlers] of this.handlers.entries()) {
      if (this.matchesPattern(messageType, pattern)) {
        matchingHandlers.push(...handlers);
      }
    }

    return matchingHandlers;
  }

  /**
   * Check if message type matches pattern
   */
  private matchesPattern(messageType: string, pattern: string): boolean {
    // Convert pattern to regex (support wildcards)
    const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(messageType);
  }

  /**
   * Insert message by priority
   */
  private insertByPriority(queue: QueueMessage[], message: QueueMessage): void {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const messagePriority = priorityOrder[message.priority];

    let insertIndex = queue.length;
    for (let i = 0; i < queue.length; i++) {
      const queuePriority = priorityOrder[queue[i].priority];
      if (messagePriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }

    queue.splice(insertIndex, 0, message);
  }

  /**
   * Check if message is expired
   */
  private isMessageExpired(message: QueueMessage): boolean {
    if (!message.ttl) return false;

    const messageTime = new Date(message.timestamp).getTime();
    const now = Date.now();

    return now - messageTime > message.ttl;
  }

  /**
   * Handle expired message
   */
  private handleExpiredMessage(message: QueueMessage): void {
    this.emit("message.expired", {
      messageId: message.id,
      messageType: message.type,
      expiredAt: new Date().toISOString(),
    });
  }

  /**
   * Calculate backoff delay for retries
   */
  private calculateBackoffDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, retryCount - 1),
      maxDelay,
    );

    // Add jitter (±25%)
    const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);

    return Math.max(exponentialDelay + jitter, 100);
  }

  /**
   * Update queue metrics
   */
  private updateMetrics(
    queueName: string,
    processingTime: number,
    success: boolean,
  ): void {
    const metrics = this.metrics.get(queueName);
    if (!metrics) return;

    if (success) {
      metrics.messagesProcessed++;
      metrics.averageProcessingTime =
        (metrics.averageProcessingTime * (metrics.messagesProcessed - 1) +
          processingTime) /
        metrics.messagesProcessed;
      metrics.lastProcessedAt = new Date().toISOString();
    } else {
      metrics.messagesFailedPermanently++;
    }

    const queue = this.queues.get(queueName);
    if (queue) {
      metrics.queueDepth = queue.length;
    }
  }

  /**
   * Get max retries based on priority
   */
  private getMaxRetries(priority: string): number {
    const retryMap = {
      critical: 5,
      high: 3,
      medium: 2,
      low: 1,
    };
    return retryMap[priority as keyof typeof retryMap] || 2;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate trace ID for distributed tracing
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  /**
   * Start background processing
   */
  private startProcessing(): void {
    // Process queues periodically
    setInterval(() => {
      for (const queueName of this.queues.keys()) {
        if (!this.processing.get(queueName)) {
          this.processQueue(queueName);
        }
      }
    }, 1000);
  }

  /**
   * Setup health monitoring
   */
  private setupHealthMonitoring(): void {
    setInterval(() => {
      this.emit("health.check", {
        timestamp: new Date().toISOString(),
        queues: Array.from(this.queues.keys()).map((queueName) => ({
          name: queueName,
          depth: this.queues.get(queueName)?.length || 0,
          processing: this.processing.get(queueName) || false,
          metrics: this.metrics.get(queueName),
        })),
        deadLetterQueueDepth: this.deadLetterQueue.length,
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Get queue metrics
   */
  getMetrics(queueName?: string): any {
    if (queueName) {
      return this.metrics.get(queueName);
    }

    return Object.fromEntries(this.metrics.entries());
  }

  /**
   * Get dead letter queue messages
   */
  getDeadLetterQueue(): QueueMessage[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Purge queue
   */
  purgeQueue(queueName: string): number {
    const queue = this.queues.get(queueName);
    if (!queue) return 0;

    const count = queue.length;
    queue.length = 0;

    const metrics = this.metrics.get(queueName);
    if (metrics) {
      metrics.queueDepth = 0;
    }

    this.emit("queue.purged", { queueName, messageCount: count });

    return count;
  }

  /**
   * Get queue status
   */
  getQueueStatus(queueName: string): any {
    const queue = this.queues.get(queueName);
    const metrics = this.metrics.get(queueName);
    const processing = this.processing.get(queueName);

    return {
      exists: !!queue,
      depth: queue?.length || 0,
      processing: processing || false,
      metrics: metrics || null,
    };
  }
}

// Service Registry for Microservices Discovery
export class ServiceRegistry extends EventEmitter {
  private services: Map<string, ServiceEndpoint> = new Map();
  private healthChecks: Map<string, any> = new Map();
  private loadBalancers: Map<string, any> = new Map();

  constructor() {
    super();
    this.startHealthChecking();
  }

  /**
   * Register service endpoint
   */
  registerService(service: ServiceEndpoint): void {
    this.services.set(service.id, service);

    // Initialize circuit breaker if enabled
    if (service.circuitBreaker.enabled) {
      this.initializeCircuitBreaker(service.id, service.circuitBreaker);
    }

    // Initialize load balancer
    this.loadBalancers.set(service.id, {
      instances: [service],
      strategy: "round-robin",
      currentIndex: 0,
    });

    this.emit("service.registered", {
      serviceId: service.id,
      serviceName: service.name,
      type: service.type,
    });
  }

  /**
   * Discover service by name
   */
  discoverService(serviceName: string): ServiceEndpoint | null {
    for (const service of this.services.values()) {
      if (service.name === serviceName) {
        return service;
      }
    }
    return null;
  }

  /**
   * Get healthy service instance
   */
  getHealthyInstance(serviceName: string): ServiceEndpoint | null {
    const service = this.discoverService(serviceName);
    if (!service) return null;

    const healthStatus = this.healthChecks.get(service.id);
    if (healthStatus && healthStatus.healthy) {
      return service;
    }

    return null;
  }

  /**
   * Initialize circuit breaker
   */
  private initializeCircuitBreaker(serviceId: string, config: any): void {
    this.healthChecks.set(serviceId, {
      healthy: true,
      failures: 0,
      lastFailure: null,
      state: "closed", // closed, open, half-open
      nextAttempt: null,
    });
  }

  /**
   * Start health checking
   */
  private startHealthChecking(): void {
    setInterval(async () => {
      for (const [serviceId, service] of this.services.entries()) {
        await this.checkServiceHealth(serviceId, service);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(
    serviceId: string,
    service: ServiceEndpoint,
  ): Promise<void> {
    try {
      // Simulate health check (in production, make actual HTTP request)
      const isHealthy = Math.random() > 0.1; // 90% uptime simulation

      const healthStatus = this.healthChecks.get(serviceId) || {
        healthy: true,
        failures: 0,
        lastFailure: null,
        state: "closed",
        nextAttempt: null,
      };

      if (isHealthy) {
        if (!healthStatus.healthy) {
          this.emit("service.recovered", {
            serviceId,
            serviceName: service.name,
            downtime: Date.now() - (healthStatus.lastFailure || 0),
          });
        }

        healthStatus.healthy = true;
        healthStatus.failures = 0;
        healthStatus.state = "closed";
      } else {
        healthStatus.healthy = false;
        healthStatus.failures++;
        healthStatus.lastFailure = Date.now();

        if (healthStatus.failures >= service.circuitBreaker.failureThreshold) {
          healthStatus.state = "open";
          healthStatus.nextAttempt =
            Date.now() + service.circuitBreaker.recoveryTimeout;
        }

        this.emit("service.unhealthy", {
          serviceId,
          serviceName: service.name,
          failures: healthStatus.failures,
          state: healthStatus.state,
        });
      }

      this.healthChecks.set(serviceId, healthStatus);
    } catch (error) {
      console.error(`Health check failed for service ${serviceId}:`, error);
    }
  }

  /**
   * Get all services status
   */
  getServicesStatus(): any {
    const status: any = {};

    for (const [serviceId, service] of this.services.entries()) {
      const healthStatus = this.healthChecks.get(serviceId);
      status[serviceId] = {
        service,
        health: healthStatus || { healthy: false, state: "unknown" },
      };
    }

    return status;
  }
}

// Event-Driven Architecture Orchestrator
export class EventOrchestrator extends EventEmitter {
  private messageQueue: MessageQueue;
  private serviceRegistry: ServiceRegistry;
  private eventPatterns: Map<string, EventPattern[]> = new Map();
  private sagaInstances: Map<string, any> = new Map();

  constructor(messageQueue: MessageQueue, serviceRegistry: ServiceRegistry) {
    super();
    this.messageQueue = messageQueue;
    this.serviceRegistry = serviceRegistry;
    this.setupDefaultPatterns();
  }

  /**
   * Setup default event patterns
   */
  private setupDefaultPatterns(): void {
    // Patient events
    this.registerEventPattern({
      pattern: "patient.*",
      handler: async (message) => {
        await this.handlePatientEvent(message);
      },
      options: { priority: "high", persistent: true },
    });

    // Clinical events
    this.registerEventPattern({
      pattern: "clinical.*",
      handler: async (message) => {
        await this.handleClinicalEvent(message);
      },
      options: { priority: "high", persistent: true },
    });

    // Compliance events
    this.registerEventPattern({
      pattern: "compliance.*",
      handler: async (message) => {
        await this.handleComplianceEvent(message);
      },
      options: { priority: "critical", persistent: true },
    });

    // System events
    this.registerEventPattern({
      pattern: "system.*",
      handler: async (message) => {
        await this.handleSystemEvent(message);
      },
      options: { priority: "medium", persistent: true },
    });
  }

  /**
   * Register event pattern
   */
  registerEventPattern(eventPattern: EventPattern): void {
    if (!this.eventPatterns.has(eventPattern.pattern)) {
      this.eventPatterns.set(eventPattern.pattern, []);
    }

    this.eventPatterns.get(eventPattern.pattern)!.push(eventPattern);

    // Subscribe to message queue
    this.messageQueue.subscribe(
      eventPattern.pattern,
      eventPattern.handler,
      eventPattern.options,
    );
  }

  /**
   * Orchestrate cross-service workflow
   */
  async orchestrateWorkflow(
    workflowId: string,
    workflowType: string,
    initialData: any,
  ): Promise<string> {
    const sagaId = `saga_${workflowId}_${Date.now()}`;

    const saga = {
      id: sagaId,
      workflowId,
      workflowType,
      status: "started",
      steps: [],
      data: initialData,
      startedAt: new Date().toISOString(),
      compensations: [],
    };

    this.sagaInstances.set(sagaId, saga);

    // Publish workflow started event
    await this.messageQueue.publish(
      "system.events",
      "workflow.started",
      {
        sagaId,
        workflowId,
        workflowType,
        data: initialData,
      },
      { priority: "high", correlationId: sagaId },
    );

    return sagaId;
  }

  /**
   * Handle patient events
   */
  private async handlePatientEvent(message: QueueMessage): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case "patient.created":
        await this.handlePatientCreated(payload, message);
        break;
      case "patient.updated":
        await this.handlePatientUpdated(payload, message);
        break;
      case "patient.episode.started":
        await this.handleEpisodeStarted(payload, message);
        break;
      case "patient.episode.completed":
        await this.handleEpisodeCompleted(payload, message);
        break;
      default:
        console.log(`Unhandled patient event: ${type}`);
    }
  }

  /**
   * Handle clinical events
   */
  private async handleClinicalEvent(message: QueueMessage): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case "clinical.form.completed":
        await this.handleClinicalFormCompleted(payload, message);
        break;
      case "clinical.assessment.updated":
        await this.handleAssessmentUpdated(payload, message);
        break;
      case "clinical.plan.modified":
        await this.handlePlanModified(payload, message);
        break;
      default:
        console.log(`Unhandled clinical event: ${type}`);
    }
  }

  /**
   * Handle compliance events
   */
  private async handleComplianceEvent(message: QueueMessage): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case "compliance.violation.detected":
        await this.handleComplianceViolation(payload, message);
        break;
      case "compliance.audit.required":
        await this.handleAuditRequired(payload, message);
        break;
      case "compliance.report.generated":
        await this.handleReportGenerated(payload, message);
        break;
      default:
        console.log(`Unhandled compliance event: ${type}`);
    }
  }

  /**
   * Handle system events
   */
  private async handleSystemEvent(message: QueueMessage): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case "system.backup.completed":
        await this.handleBackupCompleted(payload, message);
        break;
      case "system.maintenance.scheduled":
        await this.handleMaintenanceScheduled(payload, message);
        break;
      case "system.alert.triggered":
        await this.handleSystemAlert(payload, message);
        break;
      default:
        console.log(`Unhandled system event: ${type}`);
    }
  }

  // Event Handlers Implementation
  private async handlePatientCreated(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger cross-module sync
    crossModuleSync.emit("patient_created", {
      patientId: payload.patientId,
      data: payload.patientData,
    });

    // Publish downstream events
    await this.messageQueue.publish(
      "clinical.events",
      "patient.registration.completed",
      payload,
      { correlationId: message.correlationId },
    );
  }

  private async handlePatientUpdated(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Sync patient updates
    crossModuleSync.emit("patient_updated", {
      patientId: payload.patientId,
      changes: payload.changes,
    });
  }

  private async handleEpisodeStarted(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger care plan initialization
    await this.messageQueue.publish(
      "clinical.events",
      "care.plan.initialize",
      {
        episodeId: payload.episodeId,
        patientId: payload.patientId,
        careTeam: payload.careTeam,
      },
      { priority: "high", correlationId: message.correlationId },
    );
  }

  private async handleEpisodeCompleted(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger compliance reporting
    await this.messageQueue.publish(
      "compliance.events",
      "episode.compliance.check",
      {
        episodeId: payload.episodeId,
        completionData: payload.completionData,
      },
      { priority: "high", correlationId: message.correlationId },
    );
  }

  private async handleClinicalFormCompleted(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Update care plan based on form data
    crossModuleSync.emit("clinical_form_completed", {
      formId: payload.formId,
      episodeId: payload.episodeId,
      formData: payload.formData,
    });
  }

  private async handleAssessmentUpdated(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger care plan adjustments
    await this.messageQueue.publish(
      "clinical.events",
      "care.plan.adjust",
      payload,
      { correlationId: message.correlationId },
    );
  }

  private async handlePlanModified(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Notify care team of plan changes
    await this.messageQueue.publish(
      "notification.events",
      "care.team.notification",
      {
        type: "plan_modified",
        episodeId: payload.episodeId,
        changes: payload.changes,
        careTeam: payload.careTeam,
      },
      { priority: "high", correlationId: message.correlationId },
    );
  }

  private async handleComplianceViolation(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger immediate notification
    await this.messageQueue.publish(
      "notification.events",
      "compliance.violation.alert",
      payload,
      { priority: "critical", correlationId: message.correlationId },
    );
  }

  private async handleAuditRequired(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Schedule audit workflow
    await this.orchestrateWorkflow(
      `audit_${payload.entityId}`,
      "compliance_audit",
      payload,
    );
  }

  private async handleReportGenerated(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Distribute report to stakeholders
    await this.messageQueue.publish(
      "notification.events",
      "report.distribution",
      payload,
      { correlationId: message.correlationId },
    );
  }

  private async handleBackupCompleted(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Log backup completion
    console.log("Backup completed:", payload);
  }

  private async handleMaintenanceScheduled(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Notify users of scheduled maintenance
    await this.messageQueue.publish(
      "notification.events",
      "maintenance.notification",
      payload,
      { priority: "medium", correlationId: message.correlationId },
    );
  }

  private async handleSystemAlert(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Handle system alerts based on severity
    const priority = payload.severity === "critical" ? "critical" : "high";

    await this.messageQueue.publish(
      "notification.events",
      "system.alert.notification",
      payload,
      { priority, correlationId: message.correlationId },
    );
  }

  /**
   * Get saga status
   */
  getSagaStatus(sagaId: string): any {
    return this.sagaInstances.get(sagaId);
  }

  /**
   * Get all active sagas
   */
  getActiveSagas(): any[] {
    return Array.from(this.sagaInstances.values()).filter(
      (saga) => saga.status !== "completed" && saga.status !== "failed",
    );
  }
}

// Main Messaging Service
export class MessagingService extends EventEmitter {
  private messageQueue: MessageQueue;
  private serviceRegistry: ServiceRegistry;
  private eventOrchestrator: EventOrchestrator;
  private isInitialized = false;

  constructor() {
    super();
    this.messageQueue = new MessageQueue();
    this.serviceRegistry = new ServiceRegistry();
    this.eventOrchestrator = new EventOrchestrator(
      this.messageQueue,
      this.serviceRegistry,
    );
    this.setupEventForwarding();
  }

  /**
   * Initialize messaging service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Register default services
    this.registerDefaultServices();

    // Setup cross-module sync integration
    this.setupCrossModuleIntegration();

    this.isInitialized = true;

    this.emit("service.initialized", {
      timestamp: new Date().toISOString(),
      queues: Object.keys(this.messageQueue.getMetrics()),
      services: Object.keys(this.serviceRegistry.getServicesStatus()),
    });
  }

  /**
   * Register default services
   */
  private registerDefaultServices(): void {
    const defaultServices: ServiceEndpoint[] = [
      {
        id: "patient-service",
        name: "PatientService",
        type: "http",
        url: "/api/patients",
        healthCheck: "/api/patients/health",
        timeout: 5000,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: "exponential",
          initialDelay: 1000,
          maxDelay: 10000,
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 30000,
          monitoringPeriod: 60000,
        },
      },
      {
        id: "clinical-service",
        name: "ClinicalService",
        type: "http",
        url: "/api/clinical",
        healthCheck: "/api/clinical/health",
        timeout: 5000,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: "exponential",
          initialDelay: 1000,
          maxDelay: 10000,
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 30000,
          monitoringPeriod: 60000,
        },
      },
      {
        id: "compliance-service",
        name: "ComplianceService",
        type: "http",
        url: "/api/compliance",
        healthCheck: "/api/compliance/health",
        timeout: 5000,
        retryPolicy: {
          maxRetries: 5,
          backoffStrategy: "exponential",
          initialDelay: 1000,
          maxDelay: 15000,
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 3,
          recoveryTimeout: 60000,
          monitoringPeriod: 60000,
        },
      },
    ];

    defaultServices.forEach((service) => {
      this.serviceRegistry.registerService(service);
    });
  }

  /**
   * Setup cross-module sync integration
   */
  private setupCrossModuleIntegration(): void {
    // Listen to cross-module sync events and convert to messages
    crossModuleSync.on("sync_event", async (event) => {
      await this.messageQueue.publish(
        `${event.type}.events`,
        `${event.type}.${event.action}`,
        {
          entityId: event.entityId,
          data: event.data,
          source: event.source,
          userId: event.userId,
        },
        {
          priority: "high",
          correlationId: event.id,
          metadata: {
            traceId: event.id,
            timestamp: event.timestamp,
          },
        },
      );
    });

    // Listen to sync conflicts and handle them
    crossModuleSync.on("sync_conflict", async (conflictData) => {
      await this.messageQueue.publish(
        "system.events",
        "sync.conflict.detected",
        conflictData,
        { priority: "critical" },
      );
    });
  }

  /**
   * Setup event forwarding
   */
  private setupEventForwarding(): void {
    // Forward message queue events
    this.messageQueue.on("message.published", (data) => {
      this.emit("message.published", data);
    });

    this.messageQueue.on("message.processed", (data) => {
      this.emit("message.processed", data);
    });

    this.messageQueue.on("message.failed", (data) => {
      this.emit("message.failed", data);
    });

    // Forward service registry events
    this.serviceRegistry.on("service.registered", (data) => {
      this.emit("service.registered", data);
    });

    this.serviceRegistry.on("service.unhealthy", (data) => {
      this.emit("service.unhealthy", data);
    });

    this.serviceRegistry.on("service.recovered", (data) => {
      this.emit("service.recovered", data);
    });
  }

  /**
   * Publish message
   */
  async publish(
    queueName: string,
    messageType: string,
    payload: any,
    options?: any,
  ): Promise<string> {
    return await this.messageQueue.publish(
      queueName,
      messageType,
      payload,
      options,
    );
  }

  /**
   * Subscribe to messages
   */
  subscribe(pattern: string, handler: MessageHandler, options?: any): void {
    this.messageQueue.subscribe(pattern, handler, options);
  }

  /**
   * Register service
   */
  registerService(service: ServiceEndpoint): void {
    this.serviceRegistry.registerService(service);
  }

  /**
   * Discover service
   */
  discoverService(serviceName: string): ServiceEndpoint | null {
    return this.serviceRegistry.discoverService(serviceName);
  }

  /**
   * Orchestrate workflow
   */
  async orchestrateWorkflow(
    workflowId: string,
    workflowType: string,
    initialData: any,
  ): Promise<string> {
    return await this.eventOrchestrator.orchestrateWorkflow(
      workflowId,
      workflowType,
      initialData,
    );
  }

  /**
   * Get system status
   */
  getSystemStatus(): any {
    return {
      initialized: this.isInitialized,
      timestamp: new Date().toISOString(),
      messageQueue: {
        metrics: this.messageQueue.getMetrics(),
        deadLetterQueue: this.messageQueue.getDeadLetterQueue().length,
      },
      services: this.serviceRegistry.getServicesStatus(),
      activeSagas: this.eventOrchestrator.getActiveSagas().length,
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): any {
    const status = this.getSystemStatus();
    const isHealthy =
      this.isInitialized &&
      Object.values(status.services).every(
        (service: any) => service.health.healthy,
      );

    return {
      healthy: isHealthy,
      status: isHealthy ? "UP" : "DOWN",
      timestamp: new Date().toISOString(),
      details: status,
    };
  }
}

// Service Mesh Implementation
export class ServiceMesh extends EventEmitter {
  private services: Map<string, ServiceNode> = new Map();
  private trafficPolicies: Map<string, TrafficPolicy> = new Map();
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private loadBalancers: Map<string, LoadBalancer> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private retryPolicies: Map<string, RetryPolicy> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private healthCheckers: Map<string, HealthChecker> = new Map();
  private metricsCollector: MeshMetricsCollector;
  private traceCollector: TraceCollector;
  private isInitialized = false;

  constructor() {
    super();
    this.metricsCollector = new MeshMetricsCollector();
    this.traceCollector = new TraceCollector();
  }

  /**
   * Initialize service mesh
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize default policies
    this.initializeDefaultPolicies();

    // Start health monitoring
    this.startHealthMonitoring();

    // Start metrics collection
    this.startMetricsCollection();

    // Start distributed tracing
    this.startDistributedTracing();

    this.isInitialized = true;

    this.emit('mesh.initialized', {
      timestamp: new Date().toISOString(),
      services: this.services.size,
      policies: this.trafficPolicies.size + this.securityPolicies.size,
    });
  }

  /**
   * Register service in mesh
   */
  registerService(serviceConfig: ServiceMeshConfig): void {
    const serviceNode: ServiceNode = {
      id: serviceConfig.id,
      name: serviceConfig.name,
      version: serviceConfig.version,
      namespace: serviceConfig.namespace || 'default',
      endpoints: serviceConfig.endpoints,
      metadata: serviceConfig.metadata || {},
      status: 'healthy',
      registeredAt: new Date().toISOString(),
      lastHealthCheck: new Date().toISOString(),
      dependencies: serviceConfig.dependencies || [],
      capabilities: serviceConfig.capabilities || [],
    };

    this.services.set(serviceConfig.id, serviceNode);

    // Initialize load balancer
    this.loadBalancers.set(serviceConfig.id, new LoadBalancer({
      strategy: serviceConfig.loadBalancing?.strategy || 'round-robin',
      healthCheck: serviceConfig.loadBalancing?.healthCheck !== false,
      endpoints: serviceConfig.endpoints,
    }));

    // Initialize circuit breaker
    if (serviceConfig.circuitBreaker?.enabled !== false) {
      this.circuitBreakers.set(serviceConfig.id, new CircuitBreaker({
        failureThreshold: serviceConfig.circuitBreaker?.failureThreshold || 5,
        recoveryTimeout: serviceConfig.circuitBreaker?.recoveryTimeout || 30000,
        monitoringPeriod: serviceConfig.circuitBreaker?.monitoringPeriod || 60000,
      }));
    }

    // Initialize retry policy
    this.retryPolicies.set(serviceConfig.id, {
      maxRetries: serviceConfig.retry?.maxRetries || 3,
      backoffStrategy: serviceConfig.retry?.backoffStrategy || 'exponential',
      initialDelay: serviceConfig.retry?.initialDelay || 1000,
      maxDelay: serviceConfig.retry?.maxDelay || 30000,
      retryableErrors: serviceConfig.retry?.retryableErrors || ['TIMEOUT', 'CONNECTION_ERROR'],
    });

    // Initialize rate limiter
    if (serviceConfig.rateLimit) {
      this.rateLimiters.set(serviceConfig.id, new RateLimiter({
        requests: serviceConfig.rateLimit.requests,
        window: serviceConfig.rateLimit.window,
        burst: serviceConfig.rateLimit.burst || serviceConfig.rateLimit.requests,
        strategy: serviceConfig.rateLimit.strategy || 'sliding_window',
      }));
    }

    // Initialize health checker
    this.healthCheckers.set(serviceConfig.id, new HealthChecker({
      service: serviceConfig.name,
      path: serviceConfig.healthCheck?.path || '/health',
      method: serviceConfig.healthCheck?.method || 'GET',
      expectedStatus: serviceConfig.healthCheck?.expectedStatus || [200],
    }, {
      enabled: true,
      interval: serviceConfig.healthCheck?.interval || 30000,
      timeout: serviceConfig.healthCheck?.timeout || 5000,
      retries: serviceConfig.healthCheck?.retries || 3,
      endpoints: [],
    }));

    this.emit('service.registered', {
      serviceId: serviceConfig.id,
      serviceName: serviceConfig.name,
      namespace: serviceNode.namespace,
      endpoints: serviceConfig.endpoints.length,
    });
  }

  /**
   * Apply traffic policy
   */
  applyTrafficPolicy(policy: TrafficPolicy): void {
    this.trafficPolicies.set(policy.id, policy);

    this.emit('policy.applied', {
      type: 'traffic',
      policyId: policy.id,
      targetService: policy.targetService,
      rules: policy.rules.length,
    });
  }

  /**
   * Apply security policy
   */
  applySecurityPolicy(policy: SecurityPolicy): void {
    this.securityPolicies.set(policy.id, policy);

    this.emit('policy.applied', {
      type: 'security',
      policyId: policy.id,
      targetService: policy.targetService,
      rules: policy.rules.length,
    });
  }

  /**
   * Route request through service mesh
   */
  async routeRequest(
    sourceService: string,
    targetService: string,
    request: MeshRequest,
  ): Promise<MeshResponse> {
    const traceId = request.headers['x-trace-id'] || this.generateTraceId();
    const spanId = this.generateSpanId();

    // Start trace
    const trace = this.traceCollector.startTrace(traceId, spanId, {
      operation: `${sourceService} -> ${targetService}`,
      service: sourceService,
      timestamp: Date.now(),
    });

    try {
      // Apply security policies
      await this.enforceSecurityPolicies(sourceService, targetService, request);

      // Apply traffic policies
      const routedRequest = await this.applyTrafficPolicies(targetService, request);

      // Apply rate limiting
      await this.enforceRateLimit(targetService, request);

      // Get healthy service instance
      const serviceInstance = await this.selectServiceInstance(targetService);

      // Execute request with circuit breaker
      const response = await this.executeWithCircuitBreaker(
        targetService,
        serviceInstance,
        routedRequest,
      );

      // Record metrics
      this.metricsCollector.recordRequest({
        sourceService,
        targetService,
        method: request.method,
        statusCode: response.statusCode,
        duration: Date.now() - trace.startTime,
        success: response.statusCode < 400,
      });

      // Complete trace
      this.traceCollector.completeTrace(traceId, {
        statusCode: response.statusCode,
        duration: Date.now() - trace.startTime,
        success: response.statusCode < 400,
      });

      return response;
    } catch (error) {
      // Record error metrics
      this.metricsCollector.recordError({
        sourceService,
        targetService,
        error: error.message,
        timestamp: Date.now(),
      });

      // Complete trace with error
      this.traceCollector.completeTrace(traceId, {
        error: error.message,
        duration: Date.now() - trace.startTime,
        success: false,
      });

      throw error;
    }
  }

  /**
   * Initialize default policies
   */
  private initializeDefaultPolicies(): void {
    // Default traffic policy
    this.applyTrafficPolicy({
      id: 'default-traffic-policy',
      name: 'Default Traffic Policy',
      targetService: '*',
      rules: [
        {
          match: { path: '/*' },
          route: {
            destination: 'default',
            weight: 100,
            timeout: 30000,
          },
        },
      ],
      priority: 0,
    });

    // Default security policy
    this.applySecurityPolicy({
      id: 'default-security-policy',
      name: 'Default Security Policy',
      targetService: '*',
      rules: [
        {
          action: 'allow',
          source: { services: ['*'] },
          conditions: [],
        },
      ],
      priority: 0,
    });
  }

  /**
   * Enforce security policies
   */
  private async enforceSecurityPolicies(
    sourceService: string,
    targetService: string,
    request: MeshRequest,
  ): Promise<void> {
    const applicablePolicies = Array.from(this.securityPolicies.values())
      .filter(policy => 
        policy.targetService === targetService || policy.targetService === '*'
      )
      .sort((a, b) => b.priority - a.priority);

    for (const policy of applicablePolicies) {
      for (const rule of policy.rules) {
        if (this.matchesSecurityRule(rule, sourceService, request)) {
          if (rule.action === 'deny') {
            throw new Error(`Access denied by security policy: ${policy.name}`);
          }
          return; // Allow and stop processing
        }
      }
    }
  }

  /**
   * Apply traffic policies
   */
  private async applyTrafficPolicies(
    targetService: string,
    request: MeshRequest,
  ): Promise<MeshRequest> {
    const applicablePolicies = Array.from(this.trafficPolicies.values())
      .filter(policy => 
        policy.targetService === targetService || policy.targetService === '*'
      )
      .sort((a, b) => b.priority - a.priority);

    let modifiedRequest = { ...request };

    for (const policy of applicablePolicies) {
      for (const rule of policy.rules) {
        if (this.matchesTrafficRule(rule, request)) {
          // Apply transformations
          if (rule.route.headers) {
            modifiedRequest.headers = {
              ...modifiedRequest.headers,
              ...rule.route.headers,
            };
          }

          if (rule.route.timeout) {
            modifiedRequest.timeout = rule.route.timeout;
          }

          break; // Apply first matching rule
        }
      }
    }

    return modifiedRequest;
  }

  /**
   * Enforce rate limiting
   */
  private async enforceRateLimit(
    targetService: string,
    request: MeshRequest,
  ): Promise<void> {
    const rateLimiter = this.rateLimiters.get(targetService);
    if (!rateLimiter) return;

    const key = `${targetService}:${request.headers['x-client-id'] || 'anonymous'}`;
    const result = await rateLimiter.checkLimit(key);

    if (!result.allowed) {
      throw new Error(`Rate limit exceeded for service: ${targetService}`);
    }
  }

  /**
   * Select service instance using load balancer
   */
  private async selectServiceInstance(targetService: string): Promise<ServiceEndpoint> {
    const service = this.services.get(targetService);
    if (!service) {
      throw new Error(`Service not found: ${targetService}`);
    }

    const loadBalancer = this.loadBalancers.get(targetService);
    if (!loadBalancer) {
      throw new Error(`Load balancer not found for service: ${targetService}`);
    }

    const healthyEndpoints = service.endpoints.filter(endpoint => {
      const healthChecker = this.healthCheckers.get(`${targetService}:${endpoint.id}`);
      return !healthChecker || healthChecker.getStatus().healthy;
    });

    if (healthyEndpoints.length === 0) {
      throw new Error(`No healthy instances available for service: ${targetService}`);
    }

    return loadBalancer.selectEndpoint(healthyEndpoints);
  }

  /**
   * Execute request with circuit breaker
   */
  private async executeWithCircuitBreaker(
    targetService: string,
    serviceInstance: ServiceEndpoint,
    request: MeshRequest,
  ): Promise<MeshResponse> {
    const circuitBreaker = this.circuitBreakers.get(targetService);
    const retryPolicy = this.retryPolicies.get(targetService);

    if (circuitBreaker && circuitBreaker.isOpen()) {
      throw new Error(`Circuit breaker is open for service: ${targetService}`);
    }

    let lastError: Error;
    const maxRetries = retryPolicy?.maxRetries || 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeServiceCall(serviceInstance, request);

        // Record success in circuit breaker
        if (circuitBreaker) {
          circuitBreaker.recordSuccess();
        }

        return response;
      } catch (error) {
        lastError = error;

        // Record failure in circuit breaker
        if (circuitBreaker) {
          circuitBreaker.recordFailure();
        }

        // Check if error is retryable
        if (attempt < maxRetries && this.isRetryableError(error, retryPolicy)) {
          const delay = this.calculateRetryDelay(attempt, retryPolicy);
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError!;
  }

  /**
   * Make actual service call
   */
  private async makeServiceCall(
    serviceInstance: ServiceEndpoint,
    request: MeshRequest,
  ): Promise<MeshResponse> {
    // This would be implemented with actual HTTP client
    // For now, return a mock response
    return {
      statusCode: 200,
      headers: {},
      body: { message: 'Success' },
      duration: Math.random() * 1000,
    };
  }

  /**
   * Check if security rule matches
   */
  private matchesSecurityRule(
    rule: SecurityRule,
    sourceService: string,
    request: MeshRequest,
  ): boolean {
    // Check source service
    if (rule.source.services && !rule.source.services.includes('*')) {
      if (!rule.source.services.includes(sourceService)) {
        return false;
      }
    }

    // Check conditions
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, request)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if traffic rule matches
   */
  private matchesTrafficRule(rule: TrafficRule, request: MeshRequest): boolean {
    if (rule.match.path) {
      const pathPattern = rule.match.path.replace('*', '.*');
      const regex = new RegExp(`^${pathPattern}/**
 * Advanced Messaging Service for Microservices Communication
 * Implements event-driven architecture with message queue system
 * Supports async operations, pub/sub patterns, and service orchestration
 */

import { EventEmitter } from "eventemitter3";
import {
  WEBSOCKET_CONFIG,
  PUBSUB_CHANNELS,
  MESSAGE_TYPES,
  COMMUNICATION_SETTINGS,
} from "../config/messaging.config";
import { crossModuleSync } from "../api/cross-module-sync.api";

// Message Queue Interfaces
export interface QueueMessage {
  id: string;
  type: string;
  payload: any;
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
  source: string;
  destination?: string;
  retryCount: number;
  maxRetries: number;
  ttl?: number;
  correlationId?: string;
  replyTo?: string;
  headers?: Record<string, any>;
  metadata?: {
    traceId?: string;
    spanId?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
  };
}

export interface MessageHandler {
  (message: QueueMessage): Promise<any>;
}

export interface ServiceEndpoint {
  id: string;
  name: string;
  type: "http" | "websocket" | "grpc" | "queue";
  url: string;
  healthCheck: string;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: "linear" | "exponential" | "fixed";
    initialDelay: number;
    maxDelay: number;
  };
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
  };
}

export interface EventPattern {
  pattern: string;
  handler: MessageHandler;
  options?: {
    priority?: "low" | "medium" | "high" | "critical";
    persistent?: boolean;
    exclusive?: boolean;
    autoAck?: boolean;
  };
}

// Advanced Message Queue Implementation
export class MessageQueue extends EventEmitter {
  private queues: Map<string, QueueMessage[]> = new Map();
  private handlers: Map<string, MessageHandler[]> = new Map();
  private deadLetterQueue: QueueMessage[] = [];
  private processing: Map<string, boolean> = new Map();
  private metrics: Map<string, any> = new Map();
  private circuitBreakers: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeQueues();
    this.startProcessing();
    this.setupHealthMonitoring();
  }

  /**
   * Initialize default queues
   */
  private initializeQueues(): void {
    const defaultQueues = [
      "patient.events",
      "clinical.events",
      "compliance.events",
      "notification.events",
      "system.events",
      "integration.events",
      "analytics.events",
    ];

    defaultQueues.forEach((queueName) => {
      this.queues.set(queueName, []);
      this.processing.set(queueName, false);
      this.metrics.set(queueName, {
        messagesProcessed: 0,
        messagesFailedPermanently: 0,
        averageProcessingTime: 0,
        lastProcessedAt: null,
        queueDepth: 0,
      });
    });
  }

  /**
   * Publish message to queue
   */
  async publish(
    queueName: string,
    messageType: string,
    payload: any,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      ttl?: number;
      correlationId?: string;
      replyTo?: string;
      headers?: Record<string, any>;
      metadata?: any;
    } = {},
  ): Promise<string> {
    const messageId = this.generateMessageId();

    const message: QueueMessage = {
      id: messageId,
      type: messageType,
      payload,
      priority: options.priority || "medium",
      timestamp: new Date().toISOString(),
      source: "messaging-service",
      retryCount: 0,
      maxRetries: this.getMaxRetries(options.priority || "medium"),
      ttl: options.ttl,
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      headers: options.headers,
      metadata: {
        traceId: this.generateTraceId(),
        ...options.metadata,
      },
    };

    // Ensure queue exists
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.processing.set(queueName, false);
    }

    // Add to queue with priority ordering
    const queue = this.queues.get(queueName)!;
    this.insertByPriority(queue, message);

    // Update metrics
    const metrics = this.metrics.get(queueName);
    if (metrics) {
      metrics.queueDepth = queue.length;
    }

    // Emit event
    this.emit("message.published", {
      queueName,
      messageId,
      messageType,
      priority: message.priority,
    });

    // Trigger processing
    this.processQueue(queueName);

    return messageId;
  }

  /**
   * Subscribe to message pattern
   */
  subscribe(
    pattern: string,
    handler: MessageHandler,
    options: {
      priority?: "low" | "medium" | "high" | "critical";
      persistent?: boolean;
      exclusive?: boolean;
      autoAck?: boolean;
    } = {},
  ): void {
    if (!this.handlers.has(pattern)) {
      this.handlers.set(pattern, []);
    }

    this.handlers.get(pattern)!.push(handler);

    this.emit("subscription.added", {
      pattern,
      handlerCount: this.handlers.get(pattern)!.length,
      options,
    });
  }

  /**
   * Process queue messages
   */
  private async processQueue(queueName: string): Promise<void> {
    if (this.processing.get(queueName)) {
      return; // Already processing
    }

    this.processing.set(queueName, true);
    const queue = this.queues.get(queueName);

    if (!queue || queue.length === 0) {
      this.processing.set(queueName, false);
      return;
    }

    try {
      while (queue.length > 0) {
        const message = queue.shift()!;

        // Check TTL
        if (this.isMessageExpired(message)) {
          this.handleExpiredMessage(message);
          continue;
        }

        const startTime = Date.now();

        try {
          await this.processMessage(message);

          // Update metrics
          const processingTime = Date.now() - startTime;
          this.updateMetrics(queueName, processingTime, true);

          this.emit("message.processed", {
            queueName,
            messageId: message.id,
            processingTime,
          });
        } catch (error) {
          await this.handleMessageError(queueName, message, error);
        }
      }
    } finally {
      this.processing.set(queueName, false);
    }
  }

  /**
   * Process individual message
   */
  private async processMessage(message: QueueMessage): Promise<void> {
    const matchingHandlers = this.findMatchingHandlers(message.type);

    if (matchingHandlers.length === 0) {
      throw new Error(`No handlers found for message type: ${message.type}`);
    }

    // Execute handlers in parallel for better performance
    const handlerPromises = matchingHandlers.map(async (handler) => {
      try {
        const result = await handler(message);

        // Handle reply-to pattern
        if (message.replyTo && result) {
          await this.publish(message.replyTo, `${message.type}.reply`, result, {
            correlationId: message.correlationId,
            headers: { originalMessageId: message.id },
          });
        }

        return result;
      } catch (error) {
        console.error(`Handler error for message ${message.id}:`, error);
        throw error;
      }
    });

    await Promise.all(handlerPromises);
  }

  /**
   * Handle message processing errors
   */
  private async handleMessageError(
    queueName: string,
    message: QueueMessage,
    error: any,
  ): Promise<void> {
    message.retryCount++;

    if (message.retryCount < message.maxRetries) {
      // Calculate backoff delay
      const delay = this.calculateBackoffDelay(message.retryCount);

      // Re-queue with delay
      setTimeout(() => {
        const queue = this.queues.get(queueName);
        if (queue) {
          this.insertByPriority(queue, message);
          this.processQueue(queueName);
        }
      }, delay);

      this.emit("message.retry", {
        queueName,
        messageId: message.id,
        retryCount: message.retryCount,
        delay,
      });
    } else {
      // Move to dead letter queue
      this.deadLetterQueue.push({
        ...message,
        metadata: {
          ...message.metadata,
          failureReason: error.message,
          failedAt: new Date().toISOString(),
        },
      });

      this.updateMetrics(queueName, 0, false);

      this.emit("message.failed", {
        queueName,
        messageId: message.id,
        error: error.message,
        retryCount: message.retryCount,
      });
    }
  }

  /**
   * Find handlers matching message type pattern
   */
  private findMatchingHandlers(messageType: string): MessageHandler[] {
    const matchingHandlers: MessageHandler[] = [];

    for (const [pattern, handlers] of this.handlers.entries()) {
      if (this.matchesPattern(messageType, pattern)) {
        matchingHandlers.push(...handlers);
      }
    }

    return matchingHandlers;
  }

  /**
   * Check if message type matches pattern
   */
  private matchesPattern(messageType: string, pattern: string): boolean {
    // Convert pattern to regex (support wildcards)
    const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(messageType);
  }

  /**
   * Insert message by priority
   */
  private insertByPriority(queue: QueueMessage[], message: QueueMessage): void {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const messagePriority = priorityOrder[message.priority];

    let insertIndex = queue.length;
    for (let i = 0; i < queue.length; i++) {
      const queuePriority = priorityOrder[queue[i].priority];
      if (messagePriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }

    queue.splice(insertIndex, 0, message);
  }

  /**
   * Check if message is expired
   */
  private isMessageExpired(message: QueueMessage): boolean {
    if (!message.ttl) return false;

    const messageTime = new Date(message.timestamp).getTime();
    const now = Date.now();

    return now - messageTime > message.ttl;
  }

  /**
   * Handle expired message
   */
  private handleExpiredMessage(message: QueueMessage): void {
    this.emit("message.expired", {
      messageId: message.id,
      messageType: message.type,
      expiredAt: new Date().toISOString(),
    });
  }

  /**
   * Calculate backoff delay for retries
   */
  private calculateBackoffDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, retryCount - 1),
      maxDelay,
    );

    // Add jitter (±25%)
    const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);

    return Math.max(exponentialDelay + jitter, 100);
  }

  /**
   * Update queue metrics
   */
  private updateMetrics(
    queueName: string,
    processingTime: number,
    success: boolean,
  ): void {
    const metrics = this.metrics.get(queueName);
    if (!metrics) return;

    if (success) {
      metrics.messagesProcessed++;
      metrics.averageProcessingTime =
        (metrics.averageProcessingTime * (metrics.messagesProcessed - 1) +
          processingTime) /
        metrics.messagesProcessed;
      metrics.lastProcessedAt = new Date().toISOString();
    } else {
      metrics.messagesFailedPermanently++;
    }

    const queue = this.queues.get(queueName);
    if (queue) {
      metrics.queueDepth = queue.length;
    }
  }

  /**
   * Get max retries based on priority
   */
  private getMaxRetries(priority: string): number {
    const retryMap = {
      critical: 5,
      high: 3,
      medium: 2,
      low: 1,
    };
    return retryMap[priority as keyof typeof retryMap] || 2;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate trace ID for distributed tracing
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  /**
   * Start background processing
   */
  private startProcessing(): void {
    // Process queues periodically
    setInterval(() => {
      for (const queueName of this.queues.keys()) {
        if (!this.processing.get(queueName)) {
          this.processQueue(queueName);
        }
      }
    }, 1000);
  }

  /**
   * Setup health monitoring
   */
  private setupHealthMonitoring(): void {
    setInterval(() => {
      this.emit("health.check", {
        timestamp: new Date().toISOString(),
        queues: Array.from(this.queues.keys()).map((queueName) => ({
          name: queueName,
          depth: this.queues.get(queueName)?.length || 0,
          processing: this.processing.get(queueName) || false,
          metrics: this.metrics.get(queueName),
        })),
        deadLetterQueueDepth: this.deadLetterQueue.length,
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Get queue metrics
   */
  getMetrics(queueName?: string): any {
    if (queueName) {
      return this.metrics.get(queueName);
    }

    return Object.fromEntries(this.metrics.entries());
  }

  /**
   * Get dead letter queue messages
   */
  getDeadLetterQueue(): QueueMessage[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Purge queue
   */
  purgeQueue(queueName: string): number {
    const queue = this.queues.get(queueName);
    if (!queue) return 0;

    const count = queue.length;
    queue.length = 0;

    const metrics = this.metrics.get(queueName);
    if (metrics) {
      metrics.queueDepth = 0;
    }

    this.emit("queue.purged", { queueName, messageCount: count });

    return count;
  }

  /**
   * Get queue status
   */
  getQueueStatus(queueName: string): any {
    const queue = this.queues.get(queueName);
    const metrics = this.metrics.get(queueName);
    const processing = this.processing.get(queueName);

    return {
      exists: !!queue,
      depth: queue?.length || 0,
      processing: processing || false,
      metrics: metrics || null,
    };
  }
}

// Service Registry for Microservices Discovery
export class ServiceRegistry extends EventEmitter {
  private services: Map<string, ServiceEndpoint> = new Map();
  private healthChecks: Map<string, any> = new Map();
  private loadBalancers: Map<string, any> = new Map();

  constructor() {
    super();
    this.startHealthChecking();
  }

  /**
   * Register service endpoint
   */
  registerService(service: ServiceEndpoint): void {
    this.services.set(service.id, service);

    // Initialize circuit breaker if enabled
    if (service.circuitBreaker.enabled) {
      this.initializeCircuitBreaker(service.id, service.circuitBreaker);
    }

    // Initialize load balancer
    this.loadBalancers.set(service.id, {
      instances: [service],
      strategy: "round-robin",
      currentIndex: 0,
    });

    this.emit("service.registered", {
      serviceId: service.id,
      serviceName: service.name,
      type: service.type,
    });
  }

  /**
   * Discover service by name
   */
  discoverService(serviceName: string): ServiceEndpoint | null {
    for (const service of this.services.values()) {
      if (service.name === serviceName) {
        return service;
      }
    }
    return null;
  }

  /**
   * Get healthy service instance
   */
  getHealthyInstance(serviceName: string): ServiceEndpoint | null {
    const service = this.discoverService(serviceName);
    if (!service) return null;

    const healthStatus = this.healthChecks.get(service.id);
    if (healthStatus && healthStatus.healthy) {
      return service;
    }

    return null;
  }

  /**
   * Initialize circuit breaker
   */
  private initializeCircuitBreaker(serviceId: string, config: any): void {
    this.healthChecks.set(serviceId, {
      healthy: true,
      failures: 0,
      lastFailure: null,
      state: "closed", // closed, open, half-open
      nextAttempt: null,
    });
  }

  /**
   * Start health checking
   */
  private startHealthChecking(): void {
    setInterval(async () => {
      for (const [serviceId, service] of this.services.entries()) {
        await this.checkServiceHealth(serviceId, service);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(
    serviceId: string,
    service: ServiceEndpoint,
  ): Promise<void> {
    try {
      // Simulate health check (in production, make actual HTTP request)
      const isHealthy = Math.random() > 0.1; // 90% uptime simulation

      const healthStatus = this.healthChecks.get(serviceId) || {
        healthy: true,
        failures: 0,
        lastFailure: null,
        state: "closed",
        nextAttempt: null,
      };

      if (isHealthy) {
        if (!healthStatus.healthy) {
          this.emit("service.recovered", {
            serviceId,
            serviceName: service.name,
            downtime: Date.now() - (healthStatus.lastFailure || 0),
          });
        }

        healthStatus.healthy = true;
        healthStatus.failures = 0;
        healthStatus.state = "closed";
      } else {
        healthStatus.healthy = false;
        healthStatus.failures++;
        healthStatus.lastFailure = Date.now();

        if (healthStatus.failures >= service.circuitBreaker.failureThreshold) {
          healthStatus.state = "open";
          healthStatus.nextAttempt =
            Date.now() + service.circuitBreaker.recoveryTimeout;
        }

        this.emit("service.unhealthy", {
          serviceId,
          serviceName: service.name,
          failures: healthStatus.failures,
          state: healthStatus.state,
        });
      }

      this.healthChecks.set(serviceId, healthStatus);
    } catch (error) {
      console.error(`Health check failed for service ${serviceId}:`, error);
    }
  }

  /**
   * Get all services status
   */
  getServicesStatus(): any {
    const status: any = {};

    for (const [serviceId, service] of this.services.entries()) {
      const healthStatus = this.healthChecks.get(serviceId);
      status[serviceId] = {
        service,
        health: healthStatus || { healthy: false, state: "unknown" },
      };
    }

    return status;
  }
}

// Event-Driven Architecture Orchestrator
export class EventOrchestrator extends EventEmitter {
  private messageQueue: MessageQueue;
  private serviceRegistry: ServiceRegistry;
  private eventPatterns: Map<string, EventPattern[]> = new Map();
  private sagaInstances: Map<string, any> = new Map();

  constructor(messageQueue: MessageQueue, serviceRegistry: ServiceRegistry) {
    super();
    this.messageQueue = messageQueue;
    this.serviceRegistry = serviceRegistry;
    this.setupDefaultPatterns();
  }

  /**
   * Setup default event patterns
   */
  private setupDefaultPatterns(): void {
    // Patient events
    this.registerEventPattern({
      pattern: "patient.*",
      handler: async (message) => {
        await this.handlePatientEvent(message);
      },
      options: { priority: "high", persistent: true },
    });

    // Clinical events
    this.registerEventPattern({
      pattern: "clinical.*",
      handler: async (message) => {
        await this.handleClinicalEvent(message);
      },
      options: { priority: "high", persistent: true },
    });

    // Compliance events
    this.registerEventPattern({
      pattern: "compliance.*",
      handler: async (message) => {
        await this.handleComplianceEvent(message);
      },
      options: { priority: "critical", persistent: true },
    });

    // System events
    this.registerEventPattern({
      pattern: "system.*",
      handler: async (message) => {
        await this.handleSystemEvent(message);
      },
      options: { priority: "medium", persistent: true },
    });
  }

  /**
   * Register event pattern
   */
  registerEventPattern(eventPattern: EventPattern): void {
    if (!this.eventPatterns.has(eventPattern.pattern)) {
      this.eventPatterns.set(eventPattern.pattern, []);
    }

    this.eventPatterns.get(eventPattern.pattern)!.push(eventPattern);

    // Subscribe to message queue
    this.messageQueue.subscribe(
      eventPattern.pattern,
      eventPattern.handler,
      eventPattern.options,
    );
  }

  /**
   * Orchestrate cross-service workflow
   */
  async orchestrateWorkflow(
    workflowId: string,
    workflowType: string,
    initialData: any,
  ): Promise<string> {
    const sagaId = `saga_${workflowId}_${Date.now()}`;

    const saga = {
      id: sagaId,
      workflowId,
      workflowType,
      status: "started",
      steps: [],
      data: initialData,
      startedAt: new Date().toISOString(),
      compensations: [],
    };

    this.sagaInstances.set(sagaId, saga);

    // Publish workflow started event
    await this.messageQueue.publish(
      "system.events",
      "workflow.started",
      {
        sagaId,
        workflowId,
        workflowType,
        data: initialData,
      },
      { priority: "high", correlationId: sagaId },
    );

    return sagaId;
  }

  /**
   * Handle patient events
   */
  private async handlePatientEvent(message: QueueMessage): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case "patient.created":
        await this.handlePatientCreated(payload, message);
        break;
      case "patient.updated":
        await this.handlePatientUpdated(payload, message);
        break;
      case "patient.episode.started":
        await this.handleEpisodeStarted(payload, message);
        break;
      case "patient.episode.completed":
        await this.handleEpisodeCompleted(payload, message);
        break;
      default:
        console.log(`Unhandled patient event: ${type}`);
    }
  }

  /**
   * Handle clinical events
   */
  private async handleClinicalEvent(message: QueueMessage): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case "clinical.form.completed":
        await this.handleClinicalFormCompleted(payload, message);
        break;
      case "clinical.assessment.updated":
        await this.handleAssessmentUpdated(payload, message);
        break;
      case "clinical.plan.modified":
        await this.handlePlanModified(payload, message);
        break;
      default:
        console.log(`Unhandled clinical event: ${type}`);
    }
  }

  /**
   * Handle compliance events
   */
  private async handleComplianceEvent(message: QueueMessage): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case "compliance.violation.detected":
        await this.handleComplianceViolation(payload, message);
        break;
      case "compliance.audit.required":
        await this.handleAuditRequired(payload, message);
        break;
      case "compliance.report.generated":
        await this.handleReportGenerated(payload, message);
        break;
      default:
        console.log(`Unhandled compliance event: ${type}`);
    }
  }

  /**
   * Handle system events
   */
  private async handleSystemEvent(message: QueueMessage): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case "system.backup.completed":
        await this.handleBackupCompleted(payload, message);
        break;
      case "system.maintenance.scheduled":
        await this.handleMaintenanceScheduled(payload, message);
        break;
      case "system.alert.triggered":
        await this.handleSystemAlert(payload, message);
        break;
      default:
        console.log(`Unhandled system event: ${type}`);
    }
  }

  // Event Handlers Implementation
  private async handlePatientCreated(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger cross-module sync
    crossModuleSync.emit("patient_created", {
      patientId: payload.patientId,
      data: payload.patientData,
    });

    // Publish downstream events
    await this.messageQueue.publish(
      "clinical.events",
      "patient.registration.completed",
      payload,
      { correlationId: message.correlationId },
    );
  }

  private async handlePatientUpdated(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Sync patient updates
    crossModuleSync.emit("patient_updated", {
      patientId: payload.patientId,
      changes: payload.changes,
    });
  }

  private async handleEpisodeStarted(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger care plan initialization
    await this.messageQueue.publish(
      "clinical.events",
      "care.plan.initialize",
      {
        episodeId: payload.episodeId,
        patientId: payload.patientId,
        careTeam: payload.careTeam,
      },
      { priority: "high", correlationId: message.correlationId },
    );
  }

  private async handleEpisodeCompleted(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger compliance reporting
    await this.messageQueue.publish(
      "compliance.events",
      "episode.compliance.check",
      {
        episodeId: payload.episodeId,
        completionData: payload.completionData,
      },
      { priority: "high", correlationId: message.correlationId },
    );
  }

  private async handleClinicalFormCompleted(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Update care plan based on form data
    crossModuleSync.emit("clinical_form_completed", {
      formId: payload.formId,
      episodeId: payload.episodeId,
      formData: payload.formData,
    });
  }

  private async handleAssessmentUpdated(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger care plan adjustments
    await this.messageQueue.publish(
      "clinical.events",
      "care.plan.adjust",
      payload,
      { correlationId: message.correlationId },
    );
  }

  private async handlePlanModified(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Notify care team of plan changes
    await this.messageQueue.publish(
      "notification.events",
      "care.team.notification",
      {
        type: "plan_modified",
        episodeId: payload.episodeId,
        changes: payload.changes,
        careTeam: payload.careTeam,
      },
      { priority: "high", correlationId: message.correlationId },
    );
  }

  private async handleComplianceViolation(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Trigger immediate notification
    await this.messageQueue.publish(
      "notification.events",
      "compliance.violation.alert",
      payload,
      { priority: "critical", correlationId: message.correlationId },
    );
  }

  private async handleAuditRequired(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Schedule audit workflow
    await this.orchestrateWorkflow(
      `audit_${payload.entityId}`,
      "compliance_audit",
      payload,
    );
  }

  private async handleReportGenerated(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Distribute report to stakeholders
    await this.messageQueue.publish(
      "notification.events",
      "report.distribution",
      payload,
      { correlationId: message.correlationId },
    );
  }

  private async handleBackupCompleted(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Log backup completion
    console.log("Backup completed:", payload);
  }

  private async handleMaintenanceScheduled(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Notify users of scheduled maintenance
    await this.messageQueue.publish(
      "notification.events",
      "maintenance.notification",
      payload,
      { priority: "medium", correlationId: message.correlationId },
    );
  }

  private async handleSystemAlert(
    payload: any,
    message: QueueMessage,
  ): Promise<void> {
    // Handle system alerts based on severity
    const priority = payload.severity === "critical" ? "critical" : "high";

    await this.messageQueue.publish(
      "notification.events",
      "system.alert.notification",
      payload,
      { priority, correlationId: message.correlationId },
    );
  }

  /**
   * Get saga status
   */
  getSagaStatus(sagaId: string): any {
    return this.sagaInstances.get(sagaId);
  }

  /**
   * Get all active sagas
   */
  getActiveSagas(): any[] {
    return Array.from(this.sagaInstances.values()).filter(
      (saga) => saga.status !== "completed" && saga.status !== "failed",
    );
  }
}

// Main Messaging Service
export class MessagingService extends EventEmitter {
  private messageQueue: MessageQueue;
  private serviceRegistry: ServiceRegistry;
  private eventOrchestrator: EventOrchestrator;
  private isInitialized = false;

  constructor() {
    super();
    this.messageQueue = new MessageQueue();
    this.serviceRegistry = new ServiceRegistry();
    this.eventOrchestrator = new EventOrchestrator(
      this.messageQueue,
      this.serviceRegistry,
    );
    this.setupEventForwarding();
  }

  /**
   * Initialize messaging service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Register default services
    this.registerDefaultServices();

    // Setup cross-module sync integration
    this.setupCrossModuleIntegration();

    this.isInitialized = true;

    this.emit("service.initialized", {
      timestamp: new Date().toISOString(),
      queues: Object.keys(this.messageQueue.getMetrics()),
      services: Object.keys(this.serviceRegistry.getServicesStatus()),
    });
  }

  /**
   * Register default services
   */
  private registerDefaultServices(): void {
    const defaultServices: ServiceEndpoint[] = [
      {
        id: "patient-service",
        name: "PatientService",
        type: "http",
        url: "/api/patients",
        healthCheck: "/api/patients/health",
        timeout: 5000,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: "exponential",
          initialDelay: 1000,
          maxDelay: 10000,
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 30000,
          monitoringPeriod: 60000,
        },
      },
      {
        id: "clinical-service",
        name: "ClinicalService",
        type: "http",
        url: "/api/clinical",
        healthCheck: "/api/clinical/health",
        timeout: 5000,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: "exponential",
          initialDelay: 1000,
          maxDelay: 10000,
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 30000,
          monitoringPeriod: 60000,
        },
      },
      {
        id: "compliance-service",
        name: "ComplianceService",
        type: "http",
        url: "/api/compliance",
        healthCheck: "/api/compliance/health",
        timeout: 5000,
        retryPolicy: {
          maxRetries: 5,
          backoffStrategy: "exponential",
          initialDelay: 1000,
          maxDelay: 15000,
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 3,
          recoveryTimeout: 60000,
          monitoringPeriod: 60000,
        },
      },
    ];

    defaultServices.forEach((service) => {
      this.serviceRegistry.registerService(service);
    });
  }

  /**
   * Setup cross-module sync integration
   */
  private setupCrossModuleIntegration(): void {
    // Listen to cross-module sync events and convert to messages
    crossModuleSync.on("sync_event", async (event) => {
      await this.messageQueue.publish(
        `${event.type}.events`,
        `${event.type}.${event.action}`,
        {
          entityId: event.entityId,
          data: event.data,
          source: event.source,
          userId: event.userId,
        },
        {
          priority: "high",
          correlationId: event.id,
          metadata: {
            traceId: event.id,
            timestamp: event.timestamp,
          },
        },
      );
    });

    // Listen to sync conflicts and handle them
    crossModuleSync.on("sync_conflict", async (conflictData) => {
      await this.messageQueue.publish(
        "system.events",
        "sync.conflict.detected",
        conflictData,
        { priority: "critical" },
      );
    });
  }

  /**
   * Setup event forwarding
   */
  private setupEventForwarding(): void {
    // Forward message queue events
    this.messageQueue.on("message.published", (data) => {
      this.emit("message.published", data);
    });

    this.messageQueue.on("message.processed", (data) => {
      this.emit("message.processed", data);
    });

    this.messageQueue.on("message.failed", (data) => {
      this.emit("message.failed", data);
    });

    // Forward service registry events
    this.serviceRegistry.on("service.registered", (data) => {
      this.emit("service.registered", data);
    });

    this.serviceRegistry.on("service.unhealthy", (data) => {
      this.emit("service.unhealthy", data);
    });

    this.serviceRegistry.on("service.recovered", (data) => {
      this.emit("service.recovered", data);
    });
  }

  /**
   * Publish message
   */
  async publish(
    queueName: string,
    messageType: string,
    payload: any,
    options?: any,
  ): Promise<string> {
    return await this.messageQueue.publish(
      queueName,
      messageType,
      payload,
      options,
    );
  }

  /**
   * Subscribe to messages
   */
  subscribe(pattern: string, handler: MessageHandler, options?: any): void {
    this.messageQueue.subscribe(pattern, handler, options);
  }

  /**
   * Register service
   */
  registerService(service: ServiceEndpoint): void {
    this.serviceRegistry.registerService(service);
  }

  /**
   * Discover service
   */
  discoverService(serviceName: string): ServiceEndpoint | null {
    return this.serviceRegistry.discoverService(serviceName);
  }

  /**
   * Orchestrate workflow
   */
  async orchestrateWorkflow(
    workflowId: string,
    workflowType: string,
    initialData: any,
  ): Promise<string> {
    return await this.eventOrchestrator.orchestrateWorkflow(
      workflowId,
      workflowType,
      initialData,
    );
  }

  /**
   * Get system status
   */
  getSystemStatus(): any {
    return {
      initialized: this.isInitialized,
      timestamp: new Date().toISOString(),
      messageQueue: {
        metrics: this.messageQueue.getMetrics(),
        deadLetterQueue: this.messageQueue.getDeadLetterQueue().length,
      },
      services: this.serviceRegistry.getServicesStatus(),
      activeSagas: this.eventOrchestrator.getActiveSagas().length,
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): any {
    const status = this.getSystemStatus();
    const isHealthy =
      this.isInitialized &&
      Object.values(status.services).every(
        (service: any) => service.health.healthy,
      );

    return {
      healthy: isHealthy,
      status: isHealthy ? "UP" : "DOWN",
      timestamp: new Date().toISOString(),
      details: status,
    };
  }
}

);
      if (!regex.test(request.path)) {
        return false;
      }
    }

    if (rule.match.method && rule.match.method !== request.method) {
      return false;
    }

    if (rule.match.headers) {
      for (const [key, value] of Object.entries(rule.match.headers)) {
        if (request.headers[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: PolicyCondition, request: MeshRequest): boolean {
    const value = this.extractValue(condition.field, request);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return false;
    }
  }

  /**
   * Extract value from request
   */
  private extractValue(field: string, request: MeshRequest): any {
    const parts = field.split('.');
    let value: any = request;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error, retryPolicy?: RetryPolicy): boolean {
    if (!retryPolicy) return false;

    return retryPolicy.retryableErrors.some(errorType => 
      error.message.includes(errorType)
    );
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(attempt: number, retryPolicy?: RetryPolicy): number {
    if (!retryPolicy) return 1000;

    switch (retryPolicy.backoffStrategy) {
      case 'linear':
        return Math.min(
          retryPolicy.initialDelay * (attempt + 1),
          retryPolicy.maxDelay,
        );
      case 'exponential':
        return Math.min(
          retryPolicy.initialDelay * Math.pow(2, attempt),
          retryPolicy.maxDelay,
        );
      case 'fixed':
      default:
        return retryPolicy.initialDelay;
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      for (const [serviceId, healthChecker] of this.healthCheckers.entries()) {
        healthChecker.start();
      }
    }, 30000);
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      const metrics = this.metricsCollector.getMetrics();
      this.emit('metrics.collected', metrics);
    }, 60000);
  }

  /**
   * Start distributed tracing
   */
  private startDistributedTracing(): void {
    // Initialize tracing system
    this.traceCollector.initialize();
  }

  /**
   * Generate trace ID
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  /**
   * Generate span ID
   */
  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get mesh status
   */
  getMeshStatus(): MeshStatus {
    const services = Array.from(this.services.values());
    const healthyServices = services.filter(service => service.status === 'healthy');

    return {
      initialized: this.isInitialized,
      services: {
        total: services.length,
        healthy: healthyServices.length,
        unhealthy: services.length - healthyServices.length,
      },
      policies: {
        traffic: this.trafficPolicies.size,
        security: this.securityPolicies.size,
      },
      metrics: this.metricsCollector.getMetrics(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get service topology
   */
  getServiceTopology(): ServiceTopology {
    const nodes = Array.from(this.services.values()).map(service => ({
      id: service.id,
      name: service.name,
      version: service.version,
      namespace: service.namespace,
      status: service.status,
      endpoints: service.endpoints.length,
      dependencies: service.dependencies,
      capabilities: service.capabilities,
    }));

    const edges = nodes.flatMap(node => 
      node.dependencies.map(dep => ({
        source: node.id,
        target: dep,
        type: 'dependency',
      }))
    );

    return {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
  }
}

// Supporting Classes
class LoadBalancer {
  private config: LoadBalancerConfig;
  private currentIndex = 0;

  constructor(config: LoadBalancerConfig) {
    this.config = config;
  }

  selectEndpoint(endpoints: ServiceEndpoint[]): ServiceEndpoint {
    if (endpoints.length === 0) {
      throw new Error('No endpoints available');
    }

    switch (this.config.strategy) {
      case 'round-robin':
        const endpoint = endpoints[this.currentIndex % endpoints.length];
        this.currentIndex++;
        return endpoint;
      case 'random':
        return endpoints[Math.floor(Math.random() * endpoints.length)];
      case 'least-connections':
        // For simplicity, return first endpoint
        return endpoints[0];
      default:
        return endpoints[0];
    }
  }
}

class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  isOpen(): boolean {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }
}

class MeshMetricsCollector {
  private metrics: MeshMetrics = {
    requests: {
      total: 0,
      success: 0,
      errors: 0,
      averageLatency: 0,
    },
    services: {},
    errors: {},
    timestamp: new Date().toISOString(),
  };

  recordRequest(data: {
    sourceService: string;
    targetService: string;
    method: string;
    statusCode: number;
    duration: number;
    success: boolean;
  }): void {
    this.metrics.requests.total++;

    if (data.success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }

    // Update average latency
    this.metrics.requests.averageLatency = 
      (this.metrics.requests.averageLatency * (this.metrics.requests.total - 1) + data.duration) / 
      this.metrics.requests.total;

    // Update service metrics
    if (!this.metrics.services[data.targetService]) {
      this.metrics.services[data.targetService] = {
        requests: 0,
        errors: 0,
        averageLatency: 0,
      };
    }

    const serviceMetrics = this.metrics.services[data.targetService];
    serviceMetrics.requests++;
    
    if (!data.success) {
      serviceMetrics.errors++;
    }

    serviceMetrics.averageLatency = 
      (serviceMetrics.averageLatency * (serviceMetrics.requests - 1) + data.duration) / 
      serviceMetrics.requests;
  }

  recordError(data: {
    sourceService: string;
    targetService: string;
    error: string;
    timestamp: number;
  }): void {
    const errorKey = `${data.sourceService}->${data.targetService}: ${data.error}`;
    this.metrics.errors[errorKey] = (this.metrics.errors[errorKey] || 0) + 1;
  }

  getMetrics(): MeshMetrics {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
    };
  }
}

class TraceCollector {
  private traces: Map<string, TraceData> = new Map();

  initialize(): void {
    // Initialize distributed tracing
    console.log('Distributed tracing initialized');
  }

  startTrace(traceId: string, spanId: string, data: any): TraceData {
    const trace: TraceData = {
      traceId,
      spanId,
      startTime: Date.now(),
      ...data,
    };

    this.traces.set(traceId, trace);
    return trace;
  }

  completeTrace(traceId: string, data: any): void {
    const trace = this.traces.get(traceId);
    if (trace) {
      Object.assign(trace, data);
      trace.endTime = Date.now();
    }
  }

  getTrace(traceId: string): TraceData | undefined {
    return this.traces.get(traceId);
  }
}

// Type Definitions
interface ServiceMeshConfig {
  id: string;
  name: string;
  version: string;
  namespace?: string;
  endpoints: ServiceEndpoint[];
  metadata?: Record<string, any>;
  dependencies?: string[];
  capabilities?: string[];
  loadBalancing?: {
    strategy?: 'round-robin' | 'random' | 'least-connections';
    healthCheck?: boolean;
  };
  circuitBreaker?: {
    enabled?: boolean;
    failureThreshold?: number;
    recoveryTimeout?: number;
    monitoringPeriod?: number;
  };
  retry?: {
    maxRetries?: number;
    backoffStrategy?: 'linear' | 'exponential' | 'fixed';
    initialDelay?: number;
    maxDelay?: number;
    retryableErrors?: string[];
  };
  rateLimit?: {
    requests: number;
    window: number;
    burst?: number;
    strategy?: 'fixed_window' | 'sliding_window' | 'token_bucket';
  };
  healthCheck?: {
    path?: string;
    method?: string;
    expectedStatus?: number[];
    interval?: number;
    timeout?: number;
    retries?: number;
  };
}

interface ServiceNode {
  id: string;
  name: string;
  version: string;
  namespace: string;
  endpoints: ServiceEndpoint[];
  metadata: Record<string, any>;
  status: 'healthy' | 'unhealthy' | 'unknown';
  registeredAt: string;
  lastHealthCheck: string;
  dependencies: string[];
  capabilities: string[];
}

interface TrafficPolicy {
  id: string;
  name: string;
  targetService: string;
  rules: TrafficRule[];
  priority: number;
}

interface TrafficRule {
  match: {
    path?: string;
    method?: string;
    headers?: Record<string, string>;
  };
  route: {
    destination: string;
    weight: number;
    timeout?: number;
    headers?: Record<string, string>;
  };
}

interface SecurityPolicy {
  id: string;
  name: string;
  targetService: string;
  rules: SecurityRule[];
  priority: number;
}

interface SecurityRule {
  action: 'allow' | 'deny';
  source: {
    services: string[];
    namespaces?: string[];
  };
  conditions: PolicyCondition[];
}

interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

interface LoadBalancerConfig {
  strategy: 'round-robin' | 'random' | 'least-connections';
  healthCheck: boolean;
  endpoints: ServiceEndpoint[];
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

interface MeshRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface MeshResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  duration: number;
}

interface MeshStatus {
  initialized: boolean;
  services: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
  policies: {
    traffic: number;
    security: number;
  };
  metrics: MeshMetrics;
  timestamp: string;
}

interface MeshMetrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    averageLatency: number;
  };
  services: Record<string, {
    requests: number;
    errors: number;
    averageLatency: number;
  }>;
  errors: Record<string, number>;
  timestamp: string;
}

interface TraceData {
  traceId: string;
  spanId: string;
  startTime: number;
  endTime?: number;
  operation?: string;
  service?: string;
  statusCode?: number;
  duration?: number;
  success?: boolean;
  error?: string;
}

interface ServiceTopology {
  nodes: {
    id: string;
    name: string;
    version: string;
    namespace: string;
    status: string;
    endpoints: number;
    dependencies: string[];
    capabilities: string[];
  }[];
  edges: {
    source: string;
    target: string;
    type: string;
  }[];
  timestamp: string;
}

// Webhook Management Integration
export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    initialDelay: number;
    maxDelay: number;
  };
}

export class WebhookManager extends EventEmitter {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private eventQueue: any[] = [];
  private processing = false;

  constructor() {
    super();
    this.startEventProcessor();
  }

  /**
   * Register webhook endpoint
   */
  registerWebhook(config: WebhookConfig): void {
    this.webhooks.set(config.id, config);
    this.emit('webhook.registered', { webhookId: config.id, url: config.url });
  }

  /**
   * Trigger webhook for specific events
   */
  async triggerWebhook(eventType: string, data: any): Promise<void> {
    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      deliveryAttempts: 0,
    };

    this.eventQueue.push(event);
    
    if (!this.processing) {
      this.processEventQueue();
    }
  }

  /**
   * Process webhook event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) return;

    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.deliverEvent(event);
    }

    this.processing = false;
  }

  /**
   * Deliver event to registered webhooks
   */
  private async deliverEvent(event: any): Promise<void> {
    const relevantWebhooks = Array.from(this.webhooks.values())
      .filter(webhook => webhook.active && webhook.events.includes(event.type));

    for (const webhook of relevantWebhooks) {
      await this.deliverToWebhook(event, webhook);
    }
  }

  /**
   * Deliver event to specific webhook
   */
  private async deliverToWebhook(event: any, webhook: WebhookConfig): Promise<void> {
    const maxRetries = webhook.retryPolicy.maxRetries;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const payload = {
          id: event.id,
          type: event.type,
          data: event.data,
          timestamp: event.timestamp,
        };

        const signature = this.generateSignature(JSON.stringify(payload), webhook.secret);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event.type,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          this.emit('webhook.delivered', {
            webhookId: webhook.id,
            eventId: event.id,
            attempt: attempt + 1,
          });
          break;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        attempt++;
        
        if (attempt <= maxRetries) {
          const delay = this.calculateRetryDelay(attempt, webhook.retryPolicy);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          this.emit('webhook.failed', {
            webhookId: webhook.id,
            eventId: event.id,
            error: error instanceof Error ? error.message : String(error),
            totalAttempts: attempt,
          });
        }
      }
    }
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: string, secret: string): string {
    // In production, use proper HMAC-SHA256
    return `sha256=${Buffer.from(payload + secret).toString('base64')}`;
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(attempt: number, retryPolicy: WebhookConfig['retryPolicy']): number {
    switch (retryPolicy.backoffStrategy) {
      case 'linear':
        return Math.min(retryPolicy.initialDelay * attempt, retryPolicy.maxDelay);
      case 'exponential':
        return Math.min(retryPolicy.initialDelay * Math.pow(2, attempt - 1), retryPolicy.maxDelay);
      default:
        return retryPolicy.initialDelay;
    }
  }

  /**
   * Start event processor
   */
  private startEventProcessor(): void {
    setInterval(() => {
      if (!this.processing && this.eventQueue.length > 0) {
        this.processEventQueue();
      }
    }, 1000);
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats(): any {
    return {
      totalWebhooks: this.webhooks.size,
      activeWebhooks: Array.from(this.webhooks.values()).filter(w => w.active).length,
      queuedEvents: this.eventQueue.length,
      processing: this.processing,
    };
  }
}

// Enhanced Messaging Service with Service Mesh Integration
export class EnhancedMessagingService extends MessagingService {
  private serviceMesh: ServiceMesh;
  private webhookManager: WebhookManager;

  constructor() {
    super();
    this.serviceMesh = new ServiceMesh();
    this.webhookManager = new WebhookManager();
    this.setupMeshIntegration();
    this.setupWebhookIntegration();
  }

  /**
   * Initialize enhanced messaging service with service mesh
   */
  async initialize(): Promise<void> {
    await super.initialize();
    await this.serviceMesh.initialize();

    this.emit('enhanced.service.initialized', {
      timestamp: new Date().toISOString(),
      meshStatus: this.serviceMesh.getMeshStatus(),
    });
  }

  /**
   * Register service in mesh
   */
  registerMeshService(config: ServiceMeshConfig): void {
    this.serviceMesh.registerService(config);
    
    // Also register in service registry
    const serviceEndpoint: ServiceEndpoint = {
      id: config.id,
      name: config.name,
      type: 'http',
      url: config.endpoints[0]?.url || '',
      healthCheck: config.healthCheck?.path || '/health',
      timeout: config.healthCheck?.timeout || 5000,
      retryPolicy: {
        maxRetries: config.retry?.maxRetries || 3,
        backoffStrategy: config.retry?.backoffStrategy || 'exponential',
        initialDelay: config.retry?.initialDelay || 1000,
        maxDelay: config.retry?.maxDelay || 30000,
      },
      circuitBreaker: {
        enabled: config.circuitBreaker?.enabled !== false,
        failureThreshold: config.circuitBreaker?.failureThreshold || 5,
        recoveryTimeout: config.circuitBreaker?.recoveryTimeout || 30000,
        monitoringPeriod: config.circuitBreaker?.monitoringPeriod || 60000,
      },
    };

    this.registerService(serviceEndpoint);
  }

  /**
   * Route message through service mesh
   */
  async routeMessage(
    sourceService: string,
    targetService: string,
    messageType: string,
    payload: any,
    options?: any,
  ): Promise<any> {
    const request: MeshRequest = {
      method: 'POST',
      path: `/api/messages/${messageType}`,
      headers: {
        'content-type': 'application/json',
        'x-source-service': sourceService,
        'x-message-type': messageType,
        ...options?.headers,
      },
      body: payload,
      timeout: options?.timeout,
    };

    const response = await this.serviceMesh.routeRequest(
      sourceService,
      targetService,
      request,
    );

    return response.body;
  }

  /**
   * Apply traffic policy to service mesh
   */
  applyTrafficPolicy(policy: TrafficPolicy): void {
    this.serviceMesh.applyTrafficPolicy(policy);
  }

  /**
   * Apply security policy to service mesh
   */
  applySecurityPolicy(policy: SecurityPolicy): void {
    this.serviceMesh.applySecurityPolicy(policy);
  }

  /**
   * Get service mesh status
   */
  getMeshStatus(): MeshStatus {
    return this.serviceMesh.getMeshStatus();
  }

  /**
   * Get service topology
   */
  getServiceTopology(): ServiceTopology {
    return this.serviceMesh.getServiceTopology();
  }

  /**
   * Register webhook endpoint
   */
  registerWebhook(config: WebhookConfig): void {
    this.webhookManager.registerWebhook(config);
  }

  /**
   * Trigger webhook manually
   */
  async triggerWebhook(eventType: string, data: any): Promise<void> {
    await this.webhookManager.triggerWebhook(eventType, data);
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats(): any {
    return this.webhookManager.getWebhookStats();
  }

  /**
   * Setup webhook integration
   */
  private setupWebhookIntegration(): void {
    // Register default webhooks for common events
    this.webhookManager.registerWebhook({
      id: 'patient_events_webhook',
      url: process.env.PATIENT_WEBHOOK_URL || 'https://api.reyada.com/webhooks/patient',
      events: ['patient.created', 'patient.updated', 'patient.episode.started', 'patient.episode.completed'],
      secret: process.env.WEBHOOK_SECRET || 'default_secret',
      active: true,
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        initialDelay: 1000,
        maxDelay: 30000,
      },
    });

    this.webhookManager.registerWebhook({
      id: 'clinical_events_webhook',
      url: process.env.CLINICAL_WEBHOOK_URL || 'https://api.reyada.com/webhooks/clinical',
      events: ['clinical.form.completed', 'clinical.assessment.updated', 'clinical.plan.modified'],
      secret: process.env.WEBHOOK_SECRET || 'default_secret',
      active: true,
      retryPolicy: {
        maxRetries: 5,
        backoffStrategy: 'exponential',
        initialDelay: 2000,
        maxDelay: 60000,
      },
    });

    this.webhookManager.registerWebhook({
      id: 'compliance_events_webhook',
      url: process.env.COMPLIANCE_WEBHOOK_URL || 'https://api.reyada.com/webhooks/compliance',
      events: ['compliance.violation.detected', 'compliance.audit.required', 'compliance.report.generated'],
      secret: process.env.WEBHOOK_SECRET || 'default_secret',
      active: true,
      retryPolicy: {
        maxRetries: 7,
        backoffStrategy: 'exponential',
        initialDelay: 5000,
        maxDelay: 120000,
      },
    });

    // Forward messaging events to webhooks
    this.on('message.published', (data) => {
      this.webhookManager.triggerWebhook('message.published', data);
    });

    this.on('message.processed', (data) => {
      this.webhookManager.triggerWebhook('message.processed', data);
    });

    this.on('message.failed', (data) => {
      this.webhookManager.triggerWebhook('message.failed', data);
    });

    // Forward webhook events
    this.webhookManager.on('webhook.delivered', (data) => {
      this.emit('webhook.delivered', data);
    });

    this.webhookManager.on('webhook.failed', (data) => {
      this.emit('webhook.failed', data);
    });
  }

  /**
   * Setup mesh integration
   */
  private setupMeshIntegration(): void {
    // Forward mesh events
    this.serviceMesh.on('service.registered', (data) => {
      this.emit('mesh.service.registered', data);
      // Trigger webhook for service registration
      this.webhookManager.triggerWebhook('service.registered', data);
    });

    this.serviceMesh.on('policy.applied', (data) => {
      this.emit('mesh.policy.applied', data);
      // Trigger webhook for policy changes
      this.webhookManager.triggerWebhook('policy.applied', data);
    });

    this.serviceMesh.on('metrics.collected', (data) => {
      this.emit('mesh.metrics.collected', data);
      // Trigger webhook for metrics updates
      this.webhookManager.triggerWebhook('metrics.collected', data);
    });

    // Register default homecare services
    this.registerDefaultHomecareServices();
  }

  /**
   * Register default homecare services
   */
  private registerDefaultHomecareServices(): void {
    const defaultServices: ServiceMeshConfig[] = [
      {
        id: 'patient-management-service',
        name: 'PatientManagementService',
        version: '1.0.0',
        namespace: 'homecare',
        endpoints: [
          {
            id: 'patient-api',
            url: '/api/patients',
            method: ['GET', 'POST', 'PUT', 'DELETE'],
            timeout: 5000,
          },
        ],
        dependencies: ['clinical-service', 'compliance-service'],
        capabilities: ['patient-crud', 'episode-management', 'demographics'],
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          recoveryTimeout: 30000,
        },
        retry: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          retryableErrors: ['TIMEOUT', 'CONNECTION_ERROR'],
        },
      },
      {
        id: 'clinical-documentation-service',
        name: 'ClinicalDocumentationService',
        version: '1.0.0',
        namespace: 'homecare',
        endpoints: [
          {
            id: 'clinical-api',
            url: '/api/clinical',
            method: ['GET', 'POST', 'PUT'],
            timeout: 10000,
          },
        ],
        dependencies: ['patient-management-service', 'compliance-service'],
        capabilities: ['clinical-forms', 'assessments', 'care-plans'],
        circuitBreaker: {
          enabled: true,
          failureThreshold: 3,
          recoveryTimeout: 60000,
        },
        retry: {
          maxRetries: 5,
          backoffStrategy: 'exponential',
          retryableErrors: ['TIMEOUT', 'SERVER_ERROR'],
        },
      },
      {
        id: 'compliance-service',
        name: 'ComplianceService',
        version: '1.0.0',
        namespace: 'homecare',
        endpoints: [
          {
            id: 'compliance-api',
            url: '/api/compliance',
            method: ['GET', 'POST'],
            timeout: 15000,
          },
        ],
        dependencies: [],
        capabilities: ['doh-validation', 'daman-submission', 'audit-trails'],
        circuitBreaker: {
          enabled: true,
          failureThreshold: 2,
          recoveryTimeout: 120000,
        },
        retry: {
          maxRetries: 7,
          backoffStrategy: 'exponential',
          retryableErrors: ['TIMEOUT', 'VALIDATION_ERROR'],
        },
        rateLimit: {
          requests: 100,
          window: 60,
          strategy: 'sliding_window',
        },
      },
    ];

    // Register services after initialization
    setTimeout(() => {
      defaultServices.forEach(service => {
        this.registerMeshService(service);
      });
    }, 1000);
  }
}

// Export enhanced messaging service instance
export const enhancedMessagingService = new EnhancedMessagingService();
export const serviceMesh = enhancedMessagingService['serviceMesh'];

// Export singleton instance (backward compatibility)
export const messagingService = new MessagingService();
export default enhancedMessagingService;
