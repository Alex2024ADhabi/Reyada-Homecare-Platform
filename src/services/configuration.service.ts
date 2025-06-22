/**
 * Configuration Service
 * Provides centralized configuration management with environment-specific settings
 * and dynamic feature flag management
 */

import {
  configurationManager,
  ConfigurationManager,
} from "../config/api.config";

export interface ConfigurationServiceOptions {
  enableRemoteConfig?: boolean;
  remoteConfigUrl?: string;
  refreshInterval?: number;
  enableValidation?: boolean;
  enableEncryption?: boolean;
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private configManager: ConfigurationManager;
  private isInitialized = false;
  private subscribers = new Set<(config: any) => void>();
  private options: ConfigurationServiceOptions;

  private constructor(options: ConfigurationServiceOptions = {}) {
    this.options = {
      enableRemoteConfig: true,
      refreshInterval: 300000, // 5 minutes
      enableValidation: true,
      enableEncryption: false,
      ...options,
    };
    this.configManager = configurationManager;
  }

  public static getInstance(
    options?: ConfigurationServiceOptions,
  ): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService(options);
    }
    return ConfigurationService.instance;
  }

  /**
   * Initialize configuration service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🚀 Initializing Configuration Service...");

      // Initialize configuration manager
      await this.configManager.initialize();

      // Subscribe to configuration changes
      this.configManager.onConfigurationChange((config) => {
        this.notifySubscribers(config);
      });

      this.isInitialized = true;
      console.log("✅ Configuration Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Configuration Service:", error);
      throw error;
    }
  }

  /**
   * Get feature flag value
   */
  public getFeatureFlag(flagName: string): boolean {
    return this.configManager.getFeatureFlag(flagName as any);
  }

  /**
   * Get all feature flags
   */
  public getAllFeatureFlags(): Record<string, boolean> {
    return this.configManager.getConfiguration().featureFlags;
  }

  /**
   * Get environment configuration
   */
  public getEnvironmentConfig(): any {
    return this.configManager.getEnvironmentConfig();
  }

  /**
   * Get runtime configuration
   */
  public getRuntimeConfig(): any {
    return this.configManager.getRuntimeConfig();
  }

  /**
   * Get current environment name
   */
  public getEnvironment(): string {
    return this.configManager.getEnvironmentConfig().name;
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.getEnvironment() === "development";
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.getEnvironment() === "production";
  }

  /**
   * Check if running in staging mode
   */
  public isStaging(): boolean {
    return this.getEnvironment() === "staging";
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugEnabled(): boolean {
    return this.configManager.getEnvironmentConfig().debug;
  }

  /**
   * Get API timeout value
   */
  public getApiTimeout(): number {
    return this.configManager.getEnvironmentConfig().apiTimeout;
  }

  /**
   * Get max retry attempts
   */
  public getMaxRetries(): number {
    return this.configManager.getEnvironmentConfig().maxRetries;
  }

  /**
   * Get log level
   */
  public getLogLevel(): string {
    return this.configManager.getEnvironmentConfig().logLevel;
  }

  /**
   * Get logging configuration
   */
  public getLoggingConfig(): any {
    const { LOGGING_CONFIG } = require("../config/api.config");
    return LOGGING_CONFIG;
  }

  /**
   * Get monitoring configuration
   */
  public getMonitoringConfig(): any {
    const { MONITORING_CONFIG } = require("../config/api.config");
    return MONITORING_CONFIG;
  }

  /**
   * Check if centralized logging is enabled
   */
  public isCentralizedLoggingEnabled(): boolean {
    return this.getFeatureFlag("enableCentralizedLogging");
  }

  /**
   * Check if log aggregation is enabled
   */
  public isLogAggregationEnabled(): boolean {
    return this.getFeatureFlag("enableLogAggregation");
  }

  /**
   * Check if structured logging is enabled
   */
  public isStructuredLoggingEnabled(): boolean {
    return this.getFeatureFlag("enableStructuredLogging");
  }

  /**
   * Check if real-time monitoring is enabled
   */
  public isRealTimeMonitoringEnabled(): boolean {
    return this.getFeatureFlag("enableRealTimeMonitoring");
  }

  /**
   * Check if error tracking is enabled
   */
  public isErrorTrackingEnabled(): boolean {
    return this.getFeatureFlag("enableErrorTracking");
  }

  /**
   * Check if alerting system is enabled
   */
  public isAlertingSystemEnabled(): boolean {
    return this.getFeatureFlag("enableAlertingSystem");
  }

  /**
   * Check if APM integration is enabled
   */
  public isAPMIntegrationEnabled(): boolean {
    return this.getFeatureFlag("enableAPMIntegration");
  }

  /**
   * Check if distributed tracing is enabled
   */
  public isDistributedTracingEnabled(): boolean {
    return this.getFeatureFlag("enableDistributedTracing");
  }

  /**
   * Check if health checks are enabled
   */
  public isHealthChecksEnabled(): boolean {
    return this.getFeatureFlag("enableHealthChecks");
  }

  /**
   * Check if metrics collection is enabled
   */
  public isMetricsCollectionEnabled(): boolean {
    return this.getFeatureFlag("enableMetricsCollection");
  }

  /**
   * Get log level for current environment
   */
  public getCurrentLogLevel(): string {
    const loggingConfig = this.getLoggingConfig();
    const environment = this.getEnvironment();
    return loggingConfig.logLevels[environment] || "info";
  }

  /**
   * Get log category configuration
   */
  public getLogCategoryConfig(category: string): any {
    const loggingConfig = this.getLoggingConfig();
    return loggingConfig.categories[category] || null;
  }

  /**
   * Get performance monitoring thresholds
   */
  public getPerformanceThresholds(): any {
    const monitoringConfig = this.getMonitoringConfig();
    return monitoringConfig.performance?.thresholds || {};
  }

  /**
   * Get error tracking configuration
   */
  public getErrorTrackingConfig(): any {
    const monitoringConfig = this.getMonitoringConfig();
    return monitoringConfig.errorTracking || {};
  }

  /**
   * Get health check configuration
   */
  public getHealthCheckConfig(): any {
    const monitoringConfig = this.getMonitoringConfig();
    return monitoringConfig.healthChecks || {};
  }

  /**
   * Get metrics collection configuration
   */
  public getMetricsConfig(): any {
    const monitoringConfig = this.getMonitoringConfig();
    return monitoringConfig.metrics || {};
  }

  /**
   * Check if log encryption is enabled
   */
  public isLogEncryptionEnabled(): boolean {
    return this.getFeatureFlag("enableLogEncryption");
  }

  /**
   * Check if log compression is enabled
   */
  public isLogCompressionEnabled(): boolean {
    return this.getFeatureFlag("enableLogCompression");
  }

  /**
   * Check if automated alerting is enabled
   */
  public isAutomatedAlertingEnabled(): boolean {
    return this.getFeatureFlag("enableAutomatedAlerting");
  }

  /**
   * Get security configuration
   */
  public getSecurityConfig(): any {
    const { SECURITY_CONFIG } = require("../config/api.config");
    return SECURITY_CONFIG;
  }

  /**
   * Check if centralized security policies are enabled
   */
  public isCentralizedSecurityEnabled(): boolean {
    return this.getFeatureFlag("enableCentralizedSecurity");
  }

  /**
   * Check if unified encryption standards are enabled
   */
  public isUnifiedEncryptionEnabled(): boolean {
    return this.getFeatureFlag("enableUnifiedEncryption");
  }

  /**
   * Check if integrated audit trail is enabled
   */
  public isIntegratedAuditTrailEnabled(): boolean {
    return this.getFeatureFlag("enableIntegratedAuditTrail");
  }

  /**
   * Get security policy configuration
   */
  public getSecurityPolicyConfig(policyType: string): any {
    const securityConfig = this.getSecurityConfig();
    return securityConfig.policies?.[policyType] || null;
  }

  /**
   * Get encryption standards configuration
   */
  public getEncryptionConfig(): any {
    const securityConfig = this.getSecurityConfig();
    return securityConfig.encryption || {};
  }

  /**
   * Get audit trail configuration
   */
  public getAuditTrailConfig(): any {
    const securityConfig = this.getSecurityConfig();
    return securityConfig.auditTrail || {};
  }

  /**
   * Get zero trust configuration
   */
  public getZeroTrustConfig(): any {
    const securityConfig = this.getSecurityConfig();
    return securityConfig.zeroTrust || {};
  }

  /**
   * Check if zero trust architecture is enabled
   */
  public isZeroTrustEnabled(): boolean {
    const zeroTrustConfig = this.getZeroTrustConfig();
    return zeroTrustConfig.enabled || false;
  }

  /**
   * Get compliance framework configuration
   */
  public getComplianceConfig(): any {
    const securityConfig = this.getSecurityConfig();
    return securityConfig.compliance || {};
  }

  /**
   * Check if continuous compliance monitoring is enabled
   */
  public isContinuousComplianceEnabled(): boolean {
    const complianceConfig = this.getComplianceConfig();
    return complianceConfig.continuousMonitoring || false;
  }

  /**
   * Subscribe to configuration changes
   */
  public subscribe(callback: (config: any) => void): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of configuration changes
   */
  private notifySubscribers(config: any): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(config);
      } catch (error) {
        console.error("Configuration subscriber error:", error);
      }
    });
  }

  /**
   * Update configuration (for testing or admin purposes)
   */
  public async updateConfiguration(
    newConfig: Partial<ConfigurationManager>,
  ): Promise<void> {
    if (
      !this.isProduction() ||
      this.getFeatureFlag("enableDynamicConfigUpdates")
    ) {
      await this.configManager.updateConfiguration(newConfig);
    } else {
      throw new Error("Configuration updates not allowed in production");
    }
  }

  /**
   * Rollback configuration
   */
  public async rollbackConfiguration(): Promise<void> {
    if (
      !this.isProduction() ||
      this.getFeatureFlag("enableDynamicConfigUpdates")
    ) {
      await this.configManager.rollbackConfiguration();
    } else {
      throw new Error("Configuration rollback not allowed in production");
    }
  }

  /**
   * Get configuration health status
   */
  public getHealthStatus(): any {
    return this.configManager.getHealthStatus();
  }

  /**
   * Get configuration summary for monitoring
   */
  public getConfigurationSummary(): {
    environment: string;
    version: string;
    lastUpdate: string;
    enabledFeatures: string[];
    disabledFeatures: string[];
    healthStatus: string;
  } {
    const config = this.configManager.getConfiguration();
    const health = this.getHealthStatus();
    const featureFlags = config.featureFlags;

    const enabledFeatures = Object.entries(featureFlags)
      .filter(([_, enabled]) => enabled)
      .map(([flag, _]) => flag);

    const disabledFeatures = Object.entries(featureFlags)
      .filter(([_, enabled]) => !enabled)
      .map(([flag, _]) => flag);

    return {
      environment: config.environment.name,
      version: config.runtimeConfig.configVersion,
      lastUpdate: config.runtimeConfig.lastConfigUpdate,
      enabledFeatures,
      disabledFeatures,
      healthStatus: health.status,
    };
  }

  /**
   * Export configuration for backup
   */
  public exportConfiguration(): string {
    const config = this.configManager.getConfiguration();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Validate configuration
   */
  public async validateConfiguration(config?: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const configToValidate = config || this.configManager.getConfiguration();

    try {
      // Validate environment configuration
      if (!configToValidate.environment) {
        errors.push("Missing environment configuration");
      } else {
        if (!configToValidate.environment.name) {
          errors.push("Missing environment name");
        }
        if (!configToValidate.environment.logLevel) {
          warnings.push("Missing log level configuration");
        }
        if (configToValidate.environment.apiTimeout < 1000) {
          warnings.push("API timeout is very low (< 1000ms)");
        }
      }

      // Validate feature flags
      if (!configToValidate.featureFlags) {
        errors.push("Missing feature flags configuration");
      } else {
        Object.entries(configToValidate.featureFlags).forEach(
          ([flag, value]) => {
            if (typeof value !== "boolean") {
              errors.push(`Invalid feature flag value for ${flag}: ${value}`);
            }
          },
        );
      }

      // Validate runtime configuration
      if (!configToValidate.runtimeConfig) {
        warnings.push("Missing runtime configuration");
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings,
      };
    }
  }

  /**
   * Reset configuration to defaults
   */
  public async resetToDefaults(): Promise<void> {
    if (!this.isProduction()) {
      // This would reset to default configuration
      console.log("🔄 Resetting configuration to defaults...");
      // Implementation would depend on specific requirements
    } else {
      throw new Error("Configuration reset not allowed in production");
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.subscribers.clear();
    this.configManager.cleanup();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const configurationService = ConfigurationService.getInstance();
export default configurationService;
