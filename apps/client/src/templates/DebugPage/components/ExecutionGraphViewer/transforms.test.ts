import type { NodeProgressEvent } from "@atomiton/conductor/browser";
import { describe, expect, it, vi } from "vitest";
import { transformProgressEvent } from "#templates/DebugPage/components/ExecutionGraphViewer/transforms";

describe("transformProgressEvent", () => {
  it("should transform nodes with execution state", () => {
    const event: NodeProgressEvent = {
      nodeId: "root",
      executionId: "exec-1",
      progress: 50,
      message: "Executing",
      nodes: [
        {
          id: "node-1",
          name: "Node 1",
          type: "test",
          weight: 1,
          dependencies: [],
          dependents: [],
          level: 0,
          state: "executing",
        },
      ],
      graph: {
        executionOrder: [["node-1"]],
        criticalPath: [],
        totalWeight: 1,
        maxParallelism: 1,
        edges: [],
      },
    };

    const result = transformProgressEvent(event);

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]).toMatchObject({
      id: "node-1",
      type: "default",
      data: {
        name: "Node 1",
        executionState: "executing",
        isCriticalPath: false,
        weight: 1,
      },
      "data-execution-state": "executing",
      "data-critical-path": "false",
    });
  });

  it("should identify critical path nodes", () => {
    const event: NodeProgressEvent = {
      nodeId: "root",
      executionId: "exec-1",
      progress: 50,
      message: "Executing",
      nodes: [
        {
          id: "critical-node",
          name: "Critical Node",
          type: "test",
          weight: 1,
          dependencies: [],
          dependents: [],
          level: 0,
          state: "executing",
        },
      ],
      graph: {
        executionOrder: [["critical-node"]],
        criticalPath: ["critical-node"],
        totalWeight: 1,
        maxParallelism: 1,
        edges: [],
      },
    };

    const result = transformProgressEvent(event);

    expect(result.nodes[0]).toMatchObject({
      data: {
        isCriticalPath: true,
      },
      "data-critical-path": "true",
    });
  });

  it("should handle empty nodes array", () => {
    const event: NodeProgressEvent = {
      nodeId: "root",
      executionId: "exec-1",
      progress: 0,
      message: "Starting",
      nodes: [],
      graph: {
        executionOrder: [],
        criticalPath: [],
        totalWeight: 0,
        maxParallelism: 0,
        edges: [],
      },
    };

    const result = transformProgressEvent(event);

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it("should handle missing nodes array", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const event = {
      nodeId: "root",
      executionId: "exec-1",
      progress: 0,
      message: "Starting",
      graph: {
        executionOrder: [],
        criticalPath: [],
        totalWeight: 0,
        maxParallelism: 0,
        edges: [],
      },
    } as unknown as NodeProgressEvent;

    const result = transformProgressEvent(event);

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Invalid progress event: missing nodes array",
      event,
    );

    consoleSpy.mockRestore();
  });

  it("should handle missing graph data", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const event = {
      nodeId: "root",
      executionId: "exec-1",
      progress: 0,
      message: "Starting",
      nodes: [],
    } as unknown as NodeProgressEvent;

    const result = transformProgressEvent(event);

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Invalid progress event: missing graph data",
      event,
    );

    consoleSpy.mockRestore();
  });

  it("should handle missing critical path", () => {
    const event: NodeProgressEvent = {
      nodeId: "root",
      executionId: "exec-1",
      progress: 50,
      message: "Executing",
      nodes: [
        {
          id: "node-1",
          name: "Node 1",
          type: "test",
          weight: 1,
          dependencies: [],
          dependents: [],
          level: 0,
          state: "executing",
        },
      ],
      graph: {
        executionOrder: [["node-1"]],
        criticalPath: undefined as unknown as string[],
        totalWeight: 1,
        maxParallelism: 1,
        edges: [],
      },
    };

    const result = transformProgressEvent(event);

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].data.isCriticalPath).toBe(false);
  });

  it("should transform edges correctly", () => {
    const event: NodeProgressEvent = {
      nodeId: "root",
      executionId: "exec-1",
      progress: 50,
      message: "Executing",
      nodes: [
        {
          id: "node-1",
          name: "Node 1",
          type: "test",
          weight: 1,
          dependencies: [],
          dependents: ["node-2"],
          level: 0,
          state: "completed",
        },
        {
          id: "node-2",
          name: "Node 2",
          type: "test",
          weight: 1,
          dependencies: ["node-1"],
          dependents: [],
          level: 1,
          state: "executing",
        },
      ],
      graph: {
        executionOrder: [["node-1"], ["node-2"]],
        criticalPath: ["node-1", "node-2"],
        totalWeight: 2,
        maxParallelism: 1,
        edges: [{ from: "node-1", to: "node-2" }],
      },
    };

    const result = transformProgressEvent(event);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toMatchObject({
      id: "edge-node-1-node-2-0",
      source: "node-1",
      target: "node-2",
    });
  });

  it("should apply left-to-right layout", () => {
    const event: NodeProgressEvent = {
      nodeId: "root",
      executionId: "exec-1",
      progress: 50,
      message: "Executing",
      nodes: [
        {
          id: "node-1",
          name: "Node 1",
          type: "test",
          weight: 1,
          dependencies: [],
          dependents: [],
          level: 0,
          state: "executing",
        },
      ],
      graph: {
        executionOrder: [["node-1"]],
        criticalPath: [],
        totalWeight: 1,
        maxParallelism: 1,
        edges: [],
      },
    };

    const result = transformProgressEvent(event);

    // After layout, nodes should have non-zero positions
    expect(result.nodes[0].position).toBeDefined();
    expect(typeof result.nodes[0].position.x).toBe("number");
    expect(typeof result.nodes[0].position.y).toBe("number");
  });
});
