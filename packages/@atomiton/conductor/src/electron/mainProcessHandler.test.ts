/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ExecutionRequest,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";

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

// Mock the local transport
vi.mock("../transport/localTransport");

import { setupMainProcessHandler } from "./mainProcessHandler";
import { createLocalTransport } from "../transport/localTransport";

describe("Main Process Handler", () => {
  let mockEvents: any;
  let mockLocalTransport: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked modules
    const { events } = await import("@atomiton/events/desktop");

    mockEvents = events;

    // Create mock transport instance
    mockLocalTransport = {
      type: "local",
      execute: vi.fn(),
      shutdown: vi.fn(),
    };

    // Set up the mock to return our instance
    vi.mocked(createLocalTransport).mockReturnValue(mockLocalTransport);
  });

  describe("Initialization", () => {
    it("should initialize successfully in main environment", () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      const handler = setupMainProcessHandler();

      expect(handler).toHaveProperty("cleanup");
      expect(typeof handler.cleanup).toBe("function");
      expect(mockEvents.on).toHaveBeenCalledWith(
        "conductor:execute",
        expect.any(Function)
      );
    });

    it("should throw error if IPC is not available", () => {
      mockEvents.ipc.isAvailable.mockReturnValue(false);

      expect(() => setupMainProcessHandler()).toThrow(
        "Main process handler requires Electron main process context"
      );
    });

    it("should throw error if not in main environment", () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("renderer");

      expect(() => setupMainProcessHandler()).toThrow(
        "Main process handler requires Electron main process context"
      );
    });
  });

  describe("Request handling", () => {
    let executeHandler: (data: unknown) => Promise<void>;

    beforeEach(() => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      setupMainProcessHandler();

      // Extract the execute handler
      executeHandler = mockEvents.on.mock.calls.find(
        (call) => call[0] === "conductor:execute"
      )?.[1];

      expect(executeHandler).toBeDefined();
    });

    it("should execute request and emit result", async () => {
      const request: ExecutionRequest = {
        compositeId: "test-composite",
        inputs: { test: "data" },
      };

      const mockResult: ExecutionResult = {
        success: true,
        outputs: { result: "success" },
        duration: 100,
      };

      mockLocalTransport.execute.mockResolvedValue(mockResult);

      const message = {
        type: "conductor:execute",
        payload: request,
        id: "test-id-123",
      };

      await executeHandler(message);

      expect(mockLocalTransport.execute).toHaveBeenCalledWith(request);
      expect(mockEvents.emit).toHaveBeenCalledWith("conductor:result", {
        type: "conductor:result",
        payload: mockResult,
        id: "test-id-123",
      });
    });

    it("should handle execution errors and emit error", async () => {
      const request: ExecutionRequest = {
        compositeId: "test-composite",
        inputs: { test: "data" },
      };

      const error = new Error("Execution failed");
      mockLocalTransport.execute.mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const message = {
        type: "conductor:execute",
        payload: request,
        id: "test-id-123",
      };

      await executeHandler(message);

      expect(mockLocalTransport.execute).toHaveBeenCalledWith(request);
      expect(mockEvents.emit).toHaveBeenCalledWith("conductor:error", {
        id: "test-id-123",
        error: "Execution failed",
      });
      expect(consoleSpy).toHaveBeenCalledWith("[Main] Execution error:", error);

      consoleSpy.mockRestore();
    });

    it("should handle non-Error objects", async () => {
      const request: ExecutionRequest = {
        compositeId: "test-composite",
        inputs: { test: "data" },
      };

      mockLocalTransport.execute.mockRejectedValue("String error");

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const message = {
        type: "conductor:execute",
        payload: request,
        id: "test-id-123",
      };

      await executeHandler(message);

      expect(mockEvents.emit).toHaveBeenCalledWith("conductor:error", {
        id: "test-id-123",
        error: "String error",
      });

      consoleSpy.mockRestore();
    });

    it("should log execution start", async () => {
      const request: ExecutionRequest = {
        compositeId: "test-composite",
        inputs: { test: "data" },
      };

      mockLocalTransport.execute.mockResolvedValue({
        success: true,
        outputs: {},
        duration: 100,
      });

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const message = {
        type: "conductor:execute",
        payload: request,
        id: "test-id-123",
      };

      await executeHandler(message);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Main] Executing composite: test-composite"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Configuration", () => {
    it("should pass configuration to local transport", () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      const config = {
        concurrency: 8,
        storage: { type: "memory" },
        timeout: 120000,
      };

      setupMainProcessHandler(config);

      expect(createLocalTransport).toHaveBeenCalledWith(config);
    });

    it("should work without configuration", () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      setupMainProcessHandler();

      expect(createLocalTransport).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Cleanup", () => {
    it("should remove event listeners on cleanup", () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      const handler = setupMainProcessHandler();
      handler.cleanup();

      expect(mockEvents.off).toHaveBeenCalledWith(
        "conductor:execute",
        expect.any(Function)
      );
    });

    it("should shutdown transport if available", () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      const handler = setupMainProcessHandler();
      handler.cleanup();

      expect(mockLocalTransport.shutdown).toHaveBeenCalled();
    });

    it("should handle cleanup when transport has no shutdown method", () => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      // Mock transport without shutdown method
      const transportWithoutShutdown = {
        type: "local",
        execute: vi.fn(),
      };

      vi.mocked(createLocalTransport).mockReturnValue(transportWithoutShutdown);

      const handler = setupMainProcessHandler();

      expect(() => handler.cleanup()).not.toThrow();
    });
  });

  describe("Multiple concurrent executions", () => {
    let executeHandler: (data: unknown) => Promise<void>;

    beforeEach(() => {
      mockEvents.ipc.isAvailable.mockReturnValue(true);
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      setupMainProcessHandler();
      executeHandler = mockEvents.on.mock.calls.find(
        (call) => call[0] === "conductor:execute"
      )?.[1];
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

      mockLocalTransport.execute
        .mockResolvedValueOnce({
          success: true,
          outputs: { result: "result1" },
          duration: 100,
        })
        .mockResolvedValueOnce({
          success: true,
          outputs: { result: "result2" },
          duration: 50,
        });

      const message1 = {
        type: "conductor:execute",
        payload: request1,
        id: "id-1",
      };

      const message2 = {
        type: "conductor:execute",
        payload: request2,
        id: "id-2",
      };

      await Promise.all([executeHandler(message1), executeHandler(message2)]);

      expect(mockLocalTransport.execute).toHaveBeenCalledTimes(2);
      expect(mockEvents.emit).toHaveBeenCalledWith(
        "conductor:result",
        expect.objectContaining({
          id: "id-1",
        })
      );
      expect(mockEvents.emit).toHaveBeenCalledWith(
        "conductor:result",
        expect.objectContaining({
          id: "id-2",
        })
      );
    });
  });
});
