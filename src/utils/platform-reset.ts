/**
 * Platform Reset Utility - Production Ready Implementation
 * Handles platform state reset and recovery operations
 */

interface ResetOptions {
  clearStorage?: boolean;
  resetNetworkState?: boolean;
  enableLogging?: boolean;
}

interface ResetResult {
  success: boolean;
  operations: string[];
  errors: string[];
  timestamp: Date;
}

class PlatformReset {
  private static resetInProgress = false;

  /**
   * Main platform reset function
   */
  static async resetPlatform(options: ResetOptions = {}): Promise<ResetResult> {
    if (this.resetInProgress) {
      console.log('🔄 Platform reset already in progress, skipping...');
      return {
        success: false,
        operations: [],
        errors: ['Reset already in progress'],
        timestamp: new Date()
      };
    }

    this.resetInProgress = true;
    const { clearStorage = true, resetNetworkState = true, enableLogging = true } = options;
    
    const operations: string[] = [];
    const errors: string[] = [];

    if (enableLogging) {
      console.log('🔄 Starting platform reset...');
    }

    try {
      // Step 1: Clear localStorage
      if (clearStorage && typeof localStorage !== 'undefined') {
        try {
          const keysToRemove = [
            'platform_critical_error',
            'tempo-emergency-mode',
            'websocket_critical_messages_backup',
            'network_error_cache',
            'failed_requests_cache',
            'platform_error_state',
            'emergency_recovery_state'
          ];

          keysToRemove.forEach(key => {
            localStorage.removeItem(key);
          });

          operations.push('localStorage cleared');
          if (enableLogging) {
            console.log('✅ localStorage cleared');
          }
        } catch (error) {
          const errorMsg = `localStorage clear failed: ${error}`;
          errors.push(errorMsg);
          if (enableLogging) {
            console.warn('⚠️', errorMsg);
          }
        }
      }

      // Step 2: Clear sessionStorage
      if (clearStorage && typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.clear();
          operations.push('sessionStorage cleared');
          if (enableLogging) {
            console.log('✅ sessionStorage cleared');
          }
        } catch (error) {
          const errorMsg = `sessionStorage clear failed: ${error}`;
          errors.push(errorMsg);
          if (enableLogging) {
            console.warn('⚠️', errorMsg);
          }
        }
      }

      // Step 3: Reset network state
      if (resetNetworkState && typeof window !== 'undefined') {
        try {
          // Clear any network-related window properties
          delete (window as any).__NETWORK_ERROR_STATE__;
          delete (window as any).__WEBSOCKET_ERROR_STATE__;
          delete (window as any).__PLATFORM_ERROR_STATE__;

          operations.push('Network state reset');
          if (enableLogging) {
            console.log('✅ Network state reset');
          }
        } catch (error) {
          const errorMsg = `Network state reset failed: ${error}`;
          errors.push(errorMsg);
          if (enableLogging) {
            console.warn('⚠️', errorMsg);
          }
        }
      }

      // Step 4: Clear any error boundaries state
      try {
        if (typeof window !== 'undefined') {
          // Reset any global error state
          delete (window as any).__ERROR_BOUNDARY_STATE__;
          delete (window as any).__REACT_ERROR_STATE__;
          
          // Clear any cached module errors
          if ('webpackChunkName' in window) {
            delete (window as any).webpackChunkName;
          }
        }

        operations.push('Error boundaries reset');
        if (enableLogging) {
          console.log('✅ Error boundaries reset');
        }
      } catch (error) {
        const errorMsg = `Error boundaries reset failed: ${error}`;
        errors.push(errorMsg);
        if (enableLogging) {
          console.warn('⚠️', errorMsg);
        }
      }

      // Step 5: Force garbage collection if available
      try {
        if (typeof window !== 'undefined' && 'gc' in window) {
          (window as any).gc();
          operations.push('Garbage collection triggered');
          if (enableLogging) {
            console.log('✅ Garbage collection triggered');
          }
        }
      } catch (error) {
        // Ignore GC errors as it's not critical
      }

      // Step 6: Reset Tempo-specific state
      try {
        if (typeof window !== 'undefined') {
          delete (window as any).__TEMPO_ERROR_STATE__;
          delete (window as any).__TEMPO_EMERGENCY_MODE__;
          delete (window as any).__TEMPO_CRITICAL_ERROR__;

          operations.push('Tempo state reset');
          if (enableLogging) {
            console.log('✅ Tempo state reset');
          }
        }
      } catch (error) {
        const errorMsg = `Tempo state reset failed: ${error}`;
        errors.push(errorMsg);
        if (enableLogging) {
          console.warn('⚠️', errorMsg);
        }
      }

      const success = errors.length === 0;
      
      if (enableLogging) {
        if (success) {
          console.log('✅ Platform reset completed successfully');
        } else {
          console.warn(`⚠️ Platform reset completed with ${errors.length} errors`);
        }
      }

      return {
        success,
        operations,
        errors,
        timestamp: new Date()
      };

    } catch (error) {
      const errorMsg = `Platform reset failed: ${error}`;
      errors.push(errorMsg);
      
      if (enableLogging) {
        console.error('❌', errorMsg);
      }

      return {
        success: false,
        operations,
        errors,
        timestamp: new Date()
      };
    } finally {
      this.resetInProgress = false;
    }
  }

  /**
   * Quick reset for minor issues
   */
  static async quickReset(): Promise<boolean> {
    try {
      console.log('🔄 Performing quick platform reset...');
      
      const result = await this.resetPlatform({
        clearStorage: false,
        resetNetworkState: true,
        enableLogging: false
      });

      console.log(result.success ? '✅ Quick reset successful' : '⚠️ Quick reset had issues');
      return result.success;
    } catch (error) {
      console.error('❌ Quick reset failed:', error);
      return false;
    }
  }

  /**
   * Emergency reset for critical issues
   */
  static async emergencyReset(): Promise<boolean> {
    try {
      console.log('🚨 Performing emergency platform reset...');
      
      // Force clear everything
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.clear();
        } catch (e) {
          console.warn('Could not clear localStorage:', e);
        }
      }

      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.clear();
        } catch (e) {
          console.warn('Could not clear sessionStorage:', e);
        }
      }

      // Clear all window state
      if (typeof window !== 'undefined') {
        const keysToDelete = Object.keys(window).filter(key => 
          key.startsWith('__TEMPO_') || 
          key.startsWith('__PLATFORM_') || 
          key.startsWith('__ERROR_') ||
          key.startsWith('__NETWORK_')
        );

        keysToDelete.forEach(key => {
          try {
            delete (window as any)[key];
          } catch (e) {
            // Ignore deletion errors
          }
        });
      }

      console.log('✅ Emergency reset completed');
      return true;
    } catch (error) {
      console.error('❌ Emergency reset failed:', error);
      return false;
    }
  }

  /**
   * Check if reset is needed
   */
  static needsReset(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const criticalError = localStorage.getItem('platform_critical_error');
        const emergencyMode = localStorage.getItem('tempo-emergency-mode');
        
        return !!(criticalError || emergencyMode);
      }
      return false;
    } catch (error) {
      console.warn('Could not check reset status:', error);
      return false;
    }
  }

  /**
   * Get reset status
   */
  static getResetStatus() {
    return {
      resetInProgress: this.resetInProgress,
      needsReset: this.needsReset(),
      timestamp: new Date()
    };
  }
}

export default PlatformReset;
export { PlatformReset };
export type { ResetOptions, ResetResult };