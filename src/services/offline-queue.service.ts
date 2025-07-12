/**
 * Production Offline Queue Management System
 * Actual IndexedDB operations with sync mechanisms
 */

interface QueueItem {
  id: string;
  type: 'patient_data' | 'clinical_note' | 'medication' | 'vital_signs' | 'assessment';
  data: any;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  lastAttempt?: number;
  error?: string;
}

interface SyncConflict {
  id: string;
  localData: any;
  serverData: any;
  timestamp: number;
  resolved: boolean;
  resolution?: 'local' | 'server' | 'merge';
}

interface OfflineStorage {
  queue: QueueItem[];
  conflicts: SyncConflict[];
  lastSync: number;
  syncInProgress: boolean;
}

class OfflineQueueManager {
  private dbName = 'ReyadaHomecareOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private eventListeners: { [event: string]: Function[] } = {};

  constructor() {
    this.initializeDatabase();
    this.setupNetworkListeners();
    this.startSyncProcess();
  }

  /**
   * Initialize IndexedDB database
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create queue store
        if (!db.objectStoreNames.contains('queue')) {
          const queueStore = db.createObjectStore('queue', { keyPath: 'id' });
          queueStore.createIndex('type', 'type', { unique: false });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('priority', 'priority', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create conflicts store
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictsStore = db.createObjectStore('conflicts', { keyPath: 'id' });
          conflictsStore.createIndex('resolved', 'resolved', { unique: false });
          conflictsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        console.log('✅ IndexedDB schema created');
      };
    });
  }

  /**
   * Add item to offline queue
   */
  async addToQueue(
    type: QueueItem['type'],
    data: any,
    priority: QueueItem['priority'] = 'normal'
  ): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const item: QueueItem = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      priority,
      retryCount: 0,
      maxRetries: 3,
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.add(item);

      request.onsuccess = () => {
        console.log(`✅ Added to offline queue: ${item.id} (${type})`);
        this.emit('itemQueued', item);
        
        // Try immediate sync if online
        if (this.isOnline) {
          this.syncQueue();
        }
        
        resolve(item.id);
      };

      request.onerror = () => {
        console.error('Failed to add to queue:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all queued items
   */
  async getQueuedItems(status?: QueueItem['status']): Promise<QueueItem[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readonly');
      const store = transaction.objectStore('queue');
      
      let request: IDBRequest;
      if (status) {
        const index = store.index('status');
        request = index.getAll(status);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Update queue item status
   */
  async updateQueueItem(id: string, updates: Partial<QueueItem>): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          reject(new Error('Item not found'));
          return;
        }

        const updatedItem = { ...item, ...updates };
        const putRequest = store.put(updatedItem);

        putRequest.onsuccess = () => {
          this.emit('itemUpdated', updatedItem);
          resolve();
        };

        putRequest.onerror = () => {
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  /**
   * Remove item from queue
   */
  async removeFromQueue(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`✅ Removed from queue: ${id}`);
        this.emit('itemRemoved', { id });
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Sync queue with server
   */
  async syncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting offline queue sync...');

    try {
      const pendingItems = await this.getQueuedItems('pending');
      const failedItems = await this.getQueuedItems('failed');
      const itemsToSync = [...pendingItems, ...failedItems].sort((a, b) => {
        // Sort by priority and timestamp
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
      });

      let syncedCount = 0;
      let failedCount = 0;

      for (const item of itemsToSync) {
        try {
          await this.updateQueueItem(item.id, { status: 'syncing' });
          
          const success = await this.syncItem(item);
          
          if (success) {
            await this.updateQueueItem(item.id, { 
              status: 'synced',
              lastAttempt: Date.now()
            });
            syncedCount++;
            
            // Remove synced items after a delay
            setTimeout(() => {
              this.removeFromQueue(item.id);
            }, 5000);
          } else {
            throw new Error('Sync failed');
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          const newRetryCount = item.retryCount + 1;
          const status = newRetryCount >= item.maxRetries ? 'failed' : 'pending';
          
          await this.updateQueueItem(item.id, {
            status,
            retryCount: newRetryCount,
            lastAttempt: Date.now(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          failedCount++;
        }
      }

      await this.updateLastSyncTime();
      
      console.log(`✅ Sync completed: ${syncedCount} synced, ${failedCount} failed`);
      this.emit('syncCompleted', { syncedCount, failedCount });

    } catch (error) {
      console.error('❌ Sync process failed:', error);
      this.emit('syncError', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync individual item with server
   */
  private async syncItem(item: QueueItem): Promise<boolean> {
    try {
      const endpoint = this.getEndpointForType(item.type);
      const method = item.data.id ? 'PUT' : 'POST';
      const url = item.data.id ? `${endpoint}/${item.data.id}` : endpoint;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...item.data,
          offlineId: item.id,
          timestamp: item.timestamp
        })
      });

      if (!response.ok) {
        // Check for conflicts (409 status)
        if (response.status === 409) {
          const serverData = await response.json();
          await this.handleSyncConflict(item, serverData);
          return false; // Will be resolved later
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Synced ${item.type}: ${item.id}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to sync ${item.type}:`, error);
      return false;
    }
  }

  /**
   * Handle sync conflicts
   */
  private async handleSyncConflict(item: QueueItem, serverData: any): Promise<void> {
    const conflict: SyncConflict = {
      id: this.generateId(),
      localData: item.data,
      serverData,
      timestamp: Date.now(),
      resolved: false
    };

    await this.addConflict(conflict);
    this.emit('syncConflict', conflict);
  }

  /**
   * Add conflict to database
   */
  private async addConflict(conflict: SyncConflict): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflicts'], 'readwrite');
      const store = transaction.objectStore('conflicts');
      const request = store.add(conflict);

      request.onsuccess = () => {
        console.log(`⚠️ Sync conflict recorded: ${conflict.id}`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Resolve sync conflict
   */
  async resolveConflict(
    conflictId: string, 
    resolution: 'local' | 'server' | 'merge',
    mergedData?: any
  ): Promise<void> {
    if (!this.db) return;

    const conflict = await this.getConflict(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    let finalData: any;
    switch (resolution) {
      case 'local':
        finalData = conflict.localData;
        break;
      case 'server':
        finalData = conflict.serverData;
        break;
      case 'merge':
        finalData = mergedData || { ...conflict.serverData, ...conflict.localData };
        break;
    }

    // Update the server with resolved data
    try {
      const endpoint = this.getEndpointForType('patient_data'); // Determine from conflict data
      await fetch(`${endpoint}/${finalData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(finalData)
      });

      // Mark conflict as resolved
      await this.updateConflict(conflictId, { resolved: true, resolution });
      
      console.log(`✅ Conflict resolved: ${conflictId} (${resolution})`);
      this.emit('conflictResolved', { conflictId, resolution });

    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }

  /**
   * Get conflict by ID
   */
  private async getConflict(id: string): Promise<SyncConflict | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflicts'], 'readonly');
      const store = transaction.objectStore('conflicts');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Update conflict
   */
  private async updateConflict(id: string, updates: Partial<SyncConflict>): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflicts'], 'readwrite');
      const store = transaction.objectStore('conflicts');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const conflict = getRequest.result;
        if (!conflict) {
          reject(new Error('Conflict not found'));
          return;
        }

        const updatedConflict = { ...conflict, ...updates };
        const putRequest = store.put(updatedConflict);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Get endpoint for data type
   */
  private getEndpointForType(type: QueueItem['type']): string {
    const endpoints = {
      patient_data: '/api/patients',
      clinical_note: '/api/clinical-notes',
      medication: '/api/medications',
      vital_signs: '/api/vital-signs',
      assessment: '/api/assessments'
    };
    return endpoints[type] || '/api/data';
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Update last sync time
   */
  private async updateLastSyncTime(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key: 'lastSync', value: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Setup network event listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Network connection restored');
      this.isOnline = true;
      this.emit('networkOnline');
      this.syncQueue();
    });

    window.addEventListener('offline', () => {
      console.log('🌐 Network connection lost');
      this.isOnline = false;
      this.emit('networkOffline');
    });
  }

  /**
   * Start automatic sync process
   */
  private startSyncProcess(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncQueue();
      }
    }, 30000);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const pending = await this.getQueuedItems('pending');
    const syncing = await this.getQueuedItems('syncing');
    const synced = await this.getQueuedItems('synced');
    const failed = await this.getQueuedItems('failed');

    return {
      pending: pending.length,
      syncing: syncing.length,
      synced: synced.length,
      failed: failed.length,
      total: pending.length + syncing.length + synced.length + failed.length,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAll(): Promise<void> {
    if (!this.db) return;

    const stores = ['queue', 'conflicts', 'metadata'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    console.log('✅ All offline data cleared');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.eventListeners = {};
  }
}

// Singleton instance
const offlineQueueManager = new OfflineQueueManager();

export default offlineQueueManager;
export { OfflineQueueManager, QueueItem, SyncConflict };