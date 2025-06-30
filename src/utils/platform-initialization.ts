/**
 * Platform Initialization Utility
 * Comprehensive initialization of all Reyada Homecare platform services
 */

import { AIHubService } from "@/services/ai-hub.service";
import { RealTimeSyncService } from "@/services/real-time-sync.service";
import performanceMonitor from "@/services/performance-monitor.service";

export interface PlatformInitializationResult {
  success: boolean;
  timestamp: string;
  results: {
    aiHub?: {
      initialized: boolean;
      orchestrationCapable?: boolean;
      testResult?: any;
      error?: string;
    };
    realTimeSync?: {
      initialized: boolean;
      connected?: boolean;
      error?: string;
    };
    performanceMonitor?: {
      initialized: boolean;
      metricsActive?: boolean;
      error?: string;
    };
    securityOrchestrator?: {
      initialized: boolean;
      securityScore?: number;
      zeroTrustEnabled?: boolean;
      aiThreatDetectionActive?: boolean;
      lowSecurityScore?: boolean;
      error?: string;
    };
  };
  errors: string[];
  warnings: string[];
  totalInitializationTime: number;
}

/**
 * Initialize all platform services
 */
export async function initializePlatform(): Promise<PlatformInitializationResult> {
  const startTime = Date.now();
  const results: PlatformInitializationResult["results"] = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log("🚀 Starting Reyada Homecare Platform initialization...");

  // Initialize Performance Monitor first
  console.log("📊 Initializing Performance Monitor...");
  try {
    await performanceMonitor.initialize();
    console.log("✅ Performance Monitor initialized successfully");
    results.performanceMonitor = {
      initialized: true,
      metricsActive: true,
    };
  } catch (error) {
    console.error("❌ Performance Monitor initialization failed:", error);
    results.performanceMonitor = {
      initialized: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    errors.push("Performance Monitor initialization failed");
  }

  // Initialize Real-Time Sync Service
  console.log("🔄 Initializing Real-Time Sync Service...");
  try {
    const realTimeSyncService = RealTimeSyncService.getInstance();
    await realTimeSyncService.initialize();

    // Test connection
    const connectionStatus = await realTimeSyncService.getConnectionStatus();

    if (connectionStatus.connected) {
      console.log(
        "✅ Real-Time Sync Service initialized and connected successfully",
      );
      results.realTimeSync = {
        initialized: true,
        connected: true,
      };
    } else {
      console.warn("⚠️ Real-Time Sync Service initialized but not connected");
      results.realTimeSync = {
        initialized: true,
        connected: false,
      };
      warnings.push("Real-Time Sync Service not connected");
    }
  } catch (error) {
    console.error("❌ Real-Time Sync Service initialization failed:", error);
    results.realTimeSync = {
      initialized: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    errors.push("Real-Time Sync Service initialization failed");
  }

  // Initialize AI Hub Service
  console.log("🤖 Initializing AI Hub Service...");
  try {
    const aiHubService = AIHubService.getInstance();
    await aiHubService.initialize();

    // Test AI orchestration
    const orchestrationResult =
      await aiHubService.orchestrateHealthcareWorkflow({
        patientId: "test-patient",
        workflowType: "clinical_assessment",
        priority: "standard",
        data: {
          vitalSigns: { heartRate: 72, bloodPressure: "120/80" },
          symptoms: ["fatigue", "headache"],
        },
      });

    if (orchestrationResult.success) {
      console.log("✅ AI Hub Service initialized and tested successfully");
      results.aiHub = {
        initialized: true,
        orchestrationCapable: true,
        testResult: orchestrationResult,
      };
    } else {
      console.warn(
        "⚠️ AI Hub Service initialized but orchestration test failed",
      );
      results.aiHub = {
        initialized: true,
        orchestrationCapable: false,
        error: orchestrationResult.error,
      };
      warnings.push("AI Hub orchestration test failed");
    }
  } catch (error) {
    console.error("❌ AI Hub Service initialization failed:", error);
    results.aiHub = {
      initialized: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    errors.push("AI Hub Service initialization failed");
  }

  // Initialize Security Orchestrator
  console.log("🔒 Initializing Security Orchestrator...");
  try {
    const { default: SecurityOrchestrator } = await import(
      "@/services/security-orchestrator.service"
    );
    const securityOrchestrator = SecurityOrchestrator.getInstance();
    await securityOrchestrator.initialize();

    // Test security assessment
    const securityAssessment =
      await securityOrchestrator.generateSecurityAssessment();

    if (securityAssessment.overallSecurityScore >= 80) {
      console.log(
        "✅ Security Orchestrator initialized and tested successfully",
      );
      results.securityOrchestrator = {
        initialized: true,
        securityScore: securityAssessment.overallSecurityScore,
        zeroTrustEnabled: securityAssessment.zeroTrustStatus.enabled,
        aiThreatDetectionActive: securityAssessment.aiThreatDetection.active,
      };
    } else {
      console.warn(
        "⚠️ Security Orchestrator initialized but security score is low",
      );
      results.securityOrchestrator = {
        initialized: true,
        securityScore: securityAssessment.overallSecurityScore,
        lowSecurityScore: true,
      };
      warnings.push(
        `Security score below threshold: ${securityAssessment.overallSecurityScore}%`,
      );
    }
  } catch (error) {
    console.error("❌ Security Orchestrator initialization failed:", error);
    results.securityOrchestrator = {
      initialized: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    errors.push("Security Orchestrator initialization failed");
  }

  const totalInitializationTime = Date.now() - startTime;
  const success = errors.length === 0;

  // Record platform initialization metrics
  if (results.performanceMonitor?.initialized) {
    performanceMonitor.recordPlatformInitialization({
      success,
      initializationTime: totalInitializationTime,
      servicesInitialized: Object.keys(results).length,
      errors: errors.length,
      warnings: warnings.length,
    });
  }

  const result: PlatformInitializationResult = {
    success,
    timestamp: new Date().toISOString(),
    results,
    errors,
    warnings,
    totalInitializationTime,
  };

  if (success) {
    console.log(
      `🎉 Platform initialization completed successfully in ${totalInitializationTime}ms`,
    );
    if (warnings.length > 0) {
      console.log(`⚠️ ${warnings.length} warnings encountered:`, warnings);
    }
  } else {
    console.error(
      `❌ Platform initialization failed with ${errors.length} errors:`,
      errors,
    );
    if (warnings.length > 0) {
      console.warn(
        `⚠️ ${warnings.length} warnings also encountered:`,
        warnings,
      );
    }
  }

  return result;
}

/**
 * Get platform health status
 */
export async function getPlatformHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  services: {
    aiHub: "online" | "offline" | "degraded";
    realTimeSync: "online" | "offline" | "degraded";
    performanceMonitor: "online" | "offline" | "degraded";
    securityOrchestrator: "online" | "offline" | "degraded";
  };
  uptime: number;
  lastCheck: string;
}> {
  const startTime = Date.now();
  const services = {
    aiHub: "offline" as const,
    realTimeSync: "offline" as const,
    performanceMonitor: "offline" as const,
    securityOrchestrator: "offline" as const,
  };

  // Check AI Hub Service
  try {
    const aiHubService = AIHubService.getInstance();
    if (aiHubService) {
      services.aiHub = "online";
    }
  } catch (error) {
    services.aiHub = "offline";
  }

  // Check Real-Time Sync Service
  try {
    const realTimeSyncService = RealTimeSyncService.getInstance();
    const connectionStatus = await realTimeSyncService.getConnectionStatus();
    services.realTimeSync = connectionStatus.connected ? "online" : "degraded";
  } catch (error) {
    services.realTimeSync = "offline";
  }

  // Check Performance Monitor
  try {
    const isActive = performanceMonitor.isActive();
    services.performanceMonitor = isActive ? "online" : "degraded";
  } catch (error) {
    services.performanceMonitor = "offline";
  }

  // Check Security Orchestrator
  try {
    const { default: SecurityOrchestrator } = await import(
      "@/services/security-orchestrator.service"
    );
    const securityOrchestrator = SecurityOrchestrator.getInstance();
    if (securityOrchestrator) {
      services.securityOrchestrator = "online";
    }
  } catch (error) {
    services.securityOrchestrator = "offline";
  }

  // Determine overall status
  const onlineServices = Object.values(services).filter(
    (status) => status === "online",
  ).length;
  const totalServices = Object.keys(services).length;

  let status: "healthy" | "degraded" | "unhealthy";
  if (onlineServices === totalServices) {
    status = "healthy";
  } else if (onlineServices >= totalServices / 2) {
    status = "degraded";
  } else {
    status = "unhealthy";
  }

  const uptime = Date.now() - startTime;

  return {
    status,
    services,
    uptime,
    lastCheck: new Date().toISOString(),
  };
}

/**
 * Gracefully shutdown platform services
 */
export async function shutdownPlatform(): Promise<{
  success: boolean;
  shutdownTime: number;
  errors: string[];
}> {
  const startTime = Date.now();
  const errors: string[] = [];

  console.log("🛑 Starting platform shutdown...");

  // Shutdown Security Orchestrator
  try {
    const { default: SecurityOrchestrator } = await import(
      "@/services/security-orchestrator.service"
    );
    const securityOrchestrator = SecurityOrchestrator.getInstance();
    securityOrchestrator.cleanup();
    console.log("✅ Security Orchestrator shutdown completed");
  } catch (error) {
    console.error("❌ Security Orchestrator shutdown failed:", error);
    errors.push("Security Orchestrator shutdown failed");
  }

  // Shutdown Real-Time Sync Service
  try {
    const realTimeSyncService = RealTimeSyncService.getInstance();
    await realTimeSyncService.disconnect();
    console.log("✅ Real-Time Sync Service shutdown completed");
  } catch (error) {
    console.error("❌ Real-Time Sync Service shutdown failed:", error);
    errors.push("Real-Time Sync Service shutdown failed");
  }

  // Shutdown Performance Monitor
  try {
    performanceMonitor.cleanup();
    console.log("✅ Performance Monitor shutdown completed");
  } catch (error) {
    console.error("❌ Performance Monitor shutdown failed:", error);
    errors.push("Performance Monitor shutdown failed");
  }

  const shutdownTime = Date.now() - startTime;
  const success = errors.length === 0;

  if (success) {
    console.log(
      `✅ Platform shutdown completed successfully in ${shutdownTime}ms`,
    );
  } else {
    console.error(
      `❌ Platform shutdown completed with ${errors.length} errors in ${shutdownTime}ms`,
    );
  }

  return {
    success,
    shutdownTime,
    errors,
  };
}

export default {
  initializePlatform,
  getPlatformHealth,
  shutdownPlatform,
};
