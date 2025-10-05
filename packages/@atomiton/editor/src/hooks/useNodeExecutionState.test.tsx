/**
 * Tests for useNodeExecutionState hook
 *
 * This hook manages execution state visualization for nodes by:
 * - Subscribing to conductor progress events
 * - Updating DOM attributes directly (no React re-renders)
 * - Setting ARIA attributes for accessibility
 * - Updating CSS variables for progress animation
 */

import { useNodeExecutionState } from "#hooks/useNodeExecutionState";
import type { NodeExecutionState } from "@atomiton/conductor/browser";
import { conductor } from "@atomiton/conductor/browser";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock conductor
vi.mock("@atomiton/conductor/browser", () => ({
  conductor: {
    node: {
      onProgress: vi.fn(),
    },
  },
}));

// Test component that uses the hook
function TestComponent({ nodeId }: { nodeId: string }) {
  const nodeRef = useNodeExecutionState(nodeId);
  return (
    <div className="react-flow__node">
      <div className="atomiton-node">
        <div ref={nodeRef} data-testid="node-content">
          Test Node
        </div>
      </div>
    </div>
  );
}

describe("useNodeExecutionState", () => {
  let unsubscribeMock: ReturnType<typeof vi.fn>;
  let progressCallback:
    | ((event: {
        nodes: Array<{
          id: string;
          state: NodeExecutionState;
          progress: number;
          message?: string;
        }>;
      }) => void)
    | null = null;

  beforeEach(() => {
    // Setup conductor mock
    unsubscribeMock = vi.fn();
    (conductor.node.onProgress as ReturnType<typeof vi.fn>).mockImplementation(
      (callback) => {
        progressCallback = callback;
        return unsubscribeMock;
      },
    );
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
    progressCallback = null;
  });

  describe("subscription lifecycle", () => {
    it("should subscribe to progress events on mount", () => {
      render(<TestComponent nodeId="test-node" />);

      expect(conductor.node.onProgress).toHaveBeenCalledTimes(1);
      expect(conductor.node.onProgress).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it("should unsubscribe on unmount", () => {
      const { unmount } = render(<TestComponent nodeId="test-node" />);

      unmount();

      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });

    it("should resubscribe when nodeId changes", () => {
      const { rerender } = render(<TestComponent nodeId="node-1" />);

      expect(conductor.node.onProgress).toHaveBeenCalledTimes(1);

      rerender(<TestComponent nodeId="node-2" />);

      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
      expect(conductor.node.onProgress).toHaveBeenCalledTimes(2);
    });
  });

  describe("DOM attribute updates", () => {
    it("should update execution state attribute when node state changes", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      // Simulate progress event with executing state
      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 50 }],
      });

      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe(
        "executing",
      );

      // Simulate completion
      progressCallback?.({
        nodes: [{ id: "test-node", state: "completed", progress: 100 }],
      });

      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe(
        "completed",
      );
    });

    it("should set correct execution state attributes for all states", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      const states: NodeExecutionState[] = [
        "pending",
        "executing",
        "completed",
        "error",
        "skipped",
      ];

      states.forEach((state) => {
        progressCallback?.({
          nodes: [{ id: "test-node", state, progress: 50 }],
        });

        expect(reactFlowNode?.getAttribute("data-execution-state")).toBe(state);
      });
    });

    it("should handle missing nodeRef gracefully", () => {
      // Create component without proper DOM structure
      function BrokenComponent({ nodeId }: { nodeId: string }) {
        useNodeExecutionState(nodeId);
        return <div>No ref attached</div>;
      }

      render(<BrokenComponent nodeId="test-node" />);

      // Should not throw when trying to update non-existent node
      expect(() => {
        progressCallback?.({
          nodes: [{ id: "test-node", state: "executing", progress: 50 }],
        });
      }).not.toThrow();
    });

    it("should handle missing React Flow wrapper gracefully", () => {
      // Component without react-flow__node class
      function NoWrapperComponent({ nodeId }: { nodeId: string }) {
        const nodeRef = useNodeExecutionState(nodeId);
        return <div ref={nodeRef}>No wrapper</div>;
      }

      render(<NoWrapperComponent nodeId="test-node" />);

      // Should not throw
      expect(() => {
        progressCallback?.({
          nodes: [{ id: "test-node", state: "executing", progress: 50 }],
        });
      }).not.toThrow();
    });
  });

  describe("CSS variable updates", () => {
    it("should update --progress CSS variable", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 50 }],
      });

      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("50");

      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 75 }],
      });

      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("75");
    });

    it("should update progress variable for progress values 0-100", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      [0, 25, 50, 75, 100].forEach((progress) => {
        progressCallback?.({
          nodes: [{ id: "test-node", state: "executing", progress }],
        });

        expect(atomitonNode?.style.getPropertyValue("--progress")).toBe(
          String(progress),
        );
      });
    });

    it("should handle missing atomiton-node element gracefully", () => {
      // Component without atomiton-node class
      function NoAtomitonNodeComponent({ nodeId }: { nodeId: string }) {
        const nodeRef = useNodeExecutionState(nodeId);
        return (
          <div className="react-flow__node">
            <div ref={nodeRef}>No atomiton node</div>
          </div>
        );
      }

      render(<NoAtomitonNodeComponent nodeId="test-node" />);

      // Should not throw even without atomiton-node
      expect(() => {
        progressCallback?.({
          nodes: [{ id: "test-node", state: "executing", progress: 50 }],
        });
      }).not.toThrow();
    });
  });

  describe("ARIA attributes", () => {
    it("should set ARIA label with progress percentage", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 50 }],
      });

      expect(reactFlowNode?.getAttribute("aria-label")).toBe(
        "Node executing: 50% complete",
      );
    });

    it("should update ARIA label when progress changes", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 25 }],
      });

      expect(reactFlowNode?.getAttribute("aria-label")).toBe(
        "Node executing: 25% complete",
      );

      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 75 }],
      });

      expect(reactFlowNode?.getAttribute("aria-label")).toBe(
        "Node executing: 75% complete",
      );
    });

    it("should set progressbar role when executing", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 50 }],
      });

      expect(reactFlowNode?.getAttribute("role")).toBe("progressbar");
      expect(reactFlowNode?.getAttribute("aria-valuenow")).toBe("50");
      expect(reactFlowNode?.getAttribute("aria-valuemin")).toBe("0");
      expect(reactFlowNode?.getAttribute("aria-valuemax")).toBe("100");
    });

    it("should remove progressbar role when not executing", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      // Set to executing first
      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 50 }],
      });

      expect(reactFlowNode?.getAttribute("role")).toBe("progressbar");

      // Change to completed
      progressCallback?.({
        nodes: [{ id: "test-node", state: "completed", progress: 100 }],
      });

      expect(reactFlowNode?.hasAttribute("role")).toBe(false);
      expect(reactFlowNode?.hasAttribute("aria-valuenow")).toBe(false);
      expect(reactFlowNode?.hasAttribute("aria-valuemin")).toBe(false);
      expect(reactFlowNode?.hasAttribute("aria-valuemax")).toBe(false);
    });

    it("should round progress percentage in ARIA label", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 33.333 }],
      });

      expect(reactFlowNode?.getAttribute("aria-label")).toBe(
        "Node executing: 33% complete",
      );

      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 66.789 }],
      });

      expect(reactFlowNode?.getAttribute("aria-label")).toBe(
        "Node executing: 67% complete",
      );
    });
  });

  describe("performance optimizations", () => {
    it("should cache DOM references to avoid repeated .closest() calls", () => {
      const closestSpy = vi.spyOn(Element.prototype, "closest");

      render(<TestComponent nodeId="test-node" />);

      // closest() should be called twice on mount to cache references
      const initialCalls = closestSpy.mock.calls.length;
      expect(initialCalls).toBeGreaterThanOrEqual(2);

      // Trigger multiple progress updates
      for (let i = 0; i < 10; i++) {
        progressCallback?.({
          nodes: [{ id: "test-node", state: "executing", progress: i * 10 }],
        });
      }

      // closest() should NOT be called again for progress updates
      expect(closestSpy).toHaveBeenCalledTimes(initialCalls);

      closestSpy.mockRestore();
    });

    it("should handle rapid state changes without errors", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      // Simulate rapid progress updates (100 updates)
      expect(() => {
        for (let i = 0; i <= 100; i++) {
          progressCallback?.({
            nodes: [{ id: "test-node", state: "executing", progress: i }],
          });
        }
      }).not.toThrow();

      // Final state should be correct
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("100");
    });

    it("should use find() for node lookup (optimized for small arrays)", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      // Simulate typical progress event with 3-50 nodes
      const manyNodes = Array.from({ length: 50 }, (_, i) => ({
        id: `node-${i}`,
        state: "executing" as NodeExecutionState,
        progress: 50,
      }));

      manyNodes.push({
        id: "test-node",
        state: "executing" as NodeExecutionState,
        progress: 75,
      });

      progressCallback?.({ nodes: manyNodes });

      // Should still find and update the correct node
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("75");
    });
  });

  describe("edge cases", () => {
    it("should ignore progress events for different nodes", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      progressCallback?.({
        nodes: [{ id: "other-node", state: "executing", progress: 50 }],
      });

      // Should not update DOM for different node
      expect(reactFlowNode?.hasAttribute("data-execution-state")).toBe(false);
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("");
    });

    it("should handle progress events with multiple nodes", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      progressCallback?.({
        nodes: [
          { id: "node-1", state: "completed", progress: 100 },
          { id: "test-node", state: "executing", progress: 50 },
          { id: "node-3", state: "pending", progress: 0 },
        ],
      });

      // Should only update for test-node
      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe(
        "executing",
      );
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("50");
    });

    it("should handle empty progress events", () => {
      render(<TestComponent nodeId="test-node" />);

      expect(() => {
        progressCallback?.({ nodes: [] });
      }).not.toThrow();
    });

    it("should handle progress event when node not found", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      // Event without our node
      expect(() => {
        progressCallback?.({
          nodes: [{ id: "other-node", state: "executing", progress: 50 }],
        });
      }).not.toThrow();

      // Should not have updated anything
      expect(reactFlowNode?.hasAttribute("data-execution-state")).toBe(false);
    });

    it("should handle error state correctly", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      progressCallback?.({
        nodes: [{ id: "test-node", state: "error", progress: 50 }],
      });

      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe("error");
      expect(reactFlowNode?.getAttribute("aria-label")).toBe(
        "Node error: 50% complete",
      );
      // Progress should be frozen at error point
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("50");
    });

    it("should handle skipped state correctly", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");

      progressCallback?.({
        nodes: [{ id: "test-node", state: "skipped", progress: 0 }],
      });

      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe(
        "skipped",
      );
      expect(reactFlowNode?.getAttribute("aria-label")).toBe(
        "Node skipped: 0% complete",
      );
    });
  });

  describe("state transitions", () => {
    it("should handle pending -> executing -> completed transition", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      // Pending
      progressCallback?.({
        nodes: [{ id: "test-node", state: "pending", progress: 0 }],
      });
      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe(
        "pending",
      );
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("0");

      // Executing
      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 50 }],
      });
      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe(
        "executing",
      );
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("50");
      expect(reactFlowNode?.getAttribute("role")).toBe("progressbar");

      // Completed
      progressCallback?.({
        nodes: [{ id: "test-node", state: "completed", progress: 100 }],
      });
      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe(
        "completed",
      );
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("100");
      expect(reactFlowNode?.hasAttribute("role")).toBe(false);
    });

    it("should handle executing -> error transition (frozen progress)", () => {
      const { container } = render(<TestComponent nodeId="test-node" />);
      const reactFlowNode = container.querySelector(".react-flow__node");
      const atomitonNode = container.querySelector(
        ".atomiton-node",
      ) as HTMLElement;

      // Start executing
      progressCallback?.({
        nodes: [{ id: "test-node", state: "executing", progress: 30 }],
      });
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("30");

      // Error occurs - progress should freeze
      progressCallback?.({
        nodes: [{ id: "test-node", state: "error", progress: 30 }],
      });
      expect(reactFlowNode?.getAttribute("data-execution-state")).toBe("error");
      expect(atomitonNode?.style.getPropertyValue("--progress")).toBe("30");
      expect(reactFlowNode?.hasAttribute("role")).toBe(false);
    });
  });
});
