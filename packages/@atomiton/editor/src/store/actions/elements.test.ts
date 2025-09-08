import { beforeEach, describe, expect, it, vi } from "vitest";
import { elementActionFunctions } from "./elements";
import { pushHistory } from "../history";
import type { EditorState, Element } from "../types";

vi.mock("../history", () => ({
  pushHistory: vi.fn(),
}));

describe("Element Actions", () => {
  let initialState: EditorState;

  beforeEach(() => {
    vi.clearAllMocks();

    initialState = {
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
  });

  describe("addElement", () => {
    it("should add element to state and mark as dirty", () => {
      const element: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Test Node" },
      };

      const state = { ...initialState };
      elementActionFunctions.addElement(state, element);

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.elements).toEqual([element]);
      expect(state.isDirty).toBe(true);
    });

    it("should add multiple elements", () => {
      const element1: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Node 1" },
      };
      const element2: Element = {
        id: "node-2",
        type: "default",
        position: { x: 100, y: 0 },
        data: { label: "Node 2" },
      };

      const state = { ...initialState };
      elementActionFunctions.addElement(state, element1);
      elementActionFunctions.addElement(state, element2);

      expect(state.elements).toEqual([element1, element2]);
      expect(pushHistory).toHaveBeenCalledTimes(2);
    });
  });

  describe("updateElement", () => {
    it("should update existing element", () => {
      const element: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Original" },
      };

      const state = { ...initialState, elements: [element] };
      const updates = { data: { label: "Updated" } };

      elementActionFunctions.updateElement(state, "node-1", updates);

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.elements[0].data.label).toBe("Updated");
      expect(state.elements[0].position).toEqual({ x: 0, y: 0 });
      expect(state.isDirty).toBe(true);
    });

    it("should not update non-existent element", () => {
      const state = { ...initialState };
      const updates = { data: { label: "Updated" } };

      elementActionFunctions.updateElement(state, "non-existent", updates);

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.elements).toEqual([]);
      expect(state.isDirty).toBe(false);
    });

    it("should partially update element properties", () => {
      const element: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Original", value: 42 },
      };

      const state = { ...initialState, elements: [element] };
      const updates = { position: { x: 100, y: 50 } };

      elementActionFunctions.updateElement(state, "node-1", updates);

      expect(state.elements[0].position).toEqual({ x: 100, y: 50 });
      expect(state.elements[0].data).toEqual({ label: "Original", value: 42 });
      expect(state.elements[0].type).toBe("default");
    });
  });

  describe("deleteElement", () => {
    it("should remove element and related connections", () => {
      const element: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "To Delete" },
      };

      const connections = [
        { id: "edge-1", source: "node-1", target: "node-2" },
        { id: "edge-2", source: "node-2", target: "node-1" },
        { id: "edge-3", source: "node-2", target: "node-3" },
      ];

      const state = {
        ...initialState,
        elements: [element],
        connections,
        selectedElementId: "node-1",
      };

      elementActionFunctions.deleteElement(state, "node-1");

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.elements).toEqual([]);
      expect(state.connections).toEqual([
        { id: "edge-3", source: "node-2", target: "node-3" },
      ]);
      expect(state.selectedElementId).toBeNull();
      expect(state.isDirty).toBe(true);
    });

    it("should not affect selection if different element deleted", () => {
      const element: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "To Delete" },
      };

      const state = {
        ...initialState,
        elements: [element],
        selectedElementId: "node-2",
      };

      elementActionFunctions.deleteElement(state, "node-1");

      expect(state.selectedElementId).toBe("node-2");
    });

    it("should handle deleting non-existent element gracefully", () => {
      const state = { ...initialState };

      elementActionFunctions.deleteElement(state, "non-existent");

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.elements).toEqual([]);
      expect(state.isDirty).toBe(true);
    });
  });

  describe("setElements", () => {
    it("should replace all elements when different", () => {
      const oldElements: Element[] = [
        { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
      ];
      const newElements: Element[] = [
        { id: "node-2", type: "default", position: { x: 100, y: 0 }, data: {} },
        { id: "node-3", type: "default", position: { x: 200, y: 0 }, data: {} },
      ];

      const state = { ...initialState, elements: oldElements };

      elementActionFunctions.setElements(state, newElements);

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.elements).toEqual(newElements);
      expect(state.isDirty).toBe(true);
    });

    it("should not push history when elements are identical", () => {
      const elements: Element[] = [
        { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
      ];

      const state = { ...initialState, elements: [...elements] };

      elementActionFunctions.setElements(state, elements);

      expect(pushHistory).not.toHaveBeenCalled();
      expect(state.elements).toEqual(elements);
      expect(state.isDirty).toBe(true);
    });

    it("should handle empty array", () => {
      const oldElements: Element[] = [
        { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
      ];

      const state = { ...initialState, elements: oldElements };

      elementActionFunctions.setElements(state, []);

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.elements).toEqual([]);
      expect(state.isDirty).toBe(true);
    });
  });

  describe("selectElement", () => {
    it("should select element by id", () => {
      const state = { ...initialState };

      elementActionFunctions.selectElement(state, "node-1");

      expect(state.selectedElementId).toBe("node-1");
      expect(pushHistory).not.toHaveBeenCalled();
    });

    it("should clear selection with null", () => {
      const state = { ...initialState, selectedElementId: "node-1" };

      elementActionFunctions.selectElement(state, null);

      expect(state.selectedElementId).toBeNull();
    });
  });

  describe("clearSelection", () => {
    it("should clear selection", () => {
      const state = { ...initialState, selectedElementId: "node-1" };

      elementActionFunctions.clearSelection(state);

      expect(state.selectedElementId).toBeNull();
      expect(pushHistory).not.toHaveBeenCalled();
    });

    it("should work when no selection exists", () => {
      const state = { ...initialState };

      elementActionFunctions.clearSelection(state);

      expect(state.selectedElementId).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle element with complex data structure", () => {
      const complexElement: Element = {
        id: "complex-node",
        type: "custom",
        position: { x: 50, y: 100 },
        data: {
          label: "Complex Node",
          config: {
            nested: { value: 42 },
            array: [1, 2, 3],
          },
          metadata: {
            createdAt: new Date().toISOString(),
            version: "1.0.0",
          },
        },
      };

      const state = { ...initialState };
      elementActionFunctions.addElement(state, complexElement);

      expect(state.elements[0]).toEqual(complexElement);
      expect((state.elements[0].data as any).config.nested.value).toBe(42);
    });

    it("should handle rapid sequential operations", () => {
      const state = { ...initialState };
      const elements = Array.from({ length: 10 }, (_, i) => ({
        id: `node-${i}`,
        type: "default",
        position: { x: i * 100, y: 0 },
        data: { label: `Node ${i}` },
      }));

      elements.forEach((element) => {
        elementActionFunctions.addElement(state, element);
      });

      expect(state.elements).toHaveLength(10);
      expect(pushHistory).toHaveBeenCalledTimes(10);
      expect(state.isDirty).toBe(true);
    });

    it("should maintain state immutability", () => {
      const element: Element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Test" },
      };

      const state = { ...initialState };
      const originalState = JSON.parse(JSON.stringify(state));

      elementActionFunctions.addElement(state, element);

      expect(originalState.elements).toEqual([]);
      expect(originalState.isDirty).toBe(false);
      expect(state.elements).toEqual([element]);
      expect(state.isDirty).toBe(true);
    });
  });
});
