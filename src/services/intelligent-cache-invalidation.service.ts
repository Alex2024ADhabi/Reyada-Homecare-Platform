/**
 * Intelligent Cache Invalidation Service
 * Provides smart cache invalidation strategies based on data relationships and access patterns
 */

import { errorHandlerService } from "./error-handler.service";
import { redisIntegrationService } from "./redis-integration.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

interface InvalidationRule {
  id: string;
  name: string;
  pattern: string | RegExp;
  dependencies: string[];
  strategy: "immediate" | "delayed" | "conditional" | "cascade";
  priority: "low" | "medium" | "high" | "critical";
  healthcareSpecific: boolean;
  patientSafetyImpact: boolean;
  condition?: (key: string, data: any) => boolean;
  delay?: number;
}

interface InvalidationEvent {
  id: string;
  timestamp: Date;
  triggerKey: string;
  invalidatedKeys: string[];
  strategy: string;
  reason: string;
  success: boolean;
  duration: number;
  healthcareContext?: {
    patientId?: string;
    clinicalData?: boolean;
    complianceData?: boolean;
    emergencyRelated?: boolean;
  };
}

interface CacheRelationship {
  parentKey: string;
  childKeys: string[];
  relationshipType: "dependency" | "hierarchy" | "association";
  bidirectional: boolean;
  healthcareSpecific: boolean;
}

interface InvalidationMetrics {
  totalInvalidations: number;
  successfulInvalidations: number;
  failedInvalidations: number;
  averageInvalidationTime: number;
  cascadeInvalidations: number;
  healthcareInvalidations: number;
  emergencyInvalidations: number;
  patientSafetyInvalidations: number;
  performanceImpact: {
    cacheHitRateChange: number;
    responseTimeImpact: number;
    systemLoadIncrease: number;
  };
}

class IntelligentCacheInvalidationService {
  private invalidationRules: Map<string, InvalidationRule> = new Map();
  private cacheRelationships: Map<string, CacheRelationship> = new Map();
  private invalidationHistory: InvalidationEvent[] = [];
  private metrics: InvalidationMetrics;
  private isInitialized = false;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private delayedInvalidationQueue: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.metrics = {
      totalInvalidations: 0,
      successfulInvalidations: 0,
      failedInvalidations: 0,
      averageInvalidationTime: 0,
      cascadeInvalidations: 0,
      healthcareInvalidations: 0,
      emergencyInvalidations: 0,
      patientSafetyInvalidations: 0,
      performanceImpact: {
        cacheHitRateChange: 0,
        responseTimeImpact: 0,
        systemLoadIncrease: 0,
      },
    };
  }

  /**
   * Initialize intelligent cache invalidation service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🧠 Initializing Intelligent Cache Invalidation Service...");

      // Initialize healthcare-specific invalidation rules
      await this.initializeHealthcareInvalidationRules();
      await this.initializeGeneralInvalidationRules();
      await this.initializeCacheRelationships();

      // Start monitoring and optimization
      this.startInvalidationMonitoring();
      this.startPerformanceOptimization();

      this.isInitialized = true;
      console.log(
        `✅ Intelligent Cache Invalidation Service initialized with ${this.invalidationRules.size} rules`,
      );
    } catch (error) {
      console.error(
        "❌ Failed to initialize Intelligent Cache Invalidation Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "IntelligentCacheInvalidationService.initialize",
      });
      throw error;
    }
  }

  private async initializeHealthcareInvalidationRules(): Promise<void> {
    const healthcareRules: InvalidationRule[] = [
      {
        id: "patient_data_update",
        name: "Patient Data Update Invalidation",
        pattern: /^patient:.*$/,
        dependencies: [
          "patient_episodes:*",
          "clinical_forms:*",
          "medication_list:*",
          "care_plan:*",
        ],
        strategy: "immediate",
        priority: "critical",
        healthcareSpecific: true,
        patientSafetyImpact: true,
      },
      {
        id: "clinical_form_submission",
        name: "Clinical Form Submission Invalidation",
        pattern: /^clinical_form:.*$/,
        dependencies: [
          "patient_summary:*",
          "episode_data:*",
          "compliance_status:*",
          "quality_metrics:*",
        ],
        strategy: "cascade",
        priority: "high",
        healthcareSpecific: true,
        patientSafetyImpact: true,
      },
      {
        id: "medication_reconciliation",
        name: "Medication Reconciliation Invalidation",
        pattern: /^medication:.*$/,
        dependencies: [
          "patient_medications:*",
          "drug_interactions:*",
          "allergy_alerts:*",
          "safety_checks:*",
        ],
        strategy: "immediate",
        priority: "critical",
        healthcareSpecific: true,
        patientSafetyImpact: true,
      },
      {
        id: "emergency_alert",
        name: "Emergency Alert Invalidation",
        pattern: /^emergency:.*$/,
        dependencies: [
          "patient_status:*",
          "staff_notifications:*",
          "emergency_protocols:*",
        ],
        strategy: "immediate",
        priority: "critical",
        healthcareSpecific: true,
        patientSafetyImpact: true,
      },
      {
        id: "doh_compliance_update",
        name: "DOH Compliance Update Invalidation",
        pattern: /^doh:.*|compliance:.*$/,
        dependencies: [
          "compliance_reports:*",
          "audit_trails:*",
          "quality_indicators:*",
          "regulatory_status:*",
        ],
        strategy: "delayed",
        priority: "high",
        healthcareSpecific: true,
        patientSafetyImpact: false,
        delay: 5000, // 5 seconds delay for compliance data
      },
      {
        id: "jawda_metrics_update",
        name: "JAWDA Metrics Update Invalidation",
        pattern: /^jawda:.*|quality_metrics:.*$/,
        dependencies: [
          "quality_dashboard:*",
          "performance_indicators:*",
          "improvement_plans:*",
        ],
        strategy: "conditional",
        priority: "medium",
        healthcareSpecific: true,
        patientSafetyImpact: false,
        condition: (key, data) => {
          // Only invalidate if significant change in metrics
          return data?.changePercentage > 5;
        },
      },
    ];

    healthcareRules.forEach((rule) => {
      this.invalidationRules.set(rule.id, rule);
    });

    console.log(
      `🏥 Initialized ${healthcareRules.length} healthcare invalidation rules`,
    );
  }

  private async initializeGeneralInvalidationRules(): Promise<void> {
    const generalRules: InvalidationRule[] = [
      {
        id: "user_session_update",
        name: "User Session Update Invalidation",
        pattern: /^session:.*|user:.*$/,
        dependencies: ["user_preferences:*", "access_permissions:*"],
        strategy: "immediate",
        priority: "high",
        healthcareSpecific: false,
        patientSafetyImpact: false,
      },
      {
        id: "configuration_change",
        name: "Configuration Change Invalidation",
        pattern: /^config:.*|settings:.*$/,
        dependencies: ["app_config:*", "feature_flags:*", "ui_settings:*"],
        strategy: "cascade",
        priority: "medium",
        healthcareSpecific: false,
        patientSafetyImpact: false,
      },
      {
        id: "template_update",
        name: "Template Update Invalidation",
        pattern: /^template:.*|form_template:.*$/,
        dependencies: ["rendered_forms:*", "form_cache:*"],
        strategy: "delayed",
        priority: "low",
        healthcareSpecific: true,
        patientSafetyImpact: false,
        delay: 10000, // 10 seconds delay for templates
      },
    ];

    generalRules.forEach((rule) => {
      this.invalidationRules.set(rule.id, rule);
    });

    console.log(
      `⚙️ Initialized ${generalRules.length} general invalidation rules`,
    );
  }

  private async initializeCacheRelationships(): Promise<void> {
    const relationships: CacheRelationship[] = [
      {
        parentKey: "patient:*",
        childKeys: [
          "patient_episodes:*",
          "clinical_forms:*",
          "medication_list:*",
          "care_plan:*",
          "patient_summary:*",
        ],
        relationshipType: "hierarchy",
        bidirectional: false,
        healthcareSpecific: true,
      },
      {
        parentKey: "clinical_form:*",
        childKeys: [
          "episode_data:*",
          "compliance_status:*",
          "quality_metrics:*",
        ],
        relationshipType: "dependency",
        bidirectional: true,
        healthcareSpecific: true,
      },
      {
        parentKey: "medication:*",
        childKeys: [
          "drug_interactions:*",
          "allergy_alerts:*",
          "safety_checks:*",
        ],
        relationshipType: "association",
        bidirectional: false,
        healthcareSpecific: true,
      },
    ];

    relationships.forEach((relationship, index) => {
      this.cacheRelationships.set(`relationship_${index}`, relationship);
    });

    console.log(`🔗 Initialized ${relationships.length} cache relationships`);
  }

  /**
   * Intelligently invalidate cache based on key and context
   */
  async invalidate(
    key: string,
    options?: {
      reason?: string;
      healthcareContext?: InvalidationEvent["healthcareContext"];
      force?: boolean;
      skipDependencies?: boolean;
    },
  ): Promise<InvalidationEvent> {
    const startTime = Date.now();
    const eventId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reason = options?.reason || "Manual invalidation";
    const healthcareContext = options?.healthcareContext;

    try {
      // Find matching invalidation rule
      const matchingRule = this.findMatchingRule(key);
      if (!matchingRule && !options?.force) {
        console.log(`No invalidation rule found for key: ${key}`);
        return this.createInvalidationEvent(
          eventId,
          key,
          [],
          "none",
          reason,
          false,
          Date.now() - startTime,
          healthcareContext,
        );
      }

      const rule = matchingRule || this.createDefaultRule(key);
      const invalidatedKeys: string[] = [];

      // Handle different invalidation strategies
      switch (rule.strategy) {
        case "immediate":
          await this.performImmediateInvalidation(
            key,
            rule,
            invalidatedKeys,
            options?.skipDependencies,
          );
          break;

        case "delayed":
          await this.performDelayedInvalidation(
            key,
            rule,
            invalidatedKeys,
            options?.skipDependencies,
          );
          break;

        case "conditional":
          await this.performConditionalInvalidation(
            key,
            rule,
            invalidatedKeys,
            options?.skipDependencies,
          );
          break;

        case "cascade":
          await this.performCascadeInvalidation(
            key,
            rule,
            invalidatedKeys,
            options?.skipDependencies,
          );
          break;
      }

      const duration = Date.now() - startTime;
      const event = this.createInvalidationEvent(
        eventId,
        key,
        invalidatedKeys,
        rule.strategy,
        reason,
        true,
        duration,
        healthcareContext,
      );

      // Update metrics
      this.updateMetrics(event, rule);

      // Emit event
      this.emit("cache-invalidated", event);

      console.log(
        `✅ Cache invalidation completed: ${key} (${invalidatedKeys.length} keys affected)`,
      );

      return event;
    } catch (error) {
      const duration = Date.now() - startTime;
      const event = this.createInvalidationEvent(
        eventId,
        key,
        [],
        "error",
        `Error: ${error}`,
        false,
        duration,
        healthcareContext,
      );

      this.metrics.failedInvalidations++;
      this.emit("invalidation-error", { event, error });

      console.error(`❌ Cache invalidation failed for key: ${key}`, error);
      errorHandlerService.handleError(error, {
        context: "IntelligentCacheInvalidationService.invalidate",
        key,
      });

      return event;
    }
  }

  private async performImmediateInvalidation(
    key: string,
    rule: InvalidationRule,
    invalidatedKeys: string[],
    skipDependencies?: boolean,
  ): Promise<void> {
    // Invalidate the primary key
    await this.invalidateKey(key);
    invalidatedKeys.push(key);

    // Invalidate dependencies if not skipped
    if (!skipDependencies && rule.dependencies.length > 0) {
      for (const dependency of rule.dependencies) {
        const dependencyKeys = await this.expandPattern(dependency, key);
        for (const depKey of dependencyKeys) {
          await this.invalidateKey(depKey);
          invalidatedKeys.push(depKey);
        }
      }
    }
  }

  private async performDelayedInvalidation(
    key: string,
    rule: InvalidationRule,
    invalidatedKeys: string[],
    skipDependencies?: boolean,
  ): Promise<void> {
    const delay = rule.delay || 5000;

    // Cancel any existing delayed invalidation for this key
    if (this.delayedInvalidationQueue.has(key)) {
      clearTimeout(this.delayedInvalidationQueue.get(key)!);
    }

    // Schedule delayed invalidation
    const timeoutId = setTimeout(async () => {
      await this.performImmediateInvalidation(
        key,
        rule,
        invalidatedKeys,
        skipDependencies,
      );
      this.delayedInvalidationQueue.delete(key);
    }, delay);

    this.delayedInvalidationQueue.set(key, timeoutId);
    console.log(`⏰ Scheduled delayed invalidation for ${key} in ${delay}ms`);
  }

  private async performConditionalInvalidation(
    key: string,
    rule: InvalidationRule,
    invalidatedKeys: string[],
    skipDependencies?: boolean,
  ): Promise<void> {
    if (!rule.condition) {
      // Fallback to immediate invalidation if no condition
      await this.performImmediateInvalidation(
        key,
        rule,
        invalidatedKeys,
        skipDependencies,
      );
      return;
    }

    try {
      // Get current data to evaluate condition
      const currentData = await this.getCachedData(key);
      const shouldInvalidate = rule.condition(key, currentData);

      if (shouldInvalidate) {
        await this.performImmediateInvalidation(
          key,
          rule,
          invalidatedKeys,
          skipDependencies,
        );
      } else {
        console.log(`🔍 Conditional invalidation skipped for ${key}`);
      }
    } catch (error) {
      console.error(`Error evaluating condition for ${key}:`, error);
      // Fallback to immediate invalidation on error
      await this.performImmediateInvalidation(
        key,
        rule,
        invalidatedKeys,
        skipDependencies,
      );
    }
  }

  private async performCascadeInvalidation(
    key: string,
    rule: InvalidationRule,
    invalidatedKeys: string[],
    skipDependencies?: boolean,
  ): Promise<void> {
    // Start with immediate invalidation
    await this.performImmediateInvalidation(
      key,
      rule,
      invalidatedKeys,
      skipDependencies,
    );

    // Find related cache relationships
    const relatedKeys = await this.findRelatedKeys(key);
    for (const relatedKey of relatedKeys) {
      if (!invalidatedKeys.includes(relatedKey)) {
        await this.invalidateKey(relatedKey);
        invalidatedKeys.push(relatedKey);
      }
    }

    this.metrics.cascadeInvalidations++;
  }

  private findMatchingRule(key: string): InvalidationRule | null {
    for (const rule of this.invalidationRules.values()) {
      if (rule.pattern instanceof RegExp) {
        if (rule.pattern.test(key)) {
          return rule;
        }
      } else {
        if (key.includes(rule.pattern)) {
          return rule;
        }
      }
    }
    return null;
  }

  private createDefaultRule(key: string): InvalidationRule {
    return {
      id: "default",
      name: "Default Invalidation Rule",
      pattern: key,
      dependencies: [],
      strategy: "immediate",
      priority: "medium",
      healthcareSpecific: false,
      patientSafetyImpact: false,
    };
  }

  private async expandPattern(
    pattern: string,
    contextKey: string,
  ): Promise<string[]> {
    // Extract context from the original key for pattern expansion
    const contextParts = contextKey.split(":");
    const expandedPattern = pattern.replace("*", contextParts[1] || "*");

    // In a real implementation, this would query the cache for matching keys
    // For now, return the expanded pattern as a single key
    return [expandedPattern];
  }

  private async invalidateKey(key: string): Promise<void> {
    try {
      // Invalidate from Redis cache
      await redisIntegrationService.del(key);

      // Invalidate from other cache levels if needed
      // This would integrate with multi-level caching service

      console.log(`🗑️ Invalidated cache key: ${key}`);
    } catch (error) {
      console.error(`Failed to invalidate key ${key}:`, error);
      throw error;
    }
  }

  private async getCachedData(key: string): Promise<any> {
    try {
      const data = await redisIntegrationService.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to get cached data for ${key}:`, error);
      return null;
    }
  }

  private async findRelatedKeys(key: string): Promise<string[]> {
    const relatedKeys: string[] = [];

    for (const relationship of this.cacheRelationships.values()) {
      // Check if key matches parent pattern
      if (this.matchesPattern(key, relationship.parentKey)) {
        relatedKeys.push(...relationship.childKeys);
      }

      // Check if key matches child pattern and relationship is bidirectional
      if (relationship.bidirectional) {
        for (const childPattern of relationship.childKeys) {
          if (this.matchesPattern(key, childPattern)) {
            relatedKeys.push(relationship.parentKey);
            break;
          }
        }
      }
    }

    return relatedKeys;
  }

  private matchesPattern(key: string, pattern: string): boolean {
    if (pattern.includes("*")) {
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      return regex.test(key);
    }
    return key === pattern;
  }

  private createInvalidationEvent(
    id: string,
    triggerKey: string,
    invalidatedKeys: string[],
    strategy: string,
    reason: string,
    success: boolean,
    duration: number,
    healthcareContext?: InvalidationEvent["healthcareContext"],
  ): InvalidationEvent {
    const event: InvalidationEvent = {
      id,
      timestamp: new Date(),
      triggerKey,
      invalidatedKeys,
      strategy,
      reason,
      success,
      duration,
      healthcareContext,
    };

    this.invalidationHistory.push(event);
    return event;
  }

  private updateMetrics(
    event: InvalidationEvent,
    rule: InvalidationRule,
  ): void {
    this.metrics.totalInvalidations++;

    if (event.success) {
      this.metrics.successfulInvalidations++;
    } else {
      this.metrics.failedInvalidations++;
    }

    // Update average invalidation time
    this.metrics.averageInvalidationTime =
      (this.metrics.averageInvalidationTime + event.duration) / 2;

    // Update healthcare-specific metrics
    if (rule.healthcareSpecific) {
      this.metrics.healthcareInvalidations++;
    }

    if (rule.patientSafetyImpact) {
      this.metrics.patientSafetyInvalidations++;
    }

    if (event.healthcareContext?.emergencyRelated) {
      this.metrics.emergencyInvalidations++;
    }
  }

  private startInvalidationMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.analyzeInvalidationPatterns();
      this.optimizeInvalidationRules();
      this.reportMetrics();
    }, 300000); // Every 5 minutes
  }

  private startPerformanceOptimization(): void {
    setInterval(() => {
      this.optimizeDelayedInvalidations();
      this.cleanupInvalidationHistory();
    }, 600000); // Every 10 minutes
  }

  private analyzeInvalidationPatterns(): void {
    const recentEvents = this.invalidationHistory.slice(-100);
    const patternFrequency = new Map<string, number>();

    recentEvents.forEach((event) => {
      const pattern = event.triggerKey.split(":")[0];
      patternFrequency.set(pattern, (patternFrequency.get(pattern) || 0) + 1);
    });

    // Log frequent patterns for optimization
    const frequentPatterns = Array.from(patternFrequency.entries())
      .filter(([, count]) => count > 10)
      .sort(([, a], [, b]) => b - a);

    if (frequentPatterns.length > 0) {
      console.log("📊 Frequent invalidation patterns:", frequentPatterns);
    }
  }

  private optimizeInvalidationRules(): void {
    // Analyze rule effectiveness and suggest optimizations
    const ruleUsage = new Map<string, number>();

    this.invalidationHistory.forEach((event) => {
      const rule = this.findMatchingRule(event.triggerKey);
      if (rule) {
        ruleUsage.set(rule.id, (ruleUsage.get(rule.id) || 0) + 1);
      }
    });

    // Identify unused rules
    const unusedRules = Array.from(this.invalidationRules.keys()).filter(
      (ruleId) => !ruleUsage.has(ruleId),
    );

    if (unusedRules.length > 0) {
      console.log("⚠️ Unused invalidation rules:", unusedRules);
    }
  }

  private optimizeDelayedInvalidations(): void {
    // Clean up expired delayed invalidations
    const expiredKeys: string[] = [];

    this.delayedInvalidationQueue.forEach((timeoutId, key) => {
      // Check if timeout is still valid (this is a simplified check)
      if (!timeoutId) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => {
      this.delayedInvalidationQueue.delete(key);
    });
  }

  private cleanupInvalidationHistory(): void {
    // Keep only last 1000 events
    if (this.invalidationHistory.length > 1000) {
      this.invalidationHistory = this.invalidationHistory.slice(-1000);
    }
  }

  private reportMetrics(): void {
    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "Cache_Invalidation_Success_Rate",
      value:
        this.metrics.totalInvalidations > 0
          ? (this.metrics.successfulInvalidations /
              this.metrics.totalInvalidations) *
            100
          : 100,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "cache",
      name: "Average_Invalidation_Time",
      value: this.metrics.averageInvalidationTime,
      unit: "ms",
    });

    performanceMonitoringService.recordMetric({
      type: "healthcare",
      name: "Healthcare_Cache_Invalidations",
      value: this.metrics.healthcareInvalidations,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "healthcare",
      name: "Patient_Safety_Invalidations",
      value: this.metrics.patientSafetyInvalidations,
      unit: "count",
    });
  }

  // Event system
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in invalidation event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // Public API methods
  public getInvalidationRules(): InvalidationRule[] {
    return Array.from(this.invalidationRules.values());
  }

  public getInvalidationHistory(): InvalidationEvent[] {
    return [...this.invalidationHistory];
  }

  public getMetrics(): InvalidationMetrics {
    return { ...this.metrics };
  }

  public addInvalidationRule(rule: InvalidationRule): void {
    this.invalidationRules.set(rule.id, rule);
    console.log(`Added invalidation rule: ${rule.name}`);
  }

  public removeInvalidationRule(ruleId: string): boolean {
    const removed = this.invalidationRules.delete(ruleId);
    if (removed) {
      console.log(`Removed invalidation rule: ${ruleId}`);
    }
    return removed;
  }

  public async invalidatePattern(
    pattern: string,
    options?: {
      reason?: string;
      healthcareContext?: InvalidationEvent["healthcareContext"];
    },
  ): Promise<InvalidationEvent[]> {
    // In a real implementation, this would find all keys matching the pattern
    // and invalidate them
    const matchingKeys = await this.findKeysMatchingPattern(pattern);
    const events: InvalidationEvent[] = [];

    for (const key of matchingKeys) {
      const event = await this.invalidate(key, options);
      events.push(event);
    }

    return events;
  }

  private async findKeysMatchingPattern(pattern: string): Promise<string[]> {
    // Mock implementation - in production, this would scan cache keys
    return [`${pattern.replace("*", "example")}`];
  }

  public async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Clear all delayed invalidations
    this.delayedInvalidationQueue.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.delayedInvalidationQueue.clear();

    this.invalidationHistory = [];
    this.eventListeners.clear();

    console.log("🧹 Intelligent Cache Invalidation Service cleaned up");
  }
}

export const intelligentCacheInvalidationService =
  new IntelligentCacheInvalidationService();
export {
  InvalidationRule,
  InvalidationEvent,
  CacheRelationship,
  InvalidationMetrics,
};
export default intelligentCacheInvalidationService;
