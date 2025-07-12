import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler } from '@/services/error-handler.service';

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock fetch for error reporting
global.fetch = vi.fn();

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('logError', () => {
    it('should log error with basic information', () => {
      const error = new Error('Test error');
      const context = { userId: 'user-123', action: 'test-action' };
      
      ErrorHandler.logError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error logged:',
        expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String),
          context,
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          url: expect.any(String)
        })
      );
    });

    it('should handle non-Error objects', () => {
      const errorString = 'String error';
      
      ErrorHandler.logError(errorString);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error logged:',
        expect.objectContaining({
          message: 'String error',
          stack: 'No stack trace available'
        })
      );
    });

    it('should store error in localStorage', () => {
      const error = new Error('Test error');
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      ErrorHandler.logError(error);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'error_logs',
        expect.stringContaining('Test error')
      );
    });

    it('should limit stored errors to maximum count', () => {
      const existingErrors = Array(100).fill(null).map((_, i) => ({
        id: `error-${i}`,
        message: `Error ${i}`,
        timestamp: new Date().toISOString()
      }));
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingErrors));
      
      const newError = new Error('New error');
      ErrorHandler.logError(newError);
      
      const setItemCall = mockLocalStorage.setItem.mock.calls[0];
      const storedErrors = JSON.parse(setItemCall[1]);
      
      expect(storedErrors).toHaveLength(100); // Should maintain max limit
      expect(storedErrors[0].message).toBe('New error'); // New error should be first
    });
  });

  describe('logWarning', () => {
    it('should log warning with context', () => {
      const message = 'Test warning';
      const context = { component: 'TestComponent' };
      
      ErrorHandler.logWarning(message, context);
      
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Warning logged:',
        expect.objectContaining({
          message,
          context,
          timestamp: expect.any(String)
        })
      );
    });

    it('should store warning in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      ErrorHandler.logWarning('Test warning');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'warning_logs',
        expect.stringContaining('Test warning')
      );
    });
  });

  describe('getErrorLogs', () => {
    it('should return stored error logs', () => {
      const mockErrors = [
        { id: 'error-1', message: 'Error 1', timestamp: '2024-01-01T00:00:00Z' },
        { id: 'error-2', message: 'Error 2', timestamp: '2024-01-02T00:00:00Z' }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockErrors));
      
      const errors = ErrorHandler.getErrorLogs();
      
      expect(errors).toEqual(mockErrors);
    });

    it('should return empty array if no logs stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const errors = ErrorHandler.getErrorLogs();
      
      expect(errors).toEqual([]);
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const errors = ErrorHandler.getErrorLogs();
      
      expect(errors).toEqual([]);
    });

    it('should limit returned logs', () => {
      const mockErrors = Array(150).fill(null).map((_, i) => ({
        id: `error-${i}`,
        message: `Error ${i}`,
        timestamp: new Date().toISOString()
      }));
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockErrors));
      
      const errors = ErrorHandler.getErrorLogs(50);
      
      expect(errors).toHaveLength(50);
    });
  });

  describe('clearErrorLogs', () => {
    it('should clear error logs from localStorage', () => {
      ErrorHandler.clearErrorLogs();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('error_logs');
    });
  });

  describe('reportError', () => {
    it('should send error to remote endpoint', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response);
      
      const error = new Error('Test error');
      const context = { userId: 'user-123' };
      
      await ErrorHandler.reportError(error, context);
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/errors/report',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('Test error')
        })
      );
    });

    it('should handle network errors when reporting', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const error = new Error('Test error');
      
      // Should not throw
      await expect(ErrorHandler.reportError(error)).resolves.toBeUndefined();
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to report error:',
        expect.any(Error)
      );
    });

    it('should handle server errors when reporting', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);
      
      const error = new Error('Test error');
      
      await ErrorHandler.reportError(error);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to report error:',
        expect.stringContaining('500')
      );
    });
  });

  describe('handleGlobalError', () => {
    it('should handle window error events', () => {
      const errorEvent = new ErrorEvent('error', {
        message: 'Global error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
        error: new Error('Global error')
      });
      
      ErrorHandler.handleGlobalError(errorEvent);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Global error caught:',
        expect.objectContaining({
          message: 'Global error',
          filename: 'test.js',
          lineno: 10,
          colno: 5
        })
      );
    });

    it('should handle unhandled promise rejections', () => {
      const rejectionEvent = {
        reason: new Error('Unhandled rejection'),
        promise: Promise.reject(new Error('Unhandled rejection'))
      } as PromiseRejectionEvent;
      
      ErrorHandler.handleUnhandledRejection(rejectionEvent);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Unhandled promise rejection:',
        expect.objectContaining({
          reason: expect.any(Error),
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('createErrorBoundary', () => {
    it('should create error boundary component', () => {
      const ErrorBoundary = ErrorHandler.createErrorBoundary();
      
      expect(ErrorBoundary).toBeDefined();
      expect(typeof ErrorBoundary).toBe('function');
    });

    it('should use custom fallback component', () => {
      const CustomFallback = ({ error }: { error: Error }) => (
        <div>Custom error: {error.message}</div>
      );
      
      const ErrorBoundary = ErrorHandler.createErrorBoundary({
        fallback: CustomFallback
      });
      
      expect(ErrorBoundary).toBeDefined();
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', () => {
      const mockErrors = [
        {
          id: 'error-1',
          message: 'TypeError: Cannot read property',
          timestamp: '2024-01-01T00:00:00Z',
          context: { component: 'ComponentA' }
        },
        {
          id: 'error-2',
          message: 'ReferenceError: variable is not defined',
          timestamp: '2024-01-01T01:00:00Z',
          context: { component: 'ComponentB' }
        },
        {
          id: 'error-3',
          message: 'TypeError: Cannot read property',
          timestamp: '2024-01-01T02:00:00Z',
          context: { component: 'ComponentA' }
        }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockErrors));
      
      const stats = ErrorHandler.getErrorStats();
      
      expect(stats).toEqual({
        totalErrors: 3,
        errorsByType: {
          'TypeError': 2,
          'ReferenceError': 1
        },
        errorsByComponent: {
          'ComponentA': 2,
          'ComponentB': 1
        },
        recentErrors: expect.any(Array),
        errorRate: expect.any(Number)
      });
    });

    it('should handle empty error logs', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      const stats = ErrorHandler.getErrorStats();
      
      expect(stats).toEqual({
        totalErrors: 0,
        errorsByType: {},
        errorsByComponent: {},
        recentErrors: [],
        errorRate: 0
      });
    });
  });

  describe('isRecoverableError', () => {
    it('should identify recoverable errors', () => {
      const networkError = new Error('Network request failed');
      const timeoutError = new Error('Request timeout');
      const syntaxError = new SyntaxError('Unexpected token');
      
      expect(ErrorHandler.isRecoverableError(networkError)).toBe(true);
      expect(ErrorHandler.isRecoverableError(timeoutError)).toBe(true);
      expect(ErrorHandler.isRecoverableError(syntaxError)).toBe(false);
    });

    it('should handle custom error types', () => {
      class CustomRecoverableError extends Error {
        recoverable = true;
      }
      
      class CustomFatalError extends Error {
        recoverable = false;
      }
      
      const recoverableError = new CustomRecoverableError('Recoverable');
      const fatalError = new CustomFatalError('Fatal');
      
      expect(ErrorHandler.isRecoverableError(recoverableError)).toBe(true);
      expect(ErrorHandler.isRecoverableError(fatalError)).toBe(false);
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed operations', async () => {
      let attemptCount = 0;
      const mockOperation = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });
      
      const result = await ErrorHandler.withRetry(mockOperation, {
        maxAttempts: 3,
        delay: 10
      });
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(
        ErrorHandler.withRetry(mockOperation, { maxAttempts: 2, delay: 10 })
      ).rejects.toThrow('Persistent failure');
      
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = vi.fn().mockImplementation((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      });
      
      const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'));
      
      try {
        await ErrorHandler.withRetry(mockOperation, {
          maxAttempts: 3,
          delay: 100,
          exponentialBackoff: true
        });
      } catch {
        // Expected to fail
      }
      
      expect(delays).toEqual([100, 200]); // Exponential backoff: 100ms, 200ms
      
      global.setTimeout = originalSetTimeout;
    });
  });
});
