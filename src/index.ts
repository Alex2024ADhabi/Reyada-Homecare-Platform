/**
 * Reyada Homecare Platform - Main Application Index
 * Central export point for the entire application
 * Provides organized access to all platform components, services, and utilities
 */

// Core Application
export { default as App } from './App';

// Services
export * from './services';
export { ServiceRegistry, checkServiceHealth, initializeAllServices, shutdownAllServices } from './services';

// Components
export * from './components';
export { ComponentRegistry, checkComponentHealth } from './components';

// Hooks
export * from './hooks';
export { HookRegistry, checkHookHealth } from './hooks';

// Utils
export * from './utils';
export { UtilityRegistry, checkUtilityHealth } from './utils';

// Types
export * from './types';

// Constants
export * from './constants';

// Styles
export './index.css';

// Platform Registry - Complete application registry
export const PlatformRegistry = {
  services: ServiceRegistry,
  components: ComponentRegistry,
  hooks: HookRegistry,
  utilities: UtilityRegistry,
};

// Platform Health Check - Comprehensive health monitoring
export async function checkPlatformHealth(): Promise<{
  services: Record<string, boolean>;
  components: Record<string, boolean>;
  hooks: Record<string, boolean>;
  utilities: Record<string, boolean>;
  overall: boolean;
}> {
  const [servicesHealth, componentsHealth, hooksHealth, utilitiesHealth] = await Promise.all([
    checkServiceHealth(),
    checkComponentHealth(),
    checkHookHealth(),
    checkUtilityHealth(),
  ]);

  const allHealthChecks = [
    ...Object.values(servicesHealth),
    ...Object.values(componentsHealth),
    ...Object.values(hooksHealth),
    ...Object.values(utilitiesHealth),
  ];

  const overall = allHealthChecks.every(status => status === true);

  return {
    services: servicesHealth,
    components: componentsHealth,
    hooks: hooksHealth,
    utilities: utilitiesHealth,
    overall,
  };
}

// Platform Initialization - Complete platform startup
export async function initializePlatform(): Promise<void> {
  console.log('🚀 Initializing Reyada Homecare Platform...');
  
  try {
    // Initialize all services
    await initializeAllServices();
    
    // Check platform health
    const health = await checkPlatformHealth();
    
    if (health.overall) {
      console.log('✅ Reyada Homecare Platform initialized successfully');
      console.log('🏥 Healthcare services ready');
      console.log('🔧 All systems operational');
    } else {
      console.warn('⚠️ Platform initialized with some issues');
      console.log('Services:', health.services);
      console.log('Components:', health.components);
      console.log('Hooks:', health.hooks);
      console.log('Utilities:', health.utilities);
    }
  } catch (error) {
    console.error('❌ Failed to initialize platform:', error);
    throw error;
  }
}

// Platform Shutdown - Complete platform cleanup
export async function shutdownPlatform(): Promise<void> {
  console.log('🛑 Shutting down Reyada Homecare Platform...');
  
  try {
    // Shutdown all services
    await shutdownAllServices();
    
    console.log('✅ Reyada Homecare Platform shutdown completed');
  } catch (error) {
    console.error('❌ Error during platform shutdown:', error);
    throw error;
  }
}

// Platform Information
export const PlatformInfo = {
  name: 'Reyada Homecare Platform',
  version: '1.0.0',
  description: 'Comprehensive healthcare management platform with DOH compliance',
  features: [
    'Patient Management',
    'Clinical Documentation',
    'DOH Compliance',
    'Quality Management',
    'Revenue Cycle Management',
    'Manpower Management',
    'Analytics & Reporting',
    'AI/ML Integration',
    'Security & Audit',
    'Mobile Support',
  ],
  modules: {
    core: Object.keys(ServiceRegistry).length,
    components: Object.keys(ComponentRegistry).length,
    hooks: Object.keys(HookRegistry).length,
    utilities: Object.keys(UtilityRegistry).length,
  },
  compliance: [
    'UAE DOH Standards',
    'Healthcare Data Privacy',
    'Clinical Quality Standards',
    'Patient Safety Protocols',
    'Audit & Compliance Tracking',
  ],
  integrations: [
    'Emirates ID Integration',
    'Insurance Provider APIs',
    'Laboratory Systems',
    'Pharmacy Systems',
    'External Healthcare Providers',
  ],
};

// Export platform info for external access
export default PlatformInfo;