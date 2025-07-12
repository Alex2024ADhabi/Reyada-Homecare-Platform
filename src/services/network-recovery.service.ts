/**
 * Network Recovery Service - Production Ready Implementation
 * Handles network connectivity issues and automatic recovery
 */

interface NetworkStatus {
  isOnline: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  lastCheck: Date;
  recoveryAttempts: number;
}

interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

class NetworkRecoveryService {
  private networkStatus: NetworkStatus = {
    isOnline: true,
    connectionQuality: 'excellent',
    lastCheck: new Date(),
    recoveryAttempts: 0
  };

  private statusListeners: Array<(status: NetworkStatus) => void> = [];
  private recoveryInProgress = false;

  constructor() {
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring() {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      // Initial status check
      this.updateNetworkStatus();

      // Listen for online/offline events
      window.addEventListener('online', () => {
        console.log('🌐 Network connection restored');
        this.updateNetworkStatus();
        this.notifyStatusChange();
      });

      window.addEventListener('offline', () => {
        console.warn('🌐 Network connection lost');
        this.updateNetworkStatus();
        this.notifyStatusChange();
      });

      // Periodic connection quality check
      setInterval(() => {
        this.checkConnectionQuality();
      }, 30000); // Check every 30 seconds
    }
  }

  private updateNetworkStatus() {
    if (typeof navigator !== 'undefined') {
      this.networkStatus.isOnline = navigator.onLine;
      this.networkStatus.lastCheck = new Date();
      
      if (!this.networkStatus.isOnline) {
        this.networkStatus.connectionQuality = 'offline';
      }
    }
  }

  private async checkConnectionQuality() {
    if (!this.networkStatus.isOnline) return;

    try {
      const startTime = Date.now();
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        if (responseTime < 200) {
          this.networkStatus.connectionQuality = 'excellent';
        } else if (responseTime < 500) {
          this.networkStatus.connectionQuality = 'good';
        } else {
          this.networkStatus.connectionQuality = 'poor';
        }
      } else {
        this.networkStatus.connectionQuality = 'poor';
      }
    } catch (error) {
      console.warn('Network quality check failed:', error);
      this.networkStatus.connectionQuality = 'poor';
    }

    this.networkStatus.lastCheck = new Date();
    this.notifyStatusChange();
  }

  private notifyStatusChange() {
    this.statusListeners.forEach(listener => {
      try {
        listener(this.networkStatus);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  public getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  public onStatusChange(callback: (status: NetworkStatus) => void): () => void {
    this.statusListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  public async executeRecovery(
    reason: string, 
    options: RecoveryOptions = {}
  ): Promise<boolean> {
    if (this.recoveryInProgress) {
      console.log('🔄 Recovery already in progress, skipping...');
      return false;
    }

    this.recoveryInProgress = true;
    const { maxRetries = 3, retryDelay = 1000, enableLogging = true } = options;

    if (enableLogging) {
      console.log(`🔄 Starting network recovery for: ${reason}`);
    }

    try {
      // Step 1: Clear any cached network state
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('network_error_cache');
          localStorage.removeItem('failed_requests_cache');
        } catch (e) {
          console.warn('Could not clear network cache:', e);
        }
      }

      // Step 2: Force network status update
      this.updateNetworkStatus();

      // Step 3: Test connectivity with retries
      for (let i = 0; i < maxRetries; i++) {
        try {
          await this.testConnectivity();
          
          if (enableLogging) {
            console.log(`✅ Network recovery successful on attempt ${i + 1}`);
          }
          
          this.networkStatus.recoveryAttempts = 0;
          this.notifyStatusChange();
          return true;
        } catch (error) {
          if (enableLogging) {
            console.warn(`⚠️ Recovery attempt ${i + 1} failed:`, error);
          }
          
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
          }
        }
      }

      // Recovery failed
      this.networkStatus.recoveryAttempts++;
      
      if (enableLogging) {
        console.error(`❌ Network recovery failed after ${maxRetries} attempts`);
      }
      
      return false;

    } finally {
      this.recoveryInProgress = false;
    }
  }

  private async testConnectivity(): Promise<void> {
    // Test with a simple HEAD request to the current origin
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(window.location.origin, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async forceRefresh(): Promise<void> {
    console.log('🔄 Forcing application refresh...');
    
    // Clear all caches
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

    // Force reload
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  public getRecoveryStats() {
    return {
      networkStatus: this.networkStatus,
      recoveryInProgress: this.recoveryInProgress,
      listenersCount: this.statusListeners.length
    };
  }
}

// Create singleton instance
const networkRecoveryService = new NetworkRecoveryService();

export default networkRecoveryService;
export { NetworkRecoveryService };
export type { NetworkStatus, RecoveryOptions };