// Vite Configuration - DISABLED
// This project uses Webpack 5 exclusively for build processes
// Vite configuration is disabled to prevent build system conflicts

// Copyright © 2024 Reyada Home Health Care Services L.L.C. All rights reserved.
// Build System: Webpack 5 (Primary) | Vite (Disabled)
// Last Updated: 2024-12-18

// IMPORTANT: Do not enable Vite configuration while Webpack is active
// This will cause build conflicts and deployment issues

// If migration to Vite is required in the future:
// 1. Disable Webpack configuration
// 2. Update package.json scripts
// 3. Migrate Tempo devtools integration
// 4. Update deployment configuration
// 5. Test all build processes thoroughly

const VITE_DISABLED_CONFIG = {
  disabled: true,
  reason: "Webpack 5 is the primary build system",
  migration: {
    planned: false,
    blockers: [
      "Tempo devtools integration complexity",
      "Custom webpack module resolution",
      "Production deployment configuration",
      "Service worker and PWA setup",
    ],
  },
  alternatives: {
    buildSystem: "webpack",
    configFile: "webpack.config.cjs",
    devServer: "webpack-dev-server",
    hotReload: "webpack-hot-middleware",
  },
};

// Log warning if this file is accidentally imported
if (typeof console !== "undefined") {
  console.warn(
    "⚠️ Vite configuration is disabled - using Webpack 5 exclusively",
  );
  console.warn("📁 Active build config: webpack.config.cjs");
  console.warn("🔧 To change build system, update build.config.ts");
}

// Export empty configuration to prevent errors
export default VITE_DISABLED_CONFIG;

// Prevent accidental Vite usage
export const defineConfig = () => {
  throw new Error("Vite is disabled - use Webpack configuration instead");
};

export const loadEnv = () => {
  throw new Error(
    "Vite loadEnv is disabled - use environment.config.ts instead",
  );
};

export const createServer = () => {
  throw new Error(
    "Vite dev server is disabled - use webpack-dev-server instead",
  );
};

export const build = () => {
  throw new Error("Vite build is disabled - use webpack build instead");
};

export const preview = () => {
  throw new Error("Vite preview is disabled - use webpack serve instead");
};
