import { beforeEach, describe, expect, it, vi } from "vitest";
import { editorStore } from "../index";
import type { Connection, Element } from "../types";

vi.mock("@atomiton/core", () => ({
  core: {
    store: {
      createStore: vi.fn((config) => {
        let state = { ...config.initialState };
        const subscribers: (() => void)[] = [];

        return {
          getState: () => state,
          setState: (newState: any) => {
            state = { ...state, ...newState };
          },
          subscribe: (callback: () => void) => {
            subscribers.push(callback);
            return () => {
              const index = subscribers.indexOf(callback);
              if (index > -1) subscribers.splice(index, 1);
            };
          },
          dispatch: vi.fn(),
          _triggerSubscribers: () => subscribers.forEach((fn) => fn()),
        };
      }),
      createAction: vi.fn((_store, actionFn) => {
        return (...args: any[]) => {
          const store = _store as any;
          const state = store.getState();
          actionFn(state, ...args);
          store._triggerSubscribers?.();
        };
      }),
    },
  },
}));

describe("Store Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    const initialState = {
      elements: [],
      connections: [],
      selectedElementId: null,
      isLoading: false,
      isDirty: false,
      isAnimationSettings: false,
      flowInstance: null,
      zoom: 100,
      history: {
        past: [],
        future: [],
      },
    };

    // Reset the mock store to initial state
    const mockStore = editorStore as any;
    if (mockStore.setState) {
      mockStore.setState(initialState);
    }
  });

  describe("Element Operations Flow", () => {
    it("should add element and reflect in getters", () => {
      const element: Element = {
        id: "test-node",
        type: "default",
        position: { x: 100, y: 50 },
        data: { label: "Test Node" },
      };

      // Add element
      editorStore.addElement(element);

      // Check via getters
      const elements = editorStore.getElements();
      expect(elements).toEqual([element]);
      expect(editorStore.isDirty()).toBe(true);
    });

    it("should handle add, select, update, delete flow", () => {
      const element: Element = {
        id: "workflow-node",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Original" },
      };

      // 1. Add element
      editorStore.addElement(element);
      expect(editorStore.getElements()).toHaveLength(1);

      // 2. Select element
      editorStore.selectElement("workflow-node");
      expect(editorStore.getSelectedElementId()).toBe("workflow-node");
      expect(editorStore.getSelectedElement()?.id).toBe("workflow-node");

      // 3. Update element
      editorStore.updateElement("workflow-node", {
        data: { label: "Updated" },
        position: { x: 200, y: 100 },
      });
      const updated = editorStore.getSelectedElement();
      expect(updated?.data.label).toBe("Updated");
      expect(updated?.position).toEqual({ x: 200, y: 100 });

      // 4. Delete element
      editorStore.deleteElement("workflow-node");
      expect(editorStore.getElements()).toEqual([]);
      expect(editorStore.getSelectedElementId()).toBeNull();
    });
  });

  describe("Connection Operations Flow", () => {
    it("should manage connections with elements", () => {
      const element1: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: {},
      };
      const element2: Element = {
        id: "node-2",
        type: "default",
        position: { x: 100, y: 0 },
        data: {},
      };
      const connection: Connection = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };

      // Add elements
      editorStore.addElement(element1);
      editorStore.addElement(element2);
      expect(editorStore.getElements()).toHaveLength(2);

      // Add connection
      editorStore.addConnection(connection);
      expect(editorStore.getConnections()).toEqual([connection]);

      // Delete source element - should remove connection
      editorStore.deleteElement("node-1");
      expect(editorStore.getElements()).toHaveLength(1);
      expect(editorStore.getConnections()).toEqual([]);
    });
  });

  describe("History Integration", () => {
    it("should track history through operations", () => {
      const element: Element = {
        id: "history-node",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Step 1" },
      };

      // Initial state - no undo available
      expect(editorStore.canUndo()).toBe(false);
      expect(editorStore.canRedo()).toBe(false);

      // Step 1: Add element
      editorStore.addElement(element);
      expect(editorStore.canUndo()).toBe(true);
      expect(editorStore.getElements()).toHaveLength(1);

      // Step 2: Update element
      editorStore.updateElement("history-node", { data: { label: "Step 2" } });
      const updated = editorStore
        .getElements()
        .find((e) => e.id === "history-node");
      expect(updated?.data.label).toBe("Step 2");

      // Step 3: Undo update
      editorStore.undo();
      expect(editorStore.getElements()[0]?.data.label).toBe("Step 1");
      expect(editorStore.canRedo()).toBe(true);

      // Step 4: Redo update
      editorStore.redo();
      expect(editorStore.getElements()[0]?.data.label).toBe("Step 2");

      // Step 5: Undo to beginning
      editorStore.undo();
      editorStore.undo();
      expect(editorStore.getElements()).toEqual([]);
      expect(editorStore.canUndo()).toBe(false);
    });

    it("should clear future when new operations happen after undo", () => {
      const element1: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "First" },
      };
      const element2: Element = {
        id: "node-2",
        type: "default",
        position: { x: 100, y: 0 },
        data: { label: "Second" },
      };

      // Add two elements
      editorStore.addElement(element1);
      editorStore.addElement(element2);
      expect(editorStore.getElements()).toHaveLength(2);

      // Undo once
      editorStore.undo();
      expect(editorStore.getElements()).toHaveLength(1);
      expect(editorStore.canRedo()).toBe(true);

      // Add different element - should clear redo history
      const element3: Element = {
        id: "node-3",
        type: "default",
        position: { x: 200, y: 0 },
        data: { label: "Different" },
      };
      editorStore.addElement(element3);

      expect(editorStore.canRedo()).toBe(false);
      expect(editorStore.getElements()).toHaveLength(2);
      expect(editorStore.getElements().some((e) => e.id === "node-3")).toBe(
        true,
      );
    });
  });

  describe("Compatibility Layer", () => {
    it("should work with legacy node methods", () => {
      const node: Element = {
        id: "legacy-node",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Legacy" },
      };

      // Use legacy methods
      editorStore.addNode(node);
      expect(editorStore.getNodes()).toEqual([node]);

      editorStore.selectNode("legacy-node");
      expect(editorStore.getSelectedElementId()).toBe("legacy-node");

      editorStore.updateNode("legacy-node", {
        data: { label: "Updated Legacy" },
      });
      expect(editorStore.getNodes()[0]?.data.label).toBe("Updated Legacy");

      const newNodes = [
        { id: "new-1", type: "default", position: { x: 100, y: 0 }, data: {} },
        { id: "new-2", type: "default", position: { x: 200, y: 0 }, data: {} },
      ];
      editorStore.setNodes(newNodes);
      expect(editorStore.getNodes()).toEqual(newNodes);

      editorStore.deleteNode("new-1");
      expect(editorStore.getNodes()).toHaveLength(1);
    });

    it("should work with legacy edge methods", () => {
      const edge: Connection = {
        id: "legacy-edge",
        source: "a",
        target: "b",
      };

      editorStore.addEdge(edge);
      expect(editorStore.getEdges()).toEqual([edge]);

      const newEdges = [
        { id: "edge-1", source: "x", target: "y" },
        { id: "edge-2", source: "y", target: "z" },
      ];
      editorStore.setEdges(newEdges);
      expect(editorStore.getEdges()).toEqual(newEdges);

      editorStore.deleteEdge("edge-1");
      expect(editorStore.getEdges()).toHaveLength(1);
    });
  });

  describe("State Management", () => {
    it("should maintain state integrity", () => {
      // Add element and verify state
      const element: Element = {
        id: "state-test",
        type: "default",
        position: { x: 0, y: 0 },
        data: { value: "test" },
      };

      editorStore.addElement(element);
      expect(editorStore.isDirty()).toBe(true);
      expect(editorStore.getElements()).toHaveLength(1);
    });
  });

  describe("Complex Workflows", () => {
    it("should handle complex multi-step workflow", () => {
      // Create a complex workflow with multiple elements and connections
      const elements = [
        {
          id: "start",
          type: "input",
          position: { x: 0, y: 0 },
          data: { label: "Start" },
        },
        {
          id: "process",
          type: "default",
          position: { x: 200, y: 0 },
          data: { label: "Process" },
        },
        {
          id: "decision",
          type: "decision",
          position: { x: 400, y: 0 },
          data: { label: "Decision" },
        },
        {
          id: "end-yes",
          type: "output",
          position: { x: 300, y: 200 },
          data: { label: "Yes End" },
        },
        {
          id: "end-no",
          type: "output",
          position: { x: 500, y: 200 },
          data: { label: "No End" },
        },
      ];

      const connections = [
        { id: "c1", source: "start", target: "process" },
        { id: "c2", source: "process", target: "decision" },
        { id: "c3", source: "decision", target: "end-yes" },
        { id: "c4", source: "decision", target: "end-no" },
      ];

      // Build workflow step by step
      elements.forEach((element) => {
        editorStore.addElement(element);
      });
      expect(editorStore.getElements()).toHaveLength(5);

      connections.forEach((connection) => {
        editorStore.addConnection(connection);
      });
      expect(editorStore.getConnections()).toHaveLength(4);

      // Select decision node
      editorStore.selectElement("decision");
      expect(editorStore.getSelectedElement()?.data.label).toBe("Decision");

      // Remove decision node - should clean up connections
      editorStore.deleteElement("decision");
      expect(editorStore.getElements()).toHaveLength(4);
      expect(editorStore.getConnections()).toHaveLength(1); // Only start -> process remains
      expect(editorStore.getSelectedElementId()).toBeNull();

      // Undo deletion
      editorStore.undo();
      expect(editorStore.getElements()).toHaveLength(5);
      expect(editorStore.getConnections()).toHaveLength(4);
      expect(editorStore.getSelectedElementId()).toBe("decision");
    });

    it("should maintain performance with large graphs", () => {
      const nodeCount = 100;
      const edgeCount = 150;

      // Create large graph
      const elements = Array.from({ length: nodeCount }, (_, i) => ({
        id: `node-${i}`,
        type: "default",
        position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
        data: { label: `Node ${i}`, value: i },
      }));

      const connections = Array.from({ length: edgeCount }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i % nodeCount}`,
        target: `node-${(i + 1) % nodeCount}`,
      }));

      const start = performance.now();

      // Batch operations
      editorStore.setElements(elements);
      editorStore.setConnections(connections);

      const afterSetup = performance.now();

      // Perform operations
      editorStore.selectElement("node-50");
      const selected = editorStore.getSelectedElement();
      const allElements = editorStore.getElements();
      const allConnections = editorStore.getConnections();

      const end = performance.now();

      expect(selected?.id).toBe("node-50");
      expect(allElements).toHaveLength(nodeCount);
      expect(allConnections).toHaveLength(edgeCount);

      // Performance assertions
      expect(afterSetup - start).toBeLessThan(100);
      expect(end - afterSetup).toBeLessThan(50);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid operations gracefully", () => {
      // Try to update non-existent element
      editorStore.updateElement("non-existent", { data: { label: "Updated" } });
      expect(editorStore.getElements()).toEqual([]);

      // Try to select non-existent element
      editorStore.selectElement("non-existent");
      expect(editorStore.getSelectedElement()).toBeUndefined();

      // Try to delete non-existent element
      editorStore.deleteElement("non-existent");
      expect(editorStore.getElements()).toEqual([]);

      // Undo with no history
      editorStore.undo();
      expect(editorStore.getElements()).toEqual([]);

      // Redo with no future
      editorStore.redo();
      expect(editorStore.getElements()).toEqual([]);
    });
  });
});
