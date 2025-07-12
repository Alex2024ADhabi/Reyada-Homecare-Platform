/**
 * Reyada Homecare Platform - Service Index
 * Central export point for all production-ready services
 * Organized by category for easy access and maintenance
 */

// Core Healthcare Services
export { healthcareCoreService } from './core/healthcare-core.service';

// Validation Services
export { dohComplianceValidator } from './validators/doh-compliance-validator.service';
export { patientSafetyValidator } from './validators/patient-safety-validator.service';
export { clinicalQualityValidator } from './validators/clinical-quality-validator.service';
export { dataIntegrityValidator } from './validators/data-integrity-validator.service';

// Orchestration Services
export { masterDataOrchestrator } from './orchestrators/master-data-orchestrator.service';
export { securityEventOrchestrator } from './orchestrators/security-event-orchestrator.service';
export { performanceOrchestrator } from './orchestrators/performance-orchestrator.service';
export { threatResponseOrchestrator } from './orchestrators/threat-response-orchestrator.service';

// Management Services
export { mlModelTrainingManager } from './managers/ml-model-training-manager.service';
export { cacheManager } from './managers/cache-manager.service';
export { memoryManager } from './managers/memory-manager.service';
export { accessControlManager } from './managers/access-control-manager.service';

// Pipeline Services
export { deploymentPipeline } from './pipelines/deployment-pipeline.service';
export { testingFramework } from './pipelines/testing-framework.service';
export { infrastructureMonitoring } from './pipelines/infrastructure-monitoring.service';

// Engine Services
export { simulationEngine } from './engines/simulation-engine.service';
export { integrationHub } from './engines/integration-hub.service';
export { businessRulesEngine } from './engines/business-rules-engine.service';
export { workflowEngine } from './engines/workflow-engine.service';
export { analyticsEngine } from './engines/analytics-engine.service';
export { complianceEngine } from './engines/compliance-engine.service';
export { notificationEngine } from './engines/notification-engine.service';
export { dataQualityEngine } from './engines/data-quality-engine.service';
export { integrationPlatform } from './engines/integration-platform.service';
export { reportingEngine } from './engines/reporting-engine.service';

// System Services
export { documentManagementSystem } from './systems/document-management.service';
export { backupRecoverySystem } from './systems/backup-recovery.service';
export { auditTrailSystem } from './systems/audit-trail.service';
export { configurationManagementSystem } from './systems/configuration-management.service';
export { resourceManagementSystem } from './systems/resource-management.service';

// Hub Services
export { communicationHub } from './hubs/communication-hub.service';

// Utility Services
export { codebaseCleanupOrchestrator } from '../utils/codebase-cleanup-orchestrator';

// Service Categories for organized access
export const CoreServices = {
  healthcare: healthcareCoreService,
};

export const ValidationServices = {
  dohCompliance: dohComplianceValidator,
  patientSafety: patientSafetyValidator,
  clinicalQuality: clinicalQualityValidator,
  dataIntegrity: dataIntegrityValidator,
};

export const OrchestrationServices = {
  masterData: masterDataOrchestrator,
  securityEvent: securityEventOrchestrator,
  performance: performanceOrchestrator,
  threatResponse: threatResponseOrchestrator,
};

export const ManagementServices = {
  mlModelTraining: mlModelTrainingManager,
  cache: cacheManager,
  memory: memoryManager,
  accessControl: accessControlManager,
};

export const PipelineServices = {
  deployment: deploymentPipeline,
  testing: testingFramework,
  infrastructure: infrastructureMonitoring,
};

export const EngineServices = {
  simulation: simulationEngine,
  integrationHub: integrationHub,
  businessRules: businessRulesEngine,
  workflow: workflowEngine,
  analytics: analyticsEngine,
  compliance: complianceEngine,
  notification: notificationEngine,
  dataQuality: dataQualityEngine,
  integrationPlatform: integrationPlatform,
  reporting: reportingEngine,
};

export const SystemServices = {
  documentManagement: documentManagementSystem,
  backupRecovery: backupRecoverySystem,
  auditTrail: auditTrailSystem,
  configurationManagement: configurationManagementSystem,
  resourceManagement: resourceManagementSystem,
};

export const HubServices = {
  communication: communicationHub,
};

export const UtilityServices = {
  codebaseCleanup: codebaseCleanupOrchestrator,
};

// Service Registry for dynamic access
export const ServiceRegistry = {
  ...CoreServices,
  ...ValidationServices,
  ...OrchestrationServices,
  ...ManagementServices,
  ...PipelineServices,
  ...EngineServices,
  ...SystemServices,
  ...HubServices,
  ...UtilityServices,
};

// Service Health Check
export async function checkServiceHealth(): Promise<Record<string, boolean>> {
  const healthStatus: Record<string, boolean> = {};
  
  for (const [serviceName, service] of Object.entries(ServiceRegistry)) {
    try {
      // Check if service has health check method
      if (service && typeof service === 'object' && 'isInitialized' in service) {
        healthStatus[serviceName] = true;
      } else {
        healthStatus[serviceName] = false;
      }
    } catch (error) {
      healthStatus[serviceName] = false;
    }
  }
  
  return healthStatus;
}

// Service Initialization
export async function initializeAllServices(): Promise<void> {
  console.log("🚀 Initializing all Reyada Homecare Platform services...");
  
  const initPromises = Object.entries(ServiceRegistry).map(async ([serviceName, service]) => {
    try {
      if (service && typeof service === 'object' && 'initialize' in service) {
        await (service as any).initialize();
        console.log(`✅ ${serviceName} initialized successfully`);
      }
    } catch (error) {
      console.error(`❌ Failed to initialize ${serviceName}:`, error);
    }
  });
  
  await Promise.allSettled(initPromises);
  console.log("🎉 All services initialization completed");
}

// Service Shutdown
export async function shutdownAllServices(): Promise<void> {
  console.log("🛑 Shutting down all Reyada Homecare Platform services...");
  
  const shutdownPromises = Object.entries(ServiceRegistry).map(async ([serviceName, service]) => {
    try {
      if (service && typeof service === 'object' && 'shutdown' in service) {
        await (service as any).shutdown();
        console.log(`✅ ${serviceName} shutdown successfully`);
      }
    } catch (error) {
      console.error(`❌ Failed to shutdown ${serviceName}:`, error);
    }
  });
  
  await Promise.allSettled(shutdownPromises);
  console.log("🎉 All services shutdown completed");
}