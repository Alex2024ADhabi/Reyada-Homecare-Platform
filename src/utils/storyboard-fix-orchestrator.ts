/**
 * Storyboard Fix Orchestrator
 * Main entry point for fixing all storyboard loading issues
 */

import { ComprehensiveStoryboardFix } from './comprehensive-storyboard-fix';

/**
 * Initialize and fix all storyboard loading issues
 * This is the main function to call when storyboards are not loading
 */
export async function fixAllStoryboardIssues(storyboardsInfo: any[]) {
  console.log('🚀 Storyboard Fix Orchestrator: Starting comprehensive fix...');
  console.log('📊 Storyboards to process:', storyboardsInfo?.length || 0);
  
  // Enhanced input validation
  if (!Array.isArray(storyboardsInfo)) {
    console.error('❌ Invalid storyboardsInfo: not an array');
    storyboardsInfo = [];
  }
  
  // Filter out invalid storyboard entries
  storyboardsInfo = storyboardsInfo.filter(storyboard => {
    if (!storyboard || typeof storyboard !== 'object') {
      console.warn('⚠️ Filtering out invalid storyboard:', storyboard);
      return false;
    }
    if (!storyboard.id) {
      console.warn('⚠️ Filtering out storyboard without ID:', storyboard);
      return false;
    }
    return true;
  });
  
  console.log('📊 Valid storyboards after filtering:', storyboardsInfo.length);
  
  // Enhanced container-aware diagnostic check
  const diagnostic = quickDiagnosticCheck();
  console.log('🔍 Enhanced diagnostic results:', diagnostic);
  
  // Check for dependency scan issues
  if (typeof window !== 'undefined' && (window as any).__DEPENDENCY_SCAN_STATUS__ === 'failed') {
    console.error('🚨 Dependency scan failed - attempting recovery...');
    
    // Try to recover from dependency scan failure
    try {
      await recoverFromDependencyScanFailure();
    } catch (recoveryError) {
      console.error('❌ Dependency scan recovery failed:', recoveryError);
      throw new Error('Critical dependency scan failure - container restart required');
    }
  }
  
  if (!diagnostic.canProceed) {
    console.error('❌ Pre-flight check failed:', diagnostic.issues);
    
    // Container-specific error handling
    if (diagnostic.issues.includes('Not running in browser environment')) {
      throw new Error('Container environment issue: Not running in browser context');
    }
    
    if (diagnostic.issues.includes('React is not available globally')) {
      console.log('🔄 Attempting React recovery...');
      try {
        // Try to recover React
        const React = await import('react');
        (window as any).React = React.default || React;
        (globalThis as any).React = React.default || React;
        console.log('✅ React recovery successful');
      } catch (reactError) {
        console.error('❌ React recovery failed:', reactError);
        throw new Error('Container issue: React framework not available');
      }
    }
    
    // If still can't proceed after recovery attempts
    const retryDiagnostic = quickDiagnosticCheck();
    if (!retryDiagnostic.canProceed) {
      throw new Error(`Container initialization failed: ${diagnostic.issues.join(', ')}`);
    }
  }
  
  try {
    // Enhanced timeout handling
    const fixTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Storyboard fix timeout after 30 seconds')), 30000)
    );
    
    const fixPromise = ComprehensiveStoryboardFix.fixAllStoryboards(storyboardsInfo);
    
    // Run the comprehensive fix system with timeout
    const result = await Promise.race([fixPromise, fixTimeout]);
    
    if (result.success) {
      console.log('✅ Storyboard fix completed successfully!');
      
      // Show user-friendly success message
      if (typeof window !== 'undefined' && window.alert) {
        const successRate = result.totalStoryboards > 0 
          ? ((result.successfulLoads + result.recoveredLoads) / result.totalStoryboards) * 100 
          : 0;
        
        window.alert(
          `🎉 Storyboard Fix Complete!\n\n` +
          `✅ Successfully loaded: ${result.successfulLoads}\n` +
          `🛠️ Recovered: ${result.recoveredLoads}\n` +
          `❌ Failed: ${result.failedLoads}\n` +
          `📈 Success rate: ${successRate.toFixed(1)}%\n\n` +
          `${successRate >= 90 ? 'Excellent! Your storyboards are working properly.' : 
            successRate >= 70 ? 'Good progress! Some minor issues remain.' :
            'Some issues remain. Check the console for details.'}`
        );
      }
    } else {
      console.error('❌ Storyboard fix completed with issues');
      
      // Show user-friendly error message
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(
          `⚠️ Storyboard Fix Completed with Issues\n\n` +
          `Some storyboards could not be loaded. Check the browser console for detailed error information.\n\n` +
          `You may need to:\n` +
          `• Restart the development server\n` +
          `• Check for missing dependencies\n` +
          `• Verify file paths are correct`
        );
      }
    }
    
    return result;
  } catch (error) {
    console.error('💥 Storyboard Fix Orchestrator failed:', error);
    
    // Show user-friendly error message
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(
        `💥 Critical Error\n\n` +
        `The storyboard fix system encountered a critical error:\n` +
        `${error instanceof Error ? error.message : String(error)}\n\n` +
        `Please restart the development server and try again.`
      );
    }
    
    throw error;
  }
}

/**
 * Quick diagnostic check for storyboard issues
 */
export function quickDiagnosticCheck(): {
  canProceed: boolean;
  issues: string[];
  recommendations: string[];
  containerHealth: any;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Container health assessment
  const containerHealth = {
    startTime: performance.now(),
    isNewContainer: performance.now() < 60000, // Less than 1 minute
    environment: typeof window !== 'undefined' ? 'browser' : 'server',
    reactAvailable: false,
    dynamicImportSupported: typeof import === 'function',
    memoryStatus: 'unknown',
    networkStatus: typeof navigator !== 'undefined' ? navigator.onLine : false,
  };
  
  // Check React availability with container context
  const React = (window as any).React || (globalThis as any).React;
  containerHealth.reactAvailable = !!React;
  if (!React) {
    issues.push('React is not available globally');
    recommendations.push('Container may need React framework initialization');
  }
  
  // Check dynamic import support
  if (!containerHealth.dynamicImportSupported) {
    issues.push('Dynamic import is not supported');
    recommendations.push('Container environment may not support ES2020 dynamic imports');
  }
  
  // Check if we're in a browser environment
  if (containerHealth.environment !== 'browser') {
    issues.push('Not running in browser environment');
    recommendations.push('Container should be running in browser context');
  }
  
  // Enhanced memory constraints check for containers
  if (typeof performance !== 'undefined' && performance.memory) {
    const memory = performance.memory;
    const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    containerHealth.memoryStatus = `${usedPercent.toFixed(1)}%`;
    
    if (usedPercent > 90) {
      issues.push('Very high memory usage detected');
      recommendations.push('Container may need memory cleanup or restart');
    } else if (usedPercent > 70) {
      recommendations.push('Monitor container memory usage');
    }
  }
  
  // Container-specific checks
  if (!containerHealth.isNewContainer && issues.length > 0) {
    issues.push('Old container with accumulated issues');
    recommendations.push('Consider container restart for optimal performance');
  }
  
  // Network connectivity check for container
  if (!containerHealth.networkStatus) {
    issues.push('Network connectivity issues detected');
    recommendations.push('Check container network configuration');
  }
  
  const canProceed = issues.length === 0 || (issues.length === 1 && issues[0].includes('memory'));
  
  console.log('🔍 Container diagnostic results:', {
    canProceed,
    issues: issues.length,
    containerHealth,
    timestamp: new Date().toISOString()
  });
  
  if (!canProceed) {
    console.warn('⚠️ Container diagnostic check found issues:', issues);
    console.log('💡 Container recommendations:', recommendations);
  } else {
    console.log('✅ Container diagnostic check passed');
  }
  
  return {
    canProceed,
    issues,
    recommendations,
    containerHealth,
  };
}

/**
 * Emergency recovery function for when everything else fails
 */
// Enhanced dependency scan failure recovery
async function recoverFromDependencyScanFailure(): Promise<void> {
  console.log('🔄 Attempting dependency scan failure recovery...');
  
  try {
    // Clear problematic caches
    if (typeof window !== 'undefined') {
      // Clear Vite-specific caches
      const viteKeys = Object.keys(localStorage).filter(key => 
        key.includes('vite') || key.includes('__vite') || key.includes('tempo')
      );
      viteKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 Cleared cache: ${key}`);
      });
      
      // Reset dependency scan status
      (window as any).__DEPENDENCY_SCAN_STATUS__ = 'recovering';
    }
    
    // Force React availability
    const React = await import('react');
    (window as any).React = React.default || React;
    (globalThis as any).React = React.default || React;
    
    // Re-initialize JSX runtime
    const { ensureJSXRuntime } = await import('./jsx-runtime-fix');
    ensureJSXRuntime();
    
    console.log('✅ Dependency scan recovery completed');
    
    if (typeof window !== 'undefined') {
      (window as any).__DEPENDENCY_SCAN_STATUS__ = 'recovered';
    }
  } catch (error) {
    console.error('❌ Dependency scan recovery failed:', error);
    throw error;
  }
}

export function emergencyRecovery(): void {
  console.log('🚨 Emergency Recovery: Enhanced container-aware restoration...');
  
  try {
    // Enhanced container-specific recovery steps
    console.log('🔄 Starting enhanced container emergency recovery...');
    
    // Force React to be available globally with container timeout
    const reactTimeout = setTimeout(() => {
      console.warn('⚠️ React restoration timeout in container');
    }, 8000); // Longer timeout for containers
    
    import('react').then((React) => {
      clearTimeout(reactTimeout);
      (window as any).React = React.default || React;
      (globalThis as any).React = React.default || React;
      console.log('✅ React restored globally in container');
    }).catch((error) => {
      clearTimeout(reactTimeout);
      console.error('❌ Failed to restore React in container:', error);
    });
    
    // Container-specific cache clearing
    if (typeof window !== 'undefined') {
      console.log('🧹 Clearing container caches...');
      
      // Clear container-specific cached modules
      const containerCacheKeys = [
        'webpackChunkName',
        '__vite_plugin_react_preamble_installed__',
        '__REACT_DEVTOOLS_GLOBAL_HOOK__',
        '__TEMPO_CONTAINER_ID__'
      ];
      
      containerCacheKeys.forEach(key => {
        if (key in window) {
          delete (window as any)[key];
          console.log(`🧹 Cleared container cache: ${key}`);
        }
      });
      
      // Force garbage collection if available (container optimization)
      if ('gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
          console.log('🗑️ Forced garbage collection in container');
        } catch (gcError) {
          console.warn('⚠️ Container garbage collection failed:', gcError);
        }
      }
      
      // Clear container-specific storage
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('tempo') || key.includes('container') || key.includes('storyboard'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🧹 Cleared localStorage: ${key}`);
        });
      } catch (storageError) {
        console.warn('⚠️ Container storage cleanup failed:', storageError);
      }
    }
    
    // Reset container-specific global state
    if (typeof globalThis !== 'undefined') {
      console.log('🔄 Resetting container global state...');
      
      // Clear container-specific cached imports
      const problematicKeys = [
        '__vite_plugin_react_preamble_installed__',
        '__TEMPO_ROUTES_LOADED__',
        '__CONTAINER_INITIALIZED__',
        '__STORYBOARD_CACHE__'
      ];
      
      problematicKeys.forEach(key => {
        if (key in globalThis) {
          delete (globalThis as any)[key];
          console.log(`🧹 Cleared container global: ${key}`);
        }
      });
    }
    
    // Container health reset
    console.log('🏥 Resetting container health indicators...');
    if (typeof window !== 'undefined') {
      (window as any).__CONTAINER_RECOVERY_TIME__ = Date.now();
      (window as any).__CONTAINER_HEALTH_STATUS__ = 'recovering';
    }
    
    console.log('✅ Container emergency recovery completed');
    
    // Schedule container health check
    setTimeout(() => {
      const diagnostic = quickDiagnosticCheck();
      console.log('🔍 Post-recovery container health:', diagnostic.containerHealth);
      
      if (typeof window !== 'undefined') {
        (window as any).__CONTAINER_HEALTH_STATUS__ = diagnostic.canProceed ? 'healthy' : 'degraded';
      }
    }, 2000);
    
  } catch (error) {
    console.error('💥 Container emergency recovery failed:', error);
    
    // Last resort: suggest container restart
    if (typeof window !== 'undefined') {
      (window as any).__CONTAINER_HEALTH_STATUS__ = 'critical';
      console.error('🚨 Container in critical state - restart recommended');
    }
  }
}