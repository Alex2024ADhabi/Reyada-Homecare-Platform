// Predictive Caching Service for Enhanced Offline Experience

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  size: number;
  expiresAt?: number;
}

interface UserPattern {
  patientIds: string[];
  formTypes: string[];
  timePatterns: number[];
  locationPatterns: string[];
  accessFrequency: Record<string, number>;
  sessionDuration: number;
  commonWorkflows: string[];
}

interface PredictionModel {
  patientAccess: Record<string, number>;
  formUsage: Record<string, number>;
  timeBasedAccess: Record<string, number>;
  workflowPatterns: Record<string, string[]>;
  confidence: number;
}

class PredictiveCacheService {
  private static instance: PredictiveCacheService;
  private cache: Map<string, CacheEntry> = new Map();
  private userPatterns: UserPattern = {
    patientIds: [],
    formTypes: [],
    timePatterns: [],
    locationPatterns: [],
    accessFrequency: {},
    sessionDuration: 0,
    commonWorkflows: [],
  };
  private predictionModel: PredictionModel = {
    patientAccess: {},
    formUsage: {},
    timeBasedAccess: {},
    workflowPatterns: {},
    confidence: 0,
  };
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;
  private isInitialized = false;
  private analyticsEnabled = true;

  private constructor() {
    this.initializePatternTracking();
  }

  static getInstance(): PredictiveCacheService {
    if (!PredictiveCacheService.instance) {
      PredictiveCacheService.instance = new PredictiveCacheService();
    }
    return PredictiveCacheService.instance;
  }

  /**
   * Initialize predictive caching with user pattern analysis
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing patterns from storage
      await this.loadUserPatterns();

      // Load existing cache entries
      await this.loadCacheFromStorage();

      // Initialize prediction model
      await this.buildPredictionModel();

      // Start pattern tracking
      this.startPatternTracking();

      // Schedule periodic cache optimization
      this.scheduleOptimization();

      this.isInitialized = true;
      console.log("✅ Predictive cache service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize predictive cache:", error);
    }
  }

  /**
   * Predict and pre-cache likely needed data
   */
  async predictAndCache(): Promise<{
    predictions: string[];
    cached: number;
    confidence: number;
  }> {
    const predictions = await this.generatePredictions();
    let cached = 0;

    for (const prediction of predictions) {
      try {
        const success = await this.preCacheData(prediction);
        if (success) cached++;
      } catch (error) {
        console.warn(`Failed to pre-cache ${prediction}:`, error);
      }
    }

    return {
      predictions,
      cached,
      confidence: this.predictionModel.confidence,
    };
  }

  /**
   * Generate predictions based on user patterns
   */
  private async generatePredictions(): Promise<string[]> {
    const predictions: string[] = [];
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // Time-based predictions
    const timeKey = `${dayOfWeek}-${currentHour}`;
    if (this.predictionModel.timeBasedAccess[timeKey] > 0.3) {
      predictions.push(`time-pattern-${timeKey}`);
    }

    // Patient-based predictions
    const topPatients = Object.entries(this.predictionModel.patientAccess)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([patientId]) => patientId);

    predictions.push(...topPatients.map((id) => `patient-${id}`));

    // Form-based predictions
    const topForms = Object.entries(this.predictionModel.formUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([formType]) => formType);

    predictions.push(...topForms.map((type) => `form-template-${type}`));

    // Workflow-based predictions
    const currentWorkflow = this.detectCurrentWorkflow();
    if (
      currentWorkflow &&
      this.predictionModel.workflowPatterns[currentWorkflow]
    ) {
      predictions.push(
        ...this.predictionModel.workflowPatterns[currentWorkflow],
      );
    }

    return predictions.slice(0, 10); // Limit to top 10 predictions
  }

  /**
   * Pre-cache predicted data
   */
  private async preCacheData(prediction: string): Promise<boolean> {
    try {
      let data: any = null;
      let category = "general";
      let priority: CacheEntry["priority"] = "medium";

      if (prediction.startsWith("patient-")) {
        const patientId = prediction.replace("patient-", "");
        data = await this.fetchPatientData(patientId);
        category = "patient";
        priority = "high";
      } else if (prediction.startsWith("form-template-")) {
        const formType = prediction.replace("form-template-", "");
        data = await this.fetchFormTemplate(formType);
        category = "form";
        priority = "medium";
      } else if (prediction.startsWith("time-pattern-")) {
        data = await this.fetchTimeBasedData(prediction);
        category = "temporal";
        priority = "low";
      }

      if (data) {
        await this.set(prediction, data, { category, priority });
        return true;
      }
    } catch (error) {
      console.warn(`Pre-caching failed for ${prediction}:`, error);
    }

    return false;
  }

  /**
   * Set cache entry with intelligent eviction
   */
  async set(
    key: string,
    data: any,
    options: {
      category?: string;
      priority?: CacheEntry["priority"];
      ttl?: number;
    } = {},
  ): Promise<void> {
    const size = this.calculateSize(data);

    // Check if we need to make space
    if (this.currentCacheSize + size > this.maxCacheSize) {
      await this.evictLeastValuable(size);
    }

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      priority: options.priority || "medium",
      category: options.category || "general",
      size,
      expiresAt: options.ttl ? Date.now() + options.ttl : undefined,
    };

    this.cache.set(key, entry);
    this.currentCacheSize += size;

    // Update patterns
    this.updateAccessPatterns(key, "write");

    // Persist to storage
    await this.persistCacheEntry(entry);
  }

  /**
   * Get cache entry with pattern tracking
   */
  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);

    if (!entry) {
      // Try to load from persistent storage
      const persistedEntry = await this.loadCacheEntry(key);
      if (persistedEntry) {
        this.cache.set(key, persistedEntry);
        this.currentCacheSize += persistedEntry.size;
        return this.processHit(persistedEntry);
      }
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      await this.delete(key);
      return null;
    }

    return this.processHit(entry);
  }

  /**
   * Process cache hit and update patterns
   */
  private processHit(entry: CacheEntry): any {
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    // Update patterns
    this.updateAccessPatterns(entry.key, "read");

    return entry.data;
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.currentCacheSize -= entry.size;
      await this.removeCacheEntry(key);
    }
  }

  /**
   * Intelligent cache eviction based on value scoring
   */
  private async evictLeastValuable(requiredSpace: number): Promise<void> {
    const entries = Array.from(this.cache.values());

    // Score entries based on multiple factors
    const scoredEntries = entries
      .map((entry) => ({
        entry,
        score: this.calculateEntryValue(entry),
      }))
      .sort((a, b) => a.score - b.score);

    let freedSpace = 0;
    for (const { entry } of scoredEntries) {
      if (freedSpace >= requiredSpace) break;

      await this.delete(entry.key);
      freedSpace += entry.size;
    }
  }

  /**
   * Calculate entry value for eviction decisions
   */
  private calculateEntryValue(entry: CacheEntry): number {
    const now = Date.now();
    const age = now - entry.timestamp;
    const timeSinceAccess = now - entry.lastAccessed;

    // Priority weights
    const priorityWeights = {
      critical: 1000,
      high: 100,
      medium: 10,
      low: 1,
    };

    // Base score from priority
    let score = priorityWeights[entry.priority];

    // Boost score based on access frequency
    score *= 1 + entry.accessCount;

    // Reduce score based on age and time since last access
    score /= 1 + age / (1000 * 60 * 60); // Age in hours
    score /= 1 + timeSinceAccess / (1000 * 60 * 30); // Time since access in 30-min intervals

    // Size penalty (prefer smaller items when space is tight)
    score /= Math.log(entry.size + 1);

    return score;
  }

  /**
   * Update user access patterns for prediction model
   */
  private updateAccessPatterns(key: string, operation: "read" | "write"): void {
    if (!this.analyticsEnabled) return;

    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const timeKey = `${dayOfWeek}-${hour}`;

    // Update time-based patterns
    this.predictionModel.timeBasedAccess[timeKey] =
      (this.predictionModel.timeBasedAccess[timeKey] || 0) + 1;

    // Update access frequency
    this.userPatterns.accessFrequency[key] =
      (this.userPatterns.accessFrequency[key] || 0) + 1;

    // Extract patterns from key
    if (key.startsWith("patient-")) {
      const patientId = key.replace("patient-", "");
      this.predictionModel.patientAccess[patientId] =
        (this.predictionModel.patientAccess[patientId] || 0) + 1;
    } else if (key.startsWith("form-")) {
      const formType = key.split("-")[1];
      this.predictionModel.formUsage[formType] =
        (this.predictionModel.formUsage[formType] || 0) + 1;
    }

    // Update prediction model confidence
    this.updateModelConfidence();
  }

  /**
   * Update prediction model confidence based on pattern strength
   */
  private updateModelConfidence(): void {
    const totalAccesses = Object.values(
      this.userPatterns.accessFrequency,
    ).reduce((sum, count) => sum + count, 0);

    if (totalAccesses < 10) {
      this.predictionModel.confidence = 0.1;
    } else if (totalAccesses < 50) {
      this.predictionModel.confidence = 0.5;
    } else if (totalAccesses < 100) {
      this.predictionModel.confidence = 0.7;
    } else {
      this.predictionModel.confidence = 0.9;
    }
  }

  /**
   * Detect current workflow based on recent access patterns
   */
  private detectCurrentWorkflow(): string | null {
    const recentAccesses = Array.from(this.cache.values())
      .filter((entry) => Date.now() - entry.lastAccessed < 5 * 60 * 1000) // Last 5 minutes
      .map((entry) => entry.category)
      .slice(-5);

    if (recentAccesses.includes("patient") && recentAccesses.includes("form")) {
      return "patient-assessment";
    } else if (
      recentAccesses.includes("clinical") &&
      recentAccesses.includes("compliance")
    ) {
      return "clinical-documentation";
    } else if (
      recentAccesses.includes("revenue") &&
      recentAccesses.includes("claims")
    ) {
      return "revenue-management";
    }

    return null;
  }

  /**
   * Initialize pattern tracking
   */
  private initializePatternTracking(): void {
    // Track page visibility for session duration
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.saveUserPatterns();
        }
      });
    }

    // Track before unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.saveUserPatterns();
      });
    }
  }

  /**
   * Start continuous pattern tracking
   */
  private startPatternTracking(): void {
    // Update patterns every 5 minutes
    setInterval(
      () => {
        this.buildPredictionModel();
        this.saveUserPatterns();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Schedule cache optimization
   */
  private scheduleOptimization(): void {
    // Optimize cache every 30 minutes
    setInterval(
      () => {
        this.optimizeCache();
      },
      30 * 60 * 1000,
    );

    // Clean expired entries every 10 minutes
    setInterval(
      () => {
        this.cleanExpiredEntries();
      },
      10 * 60 * 1000,
    );
  }

  /**
   * Optimize cache based on usage patterns
   */
  private async optimizeCache(): Promise<void> {
    console.log("🔄 Optimizing predictive cache...");

    // Remove rarely accessed entries
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    for (const entry of entries) {
      const daysSinceAccess =
        (now - entry.lastAccessed) / (1000 * 60 * 60 * 24);

      if (daysSinceAccess > 7 && entry.accessCount < 2) {
        await this.delete(entry.key);
      }
    }

    // Pre-cache predicted data
    await this.predictAndCache();

    console.log(
      `✅ Cache optimized: ${this.cache.size} entries, ${Math.round(this.currentCacheSize / 1024 / 1024)}MB`,
    );
  }

  /**
   * Clean expired cache entries
   */
  private async cleanExpiredEntries(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      await this.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Build prediction model from user patterns
   */
  private async buildPredictionModel(): Promise<void> {
    // Analyze access patterns to build prediction model
    const totalAccesses = Object.values(
      this.userPatterns.accessFrequency,
    ).reduce((sum, count) => sum + count, 0);

    if (totalAccesses === 0) return;

    // Normalize access frequencies to probabilities
    for (const [key, count] of Object.entries(
      this.userPatterns.accessFrequency,
    )) {
      if (key.startsWith("patient-")) {
        const patientId = key.replace("patient-", "");
        this.predictionModel.patientAccess[patientId] = count / totalAccesses;
      } else if (key.startsWith("form-")) {
        const formType = key.split("-")[1];
        this.predictionModel.formUsage[formType] = count / totalAccesses;
      }
    }

    // Build workflow patterns
    this.predictionModel.workflowPatterns = {
      "patient-assessment": [
        "patient-demographics",
        "assessment-forms",
        "vital-signs",
      ],
      "clinical-documentation": [
        "clinical-forms",
        "compliance-check",
        "signatures",
      ],
      "revenue-management": [
        "claims-data",
        "payment-info",
        "denial-management",
      ],
    };
  }

  /**
   * Calculate data size for cache management
   */
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  // Storage methods (would integrate with IndexedDB)
  private async loadUserPatterns(): Promise<void> {
    try {
      const stored = localStorage.getItem("predictive-cache-patterns");
      if (stored) {
        this.userPatterns = { ...this.userPatterns, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn("Failed to load user patterns:", error);
    }
  }

  private async saveUserPatterns(): Promise<void> {
    try {
      localStorage.setItem(
        "predictive-cache-patterns",
        JSON.stringify(this.userPatterns),
      );
    } catch (error) {
      console.warn("Failed to save user patterns:", error);
    }
  }

  private async loadCacheFromStorage(): Promise<void> {
    // Implementation would load from IndexedDB
    console.log("Loading cache from persistent storage...");
  }

  private async persistCacheEntry(entry: CacheEntry): Promise<void> {
    // Implementation would persist to IndexedDB
  }

  private async loadCacheEntry(key: string): Promise<CacheEntry | null> {
    // Implementation would load from IndexedDB
    return null;
  }

  private async removeCacheEntry(key: string): Promise<void> {
    // Implementation would remove from IndexedDB
  }

  // Data fetching methods (would integrate with actual APIs)
  private async fetchPatientData(patientId: string): Promise<any> {
    // Implementation would fetch from API
    return { id: patientId, name: "Sample Patient", demographics: {} };
  }

  private async fetchFormTemplate(formType: string): Promise<any> {
    // Implementation would fetch from API
    return { type: formType, template: {}, fields: [] };
  }

  private async fetchTimeBasedData(pattern: string): Promise<any> {
    // Implementation would fetch contextual data
    return { pattern, data: {} };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    entries: number;
    size: number;
    hitRate: number;
    predictions: number;
    confidence: number;
  } {
    const totalAccesses = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0,
    );

    return {
      entries: this.cache.size,
      size: this.currentCacheSize,
      hitRate: totalAccesses > 0 ? 0.85 : 0, // Placeholder calculation
      predictions:
        Object.keys(this.predictionModel.patientAccess).length +
        Object.keys(this.predictionModel.formUsage).length,
      confidence: this.predictionModel.confidence,
    };
  }

  /**
   * Clear all cache data
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    this.currentCacheSize = 0;
    localStorage.removeItem("predictive-cache-patterns");
    console.log("🗑️ Predictive cache cleared");
  }
}

export const predictiveCacheService = PredictiveCacheService.getInstance();
export default predictiveCacheService;
