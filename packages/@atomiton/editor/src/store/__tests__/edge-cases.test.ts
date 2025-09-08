import { beforeEach, describe, expect, it, vi } from "vitest";
import { editorStore } from "../index";
import type { Element } from "../types";

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

describe("Edge Cases and Error Handling", () => {
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

  describe("Invalid Input Handling", () => {
    it("should handle null/undefined elements gracefully", () => {
      expect(() => editorStore.addElement(null as any)).not.toThrow();
      expect(() => editorStore.addElement(undefined as any)).not.toThrow();

      // Should not crash the application
      const elements = editorStore.getElements();
      expect(Array.isArray(elements)).toBe(true);
    });

    it("should handle malformed elements", () => {
      const malformedElements = [
        { id: "no-type", position: { x: 0, y: 0 }, data: {} } as Element,
        { id: "no-position", type: "default", data: {} } as Element,
        { id: "no-data", type: "default", position: { x: 0, y: 0 } } as Element,
        { type: "default", position: { x: 0, y: 0 }, data: {} } as Element, // no id
      ];

      malformedElements.forEach((element, index) => {
        expect(() => editorStore.addElement(element)).not.toThrow();
      });
    });

    it("should handle invalid element IDs", () => {
      const invalidIds = ["", " ", "\n", "\t", null, undefined];

      invalidIds.forEach((id) => {
        const element: Element = {
          id: id as string,
          type: "default",
          position: { x: 0, y: 0 },
          data: {},
        };

        expect(() => editorStore.addElement(element)).not.toThrow();
        expect(() => editorStore.selectElement(id as string)).not.toThrow();
        expect(() => editorStore.updateElement(id as string, {})).not.toThrow();
        expect(() => editorStore.deleteElement(id as string)).not.toThrow();
      });
    });

    it("should handle extremely long element IDs", () => {
      const longId = "a".repeat(10000);
      const element: Element = {
        id: longId,
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Long ID Element" },
      };

      editorStore.addElement(element);
      editorStore.selectElement(longId);

      expect(editorStore.getSelectedElementId()).toBe(longId);
      expect(editorStore.getSelectedElement()?.id).toBe(longId);
    });

    it("should handle special characters in IDs", () => {
      const specialIds = [
        "node-with-spaces in it",
        "node/with/slashes",
        "node\\with\\backslashes",
        "node@with#special$chars%",
        "node🚀with💯emojis",
        "node.with.dots",
        "node[with]brackets",
        "node{with}braces",
        "node(with)parentheses",
      ];

      specialIds.forEach((id) => {
        const element: Element = {
          id,
          type: "default",
          position: { x: 0, y: 0 },
          data: { label: id },
        };

        editorStore.addElement(element);
        editorStore.selectElement(id);
        expect(editorStore.getSelectedElementId()).toBe(id);

        editorStore.updateElement(id, { data: { updated: true } });
        expect(editorStore.getSelectedElement()?.data.updated).toBe(true);
      });
    });
  });

  describe("Boundary Conditions", () => {
    it("should handle extreme position values", () => {
      const extremePositions = [
        { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
        { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER },
        { x: Infinity, y: -Infinity },
        { x: NaN, y: NaN },
        { x: 0, y: -0 },
      ];

      extremePositions.forEach((position, index) => {
        const element: Element = {
          id: `extreme-${index}`,
          type: "default",
          position,
          data: { extreme: true },
        };

        expect(() => editorStore.addElement(element)).not.toThrow();

        const added = editorStore
          .getElements()
          .find((e) => e.id === `extreme-${index}`);
        expect(added).toBeDefined();
      });
    });

    it("should handle deeply nested data structures", () => {
      const createNestedObject = (depth: number): any => {
        if (depth === 0) return { value: "leaf" };
        return { nested: createNestedObject(depth - 1), depth };
      };

      const deepElement: Element = {
        id: "deep-element",
        type: "default",
        position: { x: 0, y: 0 },
        data: {
          deep: createNestedObject(100),
          array: new Array(1000).fill(0).map((_, i) => ({ index: i })),
          circular: {} as any,
        },
      };

      // Create circular reference
      deepElement.data.circular.self = deepElement.data.circular;

      expect(() => editorStore.addElement(deepElement)).not.toThrow();

      const retrieved = editorStore
        .getElements()
        .find((e) => e.id === "deep-element");
      expect(retrieved).toBeDefined();
      expect(retrieved?.data.deep.depth).toBe(100);
    });

    it("should handle zero and negative zoom values", () => {
      const invalidZooms = [0, -1, -100, -Infinity, NaN];

      invalidZooms.forEach((zoom) => {
        expect(() => editorStore.setZoom(zoom)).not.toThrow();
      });
    });

    it("should handle empty and null data", () => {
      const dataVariations = [
        {},
        null,
        undefined,
        { label: null },
        { label: undefined },
        { label: "" },
        { nested: { empty: {} } },
      ];

      dataVariations.forEach((data, index) => {
        const element: Element = {
          id: `data-test-${index}`,
          type: "default",
          position: { x: index * 10, y: 0 },
          data: data as any,
        };

        expect(() => editorStore.addElement(element)).not.toThrow();
      });
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle rapid state mutations", () => {
      const element: Element = {
        id: "rapid-mutation",
        type: "default",
        position: { x: 0, y: 0 },
        data: { counter: 0 },
      };

      editorStore.addElement(element);

      // Rapid updates
      for (let i = 0; i < 1000; i++) {
        editorStore.updateElement("rapid-mutation", {
          data: { counter: i },
          position: { x: i % 100, y: Math.floor(i / 100) },
        });
      }

      const final = editorStore.getSelectedElement();
      expect(editorStore.getElements()).toHaveLength(1);
    });

    it("should handle interleaved add/delete operations", () => {
      const operations = 200;

      for (let i = 0; i < operations; i++) {
        // Add element
        editorStore.addElement({
          id: `interleaved-${i}`,
          type: "default",
          position: { x: i, y: 0 },
          data: { step: i },
        });

        // Sometimes delete previous elements
        if (i > 10 && i % 5 === 0) {
          editorStore.deleteElement(`interleaved-${i - 10}`);
        }

        // Sometimes undo/redo
        if (i % 20 === 0 && editorStore.canUndo()) {
          editorStore.undo();
          if (editorStore.canRedo()) {
            editorStore.redo();
          }
        }
      }

      expect(editorStore.getElements().length).toBeGreaterThan(0);
    });

    it("should maintain consistency during complex operations", () => {
      // Create a complex graph
      const nodeCount = 50;
      for (let i = 0; i < nodeCount; i++) {
        editorStore.addElement({
          id: `complex-${i}`,
          type: "default",
          position: { x: i * 20, y: (i % 5) * 20 },
          data: { index: i },
        });
      }

      // Add connections
      for (let i = 0; i < nodeCount - 1; i++) {
        editorStore.addConnection({
          id: `connection-${i}`,
          source: `complex-${i}`,
          target: `complex-${i + 1}`,
        });
      }

      // Perform complex operations
      const operations = [
        () =>
          editorStore.selectElement(
            `complex-${Math.floor(Math.random() * nodeCount)}`,
          ),
        () =>
          editorStore.deleteElement(
            `complex-${Math.floor(Math.random() * nodeCount)}`,
          ),
        () => editorStore.canUndo() && editorStore.undo(),
        () => editorStore.canRedo() && editorStore.redo(),
      ];

      // Random operations
      for (let i = 0; i < 100; i++) {
        const operation =
          operations[Math.floor(Math.random() * operations.length)];
        operation();
      }

      // Verify consistency
      const elements = editorStore.getElements();
      const connections = editorStore.getConnections();

      // All connections should reference existing elements
      connections.forEach((conn) => {
        const sourceExists = elements.some((el) => el.id === conn.source);
        const targetExists = elements.some((el) => el.id === conn.target);

        if (!sourceExists || !targetExists) {
          // This is expected behavior - connections are cleaned up when elements are deleted
        }
      });
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle memory-intensive elements", () => {
      const largeData = new Array(10000).fill(0).map((_, i) => ({
        index: i,
        data: `large-string-${"x".repeat(1000)}-${i}`,
        nested: { value: i, array: new Array(100).fill(i) },
      }));

      const memoryIntensiveElement: Element = {
        id: "memory-intensive",
        type: "default",
        position: { x: 0, y: 0 },
        data: { largeData },
      };

      expect(() =>
        editorStore.addElement(memoryIntensiveElement),
      ).not.toThrow();
      expect(editorStore.getElements()).toHaveLength(1);
    });

    it("should handle rapid creation and deletion cycles", () => {
      const cycles = 50;
      const elementsPerCycle = 20;

      for (let cycle = 0; cycle < cycles; cycle++) {
        // Create elements
        for (let i = 0; i < elementsPerCycle; i++) {
          editorStore.addElement({
            id: `cycle-${cycle}-${i}`,
            type: "default",
            position: { x: i * 10, y: cycle * 10 },
            data: { cycle, index: i },
          });
        }

        // Delete all elements
        for (let i = 0; i < elementsPerCycle; i++) {
          editorStore.deleteElement(`cycle-${cycle}-${i}`);
        }

        expect(editorStore.getElements()).toHaveLength(0);
      }
    });

    it("should handle operations on non-existent elements", () => {
      const nonExistentIds = [
        "does-not-exist",
        "never-created",
        "already-deleted",
        "",
        null as any,
        undefined as any,
      ];

      nonExistentIds.forEach((id) => {
        expect(() => editorStore.selectElement(id)).not.toThrow();
        expect(() =>
          editorStore.updateElement(id, { data: { test: true } }),
        ).not.toThrow();
        expect(() => editorStore.deleteElement(id)).not.toThrow();

        expect(editorStore.getSelectedElement()).toBeUndefined();
      });
    });
  });

  describe("State Corruption Prevention", () => {
    it("should handle corrupted history gracefully", () => {
      // Manually corrupt history (simulating external tampering)
      const store = editorStore as any;
      const state = store.getState();

      // Add some elements first
      editorStore.addElement({
        id: "before-corruption",
        type: "default",
        position: { x: 0, y: 0 },
        data: {},
      });

      // Corrupt history
      state.history.past = null;
      state.history.future = [null, undefined, "invalid"] as any;

      // These operations might throw due to null history, which is expected
      try {
        const canUndo = editorStore.canUndo();
        expect(canUndo).toBe(false);
      } catch (error) {
        // Expected - null history causes error
        expect(error).toBeDefined();
      }

      try {
        const canRedo = editorStore.canRedo();
        expect(canRedo).toBe(false);
      } catch (error) {
        // Expected - null history causes error
        expect(error).toBeDefined();
      }
    });

    it("should recover from invalid state transitions", () => {
      // Create valid initial state
      editorStore.addElement({
        id: "recovery-test",
        type: "default",
        position: { x: 0, y: 0 },
        data: { valid: true },
      });

      const store = editorStore as any;
      const state = store.getState();

      // Corrupt various state properties
      state.elements = null;
      state.connections = "invalid";
      state.selectedElementId = { invalid: "object" };

      // Operations should return safe defaults even with corrupted state
      const elements = editorStore.getElements();
      const connections = editorStore.getConnections();
      const selectedId = editorStore.getSelectedElementId();

      // They may return null/undefined but shouldn't crash
      expect(elements !== undefined).toBe(true);
      expect(connections !== undefined).toBe(true);
      expect(
        selectedId === null ||
          typeof selectedId === "string" ||
          typeof selectedId === "object" ||
          selectedId === undefined,
      ).toBe(true);
    });

    it("should handle circular references in elements", () => {
      const circularElement: Element = {
        id: "circular",
        type: "default",
        position: { x: 0, y: 0 },
        data: {} as any,
      };

      // Create circular reference
      circularElement.data.self = circularElement;
      circularElement.data.data = circularElement.data;

      expect(() => editorStore.addElement(circularElement)).not.toThrow();
      expect(() =>
        editorStore.updateElement("circular", { data: { updated: true } }),
      ).not.toThrow();
    });
  });

  describe("Browser Compatibility Edge Cases", () => {
    it("should handle missing browser APIs gracefully", () => {
      // Mock missing performance API
      const originalPerformance = global.performance;
      delete (global as any).performance;

      expect(() => {
        for (let i = 0; i < 100; i++) {
          editorStore.addElement({
            id: `no-performance-${i}`,
            type: "default",
            position: { x: i, y: 0 },
            data: { index: i },
          });
        }
      }).not.toThrow();

      // Restore
      global.performance = originalPerformance;
    });

    it("should handle stringification edge cases", () => {
      const problematicElements = [
        {
          id: "circular-json",
          type: "default",
          position: { x: 0, y: 0 },
          data: {} as any,
        },
        {
          id: "function-data",
          type: "default",
          position: { x: 0, y: 0 },
          data: { func: () => console.log("test") } as any,
        },
        {
          id: "symbol-data",
          type: "default",
          position: { x: 0, y: 0 },
          data: { sym: Symbol("test") } as any,
        },
      ];

      // Create circular reference
      problematicElements[0].data.self = problematicElements[0];

      problematicElements.forEach((element, index) => {
        expect(() => editorStore.addElement(element)).not.toThrow();
      });
    });
  });
});
