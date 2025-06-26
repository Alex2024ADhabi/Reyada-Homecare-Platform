// P1-006: API Rate Limiting & Throttling Implementation
// Rate limiting service for API endpoints

import { RATE_LIMITING_CONFIG } from "@/config/auth.config";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimitingService {
  private static store = new Map<string, RateLimitEntry>();
  private static blockedIPs = new Set<string>();

  // Check if request is allowed
  static checkRateLimit(
    identifier: string,
    endpoint: string,
    userRole?: string,
  ): RateLimitResult {
    // Bypass rate limiting for admin roles
    if (userRole && RATE_LIMITING_CONFIG.bypassRoles.includes(userRole)) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
      };
    }

    // Check if IP is blocked
    if (this.blockedIPs.has(identifier)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000, // 1 hour
        retryAfter: 3600,
      };
    }

    const config =
      RATE_LIMITING_CONFIG.endpoints[endpoint] || RATE_LIMITING_CONFIG.global;
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let entry = this.store.get(key);

    // Clean up expired entries
    if (entry && entry.resetTime < now) {
      this.store.delete(key);
      entry = undefined;
    }

    if (!entry) {
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false,
      };
      this.store.set(key, entry);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;

    if (entry.count > config.maxRequests) {
      entry.blocked = true;

      // Block IP after multiple violations
      if (entry.count > config.maxRequests * 2) {
        this.blockedIPs.add(identifier);
        // Auto-unblock after 1 hour
        setTimeout(() => {
          this.blockedIPs.delete(identifier);
        }, 3600000);
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Record successful request (for endpoints that skip successful requests)
  static recordSuccess(identifier: string, endpoint: string) {
    const config = RATE_LIMITING_CONFIG.endpoints[endpoint];
    if (config?.skipSuccessfulRequests) {
      const key = `${identifier}:${endpoint}`;
      const entry = this.store.get(key);
      if (entry && entry.count > 0) {
        entry.count--;
      }
    }
  }

  // Get current rate limit status
  static getRateLimitStatus(identifier: string, endpoint: string) {
    const config =
      RATE_LIMITING_CONFIG.endpoints[endpoint] || RATE_LIMITING_CONFIG.global;
    const key = `${identifier}:${endpoint}`;
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || entry.resetTime < now) {
      return {
        count: 0,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked,
    };
  }

  // Clear rate limit for identifier (admin function)
  static clearRateLimit(identifier: string, endpoint?: string) {
    if (endpoint) {
      const key = `${identifier}:${endpoint}`;
      this.store.delete(key);
    } else {
      // Clear all entries for identifier
      for (const key of this.store.keys()) {
        if (key.startsWith(`${identifier}:`)) {
          this.store.delete(key);
        }
      }
    }

    // Remove from blocked IPs
    this.blockedIPs.delete(identifier);
  }

  // Get blocked IPs (admin function)
  static getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  // Cleanup expired entries (should be called periodically)
  static cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  // Initialize cleanup interval
  static initialize() {
    // Cleanup every 5 minutes
    setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }
}

// Middleware function for Express.js
export const rateLimitMiddleware = (endpoint: string) => {
  return (req: any, res: any, next: any) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const userRole = req.user?.role;

    const result = RateLimitingService.checkRateLimit(
      identifier,
      endpoint,
      userRole,
    );

    // Set rate limit headers
    res.set({
      "X-RateLimit-Limit":
        RATE_LIMITING_CONFIG.endpoints[endpoint]?.maxRequests ||
        RATE_LIMITING_CONFIG.global.maxRequests,
      "X-RateLimit-Remaining": result.remaining,
      "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    });

    if (!result.allowed) {
      if (result.retryAfter) {
        res.set("Retry-After", result.retryAfter.toString());
      }

      return res.status(429).json({
        error: "Too Many Requests",
        message:
          RATE_LIMITING_CONFIG.endpoints[endpoint]?.message ||
          RATE_LIMITING_CONFIG.global.message,
        retryAfter: result.retryAfter,
      });
    }

    // Record successful request on response
    res.on("finish", () => {
      if (res.statusCode < 400) {
        RateLimitingService.recordSuccess(identifier, endpoint);
      }
    });

    next();
  };
};

export default RateLimitingService;
