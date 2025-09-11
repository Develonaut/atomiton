/**
 * Unit tests for node-effects.ts
 *
 * Tests all ReactFlow instance operations and side effects
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactFlowInstance, Node, Edge } from "@xyflow/react";
import {
  updateFlowInstance,
  focusOnNode,
  updateStoreState,
} from "../node-effects";

describe("node-effects", () => {
  describe("updateFlowInstance", () => {
    let mockInstance: ReactFlowInstance;
    let testNodes: Node[];
    let testEdges: Edge[];

    beforeEach(() => {
      mockInstance = {
        setNodes: vi.fn(),
        setEdges: vi.fn(),
      } as unknown as ReactFlowInstance;

      testNodes = [
        { id: "1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "2", type: "test", position: { x: 100, y: 0 }, data: {} },
      ];

      testEdges = [
        { id: "edge-1-2", source: "1", target: "2", type: "default" },
      ];
    });

    it("should call setNodes with provided nodes", () => {
      updateFlowInstance(mockInstance, testNodes, testEdges);

      expect(mockInstance.setNodes).toHaveBeenCalledWith(testNodes);
      expect(mockInstance.setNodes).toHaveBeenCalledTimes(1);
    });

    it("should call setEdges with provided edges", () => {
      updateFlowInstance(mockInstance, testNodes, testEdges);

      expect(mockInstance.setEdges).toHaveBeenCalledWith(testEdges);
      expect(mockInstance.setEdges).toHaveBeenCalledTimes(1);
    });

    it("should handle empty arrays", () => {
      updateFlowInstance(mockInstance, [], []);

      expect(mockInstance.setNodes).toHaveBeenCalledWith([]);
      expect(mockInstance.setEdges).toHaveBeenCalledWith([]);
    });

    it("should call both methods in correct order", () => {
      updateFlowInstance(mockInstance, testNodes, testEdges);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setNodesCalls = (mockInstance.setNodes as any).mock.calls;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setEdgesCalls = (mockInstance.setEdges as any).mock.calls;

      expect(setNodesCalls[0][0]).toBe(testNodes);
      expect(setEdgesCalls[0][0]).toBe(testEdges);
    });
  });

  describe("focusOnNode", () => {
    let mockInstance: ReactFlowInstance;

    beforeEach(() => {
      mockInstance = {
        fitView: vi.fn(),
      } as unknown as ReactFlowInstance;

      // Mock setTimeout to execute immediately in tests
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(global, "setTimeout").mockImplementation((fn: any) => {
        fn();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return 0 as any;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should call fitView with correct node and default options", () => {
      focusOnNode(mockInstance, "test-node-id");

      expect(mockInstance.fitView).toHaveBeenCalledWith({
        nodes: [{ id: "test-node-id" }],
        duration: 200,
        padding: 0.2,
      });
    });

    it("should use default delay with setTimeout", () => {
      focusOnNode(mockInstance, "test-node-id");

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 50);
    });

    it("should accept custom options", () => {
      const customOptions = {
        duration: 500,
        padding: 0.5,
        delay: 100,
      };

      focusOnNode(mockInstance, "test-node-id", customOptions);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      expect(mockInstance.fitView).toHaveBeenCalledWith({
        nodes: [{ id: "test-node-id" }],
        duration: 500,
        padding: 0.5,
      });
    });

    it("should merge partial custom options with defaults", () => {
      focusOnNode(mockInstance, "test-node-id", { duration: 300 });

      expect(mockInstance.fitView).toHaveBeenCalledWith({
        nodes: [{ id: "test-node-id" }],
        duration: 300,
        padding: 0.2, // default
      });
    });

    it("should handle different node IDs", () => {
      focusOnNode(mockInstance, "another-node");

      expect(mockInstance.fitView).toHaveBeenCalledWith({
        nodes: [{ id: "another-node" }],
        duration: 200,
        padding: 0.2,
      });
    });
  });

  describe("updateStoreState", () => {
    let mockSetState: ReturnType<typeof vi.fn>;
    let testNodes: Node[];
    let testEdges: Edge[];

    beforeEach(() => {
      mockSetState = vi.fn();

      testNodes = [
        { id: "1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "2", type: "test", position: { x: 100, y: 0 }, data: {} },
      ];

      testEdges = [
        { id: "edge-1-2", source: "1", target: "2", type: "default" },
      ];
    });

    it("should call setState with state update function", () => {
      updateStoreState(mockSetState, testNodes, testEdges, "selected-node");

      expect(mockSetState).toHaveBeenCalledTimes(1);
      expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should update selectedNodeId in state", () => {
      updateStoreState(mockSetState, testNodes, testEdges, "selected-node");

      const updateFunction = mockSetState.mock.calls[0][0];
      const mockPreviousState = {
        selectedNodeId: "old-node",
        flowSnapshot: {
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      };

      const newState = updateFunction(mockPreviousState);

      expect(newState.selectedNodeId).toBe("selected-node");
    });

    it("should update flowSnapshot with new nodes and edges", () => {
      updateStoreState(mockSetState, testNodes, testEdges, "selected-node");

      const updateFunction = mockSetState.mock.calls[0][0];
      const mockPreviousState = {
        selectedNodeId: "old-node",
        flowSnapshot: {
          nodes: [],
          edges: [],
          viewport: { x: 10, y: 20, zoom: 1.5 },
        },
      };

      const newState = updateFunction(mockPreviousState);

      expect(newState.flowSnapshot.nodes).toBe(testNodes);
      expect(newState.flowSnapshot.edges).toBe(testEdges);
    });

    it("should preserve existing viewport in flowSnapshot", () => {
      updateStoreState(mockSetState, testNodes, testEdges, "selected-node");

      const updateFunction = mockSetState.mock.calls[0][0];
      const originalViewport = { x: 10, y: 20, zoom: 1.5 };
      const mockPreviousState = {
        selectedNodeId: "old-node",
        flowSnapshot: {
          nodes: [],
          edges: [],
          viewport: originalViewport,
        },
      };

      const newState = updateFunction(mockPreviousState);

      expect(newState.flowSnapshot.viewport).toBe(originalViewport);
    });

    it("should preserve other state properties", () => {
      updateStoreState(mockSetState, testNodes, testEdges, "selected-node");

      const updateFunction = mockSetState.mock.calls[0][0];
      const mockPreviousState = {
        selectedNodeId: "old-node",
        isLoading: true,
        isDirty: false,
        someOtherProperty: "preserved",
        flowSnapshot: {
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      };

      const newState = updateFunction(mockPreviousState);

      expect(newState.isLoading).toBe(true);
      expect(newState.isDirty).toBe(false);
      expect(newState.someOtherProperty).toBe("preserved");
    });

    it("should handle empty nodes and edges arrays", () => {
      updateStoreState(mockSetState, [], [], "selected-node");

      const updateFunction = mockSetState.mock.calls[0][0];
      const mockPreviousState = {
        selectedNodeId: "old-node",
        flowSnapshot: {
          nodes: [
            { id: "1", type: "test", position: { x: 0, y: 0 }, data: {} },
          ],
          edges: [{ id: "edge-1", source: "1", target: "2", type: "default" }],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      };

      const newState = updateFunction(mockPreviousState);

      expect(newState.flowSnapshot.nodes).toEqual([]);
      expect(newState.flowSnapshot.edges).toEqual([]);
    });
  });
});
