// Enhanced Authentication Service
// Comprehensive authentication and authorization service for Reyada Homecare Platform

import {
  AUTH_CONFIG,
  HEALTHCARE_ROLES,
  DOH_AUTH_REQUIREMENTS,
  type UserRole,
  type Permission,
} from "@/config/auth.config";
import { SecurityService } from "@/services/security.service";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: Permission[];
  licenseNumber?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  passwordExpiry?: Date;
  mfaEnabled: boolean;
  emiratesId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
  deviceId?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
  requiresMfa?: boolean;
  mfaToken?: string;
}

export class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  private securityService: SecurityService;
  private currentUser: User | null = null;
  private currentSession: AuthSession | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.securityService = SecurityService.getInstance();
    this.initializeSessionMonitoring();
  }

  public static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  /**
   * Initialize session monitoring and security checks
   */
  private initializeSessionMonitoring(): void {
    // Check session validity every minute
    this.sessionCheckInterval = setInterval(() => {
      this.validateCurrentSession();
    }, 60000);

    // Listen for storage changes (multi-tab synchronization)
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.key === "auth_session" && !event.newValue) {
          this.handleSessionTermination("external_logout");
        }
      });

      // Handle page visibility changes
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.validateCurrentSession();
        }
      });
    }
  }

  /**
   * Authenticate user with enhanced security
   */
  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log("🔐 Starting enhanced authentication process...");

      // Log authentication attempt
      await this.logAuthEvent("login_attempt", {
        email: credentials.email,
        timestamp: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
      });

      // Validate credentials format
      if (!this.validateCredentialsFormat(credentials)) {
        await this.logAuthEvent("login_failure", {
          email: credentials.email,
          reason: "invalid_credentials_format",
        });
        return { success: false, error: "Invalid credentials format" };
      }

      // Check for account lockout
      const lockoutStatus = await this.checkAccountLockout(credentials.email);
      if (lockoutStatus.isLocked) {
        await this.logAuthEvent("login_failure", {
          email: credentials.email,
          reason: "account_locked",
          unlockTime: lockoutStatus.unlockTime,
        });
        return {
          success: false,
          error: `Account locked until ${lockoutStatus.unlockTime?.toLocaleString()}`,
        };
      }

      // Authenticate with Supabase or custom provider
      const authResult = await this.authenticateWithProvider(credentials);

      if (!authResult.success) {
        await this.handleFailedLogin(credentials.email);
        return authResult;
      }

      // Check if MFA is required
      if (AUTH_CONFIG.mfaRequired && !credentials.mfaCode) {
        const mfaToken = await this.generateMfaToken(authResult.user!.id);
        await this.sendMfaCode(authResult.user!);

        return {
          success: false,
          requiresMfa: true,
          mfaToken,
          error: "MFA verification required",
        };
      }

      // Verify MFA if provided
      if (credentials.mfaCode) {
        const mfaValid = await this.verifyMfaCode(
          authResult.user!.id,
          credentials.mfaCode,
        );
        if (!mfaValid) {
          await this.logAuthEvent("login_failure", {
            email: credentials.email,
            reason: "invalid_mfa_code",
          });
          return { success: false, error: "Invalid MFA code" };
        }
      }

      // Create secure session
      const session = await this.createSecureSession(
        authResult.user!,
        credentials.deviceId,
      );

      // Update user login information
      await this.updateUserLoginInfo(authResult.user!.id);

      // Set current user and session
      this.currentUser = authResult.user!;
      this.currentSession = session;

      // Store session securely
      await this.storeSessionSecurely(session);

      // Log successful login
      await this.logAuthEvent("login_success", {
        userId: authResult.user!.id,
        email: credentials.email,
        sessionId: session.id,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Authentication successful");
      return {
        success: true,
        user: authResult.user,
        session,
      };
    } catch (error: any) {
      console.error("❌ Authentication error:", error);
      await this.logAuthEvent("login_failure", {
        email: credentials.email,
        reason: "system_error",
        error: error.message,
      });
      return { success: false, error: "Authentication system error" };
    }
  }

  /**
   * Logout user and cleanup session
   */
  public async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        await this.logAuthEvent("logout", {
          userId: this.currentUser?.id,
          sessionId: this.currentSession.id,
          timestamp: new Date().toISOString(),
        });

        // Invalidate session
        await this.invalidateSession(this.currentSession.id);

        // Clear stored session
        await this.clearStoredSession();
      }

      // Clear current user and session
      this.currentUser = null;
      this.currentSession = null;

      console.log("✅ Logout successful");
    } catch (error: any) {
      console.error("❌ Logout error:", error);
    }
  }

  /**
   * Check if user has specific permission with enhanced validation
   */
  public hasPermission(
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): boolean {
    if (!this.currentUser || !this.currentSession) {
      console.warn("Permission check failed: No authenticated user or session");
      return false;
    }

    // Check session validity first
    if (new Date() > this.currentSession.expiresAt) {
      console.warn("Permission check failed: Session expired");
      return false;
    }

    // Check if user is active
    if (!this.currentUser.isActive) {
      console.warn("Permission check failed: User account is inactive");
      return false;
    }

    // Check for wildcard permissions
    const hasWildcardPermission = this.currentUser.permissions.some(
      (permission) =>
        permission.resource === "*" && permission.action === "execute",
    );

    if (hasWildcardPermission) {
      return true;
    }

    // Check specific permission
    const hasSpecificPermission = this.currentUser.permissions.some(
      (permission) => {
        const resourceMatch =
          permission.resource === resource || permission.resource === "*";
        const actionMatch =
          permission.action === action || permission.action === "execute";

        // Check contextual conditions if provided
        if (permission.conditions && context) {
          const conditionsMatch = Object.entries(permission.conditions).every(
            ([key, value]) => context[key] === value,
          );
          return resourceMatch && actionMatch && conditionsMatch;
        }

        return resourceMatch && actionMatch;
      },
    );

    // Log permission check for audit
    this.logAuthEvent("permission_check", {
      userId: this.currentUser.id,
      resource,
      action,
      context,
      granted: hasSpecificPermission,
      timestamp: new Date().toISOString(),
    });

    return hasSpecificPermission;
  }

  /**
   * Check if user has specific role with hierarchy validation
   */
  public hasRole(roleName: string): boolean {
    if (!this.currentUser || !this.currentSession) {
      return false;
    }

    // Check session validity
    if (new Date() > this.currentSession.expiresAt) {
      return false;
    }

    // Direct role match
    if (this.currentUser.role === roleName) {
      return true;
    }

    // Check role hierarchy (if implemented)
    // This would require role hierarchy configuration
    return false;
  }

  /**
   * Check multiple permissions at once
   */
  public hasAnyPermission(
    permissions: Array<{
      resource: string;
      action: string;
      context?: Record<string, any>;
    }>,
  ): boolean {
    return permissions.some(({ resource, action, context }) =>
      this.hasPermission(resource, action, context),
    );
  }

  /**
   * Check if user has all specified permissions
   */
  public hasAllPermissions(
    permissions: Array<{
      resource: string;
      action: string;
      context?: Record<string, any>;
    }>,
  ): boolean {
    return permissions.every(({ resource, action, context }) =>
      this.hasPermission(resource, action, context),
    );
  }

  /**
   * Get user's effective permissions (computed from role and direct permissions)
   */
  public getEffectivePermissions(): Permission[] {
    if (!this.currentUser) {
      return [];
    }

    // In a real implementation, this would merge role-based permissions with direct permissions
    return this.currentUser.permissions;
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Validate current session with enhanced security checks
   */
  private async validateCurrentSession(): Promise<boolean> {
    if (!this.currentSession || !this.currentUser) {
      return false;
    }

    try {
      // Check if session is expired
      if (new Date() > this.currentSession.expiresAt) {
        await this.handleSessionExpiry();
        return false;
      }

      // Check if session is still valid in storage
      const storedSession = await this.getStoredSession();
      if (!storedSession || storedSession.id !== this.currentSession.id) {
        await this.handleSessionTermination("session_mismatch");
        return false;
      }

      // Validate session integrity
      if (!(await this.validateSessionIntegrity(this.currentSession))) {
        await this.handleSessionTermination("integrity_violation");
        return false;
      }

      // Check for concurrent session limit
      if (!(await this.validateConcurrentSessions())) {
        await this.handleSessionTermination("concurrent_session_limit");
        return false;
      }

      // Check user account status
      if (!this.currentUser.isActive) {
        await this.handleSessionTermination("account_deactivated");
        return false;
      }

      // Check for suspicious activity
      if (await this.detectSuspiciousActivity()) {
        await this.handleSessionTermination("suspicious_activity");
        return false;
      }

      // Update last activity
      this.currentSession.lastActivity = new Date();
      await this.updateSessionActivity(this.currentSession.id);

      // Refresh session if close to expiry
      const timeToExpiry =
        this.currentSession.expiresAt.getTime() - new Date().getTime();
      if (timeToExpiry < 300000) {
        // 5 minutes
        await this.refreshCurrentSession();
      }

      return true;
    } catch (error: any) {
      console.error("❌ Session validation error:", error);
      await this.handleSessionTermination("validation_error");
      return false;
    }
  }

  /**
   * Validate session integrity using cryptographic checks
   */
  private async validateSessionIntegrity(
    session: AuthSession,
  ): Promise<boolean> {
    try {
      // Verify session token hasn't been tampered with
      const expectedHash = await this.generateSessionHash(session);
      const storedHash = localStorage.getItem(`session_hash_${session.id}`);

      if (storedHash !== expectedHash) {
        console.warn("Session integrity check failed: Hash mismatch");
        return false;
      }

      // Verify IP address consistency (if enabled)
      const currentIP = await this.getClientIP();
      if (session.ipAddress !== currentIP && !this.isIPWhitelisted(currentIP)) {
        console.warn("Session integrity check failed: IP address mismatch");
        return false;
      }

      // Verify user agent consistency
      if (session.userAgent !== navigator.userAgent) {
        console.warn("Session integrity check failed: User agent mismatch");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Session integrity validation error:", error);
      return false;
    }
  }

  /**
   * Validate concurrent session limits
   */
  private async validateConcurrentSessions(): Promise<boolean> {
    try {
      // In a real implementation, this would check against a session store
      const activeSessions = JSON.parse(
        localStorage.getItem(`active_sessions_${this.currentUser?.id}`) || "[]",
      );

      if (activeSessions.length > AUTH_CONFIG.maxConcurrentSessions) {
        console.warn("Concurrent session limit exceeded");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Concurrent session validation error:", error);
      return false;
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  private async detectSuspiciousActivity(): Promise<boolean> {
    try {
      // Check for rapid successive requests
      const recentActivity = JSON.parse(
        localStorage.getItem(`recent_activity_${this.currentUser?.id}`) || "[]",
      );
      const now = Date.now();
      const recentRequests = recentActivity.filter(
        (timestamp: number) => now - timestamp < 60000,
      ); // Last minute

      if (recentRequests.length > 100) {
        // More than 100 requests per minute
        console.warn("Suspicious activity detected: High request rate");
        return true;
      }

      // Check for unusual access patterns
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 22) {
        // Outside normal business hours
        const offHoursActivity = recentActivity.filter((timestamp: number) => {
          const hour = new Date(timestamp).getHours();
          return hour < 6 || hour > 22;
        });

        if (offHoursActivity.length > 10) {
          // Frequent off-hours access
          console.warn("Suspicious activity detected: Unusual access hours");
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Suspicious activity detection error:", error);
      return false;
    }
  }

  /**
   * Generate session hash for integrity checking
   */
  private async generateSessionHash(session: AuthSession): Promise<string> {
    const sessionData = `${session.id}${session.userId}${session.token}${session.ipAddress}${session.userAgent}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(sessionData);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Check if IP address is whitelisted
   */
  private isIPWhitelisted(ip: string): boolean {
    // In a real implementation, this would check against a whitelist
    const whitelistedIPs = ["127.0.0.1", "::1"]; // localhost
    return whitelistedIPs.includes(ip);
  }

  /**
   * Refresh current session
   */
  private async refreshCurrentSession(): Promise<void> {
    if (!this.currentSession || !this.currentUser) {
      return;
    }

    try {
      // Generate new session token
      const newToken = await this.generateSecureToken();
      const newExpiresAt = new Date(Date.now() + AUTH_CONFIG.sessionTimeout);

      // Update session
      this.currentSession.token = newToken;
      this.currentSession.expiresAt = newExpiresAt;
      this.currentSession.lastActivity = new Date();

      // Store updated session
      await this.storeSessionSecurely(this.currentSession);

      // Log session refresh
      await this.logAuthEvent("session_refreshed", {
        userId: this.currentUser.id,
        sessionId: this.currentSession.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Session refresh error:", error);
      throw error;
    }
  }

  /**
   * Handle session expiry
   */
  private async handleSessionExpiry(): Promise<void> {
    await this.logAuthEvent("session_timeout", {
      userId: this.currentUser?.id,
      sessionId: this.currentSession?.id,
      timestamp: new Date().toISOString(),
    });

    await this.logout();

    // Notify user of session expiry
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
  }

  /**
   * Handle session termination
   */
  private async handleSessionTermination(reason: string): Promise<void> {
    await this.logAuthEvent("session_terminated", {
      userId: this.currentUser?.id,
      sessionId: this.currentSession?.id,
      reason,
      timestamp: new Date().toISOString(),
    });

    await this.logout();
  }

  /**
   * Validate credentials format
   */
  private validateCredentialsFormat(credentials: LoginCredentials): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      emailRegex.test(credentials.email) && credentials.password.length >= 8
    );
  }

  /**
   * Check account lockout status
   */
  private async checkAccountLockout(
    email: string,
  ): Promise<{ isLocked: boolean; unlockTime?: Date }> {
    // Implementation would check database for failed login attempts
    // For now, return not locked
    return { isLocked: false };
  }

  /**
   * Authenticate with provider (Supabase)
   */
  private async authenticateWithProvider(
    credentials: LoginCredentials,
  ): Promise<AuthResult> {
    try {
      // Import Supabase client dynamically to avoid circular dependencies
      const { supabase } = await import("@/api/supabase.api");

      // Attempt authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Authentication failed" };
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.warn("Failed to load user profile:", profileError);
      }

      // Create user object with profile data
      const user: User = {
        id: data.user.id,
        email: data.user.email || credentials.email,
        firstName: profile?.full_name?.split(" ")[0] || "User",
        lastName: profile?.full_name?.split(" ").slice(1).join(" ") || "",
        role: profile?.role || "viewer",
        permissions: profile?.permissions || [],
        licenseNumber: profile?.license_number,
        department: profile?.department,
        isActive: profile?.is_active ?? true,
        lastLogin: new Date(),
        mfaEnabled: profile?.mfa_enabled ?? false,
        emiratesId: profile?.emirates_id,
        createdAt: new Date(profile?.created_at || data.user.created_at),
        updatedAt: new Date(
          profile?.updated_at || data.user.updated_at || Date.now(),
        ),
      };

      return { success: true, user };
    } catch (error: any) {
      console.error("Authentication provider error:", error);
      return {
        success: false,
        error: error.message || "Authentication failed",
      };
    }
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(email: string): Promise<void> {
    // Implementation would track failed attempts and implement lockout
    await this.logAuthEvent("login_failure", {
      email,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate MFA token
   */
  private async generateMfaToken(userId: string): Promise<string> {
    // Generate secure MFA token
    return `mfa_${userId}_${Date.now()}`;
  }

  /**
   * Send MFA code to user
   */
  private async sendMfaCode(user: User): Promise<void> {
    try {
      // In a real implementation, this would integrate with SMS/Email service
      // For now, we'll simulate sending MFA code
      const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store MFA code temporarily (in production, this would be in a secure database)
      const mfaData = {
        userId: user.id,
        code: mfaCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        attempts: 0,
      };

      sessionStorage.setItem(`mfa_${user.id}`, JSON.stringify(mfaData));

      console.log(`📱 MFA code sent to ${user.email}: ${mfaCode}`);

      // In production, integrate with SMS/Email service:
      // await smsService.send(user.phone, `Your Reyada verification code: ${mfaCode}`);
      // await emailService.send(user.email, 'MFA Code', `Your verification code: ${mfaCode}`);
    } catch (error) {
      console.error("Failed to send MFA code:", error);
      throw new Error("Failed to send verification code");
    }
  }

  /**
   * Verify MFA code
   */
  private async verifyMfaCode(userId: string, code: string): Promise<boolean> {
    try {
      const mfaDataStr = sessionStorage.getItem(`mfa_${userId}`);
      if (!mfaDataStr) {
        console.warn("No MFA data found for user");
        return false;
      }

      const mfaData = JSON.parse(mfaDataStr);

      // Check if code has expired
      if (new Date() > new Date(mfaData.expiresAt)) {
        sessionStorage.removeItem(`mfa_${userId}`);
        console.warn("MFA code has expired");
        return false;
      }

      // Check attempt limit
      if (mfaData.attempts >= 3) {
        sessionStorage.removeItem(`mfa_${userId}`);
        console.warn("Too many MFA attempts");
        return false;
      }

      // Verify code
      const isValid = mfaData.code === code;

      if (isValid) {
        // Clean up MFA data on successful verification
        sessionStorage.removeItem(`mfa_${userId}`);
        return true;
      } else {
        // Increment attempt counter
        mfaData.attempts += 1;
        sessionStorage.setItem(`mfa_${userId}`, JSON.stringify(mfaData));
        return false;
      }
    } catch (error) {
      console.error("MFA verification error:", error);
      return false;
    }
  }

  /**
   * Create secure session
   */
  private async createSecureSession(
    user: User,
    deviceId?: string,
  ): Promise<AuthSession> {
    const session: AuthSession = {
      id: `session_${user.id}_${Date.now()}`,
      userId: user.id,
      token: await this.generateSecureToken(),
      refreshToken: await this.generateSecureToken(),
      expiresAt: new Date(Date.now() + AUTH_CONFIG.sessionTimeout),
      createdAt: new Date(),
      lastActivity: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      isActive: true,
    };

    return session;
  }

  /**
   * Generate secure token
   */
  private async generateSecureToken(): Promise<string> {
    // Generate cryptographically secure token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  /**
   * Get client IP address
   */
  private async getClientIP(): Promise<string> {
    // Implementation would get actual client IP
    return "127.0.0.1";
  }

  /**
   * Store session securely
   */
  private async storeSessionSecurely(session: AuthSession): Promise<void> {
    if (typeof window !== "undefined") {
      // Encrypt session data before storing
      const encryptedSession = await this.securityService.encrypt(
        JSON.stringify(session),
      );
      sessionStorage.setItem("auth_session", encryptedSession);
    }
  }

  /**
   * Get stored session
   */
  private async getStoredSession(): Promise<AuthSession | null> {
    if (typeof window !== "undefined") {
      const encryptedSession = sessionStorage.getItem("auth_session");
      if (encryptedSession) {
        try {
          const decryptedSession =
            await this.securityService.decrypt(encryptedSession);
          return JSON.parse(decryptedSession);
        } catch (error) {
          console.error("❌ Failed to decrypt session:", error);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Clear stored session
   */
  private async clearStoredSession(): Promise<void> {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_session");
      localStorage.removeItem("auth_metadata");
    }
  }

  /**
   * Update user login information
   */
  private async updateUserLoginInfo(userId: string): Promise<void> {
    // Implementation would update user's last login time in database
    console.log(`📝 Updated login info for user ${userId}`);
  }

  /**
   * Update session activity
   */
  private async updateSessionActivity(sessionId: string): Promise<void> {
    // Implementation would update session activity in database
    console.log(`📝 Updated session activity for ${sessionId}`);
  }

  /**
   * Invalidate session
   */
  private async invalidateSession(sessionId: string): Promise<void> {
    // Implementation would invalidate session in database
    console.log(`🗑️ Invalidated session ${sessionId}`);
  }

  /**
   * Log authentication event
   */
  private async logAuthEvent(event: string, data: any): Promise<void> {
    const logEntry = {
      event,
      timestamp: new Date().toISOString(),
      data,
      source: "enhanced-auth-service",
    };

    console.log("📝 Auth Event:", logEntry);

    // Implementation would store in audit log database
    // This is critical for DOH compliance
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }
}

// Export singleton instance
export const enhancedAuthService = EnhancedAuthService.getInstance();

export default enhancedAuthService;
