import "@testing-library/jest-dom";
import { vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
  });

  // Mock crypto
  Object.defineProperty(global, "crypto", {
    value: {
      getRandomValues: vi.fn().mockReturnValue(new Uint8Array(32)),
      randomUUID: vi.fn().mockReturnValue("test-uuid-123"),
    },
  });

  // Mock fetch
  global.fetch = vi.fn();

  // Mock navigator
  Object.defineProperty(navigator, "onLine", {
    writable: true,
    value: true,
  });

  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(""),
    },
  });

  // Mock performance
  Object.defineProperty(window, "performance", {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => []),
    },
  });

  // Mock URL
  global.URL.createObjectURL = vi.fn(() => "blob:test-url");
  global.URL.revokeObjectURL = vi.fn();

  // Suppress console warnings in tests
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("React Router") ||
        args[0].includes("validateDOMNesting") ||
        args[0].includes("Warning: "))
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: "test-user-123",
    email: "test@reyada.com",
    role: "clinician",
    permissions: ["read:patients", "write:clinical"],
  }),
  createMockPatient: () => ({
    id: "test-patient-123",
    emiratesId: "784-1990-1234567-8",
    name: {
      first: "Ahmed",
      middle: "Ali",
      last: "Al Mansouri",
    },
    dateOfBirth: "1990-01-15",
    gender: "male",
    nationality: "UAE",
  }),
  createMockAssessment: () => ({
    id: "test-assessment-123",
    patientId: "test-patient-123",
    assessmentType: "initial",
    assessmentDate: "2024-01-15T14:30:00Z",
    overallScore: 26,
    riskLevel: "moderate",
  }),
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Type declarations for global utilities
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeWithinRange(floor: number, ceiling: number): any;
    }
  }

  var testUtils: {
    createMockUser: () => any;
    createMockPatient: () => any;
    createMockAssessment: () => any;
    delay: (ms: number) => Promise<void>;
  };
}
