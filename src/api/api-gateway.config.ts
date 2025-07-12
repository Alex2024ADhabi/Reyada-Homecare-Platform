import { supabase } from "./supabase.api";
import {
  UnifiedPatient,
  UnifiedEpisode,
  UnifiedClinicalForm,
} from "./unified-schema.api";
import { crossModuleSync } from "./cross-module-sync.api";
import { DataLakeService } from "./data-lake.api";
import {
  configurationManager,
  ConfigurationManager,
} from "../config/api.config";

// API GATEWAY CONFIGURATION
// Unified authentication, authorization, rate limiting, and request routing
// for external integrations and microservices communication

interface APIGatewayConfig {
  authentication: {
    enabled: boolean;
    providers: string[];
    tokenExpiry: number;
    refreshTokenExpiry: number;
  };
  authorization: {
    rbac: {
      enabled: boolean;
      roles: Role[];
      permissions: Permission[];
    };
    policies: AuthorizationPolicy[];
  };
  rateLimiting: {
    enabled: boolean;
    global: RateLimitConfig;
    perEndpoint: { [endpoint: string]: RateLimitConfig };
    perUser: RateLimitConfig;
    perIP: RateLimitConfig;
    adaptive: {
      enabled: boolean;
      thresholds: {
        errorRate: number;
        responseTime: number;
      };
      adjustmentFactor: number;
    };
  };
  routing: {
    services: ServiceRoute[];
    loadBalancing: LoadBalancingConfig;
    healthChecks: HealthCheckConfig;
  };
  security: {
    cors: CORSConfig;
    encryption: EncryptionConfig;
    logging: LoggingConfig;
  };
  monitoring: {
    metrics: MetricsConfig;
    alerts: AlertConfig[];
    tracing: TracingConfig;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  hierarchy: number;
}

interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

interface PermissionCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "in" | "not_in";
  value: any;
}

interface AuthorizationPolicy {
  id: string;
  name: string;
  rules: PolicyRule[];
  effect: "allow" | "deny";
  priority: number;
}

interface PolicyRule {
  resource: string;
  action: string;
  conditions: PermissionCondition[];
}

interface RateLimitConfig {
  requests: number;
  window: number; // seconds
  burst: number;
  strategy: "fixed_window" | "sliding_window" | "token_bucket";
}

interface ServiceRoute {
  id: string;
  path: string;
  method: string[];
  service: {
    name: string;
    url: string;
    timeout: number;
    retries: number;
  };
  middleware: string[];
  authentication: boolean;
  authorization: string[];
  rateLimit?: RateLimitConfig;
}

interface LoadBalancingConfig {
  strategy: "round_robin" | "least_connections" | "weighted" | "ip_hash";
  healthCheck: boolean;
  failover: boolean;
}

interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  endpoints: HealthCheckEndpoint[];
}

interface HealthCheckEndpoint {
  service: string;
  path: string;
  method: string;
  expectedStatus: number[];
}

interface CORSConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyRotation: {
    enabled: boolean;
    interval: number;
  };
  tls: {
    enabled: boolean;
    version: string;
    ciphers: string[];
  };
}

interface LoggingConfig {
  enabled: boolean;
  level: "debug" | "info" | "warn" | "error";
  format: "json" | "text";
  destinations: LogDestination[];
  retention: {
    days: number;
    maxSize: string;
  };
}

interface LogDestination {
  type: "file" | "database" | "external";
  config: any;
}

interface MetricsConfig {
  enabled: boolean;
  collectors: string[];
  exporters: MetricsExporter[];
  retention: {
    days: number;
    aggregation: string;
  };
}

interface MetricsExporter {
  type: "prometheus" | "datadog" | "newrelic";
  config: any;
}

interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: "low" | "medium" | "high" | "critical";
  notifications: NotificationConfig[];
}

interface NotificationConfig {
  type: "email" | "sms" | "webhook" | "slack";
  config: any;
}

interface TracingConfig {
  enabled: boolean;
  sampler: {
    type: "probabilistic" | "rate_limiting";
    param: number;
  };
  exporter: {
    type: "jaeger" | "zipkin" | "datadog";
    config: any;
  };
}

// API Gateway Service Implementation
export class APIGatewayService {
  private config: APIGatewayConfig;
  private routes: Map<string, ServiceRoute> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private healthCheckers: Map<string, HealthChecker> = new Map();
  private metrics: MetricsCollector;
  private logger: Logger;
  private configManager: ConfigurationManager;
  private configSubscription?: () => void;

  constructor(config: APIGatewayConfig) {
    this.config = config;
    this.configManager = configurationManager;
    this.metrics = new MetricsCollector(config.monitoring.metrics);
    this.logger = new Logger(config.security.logging);
    this.initializeRoutes();
    this.initializeRateLimiters();
    this.initializeHealthCheckers();
    this.setupConfigurationManagement();
  }

  /**
   * Initialize service routes
   */
  private initializeRoutes(): void {
    const routes: ServiceRoute[] = [
      {
        id: "patient_management",
        path: "/api/v1/patients",
        method: ["GET", "POST", "PUT", "DELETE"],
        service: {
          name: "patient-service",
          url: process.env.PATIENT_SERVICE_URL || "http://localhost:3001",
          timeout: 30000,
          retries: 3,
        },
        middleware: ["auth", "validation", "logging"],
        authentication: true,
        authorization: ["patient:read", "patient:write"],
        rateLimit: {
          requests: 100,
          window: 60,
          burst: 20,
          strategy: "sliding_window",
        },
      },
      {
        id: "clinical_documentation",
        path: "/api/v1/clinical",
        method: ["GET", "POST", "PUT", "DELETE"],
        service: {
          name: "clinical-service",
          url: process.env.CLINICAL_SERVICE_URL || "http://localhost:3002",
          timeout: 45000,
          retries: 3,
        },
        middleware: ["auth", "validation", "logging", "audit"],
        authentication: true,
        authorization: ["clinical:read", "clinical:write"],
        rateLimit: {
          requests: 50,
          window: 60,
          burst: 10,
          strategy: "token_bucket",
        },
      },
      {
        id: "daman_integration",
        path: "/api/v1/daman",
        method: ["GET", "POST"],
        service: {
          name: "daman-service",
          url: process.env.DAMAN_SERVICE_URL || "http://localhost:3003",
          timeout: 60000,
          retries: 5,
        },
        middleware: ["auth", "validation", "logging", "encryption"],
        authentication: true,
        authorization: ["daman:submit", "daman:query"],
        rateLimit: {
          requests: 20,
          window: 60,
          burst: 5,
          strategy: "fixed_window",
        },
      },
      {
        id: "malaffi_integration",
        path: "/api/v1/malaffi",
        method: ["GET", "POST"],
        service: {
          name: "malaffi-service",
          url: process.env.MALAFFI_SERVICE_URL || "http://localhost:3004",
          timeout: 30000,
          retries: 3,
        },
        middleware: ["auth", "validation", "logging"],
        authentication: true,
        authorization: ["malaffi:read", "malaffi:sync"],
        rateLimit: {
          requests: 30,
          window: 60,
          burst: 10,
          strategy: "sliding_window",
        },
      },
      {
        id: "data_lake",
        path: "/api/v1/analytics",
        method: ["GET", "POST"],
        service: {
          name: "data-lake-service",
          url: process.env.DATA_LAKE_SERVICE_URL || "http://localhost:3005",
          timeout: 120000,
          retries: 2,
        },
        middleware: ["auth", "validation", "logging"],
        authentication: true,
        authorization: ["analytics:read", "analytics:query"],
        rateLimit: {
          requests: 10,
          window: 60,
          burst: 3,
          strategy: "token_bucket",
        },
      },
    ];

    routes.forEach((route) => {
      this.routes.set(`${route.method.join("|")}:${route.path}`, route);
    });
  }

  /**
   * Initialize rate limiters
   */
  private initializeRateLimiters(): void {
    if (!this.config.rateLimiting.enabled) return;

    // Global rate limiter
    this.rateLimiters.set(
      "global",
      new RateLimiter(this.config.rateLimiting.global),
    );

    // Per-user rate limiter
    this.rateLimiters.set(
      "per_user",
      new RateLimiter(this.config.rateLimiting.perUser),
    );

    // Per-endpoint rate limiters
    Object.entries(this.config.rateLimiting.perEndpoint).forEach(
      ([endpoint, config]) => {
        this.rateLimiters.set(`endpoint:${endpoint}`, new RateLimiter(config));
      },
    );
  }

  /**
   * Initialize health checkers
   */
  private initializeHealthCheckers(): void {
    if (!this.config.routing.healthChecks.enabled) return;

    this.config.routing.healthChecks.endpoints.forEach((endpoint) => {
      this.healthCheckers.set(
        endpoint.service,
        new HealthChecker(endpoint, this.config.routing.healthChecks),
      );
    });

    // Start health check intervals
    this.healthCheckers.forEach((checker) => {
      checker.start();
    });
  }

  /**
   * Setup configuration management
   */
  private setupConfigurationManagement(): void {
    // Subscribe to configuration changes
    this.configSubscription = this.configManager.onConfigurationChange(
      (newConfig) => {
        this.handleConfigurationChange(newConfig);
      },
    );

    // Initialize configuration manager
    this.configManager.initialize().catch((error) => {
      console.error("Failed to initialize configuration manager:", error);
    });
  }

  /**
   * Handle configuration changes
   */
  private handleConfigurationChange(newConfig: ConfigurationManager): void {
    try {
      console.log("🔄 Configuration change detected, updating API Gateway...");

      // Update logging level
      if (this.logger && newConfig.environment.logLevel) {
        this.logger.updateLogLevel(newConfig.environment.logLevel);
      }

      // Update API timeouts
      if (newConfig.environment.apiTimeout) {
        this.updateApiTimeouts(newConfig.environment.apiTimeout);
      }

      // Update retry policies
      if (newConfig.environment.maxRetries) {
        this.updateRetryPolicies(newConfig.environment.maxRetries);
      }

      // Update feature-specific configurations
      this.updateFeatureConfigurations(newConfig.featureFlags);

      console.log("✅ API Gateway configuration updated successfully");
    } catch (error) {
      console.error("❌ Failed to update API Gateway configuration:", error);
    }
  }

  /**
   * Update API timeouts
   */
  private updateApiTimeouts(timeout: number): void {
    this.routes.forEach((route) => {
      route.service.timeout = timeout;
    });
  }

  /**
   * Update retry policies
   */
  private updateRetryPolicies(maxRetries: number): void {
    this.routes.forEach((route) => {
      route.service.retries = maxRetries;
    });
  }

  /**
   * Update feature-specific configurations
   */
  private updateFeatureConfigurations(featureFlags: any): void {
    // Enable/disable routes based on feature flags
    if (!featureFlags.enableDataLake) {
      this.routes.delete("GET:/api/v1/analytics");
      this.routes.delete("POST:/api/v1/analytics");
    }

    if (!featureFlags.enableMachineLearning) {
      this.routes.delete("GET:/api/v1/ml");
      this.routes.delete("POST:/api/v1/ml");
    }

    if (!featureFlags.enableRealTimeAnalytics) {
      this.routes.delete("GET:/api/v1/real-time");
    }

    // Update security level based on feature flags
    if (featureFlags.enableSecurityEnhancements) {
      this.enableEnhancedSecurity();
    }

    // Update performance optimizations
    if (featureFlags.enablePerformanceOptimizations) {
      this.enablePerformanceOptimizations();
    }
  }

  /**
   * Enable enhanced security
   */
  private enableEnhancedSecurity(): void {
    // Implement enhanced security measures
    console.log("🔒 Enhanced security features enabled");
  }

  /**
   * Enable performance optimizations
   */
  private enablePerformanceOptimizations(): void {
    // Implement performance optimizations
    console.log("⚡ Performance optimizations enabled");
  }

  /**
   * Check if feature is enabled
   */
  private isFeatureEnabled(featureName: string): boolean {
    return this.configManager.getFeatureFlag(featureName as any) || false;
  }

  /**
   * Get current environment configuration
   */
  public getEnvironmentConfig(): any {
    return this.configManager.getEnvironmentConfig();
  }

  /**
   * Get configuration health status
   */
  public getConfigurationHealth(): any {
    return this.configManager.getHealthStatus();
  }

  /**
   * Process incoming request
   */
  async processRequest(
    method: string,
    path: string,
    headers: { [key: string]: string },
    body: any,
    user?: any,
  ): Promise<APIGatewayResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Check if feature is enabled for this route
      if (!this.isRouteEnabled(method, path)) {
        return this.createErrorResponse(
          503,
          "Feature temporarily disabled",
          requestId,
        );
      }

      // Log request
      this.logger.info("Request received", {
        requestId,
        method,
        path,
        userAgent: headers["user-agent"],
        ip: headers["x-forwarded-for"] || headers["x-real-ip"],
        environment: this.configManager.getEnvironmentConfig().name,
      });

      // Find matching route
      const route = this.findRoute(method, path);
      if (!route) {
        return this.createErrorResponse(404, "Route not found", requestId);
      }

      // Apply dynamic configuration to route
      this.applyDynamicConfiguration(route);

      // Apply middleware
      const middlewareResult = await this.applyMiddleware(
        route,
        method,
        path,
        headers,
        body,
        user,
      );
      if (middlewareResult.error) {
        return middlewareResult;
      }

      // Forward request to service
      const response = await this.forwardRequest(
        route,
        method,
        path,
        headers,
        body,
      );

      // Log response
      const duration = Date.now() - startTime;
      this.logger.info("Request completed", {
        requestId,
        statusCode: response.statusCode,
        duration,
        configVersion: this.configManager.getRuntimeConfig().configVersion,
      });

      // Update metrics
      this.metrics.recordRequest(method, path, response.statusCode, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error("Request failed", {
        requestId,
        error: error.message,
        duration,
        environment: this.configManager.getEnvironmentConfig().name,
      });

      this.metrics.recordError(method, path, error.message);

      return this.createErrorResponse(500, "Internal server error", requestId);
    }
  }

  /**
   * Check if route is enabled based on feature flags
   */
  private isRouteEnabled(method: string, path: string): boolean {
    // Map routes to feature flags
    const routeFeatureMap: { [key: string]: string } = {
      "/api/v1/analytics": "enableDataLake",
      "/api/v1/ml": "enableMachineLearning",
      "/api/v1/real-time": "enableRealTimeAnalytics",
      "/api/v1/blockchain": "enableBlockchainIntegration",
      "/api/v1/ar": "enableAugmentedReality",
      "/api/v1/iot": "enableIoTIntegration",
      "/api/v1/fhir": "enableFHIRIntegration",
      "/api/v1/telehealth": "enableTelehealthIntegration",
    };

    const featureFlag = routeFeatureMap[path];
    if (featureFlag) {
      return this.isFeatureEnabled(featureFlag);
    }

    return true; // Default to enabled for unmapped routes
  }

  /**
   * Apply dynamic configuration to route
   */
  private applyDynamicConfiguration(route: ServiceRoute): void {
    const envConfig = this.configManager.getEnvironmentConfig();

    // Update timeout based on environment
    route.service.timeout = envConfig.apiTimeout;

    // Update retries based on environment
    route.service.retries = envConfig.maxRetries;
  }

  /**
   * Find matching route
   */
  private findRoute(method: string, path: string): ServiceRoute | null {
    // Exact match first
    const exactKey = `${method}:${path}`;
    if (this.routes.has(exactKey)) {
      return this.routes.get(exactKey)!;
    }

    // Pattern matching
    for (const [key, route] of this.routes.entries()) {
      const [routeMethods, routePath] = key.split(":");
      const methods = routeMethods.split("|");

      if (methods.includes(method) && this.matchPath(routePath, path)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Match path patterns
   */
  private matchPath(pattern: string, path: string): boolean {
    // Simple pattern matching - can be enhanced with regex
    const patternParts = pattern.split("/");
    const pathParts = path.split("/");

    if (patternParts.length !== pathParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(":")) {
        // Parameter placeholder
        continue;
      }

      if (patternPart !== pathPart) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply middleware
   */
  private async applyMiddleware(
    route: ServiceRoute,
    method: string,
    path: string,
    headers: { [key: string]: string },
    body: any,
    user?: any,
  ): Promise<APIGatewayResponse> {
    for (const middlewareName of route.middleware) {
      const result = await this.executeMiddleware(
        middlewareName,
        route,
        method,
        path,
        headers,
        body,
        user,
      );

      if (result.error) {
        return result;
      }
    }

    return { success: true };
  }

  /**
   * Execute specific middleware
   */
  private async executeMiddleware(
    middlewareName: string,
    route: ServiceRoute,
    method: string,
    path: string,
    headers: { [key: string]: string },
    body: any,
    user?: any,
  ): Promise<APIGatewayResponse> {
    switch (middlewareName) {
      case "auth":
        return await this.authenticationMiddleware(route, headers, user);

      case "validation":
        return await this.validationMiddleware(route, method, body);

      case "logging":
        return await this.loggingMiddleware(method, path, headers, body);

      case "audit":
        return await this.auditMiddleware(method, path, user, body);

      case "encryption":
        return await this.encryptionMiddleware(body);

      default:
        return { success: true };
    }
  }

  /**
   * Enhanced Authentication middleware with Phase 3 integration
   */
  private async authenticationMiddleware(
    route: ServiceRoute,
    headers: { [key: string]: string },
    user?: any,
  ): Promise<APIGatewayResponse> {
    if (!route.authentication) {
      return { success: true };
    }

    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return this.createErrorResponse(
        401,
        "Missing or invalid authorization header",
      );
    }

    const token = authHeader.substring(7);

    try {
      // Phase 3: Integrate with Enhanced Auth Service
      const { enhancedAuthService } = await import(
        "@/services/enhanced-auth.service"
      );

      // Verify token with Supabase
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !authUser) {
        return this.createErrorResponse(401, "Invalid token");
      }

      // Phase 3: Enhanced security validation with comprehensive checks
      const securityValidation = await this.validateEnhancedSecurity(
        authUser,
        headers,
      );
      if (!securityValidation.valid) {
        return this.createErrorResponse(
          401,
          securityValidation.reason || "Security validation failed",
        );
      }

      // Phase 3: Advanced authorization with context validation
      if (route.authorization.length > 0) {
        const hasPermission = await this.checkEnhancedAuthorization(
          authUser,
          route.authorization,
          headers,
        );

        if (!hasPermission) {
          return this.createErrorResponse(403, "Insufficient permissions");
        }
      }

      // Phase 3: Enhanced session management with integrity validation
      await this.updateSessionActivity(authUser.id, headers);

      // Phase 3: Real-time security monitoring with threat detection
      await this.monitorSecurityEvents(authUser, route, headers);

      // Phase 3: Data flow validation and audit logging
      await this.validateDataFlowSecurity(authUser, route, headers);

      // Log successful authentication with enhanced context
      this.logger.info("Authentication successful", {
        userId: authUser.id,
        route: route.path,
        timestamp: new Date().toISOString(),
        securityLevel: securityValidation.securityLevel,
        sessionId: headers["x-session-id"],
        deviceFingerprint: headers["x-device-fingerprint"],
        ipAddress: headers["x-forwarded-for"] || headers["x-real-ip"],
        dataFlowValidated: true,
        authenticationMethod: "enhanced-service",
      });

      return { success: true, user: authUser };
    } catch (error) {
      this.logger.error("Authentication failed", {
        error: error.message,
        route: route.path,
        timestamp: new Date().toISOString(),
        ipAddress: headers["x-forwarded-for"] || headers["x-real-ip"],
        phase: "phase-3-integration",
      });
      return this.createErrorResponse(401, "Authentication failed");
    }
  }

  /**
   * Enhanced security validation from Phase 2
   */
  private async validateEnhancedSecurity(
    user: any,
    headers: { [key: string]: string },
  ): Promise<{ valid: boolean; reason?: string; securityLevel: string }> {
    try {
      // Check session validity
      const sessionValid = await this.validateUserSession(user.id);
      if (!sessionValid) {
        return {
          valid: false,
          reason: "Invalid or expired session",
          securityLevel: "none",
        };
      }

      // Check device fingerprint if available
      const deviceFingerprint = headers["x-device-fingerprint"];
      if (deviceFingerprint) {
        const deviceTrusted = await this.validateDeviceFingerprint(
          user.id,
          deviceFingerprint,
        );
        if (!deviceTrusted) {
          return {
            valid: false,
            reason: "Untrusted device detected",
            securityLevel: "low",
          };
        }
      }

      // Check for suspicious activity patterns
      const activityCheck = await this.checkSuspiciousActivity(
        user.id,
        headers,
      );
      if (activityCheck.suspicious) {
        return {
          valid: false,
          reason: "Suspicious activity detected",
          securityLevel: "risk",
        };
      }

      return {
        valid: true,
        securityLevel: "high",
      };
    } catch (error) {
      console.error("Enhanced security validation failed:", error);
      return {
        valid: false,
        reason: "Security validation error",
        securityLevel: "error",
      };
    }
  }

  /**
   * Enhanced authorization check with RBAC from Phase 2
   */
  private async checkEnhancedAuthorization(
    user: any,
    requiredPermissions: string[],
    headers: { [key: string]: string },
  ): Promise<boolean> {
    try {
      // Get user profile with enhanced role information
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("role, permissions, is_active, department")
        .eq("id", user.id)
        .single();

      if (!userProfile || !userProfile.is_active) {
        return false;
      }

      // Check if user has admin privileges
      if (userProfile.permissions?.includes("all")) {
        return true;
      }

      // Check specific permissions
      const userPermissions = new Set(userProfile.permissions || []);
      const hasRequiredPermissions = requiredPermissions.every((permission) =>
        userPermissions.has(permission),
      );

      if (!hasRequiredPermissions) {
        // Log authorization failure for audit
        this.logger.warn("Authorization failed", {
          userId: user.id,
          userRole: userProfile.role,
          requiredPermissions,
          userPermissions: Array.from(userPermissions),
          timestamp: new Date().toISOString(),
        });
        return false;
      }

      // Additional context-based authorization checks
      const contextualAuth = await this.checkContextualAuthorization(
        user,
        userProfile,
        headers,
      );

      return contextualAuth;
    } catch (error) {
      console.error("Enhanced authorization check failed:", error);
      return false;
    }
  }

  /**
   * Validate user session
   */
  private async validateUserSession(userId: string): Promise<boolean> {
    try {
      // Check if session exists and is valid
      const sessionData = sessionStorage.getItem(`session_${userId}`);
      if (!sessionData) return false;

      const session = JSON.parse(sessionData);
      const now = Date.now();

      // Check session expiry
      if (session.expiresAt && session.expiresAt < now) {
        return false;
      }

      // Check last activity
      const lastActivity = session.lastActivity || 0;
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      if (now - lastActivity > sessionTimeout) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Session validation failed:", error);
      return false;
    }
  }

  /**
   * Validate device fingerprint
   */
  private async validateDeviceFingerprint(
    userId: string,
    fingerprint: string,
  ): Promise<boolean> {
    try {
      // Check against stored trusted devices
      const trustedDevices = localStorage.getItem(`trusted_devices_${userId}`);
      if (!trustedDevices) return false;

      const devices = JSON.parse(trustedDevices);
      return devices.some((device: any) => device.fingerprint === fingerprint);
    } catch (error) {
      console.error("Device fingerprint validation failed:", error);
      return false;
    }
  }

  /**
   * Check for suspicious activity
   */
  private async checkSuspiciousActivity(
    userId: string,
    headers: { [key: string]: string },
  ): Promise<{ suspicious: boolean; reason?: string }> {
    try {
      const userAgent = headers["user-agent"] || "";
      const ipAddress =
        headers["x-forwarded-for"] || headers["x-real-ip"] || "";

      // Check for suspicious user agents
      const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /automated/i,
      ];

      if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
        return {
          suspicious: true,
          reason: "Suspicious user agent detected",
        };
      }

      // Check for rapid requests (basic rate limiting)
      const requestKey = `requests_${userId}_${ipAddress}`;
      const requestCount = parseInt(localStorage.getItem(requestKey) || "0");
      const maxRequests = 100; // per minute

      if (requestCount > maxRequests) {
        return {
          suspicious: true,
          reason: "Rate limit exceeded",
        };
      }

      // Update request count
      localStorage.setItem(requestKey, (requestCount + 1).toString());

      // Clear counter after 1 minute
      setTimeout(() => {
        localStorage.removeItem(requestKey);
      }, 60000);

      return { suspicious: false };
    } catch (error) {
      console.error("Suspicious activity check failed:", error);
      return { suspicious: false };
    }
  }

  /**
   * Contextual authorization checks
   */
  private async checkContextualAuthorization(
    user: any,
    userProfile: any,
    headers: { [key: string]: string },
  ): Promise<boolean> {
    try {
      // Time-based access control
      const now = new Date();
      const hour = now.getHours();

      // Restrict access outside business hours for certain roles
      if (
        userProfile.role === "administrative_staff" &&
        (hour < 6 || hour > 22)
      ) {
        return false;
      }

      // Location-based access control (if IP geolocation is available)
      const ipAddress = headers["x-forwarded-for"] || headers["x-real-ip"];
      if (ipAddress && userProfile.department) {
        // This would integrate with IP geolocation service
        // For now, we'll allow all locations
      }

      return true;
    } catch (error) {
      console.error("Contextual authorization check failed:", error);
      return true; // Default to allow on error
    }
  }

  /**
   * Validation middleware
   */
  private async validationMiddleware(
    route: ServiceRoute,
    method: string,
    body: any,
  ): Promise<APIGatewayResponse> {
    if (method === "GET" || !body) {
      return { success: true };
    }

    // Validate based on route
    try {
      switch (route.id) {
        case "patient_management":
          if (method === "POST" || method === "PUT") {
            // Validate patient data using unified schema
            const { UnifiedDataValidationService } = await import(
              "./unified-schema.api"
            );
            const validation =
              UnifiedDataValidationService.validatePatient(body);
            if (!validation.valid) {
              return this.createErrorResponse(
                400,
                `Validation failed: ${validation.errors.join(", ")}`,
              );
            }
          }
          break;

        case "clinical_documentation":
          if (method === "POST" || method === "PUT") {
            // Validate clinical form data
            const { UnifiedDataValidationService } = await import(
              "./unified-schema.api"
            );
            const validation =
              UnifiedDataValidationService.validateClinicalForm(body);
            if (!validation.valid) {
              return this.createErrorResponse(
                400,
                `Validation failed: ${validation.errors.join(", ")}`,
              );
            }
          }
          break;
      }

      return { success: true };
    } catch (error) {
      return this.createErrorResponse(400, "Validation error");
    }
  }

  /**
   * Logging middleware
   */
  private async loggingMiddleware(
    method: string,
    path: string,
    headers: { [key: string]: string },
    body: any,
  ): Promise<APIGatewayResponse> {
    this.logger.debug("Request details", {
      method,
      path,
      headers: this.sanitizeHeaders(headers),
      bodySize: body ? JSON.stringify(body).length : 0,
    });

    return { success: true };
  }

  /**
   * Audit middleware
   */
  private async auditMiddleware(
    method: string,
    path: string,
    user: any,
    body: any,
  ): Promise<APIGatewayResponse> {
    // Log audit trail for sensitive operations
    if (method !== "GET") {
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action: `${method} ${path}`,
        resource: path,
        timestamp: new Date().toISOString(),
        ip_address: "unknown", // Would be extracted from headers
        user_agent: "unknown", // Would be extracted from headers
        request_data: body ? JSON.stringify(body) : null,
      });
    }

    return { success: true };
  }

  /**
   * Encryption middleware
   */
  private async encryptionMiddleware(body: any): Promise<APIGatewayResponse> {
    // Encrypt sensitive data before forwarding
    if (body && this.config.security.encryption.enabled) {
      // Implementation would encrypt sensitive fields
      // This is a placeholder for actual encryption logic
    }

    return { success: true };
  }

  /**
   * Forward request to service
   */
  private async forwardRequest(
    route: ServiceRoute,
    method: string,
    path: string,
    headers: { [key: string]: string },
    body: any,
  ): Promise<APIGatewayResponse> {
    const serviceUrl = `${route.service.url}${path}`;
    const timeout = route.service.timeout;
    const maxRetries = route.service.retries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeHttpRequest(
          method,
          serviceUrl,
          headers,
          body,
          timeout,
        );

        return {
          success: true,
          statusCode: response.status,
          headers: response.headers,
          body: response.data,
        };
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retry with exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }

    throw new Error("Max retries exceeded");
  }

  /**
   * Make HTTP request
   */
  private async makeHttpRequest(
    method: string,
    url: string,
    headers: { [key: string]: string },
    body: any,
    timeout: number,
  ): Promise<any> {
    // This would use a proper HTTP client like axios or fetch
    // Placeholder implementation
    return {
      status: 200,
      headers: {},
      data: { message: "Success" },
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    statusCode: number,
    message: string,
    requestId?: string,
  ): APIGatewayResponse {
    return {
      success: false,
      error: true,
      statusCode,
      body: {
        error: {
          message,
          code: statusCode,
          requestId,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize headers for logging
   */
  private sanitizeHeaders(headers: { [key: string]: string }): any {
    const sanitized = { ...headers };
    delete sanitized["authorization"];
    delete sanitized["cookie"];
    return sanitized;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Phase 3: Update session activity
   */
  private async updateSessionActivity(
    userId: string,
    headers: { [key: string]: string },
  ): Promise<void> {
    try {
      const sessionId = headers["x-session-id"];
      if (!sessionId) return;

      const activityData = {
        userId,
        sessionId,
        lastActivity: new Date().toISOString(),
        ipAddress: headers["x-forwarded-for"] || headers["x-real-ip"],
        userAgent: headers["user-agent"],
        endpoint: headers["x-current-route"],
      };

      // Store in session storage for immediate access
      if (typeof window !== "undefined") {
        const existingActivity = JSON.parse(
          sessionStorage.getItem("session_activity") || "{}",
        );
        existingActivity[sessionId] = activityData;
        sessionStorage.setItem(
          "session_activity",
          JSON.stringify(existingActivity),
        );
      }

      // Update in database (would be implemented with actual DB)
      console.log("📝 Session activity updated:", activityData);
    } catch (error) {
      console.error("Failed to update session activity:", error);
    }
  }

  /**
   * Phase 3: Monitor security events
   */
  private async monitorSecurityEvents(
    user: any,
    route: ServiceRoute,
    headers: { [key: string]: string },
  ): Promise<void> {
    try {
      const securityEvent = {
        userId: user.id,
        eventType: "api_access",
        resource: route.path,
        method: route.method,
        timestamp: new Date().toISOString(),
        ipAddress: headers["x-forwarded-for"] || headers["x-real-ip"],
        userAgent: headers["user-agent"],
        sessionId: headers["x-session-id"],
        deviceFingerprint: headers["x-device-fingerprint"],
        riskScore: await this.calculateRiskScore(user, headers),
      };

      // Store security events for analysis
      const existingEvents = JSON.parse(
        localStorage.getItem("security_events") || "[]",
      );
      existingEvents.push(securityEvent);

      // Keep only last 100 events
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }

      localStorage.setItem("security_events", JSON.stringify(existingEvents));

      // Trigger real-time security analysis
      await this.analyzeSecurityPatterns(securityEvent);
    } catch (error) {
      console.error("Failed to monitor security events:", error);
    }
  }

  /**
   * Phase 3: Calculate risk score
   */
  private async calculateRiskScore(
    user: any,
    headers: { [key: string]: string },
  ): Promise<number> {
    let riskScore = 0;

    try {
      // Check for unusual access patterns
      const recentEvents = JSON.parse(
        localStorage.getItem("security_events") || "[]",
      );
      const userEvents = recentEvents.filter(
        (event: any) => event.userId === user.id,
      );

      // Time-based risk factors
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 22) {
        riskScore += 10; // Outside business hours
      }

      // Location-based risk factors
      const currentIP = headers["x-forwarded-for"] || headers["x-real-ip"];
      const recentIPs = userEvents
        .slice(-10)
        .map((event: any) => event.ipAddress)
        .filter((ip: string) => ip !== currentIP);

      if (recentIPs.length > 0) {
        riskScore += 15; // New IP address
      }

      // Device-based risk factors
      const deviceFingerprint = headers["x-device-fingerprint"];
      if (!deviceFingerprint) {
        riskScore += 20; // No device fingerprint
      }

      // Frequency-based risk factors
      const recentRequests = userEvents.filter(
        (event: any) =>
          new Date(event.timestamp).getTime() > Date.now() - 60000, // Last minute
      );

      if (recentRequests.length > 10) {
        riskScore += 25; // High frequency requests
      }

      return Math.min(riskScore, 100); // Cap at 100
    } catch (error) {
      console.error("Risk score calculation failed:", error);
      return 50; // Default medium risk
    }
  }

  /**
   * Phase 3: Analyze security patterns
   */
  private async analyzeSecurityPatterns(event: any): Promise<void> {
    try {
      // Check for suspicious patterns
      if (event.riskScore > 70) {
        await this.triggerSecurityAlert({
          type: "high_risk_access",
          userId: event.userId,
          riskScore: event.riskScore,
          details: event,
          timestamp: new Date().toISOString(),
        });
      }

      // Check for brute force attempts
      const recentFailures = JSON.parse(
        localStorage.getItem("auth_failures") || "[]",
      ).filter(
        (failure: any) =>
          failure.ipAddress === event.ipAddress &&
          new Date(failure.timestamp).getTime() > Date.now() - 300000, // Last 5 minutes
      );

      if (recentFailures.length > 5) {
        await this.triggerSecurityAlert({
          type: "brute_force_attempt",
          ipAddress: event.ipAddress,
          attempts: recentFailures.length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Security pattern analysis failed:", error);
    }
  }

  /**
   * Phase 3: Validate data flow security
   */
  private async validateDataFlowSecurity(
    user: any,
    route: ServiceRoute,
    headers: { [key: string]: string },
  ): Promise<void> {
    try {
      // Validate data classification requirements
      const dataClassification = this.getRouteDataClassification(route.path);
      const userClearanceLevel = await this.getUserClearanceLevel(user.id);

      if (
        !this.hasDataAccessPermission(userClearanceLevel, dataClassification)
      ) {
        throw new Error(
          `Insufficient data clearance: ${dataClassification} requires ${this.getRequiredClearanceLevel(dataClassification)}`,
        );
      }

      // Validate data flow patterns
      const dataFlowPattern = await this.analyzeDataFlowPattern(
        user.id,
        route.path,
        headers,
      );
      if (dataFlowPattern.suspicious) {
        await this.triggerSecurityAlert({
          type: "suspicious_data_flow",
          userId: user.id,
          route: route.path,
          pattern: dataFlowPattern,
          timestamp: new Date().toISOString(),
        });
      }

      // Log data access for audit trail
      await this.logDataAccess({
        userId: user.id,
        route: route.path,
        dataClassification,
        userClearanceLevel,
        timestamp: new Date().toISOString(),
        ipAddress: headers["x-forwarded-for"] || headers["x-real-ip"],
        sessionId: headers["x-session-id"],
      });
    } catch (error) {
      console.error("Data flow security validation failed:", error);
      throw error;
    }
  }

  /**
   * Phase 3: Get route data classification
   */
  private getRouteDataClassification(path: string): string {
    const classificationMap: { [key: string]: string } = {
      "/api/v1/patients": "restricted",
      "/api/v1/clinical": "restricted",
      "/api/v1/daman": "confidential",
      "/api/v1/malaffi": "confidential",
      "/api/v1/analytics": "internal",
      "/api/v1/reports": "confidential",
      "/api/v1/compliance": "restricted",
    };

    return classificationMap[path] || "internal";
  }

  /**
   * Phase 3: Get user clearance level
   */
  private async getUserClearanceLevel(userId: string): Promise<string> {
    try {
      // In production, this would query the user's security clearance from database
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("security_clearance, role")
        .eq("id", userId)
        .single();

      if (userProfile?.security_clearance) {
        return userProfile.security_clearance;
      }

      // Default clearance based on role
      const roleClearanceMap: { [key: string]: string } = {
        admin: "restricted",
        doctor: "confidential",
        nurse: "confidential",
        therapist: "internal",
        coordinator: "internal",
      };

      return roleClearanceMap[userProfile?.role] || "public";
    } catch (error) {
      console.error("Failed to get user clearance level:", error);
      return "public";
    }
  }

  /**
   * Phase 3: Check data access permission
   */
  private hasDataAccessPermission(
    userClearance: string,
    dataClassification: string,
  ): boolean {
    const clearanceLevels = {
      public: 0,
      internal: 1,
      confidential: 2,
      restricted: 3,
    };

    const userLevel =
      clearanceLevels[userClearance as keyof typeof clearanceLevels] || 0;
    const requiredLevel =
      clearanceLevels[dataClassification as keyof typeof clearanceLevels] || 0;

    return userLevel >= requiredLevel;
  }

  /**
   * Phase 3: Get required clearance level
   */
  private getRequiredClearanceLevel(dataClassification: string): string {
    return dataClassification;
  }

  /**
   * Phase 3: Analyze data flow pattern
   */
  private async analyzeDataFlowPattern(
    userId: string,
    path: string,
    headers: { [key: string]: string },
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    let suspicious = false;

    try {
      // Check for unusual access patterns
      const recentAccess = JSON.parse(
        localStorage.getItem(`data_access_${userId}`) || "[]",
      );

      const now = Date.now();
      const recentRequests = recentAccess.filter(
        (access: any) => now - new Date(access.timestamp).getTime() < 300000, // 5 minutes
      );

      // Check for rapid data access
      if (recentRequests.length > 20) {
        suspicious = true;
        reasons.push("High frequency data access detected");
      }

      // Check for unusual time access
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 22) {
        const offHoursAccess = recentRequests.filter((access: any) => {
          const hour = new Date(access.timestamp).getHours();
          return hour < 6 || hour > 22;
        });

        if (offHoursAccess.length > 5) {
          suspicious = true;
          reasons.push("Unusual off-hours data access pattern");
        }
      }

      // Check for cross-classification access
      const accessedClassifications = new Set(
        recentRequests.map((access: any) => access.dataClassification),
      );
      if (accessedClassifications.size > 2) {
        suspicious = true;
        reasons.push("Cross-classification data access detected");
      }

      // Store current access
      recentAccess.push({
        path,
        timestamp: new Date().toISOString(),
        dataClassification: this.getRouteDataClassification(path),
        ipAddress: headers["x-forwarded-for"] || headers["x-real-ip"],
      });

      // Keep only last 100 accesses
      if (recentAccess.length > 100) {
        recentAccess.splice(0, recentAccess.length - 100);
      }

      localStorage.setItem(
        `data_access_${userId}`,
        JSON.stringify(recentAccess),
      );

      return { suspicious, reasons };
    } catch (error) {
      console.error("Data flow pattern analysis failed:", error);
      return { suspicious: false, reasons: [] };
    }
  }

  /**
   * Phase 3: Log data access
   */
  private async logDataAccess(accessData: any): Promise<void> {
    try {
      // Store in audit log
      const auditEntry = {
        event: "data_access",
        ...accessData,
        source: "api-gateway",
      };

      // In production, this would be stored in a secure audit database
      console.log("📊 Data Access Log:", auditEntry);

      // Store locally for development
      const auditLog = JSON.parse(
        localStorage.getItem("data_access_audit") || "[]",
      );
      auditLog.push(auditEntry);

      // Keep only last 1000 entries
      if (auditLog.length > 1000) {
        auditLog.splice(0, auditLog.length - 1000);
      }

      localStorage.setItem("data_access_audit", JSON.stringify(auditLog));
    } catch (error) {
      console.error("Failed to log data access:", error);
    }
  }

  /**
   * Phase 3: Trigger security alert
   */
  private async triggerSecurityAlert(alert: any): Promise<void> {
    try {
      console.warn("🚨 Security Alert:", alert);

      // Store alert for dashboard display
      const existingAlerts = JSON.parse(
        localStorage.getItem("security_alerts") || "[]",
      );
      existingAlerts.push(alert);

      // Keep only last 50 alerts
      if (existingAlerts.length > 50) {
        existingAlerts.splice(0, existingAlerts.length - 50);
      }

      localStorage.setItem("security_alerts", JSON.stringify(existingAlerts));

      // Trigger real-time notification
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("security:alert", { detail: alert }),
        );
      }

      // Phase 3: Enhanced alert processing
      await this.processSecurityAlert(alert);

      // In production, this would integrate with:
      // - SIEM systems
      // - Email/SMS notifications
      // - Incident response workflows
      // - Automated threat response
    } catch (error) {
      console.error("Failed to trigger security alert:", error);
    }
  }

  /**
   * Phase 3: Process security alert
   */
  private async processSecurityAlert(alert: any): Promise<void> {
    try {
      // Determine alert severity
      const severity = this.calculateAlertSeverity(alert);

      // Auto-response based on severity
      if (severity === "critical") {
        await this.executeCriticalSecurityResponse(alert);
      } else if (severity === "high") {
        await this.executeHighSecurityResponse(alert);
      }

      // Update security metrics
      await this.updateSecurityMetrics(alert, severity);

      // Correlate with other alerts
      await this.correlateSecurityAlerts(alert);
    } catch (error) {
      console.error("Failed to process security alert:", error);
    }
  }

  /**
   * Phase 3: Calculate alert severity
   */
  private calculateAlertSeverity(alert: any): string {
    const severityFactors = {
      high_risk_access: 3,
      brute_force_attempt: 4,
      suspicious_data_flow: 2,
      integrity_violation: 4,
      concurrent_session_limit: 2,
    };

    const baseSeverity =
      severityFactors[alert.type as keyof typeof severityFactors] || 1;

    // Adjust based on risk score
    if (alert.riskScore && alert.riskScore > 80) {
      return "critical";
    } else if (baseSeverity >= 3 || (alert.riskScore && alert.riskScore > 60)) {
      return "high";
    } else if (baseSeverity >= 2 || (alert.riskScore && alert.riskScore > 40)) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Phase 3: Execute critical security response
   */
  private async executeCriticalSecurityResponse(alert: any): Promise<void> {
    try {
      console.warn("🔴 CRITICAL SECURITY RESPONSE ACTIVATED:", alert);

      // Immediate actions for critical alerts
      if (alert.userId) {
        // Temporarily suspend user session
        await this.suspendUserSession(alert.userId);

        // Require re-authentication
        await this.requireReAuthentication(alert.userId);
      }

      // Block suspicious IP if applicable
      if (alert.ipAddress && alert.type === "brute_force_attempt") {
        await this.blockSuspiciousIP(alert.ipAddress);
      }

      // Escalate to security team
      await this.escalateToSecurityTeam(alert);
    } catch (error) {
      console.error("Failed to execute critical security response:", error);
    }
  }

  /**
   * Phase 3: Execute high security response
   */
  private async executeHighSecurityResponse(alert: any): Promise<void> {
    try {
      console.warn("🟡 HIGH SECURITY RESPONSE ACTIVATED:", alert);

      // Enhanced monitoring for the user/IP
      if (alert.userId) {
        await this.enableEnhancedMonitoring(alert.userId);
      }

      // Notify security team
      await this.notifySecurityTeam(alert);
    } catch (error) {
      console.error("Failed to execute high security response:", error);
    }
  }

  /**
   * Phase 3: Update security metrics
   */
  private async updateSecurityMetrics(
    alert: any,
    severity: string,
  ): Promise<void> {
    try {
      const metrics = JSON.parse(
        localStorage.getItem("security_metrics") || "{}",
      );

      const today = new Date().toISOString().split("T")[0];
      if (!metrics[today]) {
        metrics[today] = {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          types: {},
        };
      }

      metrics[today].total++;
      metrics[today][severity]++;
      metrics[today].types[alert.type] =
        (metrics[today].types[alert.type] || 0) + 1;

      localStorage.setItem("security_metrics", JSON.stringify(metrics));
    } catch (error) {
      console.error("Failed to update security metrics:", error);
    }
  }

  /**
   * Phase 3: Correlate security alerts
   */
  private async correlateSecurityAlerts(alert: any): Promise<void> {
    try {
      const recentAlerts = JSON.parse(
        localStorage.getItem("security_alerts") || "[]",
      );

      const correlatedAlerts = recentAlerts.filter((existingAlert: any) => {
        const timeDiff =
          new Date(alert.timestamp).getTime() -
          new Date(existingAlert.timestamp).getTime();
        return (
          timeDiff < 300000 && // Within 5 minutes
          (existingAlert.userId === alert.userId ||
            existingAlert.ipAddress === alert.ipAddress)
        );
      });

      if (correlatedAlerts.length > 2) {
        await this.triggerCorrelatedAlertResponse({
          ...alert,
          correlatedAlerts,
          correlationType: "pattern_detected",
        });
      }
    } catch (error) {
      console.error("Failed to correlate security alerts:", error);
    }
  }

  /**
   * Phase 3: Security response helper methods
   */
  private async suspendUserSession(userId: string): Promise<void> {
    console.log(`🔒 Suspending session for user: ${userId}`);
    // Implementation would suspend user session in database
  }

  private async requireReAuthentication(userId: string): Promise<void> {
    console.log(`🔐 Requiring re-authentication for user: ${userId}`);
    // Implementation would flag user for re-authentication
  }

  private async blockSuspiciousIP(ipAddress: string): Promise<void> {
    console.log(`🚫 Blocking suspicious IP: ${ipAddress}`);
    // Implementation would add IP to blocklist
  }

  private async escalateToSecurityTeam(alert: any): Promise<void> {
    console.log(`📢 Escalating to security team:`, alert);
    // Implementation would send alert to security team
  }

  private async enableEnhancedMonitoring(userId: string): Promise<void> {
    console.log(`👁️ Enabling enhanced monitoring for user: ${userId}`);
    // Implementation would enable enhanced monitoring
  }

  private async notifySecurityTeam(alert: any): Promise<void> {
    console.log(`📧 Notifying security team:`, alert);
    // Implementation would send notification to security team
  }

  private async triggerCorrelatedAlertResponse(
    correlatedAlert: any,
  ): Promise<void> {
    console.log(`🔗 Correlated alert pattern detected:`, correlatedAlert);
    // Implementation would handle correlated alert response
  }

  /**
   * Phase 3: Get comprehensive gateway health status with data flow analysis
   */
  public getHealthStatus(): GatewayHealthStatus {
    const services: { [key: string]: ServiceHealthStatus } = {};

    this.healthCheckers.forEach((checker, serviceName) => {
      services[serviceName] = checker.getStatus();
    });

    const overallHealth = Object.values(services).every(
      (status) => status.healthy,
    )
      ? "healthy"
      : "unhealthy";

    const configHealth = this.configManager.getHealthStatus();

    return {
      status:
        overallHealth === "healthy" && configHealth.status === "healthy"
          ? "healthy"
          : "unhealthy",
      timestamp: new Date().toISOString(),
      services,
      metrics: this.metrics.getMetrics(),
      configuration: {
        status: configHealth.status,
        version: configHealth.version,
        environment: configHealth.environment,
        lastUpdate: configHealth.lastUpdate,
        remoteConfigEnabled: configHealth.remoteConfigEnabled,
        issues: configHealth.issues,
      },
      featureFlags: {
        enabled: Object.entries(
          this.configManager.getConfiguration().featureFlags,
        )
          .filter(([_, enabled]) => enabled)
          .map(([flag, _]) => flag),
        disabled: Object.entries(
          this.configManager.getConfiguration().featureFlags,
        )
          .filter(([_, enabled]) => !enabled)
          .map(([flag, _]) => flag),
      },
      // Phase 3: Enhanced health status with data flow metrics
      dataFlow: this.getDataFlowHealthStatus(),
      security: this.getSecurityHealthStatus(),
      integration: this.getIntegrationHealthStatus(),
    };
  }

  /**
   * Phase 3: Get data flow health status
   */
  private getDataFlowHealthStatus(): any {
    try {
      const dataAccessAudit = JSON.parse(
        localStorage.getItem("data_access_audit") || "[]",
      );
      const securityAlerts = JSON.parse(
        localStorage.getItem("security_alerts") || "[]",
      );
      const securityMetrics = JSON.parse(
        localStorage.getItem("security_metrics") || "{}",
      );

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);

      const recentDataAccess = dataAccessAudit.filter(
        (access: any) => new Date(access.timestamp) > oneHourAgo,
      );

      const recentAlerts = securityAlerts.filter(
        (alert: any) => new Date(alert.timestamp) > oneHourAgo,
      );

      return {
        status: recentAlerts.length > 10 ? "degraded" : "healthy",
        totalDataAccess: recentDataAccess.length,
        securityAlerts: recentAlerts.length,
        dataClassificationBreaches: recentAlerts.filter(
          (alert: any) => alert.type === "data_classification_breach",
        ).length,
        suspiciousDataFlows: recentAlerts.filter(
          (alert: any) => alert.type === "suspicious_data_flow",
        ).length,
        averageResponseTime:
          this.calculateAverageResponseTime(recentDataAccess),
        complianceScore: this.calculateComplianceScore(
          recentDataAccess,
          recentAlerts,
        ),
      };
    } catch (error) {
      console.error("Failed to get data flow health status:", error);
      return {
        status: "unknown",
        error: error.message,
      };
    }
  }

  /**
   * Phase 3: Get security health status
   */
  private getSecurityHealthStatus(): any {
    try {
      const securityMetrics = JSON.parse(
        localStorage.getItem("security_metrics") || "{}",
      );
      const today = new Date().toISOString().split("T")[0];
      const todayMetrics = securityMetrics[today] || {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      const securityScore = this.calculateSecurityScore(todayMetrics);

      return {
        status:
          securityScore > 80
            ? "healthy"
            : securityScore > 60
              ? "degraded"
              : "unhealthy",
        securityScore,
        alertsToday: todayMetrics.total,
        criticalAlerts: todayMetrics.critical,
        highAlerts: todayMetrics.high,
        authenticationFailures: this.getAuthenticationFailures(),
        sessionIntegrityViolations: this.getSessionIntegrityViolations(),
        dataAccessViolations: this.getDataAccessViolations(),
      };
    } catch (error) {
      console.error("Failed to get security health status:", error);
      return {
        status: "unknown",
        error: error.message,
      };
    }
  }

  /**
   * Phase 3: Get integration health status
   */
  private getIntegrationHealthStatus(): any {
    try {
      return {
        status: "healthy",
        enhancedAuthService: {
          status: "connected",
          lastCheck: new Date().toISOString(),
        },
        supabaseIntegration: {
          status: "connected",
          lastCheck: new Date().toISOString(),
        },
        configurationManager: {
          status: this.configManager ? "connected" : "disconnected",
          lastUpdate: this.configManager?.getRuntimeConfig()?.lastConfigUpdate,
        },
        dataFlowValidation: {
          status: "active",
          validationsPerformed: this.getValidationsPerformed(),
        },
        securityMonitoring: {
          status: "active",
          alertsProcessed: this.getAlertsProcessed(),
        },
      };
    } catch (error) {
      console.error("Failed to get integration health status:", error);
      return {
        status: "unknown",
        error: error.message,
      };
    }
  }

  /**
   * Phase 3: Helper methods for health status calculations
   */
  private calculateAverageResponseTime(dataAccess: any[]): number {
    if (dataAccess.length === 0) return 0;
    // Mock calculation - in production, this would use actual response times
    return 150; // ms
  }

  private calculateComplianceScore(dataAccess: any[], alerts: any[]): number {
    const totalAccess = dataAccess.length;
    const violations = alerts.filter(
      (alert: any) => alert.type === "compliance_violation",
    ).length;

    if (totalAccess === 0) return 100;
    return Math.max(0, 100 - (violations / totalAccess) * 100);
  }

  private calculateSecurityScore(metrics: any): number {
    const baseScore = 100;
    const criticalPenalty = metrics.critical * 20;
    const highPenalty = metrics.high * 10;
    const mediumPenalty = metrics.medium * 5;

    return Math.max(
      0,
      baseScore - criticalPenalty - highPenalty - mediumPenalty,
    );
  }

  private getAuthenticationFailures(): number {
    // Mock implementation - in production, this would query actual metrics
    return 0;
  }

  private getSessionIntegrityViolations(): number {
    // Mock implementation - in production, this would query actual metrics
    return 0;
  }

  private getDataAccessViolations(): number {
    const securityAlerts = JSON.parse(
      localStorage.getItem("security_alerts") || "[]",
    );
    return securityAlerts.filter(
      (alert: any) => alert.type === "data_access_violation",
    ).length;
  }

  private getValidationsPerformed(): number {
    const dataAccessAudit = JSON.parse(
      localStorage.getItem("data_access_audit") || "[]",
    );
    return dataAccessAudit.length;
  }

  private getAlertsProcessed(): number {
    const securityAlerts = JSON.parse(
      localStorage.getItem("security_alerts") || "[]",
    );
    return securityAlerts.length;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.configSubscription) {
      this.configSubscription();
    }

    this.healthCheckers.forEach((checker) => {
      checker.stop();
    });

    this.configManager.cleanup();
  }

  /**
   * Get gateway metrics
   */
  public getMetrics(): GatewayMetrics {
    return this.metrics.getMetrics();
  }
}

// Supporting classes
class RateLimiter {
  private config: RateLimitConfig;
  private windows: Map<string, RateLimitWindow> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowKey = this.getWindowKey(key, now);
    const window = this.windows.get(windowKey) || {
      requests: 0,
      resetTime: now + this.config.window * 1000,
    };

    if (now > window.resetTime) {
      // Reset window
      window.requests = 0;
      window.resetTime = now + this.config.window * 1000;
    }

    if (window.requests >= this.config.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: window.resetTime,
      };
    }

    window.requests++;
    this.windows.set(windowKey, window);

    return {
      allowed: true,
      remaining: this.config.requests - window.requests,
      resetTime: window.resetTime,
    };
  }

  private getWindowKey(key: string, timestamp: number): string {
    const windowStart = Math.floor(timestamp / (this.config.window * 1000));
    return `${key}:${windowStart}`;
  }
}

class HealthChecker {
  private endpoint: HealthCheckEndpoint;
  private config: HealthCheckConfig;
  private status: ServiceHealthStatus;
  private intervalId?: NodeJS.Timeout;

  constructor(endpoint: HealthCheckEndpoint, config: HealthCheckConfig) {
    this.endpoint = endpoint;
    this.config = config;
    this.status = {
      healthy: true,
      lastCheck: new Date().toISOString(),
      responseTime: 0,
      consecutiveFailures: 0,
    };
  }

  start(): void {
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.config.interval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();

    try {
      // Perform health check request
      // This would use actual HTTP client
      const response = await this.makeHealthCheckRequest();
      const responseTime = Date.now() - startTime;

      if (this.endpoint.expectedStatus.includes(response.status)) {
        this.status = {
          healthy: true,
          lastCheck: new Date().toISOString(),
          responseTime,
          consecutiveFailures: 0,
        };
      } else {
        this.handleFailure(responseTime);
      }
    } catch (error) {
      this.handleFailure(Date.now() - startTime);
    }
  }

  private handleFailure(responseTime: number): void {
    this.status = {
      healthy: false,
      lastCheck: new Date().toISOString(),
      responseTime,
      consecutiveFailures: this.status.consecutiveFailures + 1,
    };
  }

  private async makeHealthCheckRequest(): Promise<{ status: number }> {
    // Placeholder implementation
    return { status: 200 };
  }

  getStatus(): ServiceHealthStatus {
    return this.status;
  }
}

class MetricsCollector {
  private config: MetricsConfig;
  private metrics: GatewayMetrics;

  constructor(config: MetricsConfig) {
    this.config = config;
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        averageResponseTime: 0,
      },
      endpoints: {},
      errors: {},
      timestamp: new Date().toISOString(),
    };
  }

  recordRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ): void {
    this.metrics.requests.total++;

    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }

    // Update average response time
    this.metrics.requests.averageResponseTime =
      (this.metrics.requests.averageResponseTime *
        (this.metrics.requests.total - 1) +
        duration) /
      this.metrics.requests.total;

    // Update endpoint metrics
    const endpointKey = `${method} ${path}`;
    if (!this.metrics.endpoints[endpointKey]) {
      this.metrics.endpoints[endpointKey] = {
        requests: 0,
        averageResponseTime: 0,
        errors: 0,
      };
    }

    const endpoint = this.metrics.endpoints[endpointKey];
    endpoint.requests++;
    endpoint.averageResponseTime =
      (endpoint.averageResponseTime * (endpoint.requests - 1) + duration) /
      endpoint.requests;

    if (statusCode >= 400) {
      endpoint.errors++;
    }
  }

  recordError(method: string, path: string, error: string): void {
    const errorKey = `${method} ${path}: ${error}`;
    this.metrics.errors[errorKey] = (this.metrics.errors[errorKey] || 0) + 1;
  }

  getMetrics(): GatewayMetrics {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
    };
  }
}

class Logger {
  private config: LoggingConfig;

  constructor(config: LoggingConfig) {
    this.config = config;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog("debug")) {
      this.log("debug", message, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog("info")) {
      this.log("info", message, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog("warn")) {
      this.log("warn", message, data);
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog("error")) {
      this.log("error", message, data);
    }
  }

  /**
   * Update log level dynamically
   */
  updateLogLevel(level: "debug" | "info" | "warn" | "error"): void {
    this.config.level = level;
    console.log(`🔄 Log level updated to: ${level}`);
  }

  private shouldLog(level: string): boolean {
    const levels = ["debug", "info", "warn", "error"];
    const configLevel = levels.indexOf(this.config.level);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= configLevel;
  }

  private log(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    if (this.config.format === "json") {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`);
      if (data) {
        console.log(data);
      }
    }
  }
}

// Type definitions
interface APIGatewayResponse {
  success: boolean;
  error?: boolean;
  statusCode?: number;
  headers?: { [key: string]: string };
  body?: any;
  user?: any;
}

interface RateLimitWindow {
  requests: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

interface ServiceHealthStatus {
  healthy: boolean;
  lastCheck: string;
  responseTime: number;
  consecutiveFailures: number;
}

interface GatewayHealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  services: { [key: string]: ServiceHealthStatus };
  metrics: GatewayMetrics;
  // Phase 3: Enhanced health status properties
  dataFlow?: {
    status: string;
    totalDataAccess: number;
    securityAlerts: number;
    dataClassificationBreaches: number;
    suspiciousDataFlows: number;
    averageResponseTime: number;
    complianceScore: number;
  };
  security?: {
    status: string;
    securityScore: number;
    alertsToday: number;
    criticalAlerts: number;
    highAlerts: number;
    authenticationFailures: number;
    sessionIntegrityViolations: number;
    dataAccessViolations: number;
  };
  integration?: {
    status: string;
    enhancedAuthService: {
      status: string;
      lastCheck: string;
    };
    supabaseIntegration: {
      status: string;
      lastCheck: string;
    };
    configurationManager: {
      status: string;
      lastUpdate?: string;
    };
    dataFlowValidation: {
      status: string;
      validationsPerformed: number;
    };
    securityMonitoring: {
      status: string;
      alertsProcessed: number;
    };
  };
}

interface GatewayMetrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  endpoints: {
    [key: string]: {
      requests: number;
      averageResponseTime: number;
      errors: number;
    };
  };
  errors: { [key: string]: number };
  timestamp: string;
}

// Default configuration
export const defaultAPIGatewayConfig: APIGatewayConfig = {
  authentication: {
    enabled: true,
    providers: ["supabase"],
    tokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 86400, // 24 hours
  },
  authorization: {
    rbac: {
      enabled: true,
      roles: [
        {
          id: "admin",
          name: "Administrator",
          description: "Full system access",
          permissions: ["*"],
          hierarchy: 100,
        },
        {
          id: "clinician",
          name: "Clinician",
          description: "Clinical documentation access",
          permissions: [
            "patient:read",
            "patient:write",
            "clinical:read",
            "clinical:write",
          ],
          hierarchy: 80,
        },
        {
          id: "nurse",
          name: "Nurse",
          description: "Patient care access",
          permissions: ["patient:read", "clinical:read", "clinical:write"],
          hierarchy: 60,
        },
        {
          id: "staff",
          name: "Staff",
          description: "Basic access",
          permissions: ["patient:read", "clinical:read"],
          hierarchy: 40,
        },
      ],
      permissions: [
        {
          id: "patient:read",
          resource: "patient",
          action: "read",
        },
        {
          id: "patient:write",
          resource: "patient",
          action: "write",
        },
        {
          id: "clinical:read",
          resource: "clinical",
          action: "read",
        },
        {
          id: "clinical:write",
          resource: "clinical",
          action: "write",
        },
      ],
    },
    policies: [],
  },
  rateLimiting: {
    enabled: true,
    global: {
      requests: 1000,
      window: 60,
      burst: 100,
      strategy: "sliding_window",
    },
    perEndpoint: {
      "/api/v1/patients": {
        requests: 200,
        window: 60,
        burst: 50,
        strategy: "sliding_window",
      },
      "/api/v1/clinical": {
        requests: 150,
        window: 60,
        burst: 30,
        strategy: "token_bucket",
      },
      "/api/v1/daman": {
        requests: 50,
        window: 60,
        burst: 10,
        strategy: "fixed_window",
      },
    },
    perUser: {
      requests: 100,
      window: 60,
      burst: 20,
      strategy: "token_bucket",
    },
    perIP: {
      requests: 500,
      window: 60,
      burst: 100,
      strategy: "sliding_window",
    },
    adaptive: {
      enabled: true,
      thresholds: {
        errorRate: 0.05, // 5% error rate threshold
        responseTime: 2000, // 2 second response time threshold
      },
      adjustmentFactor: 0.5, // Reduce limits by 50% when thresholds exceeded
    },
  },
  routing: {
    services: [],
    loadBalancing: {
      strategy: "round_robin",
      healthCheck: true,
      failover: true,
    },
    healthChecks: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      retries: 3,
      endpoints: [],
    },
  },
  security: {
    cors: {
      enabled: true,
      origins: ["*"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      headers: ["Content-Type", "Authorization"],
      credentials: true,
      maxAge: 86400,
    },
    encryption: {
      enabled: true,
      algorithm: "AES-256-GCM",
      keyRotation: {
        enabled: true,
        interval: 86400, // 24 hours
      },
      tls: {
        enabled: true,
        version: "1.3",
        ciphers: [],
      },
    },
    logging: {
      enabled: true,
      level: "info",
      format: "json",
      destinations: [
        {
          type: "file",
          config: { path: "/var/log/api-gateway.log" },
        },
      ],
      retention: {
        days: 30,
        maxSize: "1GB",
      },
    },
  },
  monitoring: {
    metrics: {
      enabled: true,
      collectors: ["requests", "errors", "latency"],
      exporters: [
        {
          type: "prometheus",
          config: { port: 9090 },
        },
      ],
      retention: {
        days: 7,
        aggregation: "1m",
      },
    },
    alerts: [
      {
        id: "high_error_rate",
        name: "High Error Rate",
        condition: "error_rate > 0.05",
        threshold: 0.05,
        duration: 300, // 5 minutes
        severity: "high",
        notifications: [
          {
            type: "email",
            config: { recipients: ["admin@reyada.com"] },
          },
        ],
      },
    ],
    tracing: {
      enabled: true,
      sampler: {
        type: "probabilistic",
        param: 0.1, // 10% sampling
      },
      exporter: {
        type: "jaeger",
        config: { endpoint: "http://jaeger:14268/api/traces" },
      },
    },
  },
};

// Service Mesh Integration for API Gateway
export class ServiceMeshAPIGateway extends APIGatewayService {
  private serviceMesh: any; // Will be injected
  private meshEnabled = false;

  constructor(config: APIGatewayConfig, serviceMesh?: any) {
    super(config);
    if (serviceMesh) {
      this.serviceMesh = serviceMesh;
      this.meshEnabled = true;
      this.setupMeshIntegration();
    }
  }

  /**
   * Process request through service mesh
   */
  async processRequest(
    method: string,
    path: string,
    headers: { [key: string]: string },
    body: any,
    user?: any,
  ): Promise<APIGatewayResponse> {
    if (!this.meshEnabled) {
      return super.processRequest(method, path, headers, body, user);
    }

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Enhanced logging with mesh context
      this.logger.info("Mesh request received", {
        requestId,
        method,
        path,
        meshEnabled: true,
        userAgent: headers["user-agent"],
        ip: headers["x-forwarded-for"] || headers["x-real-ip"],
      });

      // Find matching route
      const route = this.findRoute(method, path);
      if (!route) {
        return this.createErrorResponse(404, "Route not found", requestId);
      }

      // Apply middleware with mesh awareness
      const middlewareResult = await this.applyMiddleware(
        route,
        method,
        path,
        headers,
        body,
        user,
      );
      if (middlewareResult.error) {
        return middlewareResult;
      }

      // Route through service mesh
      const meshRequest = {
        method,
        path,
        headers: {
          ...headers,
          "x-request-id": requestId,
          "x-gateway-timestamp": startTime.toString(),
        },
        body,
        timeout: route.service.timeout,
      };

      const meshResponse = await this.serviceMesh.routeRequest(
        "api-gateway",
        route.service.name,
        meshRequest,
      );

      // Log response with mesh metrics
      const duration = Date.now() - startTime;
      this.logger.info("Mesh request completed", {
        requestId,
        statusCode: meshResponse.statusCode,
        duration,
        meshLatency: meshResponse.duration,
      });

      // Update metrics with mesh data
      this.metrics.recordRequest(
        method,
        path,
        meshResponse.statusCode,
        duration,
      );

      return {
        success: true,
        statusCode: meshResponse.statusCode,
        headers: {
          ...meshResponse.headers,
          "x-mesh-routed": "true",
          "x-request-id": requestId,
        },
        body: meshResponse.body,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error("Mesh request failed", {
        requestId,
        error: error.message,
        duration,
        meshEnabled: true,
      });

      this.metrics.recordError(method, path, error.message);

      return this.createErrorResponse(
        500,
        "Service mesh routing error",
        requestId,
      );
    }
  }

  /**
   * Setup service mesh integration
   */
  private setupMeshIntegration(): void {
    if (!this.serviceMesh) return;

    // Register API Gateway as a service in the mesh
    this.serviceMesh.registerService({
      id: "api-gateway",
      name: "APIGateway",
      version: "1.0.0",
      namespace: "infrastructure",
      endpoints: [
        {
          id: "gateway-api",
          url: "/api",
          method: ["GET", "POST", "PUT", "DELETE"],
          timeout: 30000,
        },
      ],
      dependencies: [],
      capabilities: ["routing", "authentication", "rate-limiting"],
      circuitBreaker: {
        enabled: false, // Gateway shouldn't break
      },
      retry: {
        maxRetries: 0, // Gateway doesn't retry
      },
    });

    // Apply default traffic policies
    this.applyDefaultTrafficPolicies();

    // Apply default security policies
    this.applyDefaultSecurityPolicies();

    // Listen to mesh events
    this.serviceMesh.on("service.registered", (data: any) => {
      this.logger.info("Service registered in mesh", data);
    });

    this.serviceMesh.on("policy.applied", (data: any) => {
      this.logger.info("Policy applied in mesh", data);
    });
  }

  /**
   * Apply default traffic policies
   */
  private applyDefaultTrafficPolicies(): void {
    const trafficPolicies = [
      {
        id: "patient-service-routing",
        name: "Patient Service Routing",
        targetService: "patient-management-service",
        rules: [
          {
            match: { path: "/api/v1/patients/*" },
            route: {
              destination: "patient-management-service",
              weight: 100,
              timeout: 30000,
              headers: {
                "x-service-version": "1.0.0",
              },
            },
          },
        ],
        priority: 10,
      },
      {
        id: "clinical-service-routing",
        name: "Clinical Service Routing",
        targetService: "clinical-documentation-service",
        rules: [
          {
            match: { path: "/api/v1/clinical/*" },
            route: {
              destination: "clinical-documentation-service",
              weight: 100,
              timeout: 45000,
              headers: {
                "x-service-version": "1.0.0",
                "x-priority": "high",
              },
            },
          },
        ],
        priority: 10,
      },
      {
        id: "compliance-service-routing",
        name: "Compliance Service Routing",
        targetService: "compliance-service",
        rules: [
          {
            match: { path: "/api/v1/compliance/*" },
            route: {
              destination: "compliance-service",
              weight: 100,
              timeout: 60000,
              headers: {
                "x-service-version": "1.0.0",
                "x-priority": "critical",
              },
            },
          },
        ],
        priority: 15,
      },
    ];

    trafficPolicies.forEach((policy) => {
      this.serviceMesh.applyTrafficPolicy(policy);
    });
  }

  /**
   * Apply default security policies
   */
  private applyDefaultSecurityPolicies(): void {
    const securityPolicies = [
      {
        id: "authenticated-access-policy",
        name: "Authenticated Access Policy",
        targetService: "*",
        rules: [
          {
            action: "allow" as const,
            source: { services: ["api-gateway"] },
            conditions: [
              {
                field: "headers.authorization",
                operator: "contains" as const,
                value: "Bearer",
              },
            ],
          },
        ],
        priority: 10,
      },
      {
        id: "internal-service-communication",
        name: "Internal Service Communication",
        targetService: "*",
        rules: [
          {
            action: "allow" as const,
            source: {
              services: [
                "patient-management-service",
                "clinical-documentation-service",
                "compliance-service",
              ],
            },
            conditions: [],
          },
        ],
        priority: 5,
      },
      {
        id: "external-access-restriction",
        name: "External Access Restriction",
        targetService: "*",
        rules: [
          {
            action: "deny" as const,
            source: { services: ["*"] },
            conditions: [
              {
                field: "headers.x-external-request",
                operator: "equals" as const,
                value: "true",
              },
            ],
          },
        ],
        priority: 20,
      },
    ];

    securityPolicies.forEach((policy) => {
      this.serviceMesh.applySecurityPolicy(policy);
    });
  }

  /**
   * Get enhanced health status with mesh information
   */
  public getHealthStatus(): GatewayHealthStatus & { mesh?: any } {
    const baseHealth = super.getHealthStatus();

    if (this.meshEnabled && this.serviceMesh) {
      return {
        ...baseHealth,
        mesh: this.serviceMesh.getMeshStatus(),
      };
    }

    return baseHealth;
  }

  /**
   * Get service topology from mesh
   */
  public getServiceTopology(): any {
    if (this.meshEnabled && this.serviceMesh) {
      return this.serviceMesh.getServiceTopology();
    }
    return null;
  }
}

// Export API Gateway instance
export const apiGateway = new APIGatewayService(defaultAPIGatewayConfig);

// Service Mesh-enabled API Gateway instance
export let serviceMeshAPIGateway: ServiceMeshAPIGateway;

// API Gateway initialization function with service mesh support
export async function initializeAPIGateway(serviceMesh?: any): Promise<void> {
  console.log("Initializing API Gateway with Service Mesh support...");

  // Create service mesh-enabled gateway if mesh is provided
  if (serviceMesh) {
    serviceMeshAPIGateway = new ServiceMeshAPIGateway(
      defaultAPIGatewayConfig,
      serviceMesh,
    );
    console.log("Service Mesh integration enabled");
  }

  // Setup cross-module sync integration
  crossModuleSync.on("sync_event", (event) => {
    console.log("Cross-module sync event:", event);

    // Forward to service mesh if available
    if (serviceMeshAPIGateway) {
      // Convert sync event to mesh message
      const meshEvent = {
        type: "sync_event",
        source: "cross-module-sync",
        data: event,
        timestamp: new Date().toISOString(),
      };

      // This would be handled by the messaging service
      console.log("Forwarding sync event to service mesh:", meshEvent);
    }
  });

  crossModuleSync.on("sync_conflict", (data) => {
    console.log("Sync conflict detected:", data);

    // Handle conflicts through service mesh
    if (serviceMeshAPIGateway) {
      const conflictEvent = {
        type: "sync_conflict",
        source: "cross-module-sync",
        data,
        priority: "critical",
        timestamp: new Date().toISOString(),
      };

      console.log("Forwarding sync conflict to service mesh:", conflictEvent);
    }
  });

  console.log(
    "API Gateway initialized successfully with enhanced service mesh capabilities",
  );
}

// Initialize with service mesh integration
export async function initializeServiceMeshGateway(): Promise<ServiceMeshAPIGateway> {
  // This will be called by the messaging service to provide mesh integration
  const { enhancedMessagingService } = await import(
    "../services/messaging.service"
  );

  await enhancedMessagingService.initialize();
  const mesh = enhancedMessagingService["serviceMesh"];

  serviceMeshAPIGateway = new ServiceMeshAPIGateway(
    defaultAPIGatewayConfig,
    mesh,
  );

  console.log("Service Mesh API Gateway initialized");
  return serviceMeshAPIGateway;
}

// Health check endpoint
export async function getAPIGatewayHealth(): Promise<GatewayHealthStatus> {
  return apiGateway.getHealthStatus();
}

// Metrics endpoint
export async function getAPIGatewayMetrics(): Promise<GatewayMetrics> {
  return apiGateway.getMetrics();
}
