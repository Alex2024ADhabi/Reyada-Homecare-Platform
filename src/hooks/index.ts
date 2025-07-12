/**
 * Reyada Homecare Platform - Hook Index
 * Central export point for all production-ready React hooks
 * Organized by category for easy access and maintenance
 */

// Core Hooks
export { useLocalStorage } from './useLocalStorage';
export { useSessionStorage } from './useSessionStorage';
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';
export { useAsync } from './useAsync';
export { usePrevious } from './usePrevious';
export { useToggle } from './useToggle';
export { useCounter } from './useCounter';
export { useInterval } from './useInterval';
export { useTimeout } from './useTimeout';

// API Hooks
export { useApi } from './useApi';
export { useQuery } from './useQuery';
export { useMutation } from './useMutation';
export { useInfiniteQuery } from './useInfiniteQuery';

// Healthcare Hooks
export { usePatient } from './usePatient';
export { useClinicalData } from './useClinicalData';
export { useComplianceCheck } from './useComplianceCheck';
export { useRiskAssessment } from './useRiskAssessment';
export { useDOHValidation } from './useDOHValidation';

// Form Hooks
export { useForm } from './useForm';
export { useFormValidation } from './useFormValidation';
export { useDynamicForm } from './useDynamicForm';
export { useFormState } from './useFormState';

// UI Hooks
export { useModal } from './useModal';
export { useToast } from './useToast';
export { useConfirm } from './useConfirm';
export { useClipboard } from './useClipboard';
export { useKeyboard } from './useKeyboard';
export { useClickOutside } from './useClickOutside';
export { useWindowSize } from './useWindowSize';
export { useMediaQuery } from './useMediaQuery';

// Auth Hooks
export { useAuth } from './useAuth';
export { usePermissions } from './usePermissions';
export { useRole } from './useRole';

// Data Hooks
export { usePatients } from './usePatients';
export { useClinicalRecords } from './useClinicalRecords';
export { useComplianceData } from './useComplianceData';
export { useAnalytics } from './useAnalytics';
export { useReports } from './useReports';

// Hook Categories for organized access
export const CoreHooks = {
  useLocalStorage,
  useSessionStorage,
  useDebounce,
  useThrottle,
  useAsync,
  usePrevious,
  useToggle,
  useCounter,
  useInterval,
  useTimeout,
};

export const ApiHooks = {
  useApi,
  useQuery,
  useMutation,
  useInfiniteQuery,
};

export const HealthcareHooks = {
  usePatient,
  useClinicalData,
  useComplianceCheck,
  useRiskAssessment,
  useDOHValidation,
};

export const FormHooks = {
  useForm,
  useFormValidation,
  useDynamicForm,
  useFormState,
};

export const UIHooks = {
  useModal,
  useToast,
  useConfirm,
  useClipboard,
  useKeyboard,
  useClickOutside,
  useWindowSize,
  useMediaQuery,
};

export const AuthHooks = {
  useAuth,
  usePermissions,
  useRole,
};

export const DataHooks = {
  usePatients,
  useClinicalRecords,
  useComplianceData,
  useAnalytics,
  useReports,
};

// Hook Registry for dynamic access
export const HookRegistry = {
  ...CoreHooks,
  ...ApiHooks,
  ...HealthcareHooks,
  ...FormHooks,
  ...UIHooks,
  ...AuthHooks,
  ...DataHooks,
};

// Hook Health Check
export async function checkHookHealth(): Promise<Record<string, boolean>> {
  const healthStatus: Record<string, boolean> = {};
  
  for (const [hookName, hook] of Object.entries(HookRegistry)) {
    try {
      // Check if hook is a valid function
      if (hook && typeof hook === 'function') {
        healthStatus[hookName] = true;
      } else {
        healthStatus[hookName] = false;
      }
    } catch (error) {
      healthStatus[hookName] = false;
    }
  }
  
  return healthStatus;
}