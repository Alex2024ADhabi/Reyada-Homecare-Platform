import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite";

// Enhanced Vite Configuration for Reyada Homecare Platform
// Optimized for production-ready healthcare application
export default defineConfig({
  plugins: [
    react({
      // Enhanced React configuration for better performance
      fastRefresh: true,
      babel: {
        plugins: [
          // Add any babel plugins if needed
        ],
      },
    }),
    tempo(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "tempo-routes": path.resolve(__dirname, "./src/tempobook/routes.js"),
    },
  },
  server: {
    port: 3001,
    host: "0.0.0.0",
    // Enhanced server configuration
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
    hmr: {
      overlay: true, // Enable error overlay for better debugging
      port: 3002, // Separate HMR port to avoid conflicts
    },
    fs: {
      strict: false,
      allow: [".."],
    },
    cors: true,
    // Enhanced middleware for better error handling
    middlewareMode: false,
  },
  define: {
    global: "globalThis",
    "process.env": {},
    // Add build-time constants
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    __PROD__: JSON.stringify(process.env.NODE_ENV === "production"),
    // Healthcare platform constants
    __HEALTHCARE_PLATFORM__: JSON.stringify(true),
    __COMPLIANCE_MODE__: JSON.stringify(process.env.NODE_ENV === "production"),
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-toast",
      "@radix-ui/react-slot",
      "lucide-react",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "date-fns",
    ],
    exclude: ["tempo-devtools"],
    // Force optimization of problematic dependencies
    force: true,
  },
  build: {
    sourcemap: true,
    target: "esnext",
    minify: "esbuild",
    // Enhanced build configuration
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Optimized chunk splitting for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-toast",
            "@radix-ui/react-slot",
            "lucide-react",
          ],
          utils: [
            "clsx",
            "tailwind-merge",
            "date-fns",
            "class-variance-authority",
          ],
          healthcare: [
            // Healthcare-specific modules can be added here
          ],
        },
        // Enhanced asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
      onwarn(warning, warn) {
        // Enhanced warning suppression
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        if (warning.code === "SOURCEMAP_ERROR") return;
        if (warning.code === "CIRCULAR_DEPENDENCY") return;
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        // Log other warnings for debugging
        console.warn(`Rollup warning: ${warning.code}`, warning.message);
        warn(warning);
      },
      // Enhanced external dependencies handling
      external: (id) => {
        // Don't bundle Node.js built-ins
        return id.startsWith("node:");
      },
    },
    // Enhanced error handling during build
    reportCompressedSize: true,
    emptyOutDir: true,
    // Ensure clean build without conflicts
    copyPublicDir: true,
  },
  esbuild: {
    logOverride: {
      "this-is-undefined-in-esm": "silent",
      "direct-eval": "silent",
    },
    // Enhanced esbuild configuration
    target: "esnext",
    format: "esm",
    platform: "browser",
    // Keep console in development for debugging
    drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
  },
  // Enhanced CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add any CSS preprocessor options if needed
    },
  },
  // Enhanced preview configuration
  preview: {
    port: 3001,
    host: "0.0.0.0",
    cors: true,
  },
  // Enhanced environment variables (Vite-only, no Webpack conflicts)
  envPrefix: ["VITE_"],
  envDir: ".",
  // Enhanced worker configuration
  worker: {
    format: "es",
  },
});
