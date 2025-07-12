/**
 * Reyada Homecare Platform - Utility Index
 * Central export point for all production-ready utilities
 * Organized by category for easy access and maintenance
 */

// Core Utilities
export { cn } from './cn';
export { formatDate, parseDate, isValidDate } from './date-utils';
export { formatCurrency, parseCurrency } from './currency-utils';
export { validateEmail, validatePhone, validateEmiratesId } from './validation-utils';
export { generateId, generateUUID, generateShortId } from './id-utils';
export { debounce, throttle, delay } from './async-utils';
export { deepClone, deepMerge, isEmpty, isEqual } from './object-utils';
export { capitalize, truncate, slugify, sanitize } from './string-utils';
export { formatBytes, formatNumber, formatPercentage } from './format-utils';

// Healthcare Utilities
export { calculateAge, calculateBMI, validateMedicalId } from './healthcare-utils';
export { formatPatientName, formatMedicalRecord } from './patient-utils';
export { validateDOHCompliance, checkComplianceStatus } from './compliance-utils';
export { calculateRiskScore, assessPatientRisk } from './risk-utils';

// API Utilities
export { apiClient, createApiClient } from './api-client';
export { handleApiError, formatApiResponse } from './api-utils';
export { createQueryKey, invalidateQueries } from './query-utils';

// Storage Utilities
export { localStorage, sessionStorage, secureStorage } from './storage-utils';
export { encryptData, decryptData, hashData } from './crypto-utils';

// Form Utilities
export { createFormSchema, validateFormData } from './form-utils';
export { createDynamicForm, renderFormField } from './dynamic-form-utils';

// Constants
export { API_ENDPOINTS } from './constants/api-endpoints';
export { VALIDATION_RULES } from './constants/validation-rules';
export { DOH_STANDARDS } from './constants/doh-standards';
export { ERROR_MESSAGES } from './constants/error-messages';
export { UI_CONSTANTS } from './constants/ui-constants';

// Types
export type { ApiResponse, ApiError } from './types/api-types';
export type { Patient, ClinicalRecord } from './types/healthcare-types';
export type { FormField, FormSchema } from './types/form-types';
export type { User, Role, Permission } from './types/auth-types';
export type { ComplianceCheck, RiskAssessment } from './types/compliance-types';

// Utility Categories for organized access
export const CoreUtils = {
  cn,
  formatDate,
  parseDate,
  isValidDate,
  formatCurrency,
  parseCurrency,
  validateEmail,
  validatePhone,
  validateEmiratesId,
  generateId,
  generateUUID,
  generateShortId,
  debounce,
  throttle,
  delay,
  deepClone,
  deepMerge,
  isEmpty,
  isEqual,
  capitalize,
  truncate,
  slugify,
  sanitize,
  formatBytes,
  formatNumber,
  formatPercentage,
};

export const HealthcareUtils = {
  calculateAge,
  calculateBMI,
  validateMedicalId,
  formatPatientName,
  formatMedicalRecord,
  validateDOHCompliance,
  checkComplianceStatus,
  calculateRiskScore,
  assessPatientRisk,
};

export const ApiUtils = {
  apiClient,
  createApiClient,
  handleApiError,
  formatApiResponse,
  createQueryKey,
  invalidateQueries,
};

export const StorageUtils = {
  localStorage,
  sessionStorage,
  secureStorage,
  encryptData,
  decryptData,
  hashData,
};

export const FormUtils = {
  createFormSchema,
  validateFormData,
  createDynamicForm,
  renderFormField,
};

export const Constants = {
  API_ENDPOINTS,
  VALIDATION_RULES,
  DOH_STANDARDS,
  ERROR_MESSAGES,
  UI_CONSTANTS,
};

// Utility Registry for dynamic access
export const UtilityRegistry = {
  ...CoreUtils,
  ...HealthcareUtils,
  ...ApiUtils,
  ...StorageUtils,
  ...FormUtils,
  ...Constants,
};

// Utility Health Check
export async function checkUtilityHealth(): Promise<Record<string, boolean>> {
  const healthStatus: Record<string, boolean> = {};
  
  for (const [utilityName, utility] of Object.entries(UtilityRegistry)) {
    try {
      // Check if utility is available and functional
      if (utility !== undefined && utility !== null) {
        healthStatus[utilityName] = true;
      } else {
        healthStatus[utilityName] = false;
      }
    } catch (error) {
      healthStatus[utilityName] = false;
    }
  }
  
  return healthStatus;
}