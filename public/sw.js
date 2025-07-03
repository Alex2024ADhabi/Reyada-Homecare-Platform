// Reyada Homecare Platform Service Worker
// Enhanced PWA functionality with offline support for healthcare operations

const CACHE_NAME = "reyada-homecare-v1.2.0";
const STATIC_CACHE = "reyada-static-v1.2.0";
const DYNAMIC_CACHE = "reyada-dynamic-v1.2.0";
const CRITICAL_CACHE = "reyada-critical-v1.2.0";

// Critical healthcare resources that must be cached
const CRITICAL_RESOURCES = [
  "/",
  "/dashboard",
  "/patients",
  "/clinical/forms",
  "/compliance/monitor",
  "/offline.html",
  "/manifest.json",
];

// Static resources to cache
const STATIC_RESOURCES = [
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Healthcare-specific API endpoints for offline support
const HEALTHCARE_API_PATTERNS = [
  /\/api\/patients\/.*/,
  /\/api\/clinical\/.*/,
  /\/api\/compliance\/.*/,
  /\/api\/doh\/.*/,
  /\/api\/daman\/.*/,
  /\/api\/emergency\/.*/,
];

// Emergency contact information (cached for offline access)
const EMERGENCY_DATA = {
  contacts: [
    { name: "Emergency Services", number: "999" },
    { name: "DOH Hotline", number: "800-11111" },
    { name: "Reyada Emergency", number: "+971-4-XXX-XXXX" },
  ],
  protocols: [
    "Patient Safety Protocol",
    "Medical Emergency Response",
    "DOH Compliance Emergency Procedures",
  ],
};

// Install event - cache critical resources
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Reyada Homecare Service Worker");

  event.waitUntil(
    Promise.all([
      // Cache critical healthcare resources
      caches.open(CRITICAL_CACHE).then((cache) => {
        console.log("[SW] Caching critical healthcare resources");
        return cache.addAll(CRITICAL_RESOURCES);
      }),

      // Cache static resources
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("[SW] Caching static resources");
        return cache.addAll(STATIC_RESOURCES);
      }),

      // Store emergency data
      caches.open(CRITICAL_CACHE).then((cache) => {
        const emergencyResponse = new Response(JSON.stringify(EMERGENCY_DATA), {
          headers: { "Content-Type": "application/json" },
        });
        return cache.put("/api/emergency/contacts", emergencyResponse);
      }),
    ]).then(() => {
      console.log("[SW] Installation complete - healthcare resources cached");
      return self.skipWaiting();
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Reyada Homecare Service Worker");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CRITICAL_CACHE
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log(
          "[SW] Activation complete - ready for healthcare operations",
        );
        return self.clients.claim();
      }),
  );
});

// Fetch event - handle requests with healthcare-specific logic
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === "GET") {
    if (isCriticalHealthcareRequest(url)) {
      event.respondWith(handleCriticalRequest(request));
    } else if (isHealthcareAPIRequest(url)) {
      event.respondWith(handleHealthcareAPIRequest(request));
    } else if (isStaticResource(url)) {
      event.respondWith(handleStaticRequest(request));
    } else {
      event.respondWith(handleDynamicRequest(request));
    }
  } else if (request.method === "POST" || request.method === "PUT") {
    event.respondWith(handleDataSubmission(request));
  }
});

// Handle critical healthcare requests (offline-first)
function handleCriticalRequest(request) {
  return caches
    .match(request, { cacheName: CRITICAL_CACHE })
    .then((cachedResponse) => {
      if (cachedResponse) {
        console.log("[SW] Serving critical resource from cache:", request.url);
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches
              .open(CRITICAL_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Return offline page for critical failures
          return caches.match("/offline.html");
        });
    });
}

// Handle healthcare API requests with intelligent caching
function handleHealthcareAPIRequest(request) {
  const url = new URL(request.url);

  // For patient data, try network first, then cache
  if (url.pathname.includes("/patients/")) {
    return fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches
            .open(DYNAMIC_CACHE)
            .then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        console.log("[SW] Network failed, serving patient data from cache");
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Add offline indicator header
            const headers = new Headers(cachedResponse.headers);
            headers.set("X-Served-From", "cache-offline");
            return new Response(cachedResponse.body, {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers: headers,
            });
          }
          return createOfflineResponse("Patient data unavailable offline");
        });
      });
  }

  // For compliance data, cache first, then network
  if (url.pathname.includes("/compliance/") || url.pathname.includes("/doh/")) {
    return caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches
              .open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    });
  }

  // Default API handling
  return fetch(request).catch(() => {
    return caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse || createOfflineResponse("Service unavailable offline")
      );
    });
  });
}

// Handle static resource requests
function handleStaticRequest(request) {
  return caches
    .match(request, { cacheName: STATIC_CACHE })
    .then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches
              .open(STATIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
      );
    });
}

// Handle dynamic requests
function handleDynamicRequest(request) {
  return fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        caches
          .open(DYNAMIC_CACHE)
          .then((cache) => cache.put(request, responseClone));
      }
      return networkResponse;
    })
    .catch(() => {
      return caches.match(request).then((cachedResponse) => {
        return cachedResponse || caches.match("/offline.html");
      });
    });
}

// Handle data submissions (POST/PUT) with offline queue
function handleDataSubmission(request) {
  return fetch(request).catch(() => {
    // Store failed requests for later sync
    return storeFailedRequest(request).then(() => {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Request queued for sync when online",
          queued: true,
        }),
        {
          status: 202,
          headers: { "Content-Type": "application/json" },
        },
      );
    });
  });
}

// Store failed requests for background sync
function storeFailedRequest(request) {
  return request
    .clone()
    .text()
    .then((body) => {
      const requestData = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: body,
        timestamp: Date.now(),
      };

      return caches.open(DYNAMIC_CACHE).then((cache) => {
        const queueKey = `queue-${Date.now()}-${Math.random()}`;
        const response = new Response(JSON.stringify(requestData));
        return cache.put(queueKey, response);
      });
    });
}

// Utility functions
function isCriticalHealthcareRequest(url) {
  return (
    CRITICAL_RESOURCES.some((resource) => url.pathname === resource) ||
    url.pathname.includes("/emergency/") ||
    url.pathname.includes("/critical/")
  );
}

function isHealthcareAPIRequest(url) {
  return HEALTHCARE_API_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isStaticResource(url) {
  return (
    url.pathname.includes("/static/") ||
    url.pathname.includes("/icons/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg")
  );
}

function createOfflineResponse(message) {
  return new Response(
    JSON.stringify({
      error: true,
      message: message,
      offline: true,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}

// Background sync for queued requests
self.addEventListener("sync", (event) => {
  if (event.tag === "healthcare-data-sync") {
    console.log("[SW] Background sync triggered for healthcare data");
    event.waitUntil(syncQueuedRequests());
  }
});

// Sync queued requests when back online
function syncQueuedRequests() {
  return caches
    .open(DYNAMIC_CACHE)
    .then((cache) => {
      return cache.keys();
    })
    .then((requests) => {
      const queuedRequests = requests.filter((req) =>
        req.url.includes("queue-"),
      );

      return Promise.all(
        queuedRequests.map((queuedReq) => {
          return caches
            .match(queuedReq)
            .then((response) => response.json())
            .then((requestData) => {
              return fetch(requestData.url, {
                method: requestData.method,
                headers: requestData.headers,
                body: requestData.body,
              });
            })
            .then(() => {
              // Remove from queue after successful sync
              return caches
                .open(DYNAMIC_CACHE)
                .then((cache) => cache.delete(queuedReq));
            })
            .catch((error) => {
              console.log("[SW] Failed to sync request:", error);
            });
        }),
      );
    });
}

// Push notification handling for healthcare alerts
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  let notificationData = {
    title: "Reyada Homecare Alert",
    body: "New healthcare notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    tag: "healthcare-alert",
    requireInteraction: true,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };

      // Add healthcare-specific styling for critical alerts
      if (data.priority === "critical") {
        notificationData.requireInteraction = true;
        notificationData.actions = [
          { action: "view", title: "View Details" },
          { action: "dismiss", title: "Dismiss" },
        ];
      }
    } catch (error) {
      console.log("[SW] Error parsing push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData,
    ),
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);

  event.notification.close();

  if (event.action === "view" || !event.action) {
    event.waitUntil(clients.openWindow("/dashboard"));
  }
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);

  // Track notification dismissal for analytics
  if (
    "serviceWorker" in navigator &&
    "sync" in window.ServiceWorkerRegistration.prototype
  ) {
    self.registration.sync.register("notification-dismissed");
  }
});

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case "SKIP_WAITING":
        self.skipWaiting();
        break;
      case "GET_VERSION":
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case "CLEAR_CACHE":
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
      case "SYNC_NOW":
        syncQueuedRequests().then(() => {
          event.ports[0].postMessage({ synced: true });
        });
        break;
    }
  }
});

// Clear all caches (for maintenance)
function clearAllCaches() {
  return caches.keys().then((cacheNames) => {
    return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  });
}

console.log("[SW] Reyada Homecare Service Worker loaded successfully");
