import { beforeEach, describe, expect, it, vi } from "vitest";
import { editorStore } from "../index";
import { MAX_HISTORY_SIZE } from "../types";

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

describe("Performance Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store to clean state
    const initialState = {
      elements: [],
      connections: [],
      selectedElementId: null,
      isLoading: false,
      isDirty: false,
      isAnimationSettings: false,
      flowInstance: null,
      zoom: 100,
      history: { past: [], future: [] },
    };

    const mockStore = editorStore as any;
    if (mockStore.setState) {
      mockStore.setState(initialState);
    }
  });

  describe("Large Dataset Performance", () => {
    it("should handle 1000 nodes efficiently", () => {
      const nodeCount = 1000;
      const nodes = Array.from({ length: nodeCount }, (_, i) => ({
        id: `node-${i}`,
        type: "default",
        position: { x: (i % 50) * 20, y: Math.floor(i / 50) * 20 },
        data: {
          label: `Node ${i}`,
          value: i,
          metadata: { created: Date.now(), index: i },
        },
      }));

      const start = performance.now();
      editorStore.setElements(nodes);
      const setElementsTime = performance.now() - start;

      const getStart = performance.now();
      const retrievedNodes = editorStore.getElements();
      const getElementsTime = performance.now() - getStart;

      expect(retrievedNodes).toHaveLength(nodeCount);
      expect(setElementsTime).toBeLessThan(100);
      expect(getElementsTime).toBeLessThan(10);
    });

    it("should handle 1000 connections efficiently", () => {
      const connectionCount = 1000;
      const connections = Array.from({ length: connectionCount }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${(i + 1) % 500}`, // Create some cycles
      }));

      const start = performance.now();
      editorStore.setConnections(connections);
      const setConnectionsTime = performance.now() - start;

      const getStart = performance.now();
      const retrievedConnections = editorStore.getConnections();
      const getConnectionsTime = performance.now() - getStart;

      expect(retrievedConnections).toHaveLength(connectionCount);
      expect(setConnectionsTime).toBeLessThan(100);
      expect(getConnectionsTime).toBeLessThan(10);
    });

    it("should handle rapid element additions", () => {
      const elementCount = 500;

      const start = performance.now();

      for (let i = 0; i < elementCount; i++) {
        editorStore.addElement({
          id: `rapid-${i}`,
          type: "default",
          position: { x: i * 2, y: 0 },
          data: { index: i },
        });
      }

      const end = performance.now();
      const duration = end - start;

      expect(editorStore.getElements()).toHaveLength(elementCount);
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
      expect(duration / elementCount).toBeLessThan(1); // Average less than 1ms per element
    });

    it("should handle bulk element operations", () => {
      const elementCount = 1000;
      const elements = Array.from({ length: elementCount }, (_, i) => ({
        id: `bulk-${i}`,
        type: "default",
        position: { x: i % 100, y: Math.floor(i / 100) },
        data: { value: i * 2 },
      }));

      // Bulk add
      const addStart = performance.now();
      editorStore.setElements(elements);
      const addTime = performance.now() - addStart;

      // Bulk update via setElements
      const updatedElements = elements.map((el) => ({
        ...el,
        data: { ...el.data, updated: true },
      }));

      const updateStart = performance.now();
      editorStore.setElements(updatedElements);
      const updateTime = performance.now() - updateStart;

      // Bulk clear
      const clearStart = performance.now();
      editorStore.setElements([]);
      const clearTime = performance.now() - clearStart;

      expect(addTime).toBeLessThan(100);
      expect(updateTime).toBeLessThan(100);
      expect(clearTime).toBeLessThan(50);
    });
  });

  describe("History Performance", () => {
    it("should handle maximum history size efficiently", () => {
      const operationCount = MAX_HISTORY_SIZE * 2;

      const start = performance.now();

      for (let i = 0; i < operationCount; i++) {
        editorStore.addElement({
          id: `history-${i}`,
          type: "default",
          position: { x: i, y: 0 },
          data: { step: i },
        });
      }

      const end = performance.now();

      expect(editorStore.getElements()).toHaveLength(operationCount);
      expect(editorStore.canUndo()).toBe(true);

      // Should maintain performance even with history limit
      expect(end - start).toBeLessThan(1000);
    });

    it("should handle rapid undo/redo operations", () => {
      // Setup history
      for (let i = 0; i < 20; i++) {
        editorStore.addElement({
          id: `undo-test-${i}`,
          type: "default",
          position: { x: i * 10, y: 0 },
          data: { index: i },
        });
      }

      const start = performance.now();

      // Rapid undo/redo cycle
      for (let i = 0; i < 100; i++) {
        if (editorStore.canUndo()) {
          editorStore.undo();
        }
        if (editorStore.canRedo()) {
          editorStore.redo();
        }
      }

      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it("should maintain performance with deep history", () => {
      // Fill history to max
      for (let i = 0; i < MAX_HISTORY_SIZE; i++) {
        editorStore.addElement({
          id: `deep-${i}`,
          type: "default",
          position: { x: i, y: 0 },
          data: { depth: i },
        });
      }

      // Test operations with full history
      const start = performance.now();

      editorStore.addElement({
        id: "test-with-full-history",
        type: "default",
        position: { x: 0, y: 0 },
        data: {},
      });

      editorStore.updateElement("test-with-full-history", {
        data: { updated: true },
      });

      editorStore.undo();
      editorStore.redo();

      const end = performance.now();

      expect(end - start).toBeLessThan(50);
    });
  });

  describe("Search and Selection Performance", () => {
    it("should find elements quickly in large datasets", () => {
      const elementCount = 5000;
      const elements = Array.from({ length: elementCount }, (_, i) => ({
        id: `search-${i}`,
        type: "default",
        position: { x: i % 100, y: Math.floor(i / 100) },
        data: { label: `Element ${i}`, searchable: i % 2 === 0 },
      }));

      editorStore.setElements(elements);

      // Test selection performance
      const selectionTests = [
        `search-0`,
        `search-${Math.floor(elementCount / 2)}`,
        `search-${elementCount - 1}`,
      ];

      selectionTests.forEach((elementId) => {
        const start = performance.now();
        editorStore.selectElement(elementId);
        const selected = editorStore.getSelectedElement();
        const end = performance.now();

        expect(selected?.id).toBe(elementId);
        expect(end - start).toBeLessThan(5);
      });
    });

    it("should handle selection changes rapidly", () => {
      const elementCount = 1000;
      const elements = Array.from({ length: elementCount }, (_, i) => ({
        id: `select-${i}`,
        type: "default",
        position: { x: i, y: 0 },
        data: { index: i },
      }));

      editorStore.setElements(elements);

      const start = performance.now();

      // Rapidly change selections
      for (let i = 0; i < 100; i++) {
        const elementId = `select-${i % elementCount}`;
        editorStore.selectElement(elementId);
      }

      const end = performance.now();

      expect(end - start).toBeLessThan(50);
      expect(editorStore.getSelectedElementId()).toBe("select-99");
    });
  });

  describe("Memory Management", () => {
    it("should not leak memory with large operations", () => {
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

      // Perform large operations
      for (let cycle = 0; cycle < 10; cycle++) {
        const elements = Array.from({ length: 100 }, (_, i) => ({
          id: `memory-${cycle}-${i}`,
          type: "default",
          position: { x: i, y: cycle },
          data: { cycle, index: i, large: new Array(1000).fill(0) },
        }));

        editorStore.setElements(elements);

        // Force some garbage collection operations
        for (let i = 0; i < 10; i++) {
          editorStore.selectElement(`memory-${cycle}-${i}`);
          editorStore.updateElement(`memory-${cycle}-${i}`, {
            data: { updated: true },
          });
        }

        editorStore.setElements([]);
      }

      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be reasonable (less than 50MB)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });

    it("should handle object creation efficiently", () => {
      const objectCount = 10000;

      const start = performance.now();

      const elements = Array.from({ length: objectCount }, (_, i) => ({
        id: `obj-${i}`,
        type: "default",
        position: { x: i % 1000, y: Math.floor(i / 1000) },
        data: {
          label: `Object ${i}`,
          metadata: {
            created: Date.now(),
            index: i,
            config: { setting1: true, setting2: i % 5, setting3: `value-${i}` },
          },
        },
      }));

      const creationTime = performance.now() - start;

      const setStart = performance.now();
      editorStore.setElements(elements);
      const setTime = performance.now() - setStart;

      expect(creationTime).toBeLessThan(500);
      expect(setTime).toBeLessThan(200);
      expect(editorStore.getElements()).toHaveLength(objectCount);
    });
  });

  describe("Stress Tests", () => {
    it("should handle concurrent operations", () => {
      const operations = 1000;

      const start = performance.now();

      // Simulate concurrent operations
      for (let i = 0; i < operations; i++) {
        switch (i % 4) {
          case 0:
            editorStore.addElement({
              id: `stress-${i}`,
              type: "default",
              position: { x: i, y: 0 },
              data: { operation: "add" },
            });
            break;
          case 1:
            if (i > 0) {
              editorStore.updateElement(`stress-${i - 1}`, {
                data: { operation: "update", updated: true },
              });
            }
            break;
          case 2:
            editorStore.selectElement(`stress-${Math.floor(i / 2)}`);
            break;
          case 3:
            if (i % 8 === 3 && i > 4) {
              editorStore.deleteElement(`stress-${i - 4}`);
            }
            break;
        }
      }

      const end = performance.now();

      expect(end - start).toBeLessThan(1000);
      expect(editorStore.getElements().length).toBeGreaterThan(0);
    });

    it("should maintain state consistency under stress", () => {
      // Stress test with rapid operations
      for (let i = 0; i < 100; i++) {
        editorStore.addElement({
          id: `consistency-${i}`,
          type: "default",
          position: { x: i, y: 0 },
          data: { index: i },
        });
      }

      // Random operations
      for (let i = 0; i < 200; i++) {
        const elementId = `consistency-${Math.floor(Math.random() * 100)}`;
        const operation = Math.floor(Math.random() * 4);

        switch (operation) {
          case 0: // Select
            editorStore.selectElement(elementId);
            break;
          case 1: // Update
            editorStore.updateElement(elementId, {
              data: { randomUpdate: i },
            });
            break;
          case 2: // Undo
            if (editorStore.canUndo() && Math.random() > 0.7) {
              editorStore.undo();
            }
            break;
          case 3: // Redo
            if (editorStore.canRedo() && Math.random() > 0.7) {
              editorStore.redo();
            }
            break;
        }
      }

      // Verify state consistency
      const elements = editorStore.getElements();
      const selectedId = editorStore.getSelectedElementId();
      const selectedElement = editorStore.getSelectedElement();

      // If something is selected, it should exist in elements
      if (selectedId) {
        expect(elements.some((el) => el.id === selectedId)).toBe(true);
        expect(selectedElement?.id).toBe(selectedId);
      }

      // All elements should have unique IDs
      const ids = elements.map((el) => el.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle typical user workflow efficiently", () => {
      const workflowStart = performance.now();

      // Typical workflow: Create -> Connect -> Modify -> Save pattern
      const workflows = 10;

      for (let w = 0; w < workflows; w++) {
        // Create workflow nodes
        const nodes = [
          {
            id: `wf${w}-start`,
            type: "input",
            position: { x: 0, y: w * 200 },
            data: { label: "Start" },
          },
          {
            id: `wf${w}-process`,
            type: "default",
            position: { x: 200, y: w * 200 },
            data: { label: "Process" },
          },
          {
            id: `wf${w}-end`,
            type: "output",
            position: { x: 400, y: w * 200 },
            data: { label: "End" },
          },
        ];

        nodes.forEach((node) => editorStore.addElement(node));

        // Connect them
        editorStore.addConnection({
          id: `wf${w}-c1`,
          source: `wf${w}-start`,
          target: `wf${w}-process`,
        });
        editorStore.addConnection({
          id: `wf${w}-c2`,
          source: `wf${w}-process`,
          target: `wf${w}-end`,
        });

        // Select and modify
        editorStore.selectElement(`wf${w}-process`);
        editorStore.updateElement(`wf${w}-process`, {
          data: { label: `Process ${w}`, configured: true },
        });
      }

      const workflowEnd = performance.now();

      expect(editorStore.getElements()).toHaveLength(workflows * 3);
      expect(editorStore.getConnections()).toHaveLength(workflows * 2);
      expect(workflowEnd - workflowStart).toBeLessThan(200);
    });
  });
});
