/**
 * Service Worker for Reyada Homecare Platform
 * Progressive Web App features and offline capabilities
 */

const CACHE_NAME = "reyada-homecare-v1.0.0";
const STATIC_CACHE = "reyada-static-v1.0.0";
const DYNAMIC_CACHE = "reyada-dynamic-v1.0.0";
const API_CACHE = "reyada-api-v1.0.0";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  // Add critical CSS and JS files
];

// API endpoints to cache
const API_ENDPOINTS = ["/api/patients", "/api/forms", "/api/analytics"];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Route configurations
const ROUTE_CONFIG = {
  "/api/": CACHE_STRATEGIES.NETWORK_FIRST,
  "/static/": CACHE_STRATEGIES.CACHE_FIRST,
  "/images/": CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  "/": CACHE_STRATEGIES.NETWORK_FIRST,
};

// Performance monitoring
const performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineRequests: 0,
};

/**
 * Service Worker Installation
 */
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("📦 Caching static assets...");
        return cache.addAll(STATIC_ASSETS);
      }),

      // Initialize performance tracking
      initializePerformanceTracking(),

      // Setup background sync
      setupBackgroundSync(),
    ]).then(() => {
      console.log("✅ Service Worker installed successfully");
      // Skip waiting to activate immediately
      return self.skipWaiting();
    }),
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating...");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),

      // Claim all clients
      self.clients.claim(),

      // Initialize offline capabilities
      initializeOfflineCapabilities(),
    ]).then(() => {
      console.log("✅ Service Worker activated successfully");
    }),
  );
});

/**
 * Fetch Event Handler
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // Determine cache strategy
  const strategy = getCacheStrategy(url.pathname);

  event.respondWith(
    handleRequest(request, strategy)
      .then((response) => {
        // Track performance metrics
        updatePerformanceMetrics(request, response);
        return response;
      })
      .catch((error) => {
        console.error("❌ Fetch error:", error);
        return handleFetchError(request, error);
      }),
  );
});

/**
 * Background Sync Event Handler
 */
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync triggered:", event.tag);

  if (event.tag === "patient-data-sync") {
    event.waitUntil(syncPatientData());
  } else if (event.tag === "form-data-sync") {
    event.waitUntil(syncFormData());
  } else if (event.tag === "analytics-sync") {
    event.waitUntil(syncAnalyticsData());
  }
});

/**
 * Push Event Handler
 */
self.addEventListener("push", (event) => {
  console.log("📱 Push notification received");

  const options = {
    body: "You have new updates in Reyada Homecare",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Updates",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/xmark.png",
      },
    ],
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification("Reyada Homecare", options),
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(self.clients.openWindow("/"));
  }
});

/**
 * Message Handler
 */
self.addEventListener("message", (event) => {
  console.log("💬 Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data && event.data.type === "GET_CACHE_STATUS") {
    event.ports[0].postMessage({
      cacheStatus: getCacheStatus(),
      performanceMetrics,
    });
  } else if (event.data && event.data.type === "CLEAR_CACHE") {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

/**
 * Handle different caching strategies
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return networkOnly(request);
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);
    default:
      return networkFirst(request);
  }
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    return cachedResponse;
  }

  performanceMetrics.cacheMisses++;
  const networkResponse = await fetch(request);

  if (networkResponse.ok) {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
  try {
    performanceMetrics.networkRequests++;
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("🌐 Network failed, trying cache:", request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });

  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    return cachedResponse;
  }

  performanceMetrics.cacheMisses++;
  return networkResponsePromise;
}

/**
 * Network Only Strategy
 */
async function networkOnly(request) {
  performanceMetrics.networkRequests++;
  return fetch(request);
}

/**
 * Cache Only Strategy
 */
async function cacheOnly(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    return cachedResponse;
  }

  performanceMetrics.cacheMisses++;
  throw new Error("No cached response available");
}

/**
 * Determine cache strategy based on URL
 */
function getCacheStrategy(pathname) {
  for (const [pattern, strategy] of Object.entries(ROUTE_CONFIG)) {
    if (pathname.startsWith(pattern)) {
      return strategy;
    }
  }
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Handle fetch errors
 */
async function handleFetchError(request, error) {
  console.error("🚨 Fetch failed:", request.url, error);

  performanceMetrics.offlineRequests++;

  // Try to serve from cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Serve offline page for navigation requests
  if (request.mode === "navigate") {
    const offlineResponse = await caches.match("/offline.html");
    if (offlineResponse) {
      return offlineResponse;
    }
  }

  // Return a generic offline response
  return new Response(
    JSON.stringify({
      error: "Offline",
      message: "This content is not available offline",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

/**
 * Clean up old caches
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];

  const deletePromises = cacheNames
    .filter((cacheName) => !validCaches.includes(cacheName))
    .map((cacheName) => {
      console.log("🗑️ Deleting old cache:", cacheName);
      return caches.delete(cacheName);
    });

  return Promise.all(deletePromises);
}

/**
 * Initialize performance tracking
 */
async function initializePerformanceTracking() {
  console.log("📊 Initializing performance tracking...");

  // Reset metrics
  Object.keys(performanceMetrics).forEach((key) => {
    performanceMetrics[key] = 0;
  });

  // Send metrics to main thread periodically
  setInterval(() => {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "PERFORMANCE_METRICS",
          data: performanceMetrics,
        });
      });
    });
  }, 60000); // Every minute
}

/**
 * Setup background sync
 */
async function setupBackgroundSync() {
  console.log("🔄 Setting up background sync...");

  // Register sync events
  if ("sync" in self.registration) {
    console.log("✅ Background sync supported");
  } else {
    console.warn("⚠️ Background sync not supported");
  }
}

/**
 * Initialize offline capabilities
 */
async function initializeOfflineCapabilities() {
  console.log("📱 Initializing offline capabilities...");

  // Pre-cache critical resources
  const cache = await caches.open(STATIC_CACHE);

  // Add offline page if not already cached
  const offlineResponse = await cache.match("/offline.html");
  if (!offlineResponse) {
    await cache.add("/offline.html");
  }
}

/**
 * Sync patient data
 */
async function syncPatientData() {
  console.log("👥 Syncing patient data...");

  try {
    // Get pending patient data from IndexedDB
    const pendingData = await getPendingPatientData();

    if (pendingData.length > 0) {
      const response = await fetch("/api/patients/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pendingData),
      });

      if (response.ok) {
        await clearPendingPatientData();
        console.log("✅ Patient data synced successfully");
      }
    }
  } catch (error) {
    console.error("❌ Patient data sync failed:", error);
  }
}

/**
 * Sync form data
 */
async function syncFormData() {
  console.log("📝 Syncing form data...");

  try {
    const pendingForms = await getPendingFormData();

    if (pendingForms.length > 0) {
      const response = await fetch("/api/forms/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pendingForms),
      });

      if (response.ok) {
        await clearPendingFormData();
        console.log("✅ Form data synced successfully");
      }
    }
  } catch (error) {
    console.error("❌ Form data sync failed:", error);
  }
}

/**
 * Sync analytics data
 */
async function syncAnalyticsData() {
  console.log("📊 Syncing analytics data...");

  try {
    const pendingAnalytics = await getPendingAnalyticsData();

    if (pendingAnalytics.length > 0) {
      const response = await fetch("/api/analytics/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pendingAnalytics),
      });

      if (response.ok) {
        await clearPendingAnalyticsData();
        console.log("✅ Analytics data synced successfully");
      }
    }
  } catch (error) {
    console.error("❌ Analytics data sync failed:", error);
  }
}

/**
 * Update performance metrics
 */
function updatePerformanceMetrics(request, response) {
  // Track response times, cache hit rates, etc.
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    // Track API performance
    if (response.headers.get("x-cache") === "HIT") {
      performanceMetrics.cacheHits++;
    } else {
      performanceMetrics.cacheMisses++;
    }
  }
}

/**
 * Get cache status
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }

  return status;
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map((cacheName) =>
    caches.delete(cacheName),
  );
  return Promise.all(deletePromises);
}

// Mock functions for IndexedDB operations
// In a real implementation, these would interact with IndexedDB

async function getPendingPatientData() {
  // Mock implementation
  return [];
}

async function clearPendingPatientData() {
  // Mock implementation
  return Promise.resolve();
}

async function getPendingFormData() {
  // Mock implementation
  return [];
}

async function clearPendingFormData() {
  // Mock implementation
  return Promise.resolve();
}

async function getPendingAnalyticsData() {
  // Mock implementation
  return [];
}

async function clearPendingAnalyticsData() {
  // Mock implementation
  return Promise.resolve();
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    handleRequest,
    getCacheStrategy,
    performanceMetrics,
  };
}
