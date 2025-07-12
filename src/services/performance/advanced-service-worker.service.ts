/**
 * Advanced Service Worker Implementation
 * Implements advanced service worker with caching strategies
 * Part of Phase 3: Performance Optimization - Additional Performance
 */

// Service Worker Registration and Management
export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  strategy: "cache-first" | "network-first" | "stale-while-revalidate" | "network-only" | "cache-only";
  maxAge?: number; // seconds
  maxEntries?: number;
  networkTimeoutSeconds?: number;
}

export interface ServiceWorkerConfig {
  version: string;
  cacheStrategies: CacheStrategy[];
  precacheAssets: string[];
  runtimeCaching: {
    urlPattern: RegExp;
    handler: string;
    options?: any;
  }[];
  backgroundSync: {
    name: string;
    options: any;
  }[];
  pushNotifications: {
    enabled: boolean;
    vapidKey?: string;
  };
}

export interface ServiceWorkerMetrics {
  cacheHitRate: number;
  networkRequests: number;
  cachedRequests: number;
  failedRequests: number;
  backgroundSyncJobs: number;
  storageUsage: number;
  lastUpdated: string;
}

class AdvancedServiceWorkerService {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private metrics: ServiceWorkerMetrics | null = null;
  private isInitialized = false;

  constructor() {
    this.config = {
      version: "1.0.0",
      cacheStrategies: [
        {
          name: "static-assets",
          pattern: /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
          strategy: "cache-first",
          maxAge: 86400 * 30, // 30 days
          maxEntries: 100,
        },
        {
          name: "api-calls",
          pattern: /\/api\//,
          strategy: "network-first",
          maxAge: 300, // 5 minutes
          networkTimeoutSeconds: 5,
        },
        {
          name: "html-pages",
          pattern: /\.html$/,
          strategy: "stale-while-revalidate",
          maxAge: 86400, // 1 day
        },
        {
          name: "images",
          pattern: /\.(png|jpg|jpeg|gif|webp|svg)$/,
          strategy: "cache-first",
          maxAge: 86400 * 7, // 7 days
          maxEntries: 50,
        },
      ],
      precacheAssets: [
        "/",
        "/manifest.json",
        "/offline.html",
      ],
      runtimeCaching: [],
      backgroundSync: [
        {
          name: "api-sync",
          options: {
            maxRetentionTime: 24 * 60, // 24 hours in minutes
          },
        },
      ],
      pushNotifications: {
        enabled: true,
      },
    };
  }

  /**
   * Initialize service worker
   */
  async initialize(): Promise<void> {
    try {
      if (!("serviceWorker" in navigator)) {
        console.warn("Service Worker not supported");
        return;
      }

      console.log("🔧 Initializing Advanced Service Worker...");

      // Generate service worker code
      const serviceWorkerCode = this.generateServiceWorkerCode();
      
      // Create service worker blob
      const blob = new Blob([serviceWorkerCode], { type: "application/javascript" });
      const serviceWorkerUrl = URL.createObjectURL(blob);

      // Register service worker
      this.registration = await navigator.serviceWorker.register(serviceWorkerUrl, {
        scope: "/",
      });

      // Setup event listeners
      this.setupEventListeners();

      // Initialize metrics collection
      this.initializeMetrics();

      this.isInitialized = true;
      console.log("✅ Advanced Service Worker initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize service worker:", error);
      throw error;
    }
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    try {
      if (!this.registration) {
        throw new Error("Service worker not registered");
      }

      await this.registration.update();
      console.log("🔄 Service worker updated");
    } catch (error) {
      console.error("❌ Failed to update service worker:", error);
      throw error;
    }
  }

  /**
   * Get service worker metrics
   */
  async getMetrics(): Promise<ServiceWorkerMetrics> {
    if (!this.metrics) {
      await this.collectMetrics();
    }
    return this.metrics!;
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log("🗑️ All caches cleared");
    } catch (error) {
      console.error("❌ Failed to clear caches:", error);
      throw error;
    }
  }

  /**
   * Get cache storage usage
   */
  async getCacheStorageUsage(): Promise<number> {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
      return 0;
    } catch (error) {
      console.error("❌ Failed to get cache storage usage:", error);
      return 0;
    }
  }

  /**
   * Enable push notifications
   */
  async enablePushNotifications(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        throw new Error("Service worker not registered");
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Push notification permission denied");
        return null;
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.config.pushNotifications.vapidKey,
      });

      console.log("🔔 Push notifications enabled");
      return subscription;
    } catch (error) {
      console.error("❌ Failed to enable push notifications:", error);
      return null;
    }
  }

  // Private helper methods
  private generateServiceWorkerCode(): string {
    return `
// Advanced Service Worker - Version ${this.config.version}
const CACHE_VERSION = '${this.config.version}';
const STATIC_CACHE = 'static-v' + CACHE_VERSION;
const DYNAMIC_CACHE = 'dynamic-v' + CACHE_VERSION;
const OFFLINE_PAGE = '/offline.html';

// Cache strategies configuration
const CACHE_STRATEGIES = ${JSON.stringify(this.config.cacheStrategies)};
const PRECACHE_ASSETS = ${JSON.stringify(this.config.precacheAssets)};

// Install event - precache assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Install failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Find matching cache strategy
  const strategy = findCacheStrategy(request.url);
  
  if (strategy) {
    event.respondWith(handleRequest(request, strategy));
  }
});

// Background sync event
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'api-sync') {
    event.waitUntil(syncApiRequests());
  }
});

// Push notification event
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Reyada Healthcare', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
function findCacheStrategy(url) {
  return CACHE_STRATEGIES.find(strategy => strategy.pattern.test ? strategy.pattern.test(url) : new RegExp(strategy.pattern).test(url));
}

async function handleRequest(request, strategy) {
  const cacheName = strategy.name + '-v' + CACHE_VERSION;
  
  switch (strategy.strategy) {
    case 'cache-first':
      return cacheFirst(request, cacheName, strategy);
    case 'network-first':
      return networkFirst(request, cacheName, strategy);
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request, cacheName, strategy);
    case 'network-only':
      return fetch(request);
    case 'cache-only':
      return caches.match(request);
    default:
      return fetch(request);
  }
}

async function cacheFirst(request, cacheName, strategy) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is expired
      const cacheTime = cachedResponse.headers.get('sw-cache-time');
      if (cacheTime && strategy.maxAge) {
        const age = (Date.now() - parseInt(cacheTime)) / 1000;
        if (age > strategy.maxAge) {
          // Cache expired, fetch new version
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            responseClone.headers.set('sw-cache-time', Date.now().toString());
            await cache.put(request, responseClone);
          }
          return networkResponse;
        }
      }
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      responseClone.headers.set('sw-cache-time', Date.now().toString());
      await cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, strategy) {
  try {
    const networkPromise = fetch(request);
    
    if (strategy.networkTimeoutSeconds) {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), strategy.networkTimeoutSeconds * 1000);
      });
      
      try {
        const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
        if (networkResponse.ok) {
          const cache = await caches.open(cacheName);
          const responseClone = networkResponse.clone();
          responseClone.headers.set('sw-cache-time', Date.now().toString());
          await cache.put(request, responseClone);
        }
        return networkResponse;
      } catch (error) {
        // Network failed or timed out, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw error;
      }
    } else {
      const networkResponse = await networkPromise;
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        const responseClone = networkResponse.clone();
        responseClone.headers.set('sw-cache-time', Date.now().toString());
        await cache.put(request, responseClone);
      }
      return networkResponse;
    }
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    console.error('Network first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName, strategy) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      responseClone.headers.set('sw-cache-time', Date.now().toString());
      cache.put(request, responseClone);
    }
    return networkResponse;
  }).catch(error => {
    console.error('Network request failed:', error);
    return null;
  });
  
  return cachedResponse || await networkPromise || new Response('Offline', { status: 503 });
}

async function syncApiRequests() {
  try {
    // Get pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();
    
    for (const requestData of pendingRequests) {
      try {
        const response = await fetch(requestData.url, requestData.options);
        if (response.ok) {
          await removePendingRequest(requestData.id);
          console.log('Synced request:', requestData.url);
        }
      } catch (error) {
        console.error('Failed to sync request:', requestData.url, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingRequests() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

async function removePendingRequest(id) {
  // In a real implementation, this would remove from IndexedDB
}

// Performance monitoring
let requestCount = 0;
let cacheHits = 0;
let networkRequests = 0;

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_METRICS') {
    event.ports[0].postMessage({
      requestCount,
      cacheHits,
      networkRequests,
      cacheHitRate: requestCount > 0 ? (cacheHits / requestCount) * 100 : 0
    });
  }
});
`;
  }

  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen for service worker updates
    this.registration.addEventListener("updatefound", () => {
      console.log("🔄 Service worker update found");
      const newWorker = this.registration!.installing;
      
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("🆕 New service worker available");
            // Notify user about update
            this.notifyUpdate();
          }
        });
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("📨 Message from service worker:", event.data);
    });
  }

  private initializeMetrics(): void {
    // Initialize metrics collection
    this.collectMetrics();
    
    // Collect metrics every 5 minutes
    setInterval(() => {
      this.collectMetrics();
    }, 300000);
  }

  private async collectMetrics(): Promise<void> {
    try {
      if (!this.registration || !this.registration.active) {
        return;
      }

      // Get metrics from service worker
      const channel = new MessageChannel();
      const metricsPromise = new Promise<any>((resolve) => {
        channel.port1.onmessage = (event) => {
          resolve(event.data);
        };
      });

      this.registration.active.postMessage(
        { type: "GET_METRICS" },
        [channel.port2]
      );

      const swMetrics = await Promise.race([
        metricsPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
      ]);

      const storageUsage = await this.getCacheStorageUsage();

      this.metrics = {
        cacheHitRate: swMetrics.cacheHitRate || 0,
        networkRequests: swMetrics.networkRequests || 0,
        cachedRequests: swMetrics.cacheHits || 0,
        failedRequests: 0, // Would be tracked in real implementation
        backgroundSyncJobs: 0, // Would be tracked in real implementation
        storageUsage,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Failed to collect service worker metrics:", error);
    }
  }

  private notifyUpdate(): void {
    // In a real implementation, this would show a user notification
    // about the available update
    console.log("🔔 Service worker update available");
    
    // You could dispatch a custom event here for the UI to handle
    window.dispatchEvent(new CustomEvent("sw-update-available"));
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<void> {
    try {
      if (this.registration) {
        await this.registration.unregister();
        console.log("🗑️ Service worker unregistered");
      }
    } catch (error) {
      console.error("❌ Failed to unregister service worker:", error);
      throw error;
    }
  }
}

export const advancedServiceWorkerService = new AdvancedServiceWorkerService();
export default advancedServiceWorkerService;