import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast-provider';

// Custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ToastProvider>
        {children}
      </ToastProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const mockPatientData = {
  id: 'patient-123',
  emiratesId: '784-1990-1234567-8',
  name: {
    first: 'Ahmed',
    middle: 'Ali',
    last: 'Al Mansouri'
  },
  dateOfBirth: '1990-01-15',
  gender: 'male' as const,
  nationality: 'UAE',
  contact: {
    phone: '+971501234567',
    email: 'ahmed.almansouri@email.com',
    address: {
      street: '123 Sheikh Zayed Road',
      city: 'Dubai',
      emirate: 'Dubai',
      postalCode: '12345'
    }
  },
  insurance: {
    provider: 'Daman',
    policyNumber: 'DAM123456789',
    expiryDate: '2024-12-31'
  },
  emergencyContact: {
    name: 'Fatima Al Mansouri',
    relationship: 'spouse',
    phone: '+971509876543'
  }
};

export const mockAssessmentData = {
  id: 'assessment-123',
  patientId: 'patient-123',
  assessmentType: 'initial' as const,
  assessmentDate: '2024-01-15T14:30:00Z',
  clinicianId: 'clinician-456',
  domains: {
    domain1: { score: 3, notes: 'Patient shows good cognitive function' },
    domain2: { score: 2, notes: 'Mobility limitations due to recent surgery' },
    domain3: { score: 4, notes: 'Excellent family support system' },
    domain4: { score: 3, notes: 'Stable vital signs' },
    domain5: { score: 2, notes: 'Requires assistance with ADLs' },
    domain6: { score: 3, notes: 'Good medication compliance' },
    domain7: { score: 4, notes: 'Safe home environment' },
    domain8: { score: 2, notes: 'Financial constraints noted' },
    domain9: { score: 3, notes: 'Motivated for recovery' }
  },
  overallScore: 26,
  riskLevel: 'moderate' as const,
  clinicalNotes: 'Patient requires nursing care 3x weekly with physiotherapy support',
  recommendations: [
    'Continue current medication regimen',
    'Increase mobility exercises',
    'Weekly nursing assessments'
  ]
};

export const mockClaimData = {
  id: 'claim-123',
  patientId: 'patient-123',
  claimNumber: 'CLM-2024-001',
  claimType: 'homecare' as const,
  status: 'submitted' as const,
  billingPeriod: {
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  },
  serviceLines: [
    {
      serviceCode: 'NURSE-001',
      serviceDescription: 'Skilled Nursing Care',
      dateOfService: '2024-01-15',
      quantity: 1,
      unitPrice: 150.00,
      totalAmount: 150.00,
      providerId: 'provider-001',
      providerName: 'Sarah Ahmed, RN'
    }
  ],
  totalAmount: 150.00,
  submittedAt: '2024-01-20T09:00:00Z'
};

export const mockAuthorizationData = {
  id: 'auth-123',
  patientId: 'patient-123',
  referenceNumber: 'DAM-2024-001',
  status: 'submitted' as const,
  requestType: 'initial' as const,
  serviceType: 'homecare' as const,
  requestedServices: ['nursing-care', 'physiotherapy'],
  requestedDuration: '30-days',
  clinicalJustification: 'Patient requires comprehensive home healthcare services following recent hospitalization for diabetes complications.',
  submittedAt: '2024-01-15T10:30:00Z',
  estimatedProcessingTime: '5-7 business days'
};

// Test helpers
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react');
  try {
    await waitForElementToBeRemoved(
      () => document.querySelector('[data-testid="loading"]'),
      { timeout: 5000 }
    );
  } catch {
    // Loading element might not exist, which is fine
  }
};

export const mockApiResponse = <T>(data: T, delay = 0) => {
  return new Promise<{ data: T }>((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

export const mockApiError = (message: string, status = 400, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        response: {
          status,
          data: {
            success: false,
            error: {
              code: 'API_ERROR',
              message,
              timestamp: new Date().toISOString()
            }
          }
        }
      });
    }, delay);
  });
};

// Form testing utilities
export const fillFormField = async (fieldName: string, value: string) => {
  const { screen } = await import('@testing-library/react');
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();
  
  const field = screen.getByLabelText(new RegExp(fieldName, 'i')) ||
                screen.getByPlaceholderText(new RegExp(fieldName, 'i')) ||
                screen.getByTestId(fieldName);
  
  await user.clear(field);
  await user.type(field, value);
};

export const submitForm = async (formTestId?: string) => {
  const { screen } = await import('@testing-library/react');
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();
  
  const submitButton = formTestId 
    ? screen.getByTestId(`${formTestId}-submit`)
    : screen.getByRole('button', { name: /submit|save|create/i });
  
  await user.click(submitButton);
};

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  expect.extend(toHaveNoViolations);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const startTime = performance.now();
  renderFn();
  const endTime = performance.now();
  return endTime - startTime;
};

// Mock service workers for API testing
export const setupMockServiceWorker = () => {
  // This would typically set up MSW (Mock Service Worker)
  // For now, we'll use a simple mock implementation
  const handlers = new Map();
  
  return {
    get: (path: string, handler: (req: any) => any) => {
      handlers.set(`GET:${path}`, handler);
    },
    post: (path: string, handler: (req: any) => any) => {
      handlers.set(`POST:${path}`, handler);
    },
    put: (path: string, handler: (req: any) => any) => {
      handlers.set(`PUT:${path}`, handler);
    },
    delete: (path: string, handler: (req: any) => any) => {
      handlers.set(`DELETE:${path}`, handler);
    },
    start: () => {
      // Mock implementation
    },
    stop: () => {
      // Mock implementation
    }
  };
};
