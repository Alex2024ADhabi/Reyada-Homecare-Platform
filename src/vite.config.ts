import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tempo()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  build: {
    // Bundle optimization
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-toast",
            "@radix-ui/react-alert-dialog",
          ],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          utils: ["date-fns", "clsx", "tailwind-merge"],
          icons: ["lucide-react"],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging
    sourcemap: true,
    // Minify for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Bulletproof dependency optimization to prevent scanning errors
  optimizeDeps: {
    force: false,
    entries: ["./src/main.tsx"],
    exclude: [
      "tempo-routes",
      "tempo-devtools",
      "@/utils/storyboard-fix-orchestrator",
      "@/utils/comprehensive-storyboard-fix",
      "@/utils/vite-dependency-fix",
      "@/utils/storyboard-dependency-resolver",
      "@/utils/storyboard-error-recovery",
      "@/utils/jsx-runtime-fix",
    ],
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-button",
      "@radix-ui/react-card",
      "@radix-ui/react-alert",
      "@radix-ui/react-tabs",
      "@radix-ui/react-progress",
      "@radix-ui/react-badge",
    ],
    esbuildOptions: {
      target: "es2020",
      jsx: "automatic",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
      define: {
        global: "globalThis",
      },
      loader: {
        ".js": "jsx",
        ".ts": "tsx",
      },
    },
  },
  // Security headers
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
