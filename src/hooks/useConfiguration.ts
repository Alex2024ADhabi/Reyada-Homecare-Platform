/**
 * Configuration Hook
 * React hook for accessing and managing configuration in components
 */

import { useState, useEffect, useCallback } from "react";
import { configurationService } from "../services/configuration.service";

export interface UseConfigurationOptions {
  autoInitialize?: boolean;
  subscribeToChanges?: boolean;
}

export function useConfiguration(options: UseConfigurationOptions = {}) {
  const { autoInitialize = true, subscribeToChanges = true } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [environment, setEnvironment] = useState<string>("development");
  const [healthStatus, setHealthStatus] = useState<any>(null);

  /**
   * Initialize configuration service
   */
  const initialize = useCallback(async () => {
    if (isLoading || isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      await configurationService.initialize();

      // Load initial configuration
      const currentConfig = configurationService.getConfigurationSummary();
      const currentFeatureFlags = configurationService.getAllFeatureFlags();
      const currentEnvironment = configurationService.getEnvironment();
      const currentHealthStatus = configurationService.getHealthStatus();

      setConfig(currentConfig);
      setFeatureFlags(currentFeatureFlags);
      setEnvironment(currentEnvironment);
      setHealthStatus(currentHealthStatus);
      setIsInitialized(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize configuration",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isInitialized]);

  /**
   * Refresh configuration
   */
  const refresh = useCallback(async () => {
    try {
      const currentConfig = configurationService.getConfigurationSummary();
      const currentFeatureFlags = configurationService.getAllFeatureFlags();
      const currentEnvironment = configurationService.getEnvironment();
      const currentHealthStatus = configurationService.getHealthStatus();

      setConfig(currentConfig);
      setFeatureFlags(currentFeatureFlags);
      setEnvironment(currentEnvironment);
      setHealthStatus(currentHealthStatus);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh configuration",
      );
    }
  }, []);

  /**
   * Get feature flag value
   */
  const getFeatureFlag = useCallback((flagName: string): boolean => {
    return configurationService.getFeatureFlag(flagName);
  }, []);

  /**
   * Check if feature is enabled
   */
  const isFeatureEnabled = useCallback(
    (flagName: string): boolean => {
      return getFeatureFlag(flagName);
    },
    [getFeatureFlag],
  );

  /**
   * Get environment configuration
   */
  const getEnvironmentConfig = useCallback(() => {
    return configurationService.getEnvironmentConfig();
  }, []);

  /**
   * Check environment type
   */
  const isDevelopment = useCallback(() => {
    return configurationService.isDevelopment();
  }, []);

  const isProduction = useCallback(() => {
    return configurationService.isProduction();
  }, []);

  const isStaging = useCallback(() => {
    return configurationService.isStaging();
  }, []);

  const isDebugEnabled = useCallback(() => {
    return configurationService.isDebugEnabled();
  }, []);

  /**
   * Update configuration (for admin/testing)
   */
  const updateConfiguration = useCallback(
    async (newConfig: any) => {
      try {
        await configurationService.updateConfiguration(newConfig);
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update configuration",
        );
        throw err;
      }
    },
    [refresh],
  );

  /**
   * Rollback configuration
   */
  const rollbackConfiguration = useCallback(async () => {
    try {
      await configurationService.rollbackConfiguration();
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to rollback configuration",
      );
      throw err;
    }
  }, [refresh]);

  /**
   * Export configuration
   */
  const exportConfiguration = useCallback(() => {
    return configurationService.exportConfiguration();
  }, []);

  /**
   * Validate configuration
   */
  const validateConfiguration = useCallback(async (configToValidate?: any) => {
    return await configurationService.validateConfiguration(configToValidate);
  }, []);

  // Initialize on mount if autoInitialize is enabled
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  // Subscribe to configuration changes
  useEffect(() => {
    if (!subscribeToChanges || !isInitialized) return;

    const unsubscribe = configurationService.subscribe((newConfig) => {
      console.log("🔄 Configuration updated:", newConfig);
      refresh();
    });

    return unsubscribe;
  }, [subscribeToChanges, isInitialized, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup is handled by the service singleton
    };
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    config,
    featureFlags,
    environment,
    healthStatus,

    // Actions
    initialize,
    refresh,
    updateConfiguration,
    rollbackConfiguration,
    exportConfiguration,
    validateConfiguration,

    // Utilities
    getFeatureFlag,
    isFeatureEnabled,
    getEnvironmentConfig,
    isDevelopment,
    isProduction,
    isStaging,
    isDebugEnabled,

    // Configuration values (for convenience)
    apiTimeout: configurationService.getApiTimeout(),
    maxRetries: configurationService.getMaxRetries(),
    logLevel: configurationService.getLogLevel(),

    // Logging and Monitoring utilities
    loggingConfig: configurationService.getLoggingConfig(),
    monitoringConfig: configurationService.getMonitoringConfig(),
    isCentralizedLoggingEnabled:
      configurationService.isCentralizedLoggingEnabled(),
    isLogAggregationEnabled: configurationService.isLogAggregationEnabled(),
    isStructuredLoggingEnabled:
      configurationService.isStructuredLoggingEnabled(),
    isRealTimeMonitoringEnabled:
      configurationService.isRealTimeMonitoringEnabled(),
    isErrorTrackingEnabled: configurationService.isErrorTrackingEnabled(),
    isAlertingSystemEnabled: configurationService.isAlertingSystemEnabled(),
    isAPMIntegrationEnabled: configurationService.isAPMIntegrationEnabled(),
    isDistributedTracingEnabled:
      configurationService.isDistributedTracingEnabled(),
    isHealthChecksEnabled: configurationService.isHealthChecksEnabled(),
    isMetricsCollectionEnabled:
      configurationService.isMetricsCollectionEnabled(),
    getCurrentLogLevel: configurationService.getCurrentLogLevel(),
    getLogCategoryConfig:
      configurationService.getLogCategoryConfig.bind(configurationService),
    getPerformanceThresholds: configurationService.getPerformanceThresholds(),
    getErrorTrackingConfig: configurationService.getErrorTrackingConfig(),
    getHealthCheckConfig: configurationService.getHealthCheckConfig(),
    getMetricsConfig: configurationService.getMetricsConfig(),
    isLogEncryptionEnabled: configurationService.isLogEncryptionEnabled(),
    isLogCompressionEnabled: configurationService.isLogCompressionEnabled(),
    isAutomatedAlertingEnabled:
      configurationService.isAutomatedAlertingEnabled(),

    // Security Framework utilities
    securityConfig: configurationService.getSecurityConfig(),
    isCentralizedSecurityEnabled:
      configurationService.isCentralizedSecurityEnabled(),
    isUnifiedEncryptionEnabled:
      configurationService.isUnifiedEncryptionEnabled(),
    isIntegratedAuditTrailEnabled:
      configurationService.isIntegratedAuditTrailEnabled(),
    getSecurityPolicyConfig:
      configurationService.getSecurityPolicyConfig.bind(configurationService),
    getEncryptionConfig: configurationService.getEncryptionConfig(),
    getAuditTrailConfig: configurationService.getAuditTrailConfig(),
    getZeroTrustConfig: configurationService.getZeroTrustConfig(),
    isZeroTrustEnabled: configurationService.isZeroTrustEnabled(),
    getComplianceConfig: configurationService.getComplianceConfig(),
    isContinuousComplianceEnabled:
      configurationService.isContinuousComplianceEnabled(),
  };
}

export default useConfiguration;
