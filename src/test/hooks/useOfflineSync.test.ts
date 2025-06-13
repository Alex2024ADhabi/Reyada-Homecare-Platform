import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

// Mock the offline service
const mockOfflineService = {
  addToQueue: vi.fn(),
  processQueue: vi.fn(),
  getPendingSyncItems: vi.fn(),
  clearQueue: vi.fn(),
  getQueueSize: vi.fn(),
  isOnline: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

vi.mock("@/services/offline.service", () => ({
  offlineService: mockOfflineService,
}));

// Mock navigator.onLine
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
});

// Mock window events
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
Object.defineProperty(window, "addEventListener", {
  value: mockAddEventListener,
});
Object.defineProperty(window, "removeEventListener", {
  value: mockRemoveEventListener,
});

describe("useOfflineSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigator.onLine = true;
    mockOfflineService.isOnline.mockReturnValue(true);
    mockOfflineService.getPendingSyncItems.mockResolvedValue({
      clinicalForms: [],
      patientAssessments: [],
      serviceInitiations: [],
    });
    mockOfflineService.getQueueSize.mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with online state", () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.pendingItems).toEqual({
      clinicalForms: 0,
      patientAssessments: 0,
      serviceInitiations: 0,
    });
  });

  it("should initialize with offline state when navigator is offline", () => {
    navigator.onLine = false;
    mockOfflineService.isOnline.mockReturnValue(false);

    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(false);
  });

  it("should set up event listeners on mount", () => {
    renderHook(() => useOfflineSync());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      "online",
      expect.any(Function),
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "offline",
      expect.any(Function),
    );
  });

  it("should clean up event listeners on unmount", () => {
    const { unmount } = renderHook(() => useOfflineSync());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "online",
      expect.any(Function),
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "offline",
      expect.any(Function),
    );
  });

  it("should handle going offline", async () => {
    const { result } = renderHook(() => useOfflineSync());

    // Simulate going offline
    navigator.onLine = false;
    mockOfflineService.isOnline.mockReturnValue(false);

    // Trigger offline event
    const offlineHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "offline",
    )?.[1];

    await act(async () => {
      offlineHandler?.();
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("should handle coming back online", async () => {
    // Start offline
    navigator.onLine = false;
    mockOfflineService.isOnline.mockReturnValue(false);

    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(false);

    // Go back online
    navigator.onLine = true;
    mockOfflineService.isOnline.mockReturnValue(true);
    mockOfflineService.processQueue.mockResolvedValue(undefined);

    // Trigger online event
    const onlineHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "online",
    )?.[1];

    await act(async () => {
      onlineHandler?.();
    });

    expect(result.current.isOnline).toBe(true);
    expect(mockOfflineService.processQueue).toHaveBeenCalled();
  });

  it("should queue data when offline", async () => {
    navigator.onLine = false;
    mockOfflineService.isOnline.mockReturnValue(false);

    const { result } = renderHook(() => useOfflineSync());

    const testData = {
      type: "clinical-form",
      data: { patientId: "patient-123", formData: {} },
    };

    await act(async () => {
      await result.current.queueForSync(testData);
    });

    expect(mockOfflineService.addToQueue).toHaveBeenCalledWith(testData);
  });

  it("should sync immediately when online", async () => {
    const mockSyncFunction = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useOfflineSync());

    const testData = {
      type: "clinical-form",
      data: { patientId: "patient-123", formData: {} },
    };

    await act(async () => {
      await result.current.queueForSync(testData, mockSyncFunction);
    });

    expect(mockSyncFunction).toHaveBeenCalledWith(testData);
    expect(mockOfflineService.addToQueue).not.toHaveBeenCalled();
  });

  it("should handle sync errors gracefully", async () => {
    const mockSyncFunction = vi
      .fn()
      .mockRejectedValue(new Error("Sync failed"));

    const { result } = renderHook(() => useOfflineSync());

    const testData = {
      type: "clinical-form",
      data: { patientId: "patient-123", formData: {} },
    };

    await act(async () => {
      await result.current.queueForSync(testData, mockSyncFunction);
    });

    // Should fall back to queuing when sync fails
    expect(mockOfflineService.addToQueue).toHaveBeenCalledWith(testData);
  });

  it("should manually sync queued items", async () => {
    mockOfflineService.processQueue.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await result.current.syncNow();
    });

    expect(result.current.isSyncing).toBe(false);
    expect(mockOfflineService.processQueue).toHaveBeenCalled();
  });

  it("should handle sync errors in manual sync", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockOfflineService.processQueue.mockRejectedValue(new Error("Sync failed"));

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await result.current.syncNow();
    });

    expect(result.current.isSyncing).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Sync failed:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it("should update pending items count", async () => {
    const mockPendingItems = {
      clinicalForms: [{ id: "1" }, { id: "2" }],
      patientAssessments: [{ id: "3" }],
      serviceInitiations: [],
    };

    mockOfflineService.getPendingSyncItems.mockResolvedValue(mockPendingItems);

    const { result } = renderHook(() => useOfflineSync());

    // Wait for initial load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.pendingItems).toEqual({
      clinicalForms: 2,
      patientAssessments: 1,
      serviceInitiations: 0,
    });
  });

  it("should handle errors when loading pending items", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockOfflineService.getPendingSyncItems.mockRejectedValue(
      new Error("Load failed"),
    );

    const { result } = renderHook(() => useOfflineSync());

    // Wait for initial load attempt
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.pendingItems).toEqual({
      clinicalForms: 0,
      patientAssessments: 0,
      serviceInitiations: 0,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to load pending sync items:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it("should clear all queued items", async () => {
    mockOfflineService.clearQueue.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await result.current.clearQueue();
    });

    expect(mockOfflineService.clearQueue).toHaveBeenCalled();
  });

  it("should handle errors when clearing queue", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockOfflineService.clearQueue.mockRejectedValue(new Error("Clear failed"));

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await result.current.clearQueue();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to clear sync queue:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it("should periodically update pending items", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useOfflineSync());

    // Clear initial calls
    mockOfflineService.getPendingSyncItems.mockClear();

    // Fast-forward time to trigger periodic update
    act(() => {
      vi.advanceTimersByTime(30000); // 30 seconds
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockOfflineService.getPendingSyncItems).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("should not sync when already syncing", async () => {
    mockOfflineService.processQueue.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    const { result } = renderHook(() => useOfflineSync());

    // Start first sync
    act(() => {
      result.current.syncNow();
    });

    expect(result.current.isSyncing).toBe(true);

    // Try to start second sync
    await act(async () => {
      await result.current.syncNow();
    });

    // Should only call processQueue once
    expect(mockOfflineService.processQueue).toHaveBeenCalledTimes(1);
  });

  it("should provide connection status", () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.getConnectionStatus()).toBe(true);

    // Change to offline
    navigator.onLine = false;
    mockOfflineService.isOnline.mockReturnValue(false);

    // Trigger offline event
    const offlineHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "offline",
    )?.[1];

    act(() => {
      offlineHandler?.();
    });

    expect(result.current.getConnectionStatus()).toBe(false);
  });

  it("should handle rapid online/offline changes", async () => {
    const { result } = renderHook(() => useOfflineSync());

    const onlineHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "online",
    )?.[1];
    const offlineHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "offline",
    )?.[1];

    // Rapid changes
    await act(async () => {
      navigator.onLine = false;
      mockOfflineService.isOnline.mockReturnValue(false);
      offlineHandler?.();

      navigator.onLine = true;
      mockOfflineService.isOnline.mockReturnValue(true);
      onlineHandler?.();

      navigator.onLine = false;
      mockOfflineService.isOnline.mockReturnValue(false);
      offlineHandler?.();
    });

    expect(result.current.isOnline).toBe(false);
  });
});
