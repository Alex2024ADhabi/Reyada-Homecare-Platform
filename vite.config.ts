/**
 * Reyada Homecare Platform - Enhanced Vite Configuration
 * DOH-compliant healthcare platform with storyboard error recovery
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { tempo } from "tempo-devtools/dist/vite"

export default defineConfig({
  plugins: [
    react(),
    tempo() // Add tempo plugin for storyboard support
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Add fallback for missing modules
    fallback: {
      "tempo-routes": false
    }
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast']
        }
      }
    }
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['tempo-routes']
  },

  define: {
    'process.env.VITE_PLATFORM_NAME': '"reyada-homecare-platform"',
    'process.env.VITE_PLATFORM_VERSION': '"1.0.0"',
    'process.env.VITE_DOH_COMPLIANCE': '"true"'
  }
})