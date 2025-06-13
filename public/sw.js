// Service Worker for Reyada Homecare Platform

const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `reyada-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `reyada-dynamic-${CACHE_VERSION}`;
const API_CACHE = `reyada-api-${CACHE_VERSION}`;

// Cache strategies
let cacheStrategies = [];

// Resources to pre-cache
const STATIC_RESOURCES = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/src/main.tsx",
  "/src/index.css",
];

// Install event - cache static resources
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Pre-caching static resources");
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log("Static resources cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache static resources:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith("http")) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Handle different types of requests
async function handleRequest(request) {
  const url = new URL(request.url);

  // API requests
  if (url.pathname.startsWith("/api/")) {
    return handleApiRequest(request);
  }

  // Static assets
  if (isStaticAsset(url.pathname)) {
    return handleStaticAsset(request);
  }

  // Navigation requests
  if (request.mode === "navigate") {
    return handleNavigation(request);
  }

  // Default: network first with cache fallback
  return networkFirstWithCacheFallback(request, DYNAMIC_CACHE);
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const strategy = getCacheStrategy(request.url);

  switch (strategy?.strategy) {
    case "cache-first":
      return cacheFirstWithNetworkFallback(request, API_CACHE);
    case "network-first":
      return networkFirstWithCacheFallback(request, API_CACHE);
    case "stale-while-revalidate":
      return staleWhileRevalidate(request, API_CACHE);
    case "cache-only":
      return cacheOnly(request, API_CACHE);
    case "network-only":
      return networkOnly(request);
    default:
      return networkFirstWithCacheFallback(request, API_CACHE);
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  return cacheFirstWithNetworkFallback(request, STATIC_CACHE);
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);

    // Cache successful navigation responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cache, return offline page
    const offlineResponse = await caches.match("/offline.html");
    return offlineResponse || new Response("Offline", { status: 503 });
  }
}

// Cache strategies implementation

// Cache first with network fallback
async function cacheFirstWithNetworkFallback(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache first strategy failed:", error);
    throw error;
  }
}

// Network first with cache fallback
async function networkFirstWithCacheFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error.message);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Stale while revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  // Start network request in background
  const networkResponsePromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.log("Background network request failed:", error.message);
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // If no cache, wait for network
  return networkResponsePromise;
}

// Cache only
async function cacheOnly(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  throw new Error("No cached response available");
}

// Network only
async function networkOnly(request) {
  return fetch(request);
}

// Utility functions

function isStaticAsset(pathname) {
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

function getCacheStrategy(url) {
  return cacheStrategies.find((strategy) => strategy.pattern.test(url));
}

// Background sync
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  try {
    // Get pending sync tasks from IndexedDB or localStorage
    const syncTasks = await getSyncTasks();

    for (const task of syncTasks) {
      try {
        const response = await fetch(task.url, {
          method: task.method,
          headers: task.headers,
          body: task.data ? JSON.stringify(task.data) : undefined,
        });

        if (response.ok) {
          await removeSyncTask(task.id);
          console.log(`Sync task ${task.id} completed`);
        } else {
          console.error(
            `Sync task ${task.id} failed with status:`,
            response.status,
          );
        }
      } catch (error) {
        console.error(`Sync task ${task.id} failed:`, error);
      }
    }

    // Notify main thread
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "SYNC_COMPLETED",
          data: { completedTasks: syncTasks.length },
        });
      });
    });
  } catch (error) {
    console.error("Background sync failed:", error);

    // Notify main thread of failure
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "SYNC_FAILED",
          data: { error: error.message },
        });
      });
    });
  }
}

// Sync task management (simplified - would use IndexedDB in production)
async function getSyncTasks() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

async function removeSyncTask(taskId) {
  // This would typically remove from IndexedDB
  console.log(`Removing sync task: ${taskId}`);
}

// Message handling
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "INIT_CACHE_STRATEGIES":
      cacheStrategies = data.strategies || [];
      console.log("Cache strategies initialized:", cacheStrategies.length);
      break;

    case "PRE_CACHE":
      event.waitUntil(preCacheResources(data.resources));
      break;

    case "CLEAR_CACHE":
      event.waitUntil(clearSpecificCache(data.cacheName));
      break;

    default:
      console.log("Unknown message type:", type);
  }
});

// Pre-cache additional resources
async function preCacheResources(resources) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(resources);
    console.log("Additional resources pre-cached:", resources.length);

    // Notify main thread
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "CACHE_UPDATED",
          data: { resources: resources.length },
        });
      });
    });
  } catch (error) {
    console.error("Failed to pre-cache resources:", error);
  }
}

// Clear specific cache
async function clearSpecificCache(cacheName) {
  try {
    await caches.delete(cacheName);
    console.log(`Cache cleared: ${cacheName}`);
  } catch (error) {
    console.error(`Failed to clear cache ${cacheName}:`, error);
  }
}

// Push notifications (if needed in the future)
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action) {
    // Handle action buttons
    console.log("Notification action clicked:", event.action);
  } else {
    // Handle notification body click
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        } else {
          return self.clients.openWindow("/");
        }
      }),
    );
  }
});

console.log("Service Worker loaded successfully");
