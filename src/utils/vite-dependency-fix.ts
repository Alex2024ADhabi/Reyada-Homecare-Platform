/**
 * Vite Dependency Fix Utility
 * Handles problematic imports that cause "Failed to scan for dependencies" errors
 */

// Safe dynamic import wrapper with enhanced error handling
export async function safeDynamicImport<T = any>(
  modulePath: string,
): Promise<T | null> {
  try {
    // Normalize module path
    const normalizedPath =
      modulePath.startsWith("./") ||
      modulePath.startsWith("../") ||
      modulePath.startsWith("/")
        ? modulePath
        : `./${modulePath}`;

    const module = await import(/* @vite-ignore */ normalizedPath);
    return module.default || module;
  } catch (error) {
    console.warn(`Failed to import ${modulePath}:`, error);

    // Try alternative import strategies
    try {
      // Try without ./ prefix
      const altModule = await import(
        /* @vite-ignore */ modulePath.replace("./", "")
      );
      return altModule.default || altModule;
    } catch (altError) {
      console.warn(
        `Alternative import also failed for ${modulePath}:`,
        altError,
      );
      return null;
    }
  }
}

// Safe conditional import for tempo routes with bulletproof fallback
export async function loadTempoRoutes(): Promise<any[]> {
  if (!import.meta.env.VITE_TEMPO) {
    console.log("🔄 VITE_TEMPO not enabled, skipping tempo routes");
    return [];
  }

  try {
    console.log("🔄 Loading tempo routes with bulletproof fallback...");

    // Check cached routes first
    if (typeof window !== "undefined" && (window as any).__TEMPO_ROUTES__) {
      console.log("✅ Using cached tempo routes");
      return (window as any).__TEMPO_ROUTES__;
    }

    // Network check first with retry
    if (!navigator.onLine) {
      console.warn("⚠️ Network offline - tempo routes unavailable");
      return [];
    }

    // Try multiple import strategies for tempo routes with reduced timeout
    let tempoModule = null;
    const importTimeout = 5000; // Reduced to 5 seconds for faster startup

    try {
      // Try direct import with timeout
      tempoModule = await Promise.race([
        import("tempo-routes"),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Import timeout")), importTimeout),
        ),
      ]);
    } catch (directError) {
      console.warn(
        "Direct tempo-routes import failed, trying alternative:",
        directError,
      );

      try {
        // Try dynamic import with vite-ignore and timeout
        tempoModule = await Promise.race([
          import(/* @vite-ignore */ "tempo-routes"),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Dynamic import timeout")),
              importTimeout,
            ),
          ),
        ]);
      } catch (dynamicError) {
        console.warn("Dynamic tempo-routes import failed:", dynamicError);
        return [];
      }
    }

    const routes = tempoModule?.default || tempoModule;
    const routesArray = Array.isArray(routes) ? routes : [];

    // Cache routes globally for future use
    if (typeof window !== "undefined" && routesArray.length > 0) {
      (window as any).__TEMPO_ROUTES__ = routesArray;
      (window as any).__TEMPO_ROUTES_TIMESTAMP__ = Date.now();
    }

    console.log(`✅ Loaded ${routesArray.length} tempo routes`);
    return routesArray;
  } catch (error) {
    console.warn("Tempo routes not available:", error);
    return [];
  }
}

// Fix for JSX runtime issues with enhanced compatibility
export function ensureJSXCompatibility() {
  try {
    // Remove problematic JSX runtime imports that cause Vite scanning issues
    if (typeof window !== "undefined") {
      // Ensure React is globally available without using require
      if (!(window as any).React) {
        import("react")
          .then((React) => {
            (window as any).React = React.default || React;
            (globalThis as any).React = React.default || React;
          })
          .catch((error) => {
            console.warn("Failed to load React globally:", error);
          });
      }
    }

    // Ensure globalThis has React for storyboard compatibility
    if (typeof globalThis !== "undefined" && !(globalThis as any).React) {
      import("react")
        .then((React) => {
          (globalThis as any).React = React.default || React;
        })
        .catch((error) => {
          console.warn("Failed to set React on globalThis:", error);
        });
    }
  } catch (error) {
    console.error("JSX compatibility setup failed:", error);
  }
}

// Vite-safe service imports with enhanced error handling
export async function loadService<T = any>(
  servicePath: string,
): Promise<T | null> {
  try {
    // Use dynamic import with vite-ignore comment to prevent pre-scanning
    const service = await import(/* @vite-ignore */ servicePath);
    return service.default || service;
  } catch (error) {
    console.warn(`Service ${servicePath} not available:`, error);

    // Try alternative service loading strategies
    try {
      // Try with @ prefix for src alias
      const altServicePath = servicePath.startsWith("@/")
        ? servicePath
        : `@/${servicePath.replace("./src/", "").replace("src/", "")}`;
      const altService = await import(/* @vite-ignore */ altServicePath);
      return altService.default || altService;
    } catch (altError) {
      console.warn(
        `Alternative service loading failed for ${servicePath}:`,
        altError,
      );
      return null;
    }
  }
}

// Enhanced storyboard loading with dependency resolution
export async function loadStoryboard(storyboardPath: string): Promise<any> {
  try {
    // Network connectivity check
    if (!navigator.onLine) {
      console.warn(
        `Network offline - cannot load storyboard: ${storyboardPath}`,
      );
      return createNetworkErrorFallback(storyboardPath);
    }

    // Ensure JSX compatibility before loading storyboard
    ensureJSXCompatibility();

    // Load storyboard with multiple fallback strategies and timeout
    let storyboard = null;
    const loadTimeout = 15000; // 15 seconds

    try {
      storyboard = await Promise.race([
        import(/* @vite-ignore */ storyboardPath),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Storyboard import timeout")),
            loadTimeout,
          ),
        ),
      ]);
    } catch (directError) {
      console.warn(
        `Direct storyboard import failed for ${storyboardPath}:`,
        directError,
      );

      // Try alternative paths with timeout
      const alternativePaths = [
        storyboardPath.replace(
          "/home/peter/tempo-api/projects/4a0b90f3-3ca6-44b8-bc86-22f3300d4770/",
          "./",
        ),
        storyboardPath.replace("src/", "./src/"),
        `.${storyboardPath}`,
        storyboardPath,
        // Add more aggressive path normalization
        storyboardPath.replace(/^.*\/src\//, "./src/"),
        storyboardPath.replace(/^.*\/tempobook\//, "./src/tempobook/"),
      ];

      for (const altPath of alternativePaths) {
        try {
          storyboard = await Promise.race([
            import(/* @vite-ignore */ altPath),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Alternative path timeout")),
                5000,
              ),
            ),
          ]);

          if (storyboard) {
            console.log(
              `Successfully loaded storyboard from alternative path: ${altPath}`,
            );
            break;
          }
        } catch (altError) {
          // Check if it's a network error
          if (
            altError.message.includes("timeout") ||
            altError.message.includes("network")
          ) {
            console.warn(`Network issue loading ${altPath}:`, altError.message);
            // Don't try more paths if we're having network issues
            break;
          }
          continue;
        }
      }
    }

    if (!storyboard) {
      throw new Error(`Failed to load storyboard from ${storyboardPath}`);
    }

    return storyboard.default || storyboard;
  } catch (error) {
    console.error(`Storyboard loading failed for ${storyboardPath}:`, error);

    // Check if it's a network-related error
    const isNetworkError =
      error.message.includes("timeout") ||
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      !navigator.onLine;

    if (isNetworkError) {
      return createNetworkErrorFallback(storyboardPath);
    }

    // Return a general fallback component
    return createGeneralErrorFallback(storyboardPath, error);
  }
}

// Create network-specific error fallback
function createNetworkErrorFallback(storyboardPath: string) {
  return function NetworkErrorFallback() {
    const React = (window as any).React || (globalThis as any).React;
    if (!React) {
      return null;
    }

    return React.createElement(
      "div",
      {
        className: "p-8 bg-red-50 border border-red-200 rounded-lg text-center",
      },
      [
        React.createElement(
          "div",
          {
            key: "icon",
            className: "text-4xl mb-4",
          },
          "🌐",
        ),
        React.createElement(
          "h3",
          {
            key: "title",
            className: "text-lg font-semibold text-red-800 mb-2",
          },
          "Network Connection Error",
        ),
        React.createElement(
          "p",
          {
            key: "message",
            className: "text-red-700 mb-4",
          },
          `Cannot load storyboard due to network issues. Please check your connection.`,
        ),
        React.createElement(
          "div",
          {
            key: "details",
            className: "text-xs text-red-600 mb-4",
          },
          `Path: ${storyboardPath}`,
        ),
        React.createElement(
          "button",
          {
            key: "retry",
            className:
              "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2",
            onClick: () => {
              if (navigator.onLine) {
                window.location.reload();
              } else {
                alert("Please check your network connection and try again.");
              }
            },
          },
          "Retry Connection",
        ),
        React.createElement(
          "button",
          {
            key: "reload",
            className:
              "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700",
            onClick: () => window.location.reload(),
          },
          "Reload Page",
        ),
      ],
    );
  };
}

// Create general error fallback
function createGeneralErrorFallback(storyboardPath: string, error: any) {
  return function GeneralErrorFallback() {
    const React = (window as any).React || (globalThis as any).React;
    if (!React) {
      return null;
    }

    return React.createElement(
      "div",
      {
        className:
          "p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center",
      },
      [
        React.createElement(
          "h3",
          {
            key: "title",
            className: "text-lg font-semibold text-yellow-800 mb-2",
          },
          "Storyboard Loading Error",
        ),
        React.createElement(
          "p",
          {
            key: "message",
            className: "text-yellow-700 mb-4",
          },
          `Failed to load storyboard: ${storyboardPath}`,
        ),
        React.createElement(
          "details",
          {
            key: "details",
            className: "text-left mb-4",
          },
          [
            React.createElement(
              "summary",
              {
                key: "summary",
                className:
                  "cursor-pointer text-yellow-600 hover:text-yellow-800",
              },
              "Error Details",
            ),
            React.createElement(
              "pre",
              {
                key: "error",
                className:
                  "mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto",
              },
              error.toString(),
            ),
          ],
        ),
        React.createElement(
          "button",
          {
            key: "reload",
            className:
              "px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700",
            onClick: () => window.location.reload(),
          },
          "Reload Page",
        ),
      ],
    );
  };
}

export default {
  safeDynamicImport,
  loadTempoRoutes,
  ensureJSXCompatibility,
  loadService,
};
