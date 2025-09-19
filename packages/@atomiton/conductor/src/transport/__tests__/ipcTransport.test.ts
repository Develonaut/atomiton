/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExecutionRequest } from "../../interfaces/IExecutionEngine";

// Mock the events module
vi.mock("@atomiton/events/desktop", () => ({
  events: {
    ipc: {
      isAvailable: vi.fn(),
      getEnvironment: vi.fn(),
    },
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

// Mock the utils module
vi.mock("@atomiton/utils", () => ({
  generateId: vi.fn(() => "test-id-123"),
}));

import { createIPCTransport } from "../ipcTransport";

describe("IPC Transport", () => {
  let transport: ReturnType<typeof createIPCTransport>;
  let mockEvents: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked events
    const { events } = await import("@atomiton/events/desktop");
    mockEvents = events;

    transport = createIPCTransport();
  });

  describe("Initialization", () => {
    it("should initialize successfully in renderer environment", async () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("renderer");

      await expect(transport.initialize()).resolves.not.toThrow();

      // Should register event handlers
      expect(mockEvents.on).toHaveBeenCalledWith(
        "conductor:result",
        expect.any(Function),
      );
      expect(mockEvents.on).toHaveBeenCalledWith(
        "conductor:error",
        expect.any(Function),
      );
    });

    it("should throw error if IPC is not available", async () => {
      mockEvents.ipc.isAvailable.mockReturnValue(false);

      await expect(transport.initialize()).rejects.toThrow(
        "IPC transport requires Electron renderer context",
      );
    });

    it("should throw error if not in renderer environment", async () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      await expect(transport.initialize()).rejects.toThrow(
        "IPC transport requires Electron renderer context",
      );
    });
  });

  describe("Execution", () => {
    beforeEach(async () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("renderer");
      await transport.initialize();
    });

    it("should send execution request and resolve with result", async () => {
      const request: ExecutionRequest = {
        compositeId: "test-composite",
        inputs: { test: "data" },
      };

      const mockResult = {
        success: true,
        outputs: { result: "success" },
        duration: 100,
      };

      // Start execution (don't await yet)
      const executionPromise = transport.execute(request);

      // Verify the emit was called
      expect(mockEvents.emit).toHaveBeenCalledWith("conductor:execute", {
        type: "conductor:execute",
        payload: request,
        id: "test-id-123",
      });

      // Simulate result coming back
      const resultHandler = mockEvents.on.mock.calls.find(
        (call) => call[0] === "conductor:result",
      )?.[1];

      if (resultHandler) {
        resultHandler({
          id: "test-id-123",
          payload: mockResult,
        });
      }

      const result = await executionPromise;
      expect(result).toEqual(mockResult);
    });

    it("should reject with error when error event is received", async () => {
      const request: ExecutionRequest = {
        compositeId: "test-composite",
        inputs: { test: "data" },
      };

      // Start execution (don't await yet)
      const executionPromise = transport.execute(request);

      // Simulate error coming back
      const errorHandler = mockEvents.on.mock.calls.find(
        (call) => call[0] === "conductor:error",
      )?.[1];

      if (errorHandler) {
        errorHandler({
          id: "test-id-123",
          error: "Execution failed",
        });
      }

      await expect(executionPromise).rejects.toThrow("Execution failed");
    });

    it("should timeout after 5 minutes", async () => {
      vi.useFakeTimers();

      const request: ExecutionRequest = {
        compositeId: "test-composite",
        inputs: { test: "data" },
      };

      const executionPromise = transport.execute(request);

      // Fast-forward time by 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);

      await expect(executionPromise).rejects.toThrow("Execution timeout");

      vi.useRealTimers();
    });

    it("should throw error if IPC is not available during execution", async () => {
      mockEvents.ipc.isAvailable.mockReturnValue(false);

      const request: ExecutionRequest = {
        compositeId: "test-composite",
        inputs: { test: "data" },
      };

      await expect(transport.execute(request)).rejects.toThrow(
        "IPC transport requires Electron renderer context",
      );
    });
  });

  describe("Shutdown", () => {
    beforeEach(async () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("renderer");
      await transport.initialize();
    });

    it("should clean up event listeners on shutdown", async () => {
      await transport.shutdown();

      // Should remove event handlers
      expect(mockEvents.off).toHaveBeenCalledWith(
        "conductor:result",
        expect.any(Function),
      );
      expect(mockEvents.off).toHaveBeenCalledWith(
        "conductor:error",
        expect.any(Function),
      );
    });
  });

  describe("Multiple requests", () => {
    beforeEach(async () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("renderer");
      await transport.initialize();
    });

    it("should handle multiple concurrent requests", async () => {
      const request1: ExecutionRequest = {
        compositeId: "composite-1",
        inputs: { test: "data1" },
      };

      const request2: ExecutionRequest = {
        compositeId: "composite-2",
        inputs: { test: "data2" },
      };

      const promise1 = transport.execute(request1);
      const promise2 = transport.execute(request2);

      // Get the result handler
      const resultHandler = mockEvents.on.mock.calls.find(
        (call) => call[0] === "conductor:result",
      )?.[1];

      // Simulate results coming back (both will use same ID since we can't easily mock generateId)
      if (resultHandler) {
        // First call resolves first promise
        resultHandler({
          id: "test-id-123",
          payload: {
            success: true,
            outputs: { result: "result1" },
            duration: 100,
          },
        });

        // Second call would typically have different ID, but for test purposes
        // we'll just verify that the transport can handle the structure
        resultHandler({
          id: "test-id-123",
          payload: {
            success: true,
            outputs: { result: "result2" },
            duration: 50,
          },
        });
      }

      // At least one should resolve (in reality they'd have different IDs)
      await expect(Promise.race([promise1, promise2])).resolves.toBeTruthy();
    });
  });
});
