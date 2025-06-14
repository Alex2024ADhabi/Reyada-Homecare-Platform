/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

// Enhanced API Gateway Configuration with environment detection
const getApiBaseUrl = (): string => {
  // Check multiple environment variable sources
  const envUrl = 
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
    (typeof import !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) ||
    (typeof window !== 'undefined' && (window as any).env?.VITE_API_BASE_URL);
  
  if (envUrl) {
    return envUrl;
  }
  
  // Environment-specific defaults
  const isDevelopment = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    (typeof import !== 'undefined' && import.meta?.env?.DEV);
  
  if (isDevelopment) {
    console.warn('⚠️ Using development API URL. Set VITE_API_BASE_URL for production.');
    return "http://localhost:3001/api/v1";
  }
  
  return "https://api.reyadahomecare.ae/v1";
};

export const API_GATEWAY_CONFIG = {
  baseUrl: getApiBaseUrl(),
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  healthCheckInterval: 60000, // 1 minute
  circuitBreakerThreshold: 5,
};

// DOH API Configuration
export const DOH_API_CONFIG = {
  baseUrl: process.env.VITE_DOH_API_URL || "https://api.doh.gov.ae/v2",
  timeout: 60000,
  retryAttempts: 2,
  retryDelay: 2000,
};

// Malaffi EMR Configuration
export const MALAFFI_CONFIG = {
  baseUrl: process.env.VITE_MALAFFI_API_URL || "https://api.malaffi.ae/v1",
  timeout: 45000,
  retryAttempts: 3,
  retryDelay: 1500,
};

// Daman Insurance Configuration
export const DAMAN_CONFIG = {
  baseUrl: process.env.VITE_DAMAN_API_URL || "https://api.daman.ae/v1",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Service Endpoints
export const SERVICE_ENDPOINTS = {
  auth: `${API_GATEWAY_CONFIG.baseUrl}/auth`,
  patients: `${API_GATEWAY_CONFIG.baseUrl}/patients`,
  clinical: `${API_GATEWAY_CONFIG.baseUrl}/clinical`,
  compliance: `${API_GATEWAY_CONFIG.baseUrl}/compliance`,
  scheduling: `${API_GATEWAY_CONFIG.baseUrl}/scheduling`,
  reporting: `${API_GATEWAY_CONFIG.baseUrl}/reporting`,
  notifications: `${API_GATEWAY_CONFIG.baseUrl}/notifications`,
  referrals: `${API_GATEWAY_CONFIG.baseUrl}/referrals`,
  healthcheck: `${API_GATEWAY_CONFIG.baseUrl}/health`,
  daman: `${API_GATEWAY_CONFIG.baseUrl}/daman`,
  claims: `${API_GATEWAY_CONFIG.baseUrl}/claims`,
  revenue: `${API_GATEWAY_CONFIG.baseUrl}/revenue`,
  payments: `${API_GATEWAY_CONFIG.baseUrl}/payments`,
  denials: `${API_GATEWAY_CONFIG.baseUrl}/denials`,
  reconciliation: `${API_GATEWAY_CONFIG.baseUrl}/reconciliation`,
  authorizations: `${API_GATEWAY_CONFIG.baseUrl}/authorizations`,
  claimsProcessing: `${API_GATEWAY_CONFIG.baseUrl}/claims-processing`,
  clinicianLicenses: `${API_GATEWAY_CONFIG.baseUrl}/clinician-licenses`,
  revenueMetrics: `${API_GATEWAY_CONFIG.baseUrl}/revenue-metrics`,
  // External System Integration Endpoints
  malaffiEmr: `${API_GATEWAY_CONFIG.baseUrl}/malaffi-emr`,
  emiratesIdVerification: `${API_GATEWAY_CONFIG.baseUrl}/emirates-id-verification`,
  smsNotifications: `${API_GATEWAY_CONFIG.baseUrl}/sms-notifications`,
  emailNotifications: `${API_GATEWAY_CONFIG.baseUrl}/email-notifications`,
  paymentGateway: `${API_GATEWAY_CONFIG.baseUrl}/payment-gateway`,
  governmentReporting: `${API_GATEWAY_CONFIG.baseUrl}/government-reporting`,
};

// Request Headers
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Client-Version": "1.0.0",
  "X-Platform": "web",
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// Circuit Breaker Configuration
export const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 30000,
  monitoringPeriod: 10000,
};

// Cache Configuration
export const CACHE_CONFIG = {
  defaultTTL: 300000, // 5 minutes
  maxSize: 100,
  checkPeriod: 60000, // 1 minute
};

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  url: process.env.VITE_WS_URL || "wss://ws.reyadahomecare.ae",
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  uploadEndpoint: `${API_GATEWAY_CONFIG.baseUrl}/upload`,
};

// Enhanced environment-specific configurations with robust detection
const getEnvironmentInfo = () => {
  const nodeEnv = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV) ||
    (typeof import !== 'undefined' && import.meta?.env?.NODE_ENV) ||
    'development';
  
  const buildVersion = 
    (typeof process !== 'undefined' && process.env?.VITE_BUILD_VERSION) ||
    (typeof import !== 'undefined' && import.meta?.env?.VITE_BUILD_VERSION) ||
    (typeof window !== 'undefined' && (window as any).env?.VITE_BUILD_VERSION) ||
    '1.0.0';
  
  return {
    nodeEnv,
    buildVersion,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    timestamp: new Date().toISOString()
  };
};

const envInfo = getEnvironmentInfo();

export const ENV_CONFIG = {
  isDevelopment: envInfo.isDevelopment,
  isProduction: envInfo.isProduction,
  isTest: envInfo.isTest,
  nodeEnv: envInfo.nodeEnv,
  apiVersion: "v1",
  buildVersion: envInfo.buildVersion,
  buildTimestamp: envInfo.timestamp,
  platform: typeof window !== 'undefined' ? 'browser' : 'server',
};

// Security Configuration
export const SECURITY_CONFIG = {
  tokenRefreshThreshold: 300000, // 5 minutes
  sessionTimeout: 3600000, // 1 hour
  maxLoginAttempts: 5,
  lockoutDuration: 900000, // 15 minutes
};

// Monitoring and Analytics
export const MONITORING_CONFIG = {
  enableErrorTracking: true,
  enablePerformanceMonitoring: true,
  sampleRate: 0.1,
  enableUserTracking: false, // GDPR compliance
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableOfflineMode: true,
  enablePushNotifications: true,
  enableBiometricAuth: false,
  enableAdvancedAnalytics: true,
  enableExperimentalFeatures: process.env.NODE_ENV === "development",
};

export default {
  API_GATEWAY_CONFIG,
  DOH_API_CONFIG,
  MALAFFI_CONFIG,
  DAMAN_CONFIG,
  SERVICE_ENDPOINTS,
  DEFAULT_HEADERS,
  RATE_LIMIT_CONFIG,
  CIRCUIT_BREAKER_CONFIG,
  CACHE_CONFIG,
  WEBSOCKET_CONFIG,
  UPLOAD_CONFIG,
  ENV_CONFIG,
  SECURITY_CONFIG,
  MONITORING_CONFIG,
  FEATURE_FLAGS,
};
