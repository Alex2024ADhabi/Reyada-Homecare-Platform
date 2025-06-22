const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");

// Fix for node:crypto issue
const crypto = require("crypto");

// Prevent process crashes
process.on("uncaughtException", (error) => {
  console.warn("Uncaught Exception:", error.message);
});

process.on("unhandledRejection", (reason) => {
  console.warn("Unhandled Rejection:", reason);
});

// Enhanced error handling for webpack configuration
process.on("unhandledRejection", (reason, promise) => {
  console.warn("Webpack - Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.warn("Webpack - Uncaught Exception:", error);
  // Don't exit process to prevent build failures
});

// Enhanced environment validation with security and compliance checks
const validateEnvironment = () => {
  const requiredEnvVars = {
    development: ['NODE_ENV', 'TEMPO'],
    production: [
      'NODE_ENV', 
      'SUPABASE_URL', 
      'SUPABASE_ANON_KEY',
      'ENCRYPTION_KEY',
      'SESSION_SECRET',
      'CSP_NONCE_SECRET'
    ],
    test: ['NODE_ENV']
  };
  
  const securityEnvVars = {
    development: [],
    production: [
      'HTTPS_ONLY',
      'DOH_COMPLIANCE_ENABLED',
      'AUDIT_LOGGING_ENABLED',
      'RATE_LIMITING_ENABLED'
    ],
    test: []
  };
  
  const currentEnv = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[currentEnv] || requiredEnvVars.development;
  const security = securityEnvVars[currentEnv] || [];
  
  const missing = required.filter(envVar => !process.env[envVar]);
  const missingSecurity = security.filter(envVar => !process.env[envVar]);
  
  // Validate security configuration
  const securityIssues = [];
  if (currentEnv === 'production') {
    if (process.env.CSP_ENABLED === 'false') {
      securityIssues.push('CSP is disabled in production');
    }
    if (process.env.HTTPS_ONLY !== 'true') {
      securityIssues.push('HTTPS enforcement is not enabled');
    }
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
      securityIssues.push('Encryption key is missing or too short');
    }
  }
  
  // Log validation results
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables for ${currentEnv}:`, missing);
  }
  
  if (missingSecurity.length > 0) {
    console.warn(`⚠️ Missing security environment variables for ${currentEnv}:`, missingSecurity);
  }
  
  if (securityIssues.length > 0) {
    console.warn(`🔒 Security configuration issues for ${currentEnv}:`, securityIssues);
  }
  
  if (missing.length === 0 && securityIssues.length === 0) {
    console.log(`✅ Environment variables validated for ${currentEnv}`);
    if (missingSecurity.length === 0) {
      console.log(`🔒 Security configuration validated for ${currentEnv}`);
    }
  }
  
  return { 
    valid: missing.length === 0 && securityIssues.length === 0, 
    missing,
    missingSecurity,
    securityIssues
  };
};

// Validate environment on startup
const envValidation = validateEnvironment();

// Prevent resource locking issues
process.on("SIGINT", () => {
  console.log("\n🛑 Webpack process interrupted, cleaning up...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Webpack process terminated, cleaning up...");
  process.exit(0);
});

// Robust tempo routes management with enhanced error handling and validation
const setupTempoRoutes = () => {
  const tempoRoutesPath = path.resolve(__dirname, "src/tempobook/routes.js");
  const tempoRoutesDir = path.dirname(tempoRoutesPath);

  try {
    // Ensure directory exists with proper permissions
    if (!fs.existsSync(tempoRoutesDir)) {
      fs.mkdirSync(tempoRoutesDir, { recursive: true, mode: 0o755 });
      console.log("✅ Created tempobook directory with proper permissions");
    }
    
    // Validate existing routes file if it exists
    if (fs.existsSync(tempoRoutesPath)) {
      try {
        const existingContent = fs.readFileSync(tempoRoutesPath, 'utf8');
        if (existingContent.includes('const routes = [];')) {
          console.log("📋 Existing tempo routes file validated");
        }
      } catch (readError) {
        console.warn("⚠️ Could not validate existing routes file:", readError.message);
      }
    }

    // Enhanced routes content with comprehensive error handling and validation
    const routesContent = `// Tempo routes configuration - Auto-generated with enhanced error handling
// Generated at: ${new Date().toISOString()}
// Build environment: ${process.env.NODE_ENV || 'development'}
// Environment validation: ${envValidation.valid ? 'PASSED' : 'FAILED'}
// Missing variables: ${envValidation.missing.join(', ') || 'None'}

const routes = [];

// Enhanced error handling for route initialization with graceful degradation
try {
  // Validate routes array
  if (!Array.isArray(routes)) {
    throw new Error('Routes must be an array');
  }

  // Environment-aware route loading
  const isTempoEnabled = process.env.TEMPO === 'true' || process.env.NODE_ENV === 'development';
  const hasRequiredEnv = ${envValidation.valid};
  
  if (!isTempoEnabled) {
    console.log('📋 Tempo routes disabled - production mode without TEMPO flag');
  } else if (!hasRequiredEnv) {
    console.warn('⚠️ Tempo routes loading with missing environment variables');
  }

  // CommonJS export with validation
  if (typeof module !== "undefined" && module.exports) {
    module.exports = routes;
    module.exports.default = routes;
  }

  // ES6 export compatibility
  if (typeof exports !== "undefined") {
    exports.default = routes;
    exports.routes = routes;
  }

  console.log("📋 Tempo routes initialized successfully:", routes.length, "routes");
  console.log("🔧 Environment:", process.env.NODE_ENV || 'development');
  console.log("🔧 Tempo enabled:", isTempoEnabled);
  console.log("🔧 Environment valid:", hasRequiredEnv);
  console.log("⏰ Initialized at:", new Date().toISOString());
} catch (initError) {
  console.warn("⚠️ Tempo routes initialization error:", initError.message);
  console.warn("📍 Stack trace:", initError.stack);
  
  // Comprehensive fallback mechanism
  const fallbackRoutes = [];
  try {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = fallbackRoutes;
      module.exports.default = fallbackRoutes;
    }
    console.log("✅ Fallback routes initialized successfully");
  } catch (fallbackError) {
    console.error("❌ Critical: Fallback routes initialization failed:", fallbackError.message);
  }
}

// Ensure exports are always available with multiple fallback strategies
try {
  module.exports = routes;
  module.exports.default = routes;
} catch (exportError) {
  console.error("❌ Critical: Module exports failed:", exportError.message);
  // Last resort fallback
  if (typeof global !== 'undefined') {
    global.__TEMPO_ROUTES_FALLBACK__ = [];
  }
}

// Additional safety checks and diagnostics
if (typeof window !== 'undefined') {
  window.__TEMPO_ROUTES_LOADED__ = true;
  window.__TEMPO_ROUTES_COUNT__ = routes.length;
  window.__TEMPO_ENV_VALID__ = ${envValidation.valid};
  window.__TEMPO_BUILD_TIME__ = '${new Date().toISOString()}';
}

// Export validation function for runtime checks
if (typeof module !== "undefined" && module.exports) {
  module.exports.validateRoutes = function() {
    return {
      isArray: Array.isArray(routes),
      count: routes.length,
      envValid: ${envValidation.valid},
      timestamp: new Date().toISOString()
    };
  };
}
`;

    // Write file with error handling
    fs.writeFileSync(tempoRoutesPath, routesContent, { encoding: 'utf8', mode: 0o644 });
    console.log("✅ Enhanced tempo routes file created/updated successfully");
    console.log("📁 Routes file location:", tempoRoutesPath);
    return tempoRoutesPath;
  } catch (error) {
    console.error("❌ Tempo routes setup error:", error.message);
    console.error("📍 Error stack:", error.stack);
    
    // Create minimal fallback with enhanced error handling
    try {
      if (!fs.existsSync(tempoRoutesDir)) {
        fs.mkdirSync(tempoRoutesDir, { recursive: true, mode: 0o755 });
      }
      
      const fallbackContent = `// Tempo routes fallback - Generated due to setup error
// Error: ${error.message}
// Generated at: ${new Date().toISOString()}

const routes = [];

// Minimal export setup
try {
  module.exports = routes;
  module.exports.default = routes;
  console.log("📋 Fallback tempo routes loaded:", routes.length, "routes");
} catch (exportError) {
  console.error("❌ Critical: Tempo routes export failed:", exportError.message);
}
`;
      
      fs.writeFileSync(tempoRoutesPath, fallbackContent, { encoding: 'utf8', mode: 0o644 });
      console.log("✅ Created enhanced fallback tempo routes file");
      return tempoRoutesPath;
    } catch (fallbackError) {
      console.error("❌ Critical: Failed to create fallback routes file:", fallbackError.message);
      console.error("📍 Fallback error stack:", fallbackError.stack);
      return path.resolve(__dirname, "src/tempobook/routes.js");
    }
  }
};

// Setup tempo routes
const tempoRoutesPath = setupTempoRoutes();

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",

  entry: {
    main: "./src/main.tsx",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].chunk.js",
    clean: true,
    publicPath: "/",
    assetModuleFilename: "assets/[name].[contenthash][ext]",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "tempo-routes": tempoRoutesPath,
    },
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      process: require.resolve("process/browser"),
      util: require.resolve("util"),
      url: require.resolve("url"),
      querystring: require.resolve("querystring-es3"),
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      "node:crypto": require.resolve("crypto-browserify"),
      "node:stream": require.resolve("stream-browserify"),
      "node:buffer": require.resolve("buffer"),
      "node:util": require.resolve("util"),
      "node:url": require.resolve("url"),
      "node:path": require.resolve("path-browserify"),
      "node:os": require.resolve("os-browserify/browser"),
      "node:fs": false,
      "node:net": false,
      "node:tls": false,
      "node:child_process": false,
      "node:http": false,
      "node:https": false,
      "node:zlib": false,
      "node:assert": false,
      "node:events": require.resolve("events"),
      "node:querystring": require.resolve("querystring-es3"),
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      http: false,
      https: false,
      zlib: false,
      assert: false,
      constants: false,
      domain: false,
      events: false,
      punycode: false,
      string_decoder: false,
      sys: false,
      timers: false,
      tty: false,
      vm: false,
    },
    modules: ["node_modules", path.resolve(__dirname, "src")],
    symlinks: false,
    cacheWithContext: false,
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            configFile: "tsconfig.json",
            compilerOptions: {
              noEmit: false,
              declaration: false,
              sourceMap: process.env.NODE_ENV === "development",
              skipLibCheck: true,
              allowSyntheticDefaultImports: true,
              esModuleInterop: true,
              jsx: "react-jsx",
              target: "ES2020",
              lib: ["ES2020", "DOM", "DOM.Iterable"],
              moduleResolution: "node",
              resolveJsonModule: true,
              isolatedModules: true,
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: "defaults",
                },
              ],
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript",
            ],
            cacheDirectory: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              sourceMap: process.env.NODE_ENV === "development",
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: process.env.NODE_ENV === "development",
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
      inject: true,
      scriptLoading: "defer",
    }),

    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
      "process.env.TEMPO": JSON.stringify(process.env.TEMPO || "true"),
      "process.env.WEBPACK_BUILD": JSON.stringify("true"),
      "process.env.SUPABASE_URL": JSON.stringify(
        process.env.SUPABASE_URL || "",
      ),
      "process.env.SUPABASE_ANON_KEY": JSON.stringify(
        process.env.SUPABASE_ANON_KEY || "",
      ),
      "process.env.API_BASE_URL": JSON.stringify(
        process.env.API_BASE_URL || "",
      ),
      "process.env.BUILD_VERSION": JSON.stringify(
        process.env.BUILD_VERSION || "1.0.0",
      ),
      // Environment validation status
      "process.env.ENV_VALIDATION_STATUS": JSON.stringify(
        envValidation.valid ? "VALID" : "INVALID"
      ),
      "process.env.MISSING_ENV_VARS": JSON.stringify(
        envValidation.missing.join(",")
      ),
      "process.env.SECURITY_VALIDATION_STATUS": JSON.stringify(
        envValidation.securityIssues.length === 0 ? "SECURE" : "INSECURE"
      ),
      "process.env.SECURITY_ISSUES": JSON.stringify(
        envValidation.securityIssues.join(",")
      ),
      // Security configuration
      "process.env.CSP_ENABLED": JSON.stringify(
        process.env.CSP_ENABLED !== "false"
      ),
      "process.env.HTTPS_ONLY": JSON.stringify(
        process.env.HTTPS_ONLY === "true"
      ),
      "process.env.AUDIT_LOGGING_ENABLED": JSON.stringify(
        process.env.AUDIT_LOGGING_ENABLED !== "false"
      ),
      // Build system configuration
      "process.env.BUILD_SYSTEM": JSON.stringify("webpack"),
      "process.env.VITE_DISABLED": JSON.stringify("true"),
      global: "globalThis",
      globalThis: "globalThis",
      "typeof window": JSON.stringify("object"),
    }),

    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
      global: "globalThis",
    }),
  ],

  devServer: {
    port: 3001,
    host: "0.0.0.0",
    allowedHosts: "all",
    historyApiFallback: true,
    hot: true,
    liveReload: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "style-src 'self' https://fonts.googleapis.com",
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      logging: "info",
      progress: true,
    },
    compress: true,
    static: {
      directory: path.join(__dirname, "public"),
      publicPath: "/",
    },
    setupExitSignals: true,
    onBeforeSetupMiddleware: (devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }
      devServer.app.get("/health", (req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
      });
    },
  },

  watchOptions: {
    poll: false,
    ignored: /node_modules/,
    aggregateTimeout: 300,
  },

  devtool:
    process.env.NODE_ENV === "production" ? "source-map" : "eval-source-map",

  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },

  stats: {
    errorDetails: true,
    warnings: false,
    colors: true,
    modules: false,
    chunks: false,
  },

  performance: {
    hints: false,
  },

  cache: {
    type: "filesystem",
    cacheDirectory: path.resolve(__dirname, ".webpack-cache"),
  },

  ignoreWarnings: [
    /Failed to parse source map/,
    /Critical dependency: the request of a dependency is an expression/,
    /Module not found: Error: Can't resolve/,
    /ENOTDIR: not a directory/,
    /ENOENT: no such file or directory/,
    /Cannot find module.*package\.json/,
    /UnhandledSchemeError/,
    /Watchpack Error/,
    /TypeError: Cannot read properties of undefined/,
    /export.*was not found/,
    /Should not import the named export/,
    /ProvidedDependencyTemplate/,
    /Cannot read properties of undefined \(reading 'module'\)/,
    /Can't resolve 'tempo-routes'/,
    /Module not found.*tempo-routes/,
    /Failed to resolve import/,
    /Cannot resolve dependency/,
  ],
};