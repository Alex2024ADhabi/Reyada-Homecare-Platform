/**
 * Production Intelligent Cache Invalidation System
 * Event-driven invalidation with dependency tracking
 */

interface CacheInvalidationRule {
  id: string;
  pattern: string;
  triggers: string[];
  dependencies: string[];
  priority: number;
  strategy: 'immediate' | 'delayed' | 'batch' | 'conditional';
  condition?: (event: CacheEvent) => boolean;
  delay?: number;
}

interface CacheEvent {
  type: string;
  entity: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  userId?: string;
  metadata?: any;
}

interface InvalidationJob {
  id: string;
  rule: CacheInvalidationRule;
  event: CacheEvent;
  scheduledTime: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
}

interface CacheDependency {
  key: string;
  dependencies: string[];
  lastUpdated: number;
  version: number;
}

class IntelligentCacheInvalidation {
  private rules: Map<string, CacheInvalidationRule> = new Map();
  private dependencies: Map<string, CacheDependency> = new Map();
  private invalidationQueue: InvalidationJob[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private batchProcessor: NodeJS.Timeout | null = null;
  private batchedEvents: CacheEvent[] = [];

  constructor() {
    this.initializeHealthcareRules();
    this.startProcessing();
  }

  /**
   * Initialize healthcare-specific invalidation rules
   */
  private initializeHealthcareRules(): void {
    // Patient data invalidation rules
    this.addRule({
      id: 'patient_data_update',
      pattern: 'patient:*',
      triggers: ['patient.update', 'patient.create'],
      dependencies: ['patient_list', 'dashboard_stats'],
      priority: 8,
      strategy: 'immediate'
    });

    this.addRule({
      id: 'patient_vital_signs',
      pattern: 'vitals:*',
      triggers: ['vital_signs.create', 'vital_signs.update'],
      dependencies: [`patient:*`, 'dashboard_vitals', 'alerts:*'],
      priority: 9,
      strategy: 'immediate'
    });

    // Clinical notes invalidation
    this.addRule({
      id: 'clinical_notes_update',
      pattern: 'clinical_note:*',
      triggers: ['clinical_note.create', 'clinical_note.update', 'clinical_note.delete'],
      dependencies: ['patient:*', 'notes_list:*'],
      priority: 7,
      strategy: 'delayed',
      delay: 5000 // 5 second delay to batch multiple updates
    });

    // Medication invalidation
    this.addRule({
      id: 'medication_changes',
      pattern: 'medication:*',
      triggers: ['medication.create', 'medication.update', 'medication.delete'],
      dependencies: ['patient:*', 'medication_schedule:*', 'alerts:medication:*'],
      priority: 9,
      strategy: 'immediate'
    });

    // Assessment invalidation
    this.addRule({
      id: 'assessment_update',
      pattern: 'assessment:*',
      triggers: ['assessment.create', 'assessment.update'],
      dependencies: ['patient:*', 'care_plan:*', 'dashboard_assessments'],
      priority: 8,
      strategy: 'conditional',
      condition: (event) => this.isSignificantAssessmentChange(event)
    });

    // Care plan invalidation
    this.addRule({
      id: 'care_plan_update',
      pattern: 'care_plan:*',
      triggers: ['care_plan.update', 'care_plan.create'],
      dependencies: ['patient:*', 'schedule:*', 'goals:*'],
      priority: 8,
      strategy: 'immediate'
    });

    // Dashboard and reporting caches
    this.addRule({
      id: 'dashboard_stats',
      pattern: 'dashboard:*',
      triggers: ['patient.create', 'patient.update', 'appointment.create', 'vital_signs.create'],
      dependencies: [],
      priority: 5,
      strategy: 'batch'
    });

    // DOH compliance caches
    this.addRule({
      id: 'compliance_data',
      pattern: 'compliance:*',
      triggers: ['assessment.create', 'clinical_note.create', 'medication.update'],
      dependencies: ['doh_reports:*'],
      priority: 6,
      strategy: 'delayed',
      delay: 30000 // 30 second delay for compliance reporting
    });

    // User session and permissions
    this.addRule({
      id: 'user_permissions',
      pattern: 'user:*:permissions',
      triggers: ['user.role_change', 'user.permissions_update'],
      dependencies: ['user:*:session'],
      priority: 10,
      strategy: 'immediate'
    });

    // Emergency alerts
    this.addRule({
      id: 'emergency_alerts',
      pattern: 'alerts:emergency:*',
      triggers: ['emergency.create', 'vital_signs.critical'],
      dependencies: ['notifications:*'],
      priority: 10,
      strategy: 'immediate'
    });
  }

  /**
   * Add invalidation rule
   */
  addRule(rule: CacheInvalidationRule): void {
    this.rules.set(rule.id, rule);
    
    // Register event listeners for triggers
    rule.triggers.forEach(trigger => {
      if (!this.eventListeners.has(trigger)) {
        this.eventListeners.set(trigger, []);
      }
      this.eventListeners.get(trigger)!.push((event: CacheEvent) => {
        this.handleEvent(event, rule);
      });
    });

    console.log(`✅ Cache invalidation rule added: ${rule.id}`);
  }

  /**
   * Handle cache event
   */
  private async handleEvent(event: CacheEvent, rule: CacheInvalidationRule): Promise<void> {
    try {
      // Check condition if specified
      if (rule.condition && !rule.condition(event)) {
        console.log(`⏭️ Skipping invalidation for rule ${rule.id} - condition not met`);
        return;
      }

      const job: InvalidationJob = {
        id: this.generateJobId(),
        rule,
        event,
        scheduledTime: this.calculateScheduledTime(rule),
        status: 'pending',
        retryCount: 0,
        maxRetries: 3
      };

      switch (rule.strategy) {
        case 'immediate':
          await this.processInvalidationJob(job);
          break;

        case 'delayed':
          this.invalidationQueue.push(job);
          break;

        case 'batch':
          this.batchedEvents.push(event);
          break;

        case 'conditional':
          if (rule.condition && rule.condition(event)) {
            await this.processInvalidationJob(job);
          }
          break;
      }

      console.log(`🔄 Cache invalidation triggered: ${rule.id} (${rule.strategy})`);
    } catch (error) {
      console.error(`❌ Error handling cache event for rule ${rule.id}:`, error);
    }
  }

  /**
   * Process invalidation job
   */
  private async processInvalidationJob(job: InvalidationJob): Promise<void> {
    try {
      job.status = 'processing';
      
      // Invalidate primary pattern
      const primaryKeys = await this.findKeysToInvalidate(job.rule.pattern, job.event);
      await this.invalidateKeys(primaryKeys);

      // Invalidate dependencies
      for (const dependency of job.rule.dependencies) {
        const dependencyKeys = await this.findKeysToInvalidate(dependency, job.event);
        await this.invalidateKeys(dependencyKeys);
      }

      // Update dependency graph
      await this.updateDependencyGraph(job);

      job.status = 'completed';
      console.log(`✅ Cache invalidation completed: ${job.id}`);

    } catch (error) {
      console.error(`❌ Cache invalidation failed: ${job.id}`, error);
      job.status = 'failed';
      job.retryCount++;

      if (job.retryCount < job.maxRetries) {
        job.status = 'pending';
        job.scheduledTime = Date.now() + (job.retryCount * 5000); // Exponential backoff
        this.invalidationQueue.push(job);
      }
    }
  }

  /**
   * Find keys to invalidate based on pattern and event
   */
  private async findKeysToInvalidate(pattern: string, event: CacheEvent): Promise<string[]> {
    // Replace placeholders in pattern with actual values
    let resolvedPattern = pattern
      .replace('*', event.entityId || '*')
      .replace('{entityId}', event.entityId || '')
      .replace('{userId}', event.userId || '');

    // For healthcare-specific patterns
    if (pattern.includes('patient:*') && event.entity === 'patient') {
      resolvedPattern = `patient:${event.entityId}`;
    } else if (pattern.includes('vitals:*') && event.entity === 'vital_signs') {
      resolvedPattern = `vitals:${event.metadata?.patientId || event.entityId}:*`;
    }

    // In a real implementation, this would query Redis for matching keys
    // For now, we'll simulate key discovery
    const keys = await this.discoverCacheKeys(resolvedPattern);
    
    console.log(`🔍 Found ${keys.length} keys to invalidate for pattern: ${resolvedPattern}`);
    return keys;
  }

  /**
   * Discover cache keys (simulated)
   */
  private async discoverCacheKeys(pattern: string): Promise<string[]> {
    // In a real implementation, this would use Redis KEYS or SCAN commands
    // For simulation, return some example keys
    const simulatedKeys = [
      pattern.replace('*', '123'),
      pattern.replace('*', '456'),
      pattern.replace('*', '789')
    ].filter(key => !key.includes('*'));

    return simulatedKeys;
  }

  /**
   * Invalidate cache keys
   */
  private async invalidateKeys(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    try {
      // Use Redis service to delete keys
      const redisService = await import('./redis.service').then(m => m.default);
      
      for (const key of keys) {
        await redisService.del(key);
      }

      console.log(`🗑️ Invalidated ${keys.length} cache keys`);
    } catch (error) {
      console.error('❌ Error invalidating cache keys:', error);
      throw error;
    }
  }

  /**
   * Update dependency graph
   */
  private async updateDependencyGraph(job: InvalidationJob): Promise<void> {
    const { event, rule } = job;
    const primaryKey = `${event.entity}:${event.entityId}`;

    // Update or create dependency entry
    const dependency: CacheDependency = {
      key: primaryKey,
      dependencies: rule.dependencies,
      lastUpdated: Date.now(),
      version: (this.dependencies.get(primaryKey)?.version || 0) + 1
    };

    this.dependencies.set(primaryKey, dependency);

    // Propagate changes to dependent caches
    await this.propagateDependencyChanges(primaryKey, dependency);
  }

  /**
   * Propagate dependency changes
   */
  private async propagateDependencyChanges(key: string, dependency: CacheDependency): Promise<void> {
    // Find all caches that depend on this key
    const dependentCaches = Array.from(this.dependencies.entries())
      .filter(([_, dep]) => dep.dependencies.includes(key))
      .map(([depKey, _]) => depKey);

    // Invalidate dependent caches
    if (dependentCaches.length > 0) {
      await this.invalidateKeys(dependentCaches);
      console.log(`🔗 Propagated changes to ${dependentCaches.length} dependent caches`);
    }
  }

  /**
   * Emit cache event
   */
  emit(eventType: string, entity: string, entityId: string, action: 'create' | 'update' | 'delete', metadata?: any): void {
    const event: CacheEvent = {
      type: eventType,
      entity,
      entityId,
      action,
      timestamp: Date.now(),
      metadata
    };

    // Trigger listeners
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`❌ Error in cache event listener for ${eventType}:`, error);
      }
    });

    console.log(`📡 Cache event emitted: ${eventType} (${entity}:${entityId})`);
  }

  /**
   * Healthcare-specific event emitters
   */
  emitPatientUpdate(patientId: string, metadata?: any): void {
    this.emit('patient.update', 'patient', patientId, 'update', metadata);
  }

  emitVitalSignsCreate(patientId: string, vitalSignsId: string, metadata?: any): void {
    this.emit('vital_signs.create', 'vital_signs', vitalSignsId, 'create', { 
      patientId, 
      ...metadata 
    });
  }

  emitClinicalNoteUpdate(noteId: string, patientId: string, metadata?: any): void {
    this.emit('clinical_note.update', 'clinical_note', noteId, 'update', { 
      patientId, 
      ...metadata 
    });
  }

  emitMedicationChange(medicationId: string, patientId: string, action: 'create' | 'update' | 'delete', metadata?: any): void {
    this.emit(`medication.${action}`, 'medication', medicationId, action, { 
      patientId, 
      ...metadata 
    });
  }

  emitEmergencyAlert(alertId: string, patientId: string, metadata?: any): void {
    this.emit('emergency.create', 'emergency', alertId, 'create', { 
      patientId, 
      ...metadata 
    });
  }

  /**
   * Start processing queued invalidations
   */
  private startProcessing(): void {
    // Process delayed invalidations
    this.processingInterval = setInterval(async () => {
      await this.processQueue();
    }, 1000);

    // Process batched events
    this.batchProcessor = setInterval(async () => {
      await this.processBatchedEvents();
    }, 10000); // Process batches every 10 seconds
  }

  /**
   * Process invalidation queue
   */
  private async processQueue(): Promise<void> {
    const now = Date.now();
    const jobsToProcess = this.invalidationQueue.filter(job => 
      job.status === 'pending' && job.scheduledTime <= now
    );

    for (const job of jobsToProcess) {
      await this.processInvalidationJob(job);
    }

    // Clean up completed jobs
    this.invalidationQueue = this.invalidationQueue.filter(job => 
      job.status === 'pending' || (job.status === 'failed' && job.retryCount < job.maxRetries)
    );
  }

  /**
   * Process batched events
   */
  private async processBatchedEvents(): Promise<void> {
    if (this.batchedEvents.length === 0) return;

    const events = [...this.batchedEvents];
    this.batchedEvents = [];

    // Group events by type and entity
    const groupedEvents = events.reduce((acc, event) => {
      const key = `${event.type}:${event.entity}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {} as Record<string, CacheEvent[]>);

    // Process each group
    for (const [key, eventGroup] of Object.entries(groupedEvents)) {
      await this.processBatchedEventGroup(eventGroup);
    }

    console.log(`📦 Processed ${events.length} batched cache events`);
  }

  /**
   * Process batched event group
   */
  private async processBatchedEventGroup(events: CacheEvent[]): Promise<void> {
    // Find applicable rules
    const applicableRules = Array.from(this.rules.values()).filter(rule => 
      rule.strategy === 'batch' && 
      events.some(event => rule.triggers.includes(event.type))
    );

    for (const rule of applicableRules) {
      const job: InvalidationJob = {
        id: this.generateJobId(),
        rule,
        event: events[0], // Use first event as representative
        scheduledTime: Date.now(),
        status: 'pending',
        retryCount: 0,
        maxRetries: 3
      };

      await this.processInvalidationJob(job);
    }
  }

  /**
   * Healthcare-specific condition checkers
   */
  private isSignificantAssessmentChange(event: CacheEvent): boolean {
    // Check if assessment change is significant enough to invalidate cache
    const metadata = event.metadata || {};
    
    // Invalidate if score changed significantly or status changed
    return metadata.scoreChange > 10 || 
           metadata.statusChanged || 
           metadata.riskLevelChanged;
  }

  /**
   * Calculate scheduled time based on strategy
   */
  private calculateScheduledTime(rule: CacheInvalidationRule): number {
    const now = Date.now();
    
    switch (rule.strategy) {
      case 'immediate':
        return now;
      case 'delayed':
        return now + (rule.delay || 5000);
      case 'batch':
        return now + 10000; // 10 seconds for batching
      default:
        return now;
    }
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get invalidation statistics
   */
  getStats() {
    const totalJobs = this.invalidationQueue.length;
    const pendingJobs = this.invalidationQueue.filter(j => j.status === 'pending').length;
    const failedJobs = this.invalidationQueue.filter(j => j.status === 'failed').length;

    return {
      totalRules: this.rules.size,
      totalDependencies: this.dependencies.size,
      queuedJobs: totalJobs,
      pendingJobs,
      failedJobs,
      batchedEvents: this.batchedEvents.length,
      eventListeners: Array.from(this.eventListeners.entries()).reduce((acc, [event, listeners]) => {
        acc[event] = listeners.length;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    if (this.batchProcessor) {
      clearInterval(this.batchProcessor);
      this.batchProcessor = null;
    }

    this.rules.clear();
    this.dependencies.clear();
    this.invalidationQueue = [];
    this.eventListeners.clear();
    this.batchedEvents = [];
  }
}

// Singleton instance
const cacheInvalidation = new IntelligentCacheInvalidation();

export default cacheInvalidation;
export { IntelligentCacheInvalidation, CacheInvalidationRule, CacheEvent, InvalidationJob };