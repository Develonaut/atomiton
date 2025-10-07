/**
 * Tests for useFlowOperations hook
 * Focuses on defensive null checks and error handling for progress events
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFlowOperations } from "#templates/DebugPage/hooks/useFlowOperations";
import type { ProgressEvent } from "@atomiton/conductor/browser";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import conductor from "#lib/conductor";

// Mock conductor
vi.mock("#lib/conductor", () => ({
  default: {
    node: {
      run: vi.fn(),
      cancel: vi.fn(),
      onProgress: vi.fn(),
      onComplete: vi.fn(),
    },
  },
  DEFAULT_SLOWMO_MS: 250,
}));

// Mock useDebugLogs
vi.mock("#templates/DebugPage/hooks/useDebugLogs", () => ({
  useDebugLogs: () => ({
    addLog: vi.fn(),
    clearLogs: vi.fn(),
  }),
}));

// Mock logger
vi.mock("@atomiton/logger/browser", () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

// Default test parameters
const DEFAULT_TEST_PARAMS = {
  slowMo: 250,
  debugOptions: {
    simulateError: false,
    errorType: "generic" as const,
    errorNode: "random" as const,
    errorDelay: 0,
    simulateLongRunning: false,
    longRunningNode: "random" as const,
    longRunningDelay: 5000,
  },
};

describe("useFlowOperations - Defensive Null Checks", () => {
  let mockOnProgress: ((data: unknown) => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnProgress = undefined;

    conductor.node.onProgress = vi.fn((callback) => {
      mockOnProgress = callback;
      return vi.fn(); // unsubscribe function
    });

    conductor.node.onComplete = vi.fn((_callback) => {
      return vi.fn(); // unsubscribe function
    });
  });

  describe("Progress Event Validation", () => {
    it("should handle undefined progressData gracefully", () => {
      const { result } = renderHook(() =>
        useFlowOperations(
          DEFAULT_TEST_PARAMS.slowMo,
          DEFAULT_TEST_PARAMS.debugOptions,
        ),
      );

      // Simulate progress event subscription
      act(() => {
        // Trigger a flow execution to set currentExecutionIdRef
        result.current.runFlow(
          createNodeDefinition({
            id: "test-flow",
            type: "group",
            name: "Test Flow",
            nodes: [],
          }),
        );
      });

      // Send undefined progress data
      expect(() => {
        act(() => {
          mockOnProgress?.(undefined);
        });
      }).not.toThrow();

      // Progress should remain at initial state
      expect(result.current.progress.graphProgress).toBe(0);
    });

    it("should handle progressData with missing nodes array", () => {
      const { result } = renderHook(() =>
        useFlowOperations(
          DEFAULT_TEST_PARAMS.slowMo,
          DEFAULT_TEST_PARAMS.debugOptions,
        ),
      );

      act(() => {
        result.current.runFlow(
          createNodeDefinition({
            id: "test-flow",
            type: "group",
            name: "Test Flow",
            nodes: [],
          }),
        );
      });

      // Send progress data without nodes array
      const invalidData = {
        nodeId: "test-node",
        progress: 50,
        message: "Testing",
        graph: {
          executionOrder: [],
          criticalPath: [],
          totalWeight: 0,
          maxParallelism: 1,
          edges: [],
        },
      };

      expect(() => {
        act(() => {
          mockOnProgress?.(invalidData);
        });
      }).not.toThrow();

      expect(result.current.progress.graphProgress).toBe(0);
    });

    it("should handle progressData with invalid nodes array (not an array)", () => {
      const { result } = renderHook(() =>
        useFlowOperations(
          DEFAULT_TEST_PARAMS.slowMo,
          DEFAULT_TEST_PARAMS.debugOptions,
        ),
      );

      act(() => {
        result.current.runFlow(
          createNodeDefinition({
            id: "test-flow",
            type: "group",
            name: "Test Flow",
            nodes: [],
          }),
        );
      });

      // Send progress data with nodes as non-array
      const invalidData = {
        nodeId: "test-node",
        nodes: "not-an-array" as unknown,
        progress: 50,
        message: "Testing",
        graph: {
          executionOrder: [],
          criticalPath: [],
          totalWeight: 0,
          maxParallelism: 1,
          edges: [],
        },
      };

      expect(() => {
        act(() => {
          mockOnProgress?.(invalidData);
        });
      }).not.toThrow();

      expect(result.current.progress.graphProgress).toBe(0);
    });

    it("should handle progressData with null nodes", () => {
      const { result } = renderHook(() =>
        useFlowOperations(
          DEFAULT_TEST_PARAMS.slowMo,
          DEFAULT_TEST_PARAMS.debugOptions,
        ),
      );

      act(() => {
        result.current.runFlow(
          createNodeDefinition({
            id: "test-flow",
            type: "group",
            name: "Test Flow",
            nodes: [],
          }),
        );
      });

      // Send progress data with null nodes
      const invalidData = {
        nodeId: "test-node",
        nodes: null as unknown,
        progress: 50,
        message: "Testing",
        graph: {
          executionOrder: [],
          criticalPath: [],
          totalWeight: 0,
          maxParallelism: 1,
          edges: [],
        },
      };

      expect(() => {
        act(() => {
          mockOnProgress?.(invalidData);
        });
      }).not.toThrow();

      expect(result.current.progress.graphProgress).toBe(0);
    });

    it("should process valid progress data correctly", () => {
      const { result } = renderHook(() =>
        useFlowOperations(
          DEFAULT_TEST_PARAMS.slowMo,
          DEFAULT_TEST_PARAMS.debugOptions,
        ),
      );

      act(() => {
        result.current.runFlow(
          createNodeDefinition({
            id: "test-flow",
            type: "group",
            name: "Test Flow",
            nodes: [],
          }),
        );
      });

      // Send valid progress data
      const validData: ProgressEvent = {
        nodeId: "test-node",
        nodes: [
          {
            id: "test-node",
            name: "Test Node",
            state: "executing",
            duration: 100,
          },
        ],
        progress: 50,
        message: "Executing: Test Node",
        graph: {
          executionOrder: [["test-node"]],
          criticalPath: ["test-node"],
          totalWeight: 1,
          maxParallelism: 1,
          edges: [],
        },
      };

      act(() => {
        mockOnProgress?.(validData);
      });

      expect(result.current.progress.graphProgress).toBe(50);
      expect(result.current.progress.currentNodeName).toBe("Test Node");
    });

    it("should preserve last known executing node name when new data has no executing node", () => {
      const { result } = renderHook(() =>
        useFlowOperations(
          DEFAULT_TEST_PARAMS.slowMo,
          DEFAULT_TEST_PARAMS.debugOptions,
        ),
      );

      act(() => {
        result.current.runFlow(
          createNodeDefinition({
            id: "test-flow",
            type: "group",
            name: "Test Flow",
            nodes: [],
          }),
        );
      });

      // First, send data with executing node
      const dataWithExecuting: ProgressEvent = {
        nodeId: "test-node-1",
        nodes: [
          {
            id: "test-node-1",
            name: "First Node",
            state: "executing",
          },
        ],
        progress: 25,
        message: "Executing: First Node",
        graph: {
          executionOrder: [["test-node-1"]],
          criticalPath: ["test-node-1"],
          totalWeight: 2,
          maxParallelism: 1,
          edges: [],
        },
      };

      act(() => {
        mockOnProgress?.(dataWithExecuting);
      });

      expect(result.current.progress.currentNodeName).toBe("First Node");

      // Then, send data without executing node
      const dataWithoutExecuting: ProgressEvent = {
        nodeId: "test-node-1",
        nodes: [
          {
            id: "test-node-1",
            name: "First Node",
            state: "completed",
          },
        ],
        progress: 50,
        message: "Completed",
        graph: {
          executionOrder: [["test-node-1"]],
          criticalPath: ["test-node-1"],
          totalWeight: 2,
          maxParallelism: 1,
          edges: [],
        },
      };

      act(() => {
        mockOnProgress?.(dataWithoutExecuting);
      });

      // Should preserve "First Node" as current node name
      expect(result.current.progress.currentNodeName).toBe("First Node");
      expect(result.current.progress.graphProgress).toBe(50);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty nodes array", () => {
      const { result } = renderHook(() =>
        useFlowOperations(
          DEFAULT_TEST_PARAMS.slowMo,
          DEFAULT_TEST_PARAMS.debugOptions,
        ),
      );

      act(() => {
        result.current.runFlow(
          createNodeDefinition({
            id: "test-flow",
            type: "group",
            name: "Test Flow",
            nodes: [],
          }),
        );
      });

      const dataWithEmptyNodes: ProgressEvent = {
        nodeId: "test-node",
        nodes: [],
        progress: 0,
        message: "Starting",
        graph: {
          executionOrder: [],
          criticalPath: [],
          totalWeight: 0,
          maxParallelism: 1,
          edges: [],
        },
      };

      expect(() => {
        act(() => {
          mockOnProgress?.(dataWithEmptyNodes);
        });
      }).not.toThrow();

      expect(result.current.progress.graphProgress).toBe(0);
      expect(result.current.progress.currentNodeName).toBeUndefined();
    });

    it("should not process progress events when no execution is active", () => {
      const { result } = renderHook(() =>
        useFlowOperations(
          DEFAULT_TEST_PARAMS.slowMo,
          DEFAULT_TEST_PARAMS.debugOptions,
        ),
      );

      // Don't start any flow execution
      const validData: ProgressEvent = {
        nodeId: "test-node",
        nodes: [
          {
            id: "test-node",
            name: "Test Node",
            state: "executing",
          },
        ],
        progress: 50,
        message: "Executing",
        graph: {
          executionOrder: [["test-node"]],
          criticalPath: ["test-node"],
          totalWeight: 1,
          maxParallelism: 1,
          edges: [],
        },
      };

      act(() => {
        mockOnProgress?.(validData);
      });

      // Progress should remain at initial state since no execution is active
      expect(result.current.progress.graphProgress).toBe(0);
    });
  });
});
