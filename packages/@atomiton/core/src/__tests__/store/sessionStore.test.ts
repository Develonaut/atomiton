/**
 * Session Store Tests
 * Testing UI session state including drag/drop, selections, clipboard, and undo/redo
 * Following Brian's testing strategy for interactive state management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  createSessionStore,
  SessionActions,
  SessionSelectors,
} from "../../store/sessionStore";
import type { UndoItem, SessionStore } from "../../store/sessionStore";
import { SessionMockFactory } from "../helpers/store-mocks";
import { StoreTestFactory, TestPatterns } from "../helpers/store-test-utils";

describe("Session Store", () => {
  let store: SessionStore;
  let storeFactory: StoreTestFactory;

  beforeEach(async () => {
    storeFactory = new StoreTestFactory();
    await storeFactory.initializeStoreClient();
    store = createSessionStore();
  });

  afterEach(async () => {
    await storeFactory.cleanup();
  });

  describe("Store Creation and Initialization", () => {
    it("should create store with correct initial state", () => {
      const initialState = store.getState();

      expect(initialState).toEqual({
        dragItem: null,
        selection: null,
        clipboard: null,
        undoStack: [],
        redoStack: [],
        canUndo: false,
        canRedo: false,
        viewport: {
          x: 0,
          y: 0,
          zoom: 1,
        },
      });
    });

    it("should have actions instance", () => {
      expect(store.actions).toBeInstanceOf(SessionActions);
    });
  });

  describe("Drag and Drop Management", () => {
    it("should start drag operation", () => {
      const dragItem = SessionMockFactory.createDragItem({
        type: "node",
        nodeType: "csv-parser",
        data: { id: "csv-1", label: "CSV Parser" },
      });

      store.actions.startDrag(dragItem);

      const state = store.getState();
      expect(state.dragItem).toEqual(dragItem);
    });

    it("should end drag operation", () => {
      const dragItem = SessionMockFactory.createDragItem();
      store.actions.startDrag(dragItem);

      let state = store.getState();
      expect(state.dragItem).not.toBeNull();

      store.actions.endDrag();

      state = store.getState();
      expect(state.dragItem).toBeNull();
    });

    it("should update drag position", () => {
      const dragItem = SessionMockFactory.createDragItem();
      store.actions.startDrag(dragItem);

      store.actions.updateDragPosition(150, 200);

      const state = store.getState();
      expect(state.dragItem?.position).toEqual({ x: 150, y: 200 });
    });

    it("should handle drag without active drag item", () => {
      // Should not crash when no drag is active
      expect(() => {
        store.actions.updateDragPosition(100, 100);
      }).not.toThrow();

      expect(() => {
        store.actions.endDrag();
      }).not.toThrow();
    });

    it("should replace existing drag operation", () => {
      const dragItem1 = SessionMockFactory.createDragItem({ type: "node" });
      const dragItem2 = SessionMockFactory.createDragItem({
        type: "selection",
      });

      store.actions.startDrag(dragItem1);
      store.actions.startDrag(dragItem2);

      const state = store.getState();
      expect(state.dragItem).toEqual(dragItem2);
    });
  });

  describe("Selection Management", () => {
    it("should set single node selection", () => {
      const selection = SessionMockFactory.createSelection({
        type: "nodes",
        items: ["node-1"],
      });

      store.actions.setSelection(selection);

      const state = store.getState();
      expect(state.selection).toEqual(selection);
    });

    it("should set multiple node selection", () => {
      const selection = SessionMockFactory.createSelection({
        type: "nodes",
        items: ["node-1", "node-2", "node-3"],
        boundingBox: { x: 100, y: 100, width: 300, height: 200 },
      });

      store.actions.setSelection(selection);

      const state = store.getState();
      expect(state.selection).toEqual(selection);
    });

    it("should clear selection", () => {
      const selection = SessionMockFactory.createSelection();
      store.actions.setSelection(selection);

      let state = store.getState();
      expect(state.selection).not.toBeNull();

      store.actions.clearSelection();

      state = store.getState();
      expect(state.selection).toBeNull();
    });

    it("should add items to selection", () => {
      const initialSelection = SessionMockFactory.createSelection({
        items: ["node-1", "node-2"],
      });

      store.actions.setSelection(initialSelection);
      store.actions.addToSelection(["node-3", "node-4"]);

      const state = store.getState();
      expect(state.selection?.items).toEqual([
        "node-1",
        "node-2",
        "node-3",
        "node-4",
      ]);
    });

    it("should remove items from selection", () => {
      const initialSelection = SessionMockFactory.createSelection({
        items: ["node-1", "node-2", "node-3"],
      });

      store.actions.setSelection(initialSelection);
      store.actions.removeFromSelection(["node-2"]);

      const state = store.getState();
      expect(state.selection?.items).toEqual(["node-1", "node-3"]);
    });

    it("should toggle item in selection", () => {
      const initialSelection = SessionMockFactory.createSelection({
        items: ["node-1", "node-2"],
      });

      store.actions.setSelection(initialSelection);

      // Toggle existing item (remove)
      store.actions.toggleSelection("node-2");

      let state = store.getState();
      expect(state.selection?.items).toEqual(["node-1"]);

      // Toggle non-existing item (add)
      store.actions.toggleSelection("node-3");

      state = store.getState();
      expect(state.selection?.items).toEqual(["node-1", "node-3"]);
    });

    it("should handle selection operations with no active selection", () => {
      // Should not crash when no selection is active
      expect(() => {
        store.actions.addToSelection(["node-1"]);
        store.actions.removeFromSelection(["node-1"]);
        store.actions.toggleSelection("node-1");
      }).not.toThrow();

      // Should create selection when adding to empty selection
      store.actions.addToSelection(["node-1"]);
      const state = store.getState();
      expect(state.selection?.items).toEqual(["node-1"]);
    });
  });

  describe("Clipboard Management", () => {
    it("should copy items to clipboard", () => {
      const items = [
        { id: "node-1", type: "node", data: { label: "Node 1" } },
        { id: "node-2", type: "node", data: { label: "Node 2" } },
      ];

      store.actions.copyToClipboard(items);

      const state = store.getState();
      expect(state.clipboard?.type).toBe("copy");
      expect(state.clipboard?.items).toEqual(items);
      expect(state.clipboard?.timestamp).toBeInstanceOf(Date);
    });

    it("should cut items to clipboard", () => {
      const items = [{ id: "node-1", type: "node", data: { label: "Node 1" } }];

      store.actions.cutToClipboard(items);

      const state = store.getState();
      expect(state.clipboard?.type).toBe("cut");
      expect(state.clipboard?.items).toEqual(items);
    });

    it("should clear clipboard", () => {
      const items = [{ id: "node-1", type: "node", data: { label: "Node 1" } }];

      store.actions.copyToClipboard(items);

      let state = store.getState();
      expect(state.clipboard).not.toBeNull();

      store.actions.clearClipboard();

      state = store.getState();
      expect(state.clipboard).toBeNull();
    });

    it("should replace clipboard content", () => {
      const items1 = [{ id: "node-1", type: "node", data: {} }];
      const items2 = [{ id: "node-2", type: "node", data: {} }];

      store.actions.copyToClipboard(items1);
      store.actions.copyToClipboard(items2);

      const state = store.getState();
      expect(state.clipboard?.items).toEqual(items2);
    });

    it("should handle empty clipboard operations", () => {
      expect(() => {
        store.actions.clearClipboard();
      }).not.toThrow();

      const state = store.getState();
      expect(state.clipboard).toBeNull();
    });
  });

  describe("Undo/Redo Management", () => {
    it("should add action to undo stack", () => {
      const undoItem: UndoItem = {
        type: "node-create",
        description: "Create CSV Parser Node",
        undo: vi.fn(),
        redo: vi.fn(),
        timestamp: new Date(),
      };

      store.actions.addUndoAction(undoItem);

      const state = store.getState();
      expect(state.undoStack).toHaveLength(1);
      expect(state.undoStack[0]).toEqual(undoItem);
      expect(state.canUndo).toBe(true);
      expect(state.canRedo).toBe(false);
    });

    it("should perform undo operation", () => {
      const mockUndo = vi.fn();
      const mockRedo = vi.fn();

      const undoItem: UndoItem = {
        type: "node-create",
        description: "Create Node",
        undo: mockUndo,
        redo: mockRedo,
        timestamp: new Date(),
      };

      store.actions.addUndoAction(undoItem);
      store.actions.undo();

      const state = store.getState();
      expect(mockUndo).toHaveBeenCalled();
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(1);
      expect(state.canUndo).toBe(false);
      expect(state.canRedo).toBe(true);
    });

    it("should perform redo operation", () => {
      const mockUndo = vi.fn();
      const mockRedo = vi.fn();

      const undoItem: UndoItem = {
        type: "node-create",
        description: "Create Node",
        undo: mockUndo,
        redo: mockRedo,
        timestamp: new Date(),
      };

      store.actions.addUndoAction(undoItem);
      store.actions.undo();
      store.actions.redo();

      const state = store.getState();
      expect(mockRedo).toHaveBeenCalled();
      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(0);
      expect(state.canUndo).toBe(true);
      expect(state.canRedo).toBe(false);
    });

    it("should handle multiple undo/redo operations", () => {
      const actions = [
        {
          type: "action-1",
          description: "Action 1",
          undo: vi.fn(),
          redo: vi.fn(),
          timestamp: new Date(),
        },
        {
          type: "action-2",
          description: "Action 2",
          undo: vi.fn(),
          redo: vi.fn(),
          timestamp: new Date(),
        },
        {
          type: "action-3",
          description: "Action 3",
          undo: vi.fn(),
          redo: vi.fn(),
          timestamp: new Date(),
        },
      ];

      // Add actions
      actions.forEach((action) => store.actions.addUndoAction(action));

      let state = store.getState();
      expect(state.undoStack).toHaveLength(3);

      // Undo twice
      store.actions.undo();
      store.actions.undo();

      state = store.getState();
      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(2);
      expect(actions[2].undo).toHaveBeenCalled();
      expect(actions[1].undo).toHaveBeenCalled();
      expect(actions[0].undo).not.toHaveBeenCalled();

      // Redo once
      store.actions.redo();

      state = store.getState();
      expect(state.undoStack).toHaveLength(2);
      expect(state.redoStack).toHaveLength(1);
      expect(actions[1].redo).toHaveBeenCalled();
    });

    it("should clear redo stack when new action is added", () => {
      const action1: UndoItem = {
        type: "action-1",
        description: "Action 1",
        undo: vi.fn(),
        redo: vi.fn(),
        timestamp: new Date(),
      };

      const action2: UndoItem = {
        type: "action-2",
        description: "Action 2",
        undo: vi.fn(),
        redo: vi.fn(),
        timestamp: new Date(),
      };

      // Add action, undo it
      store.actions.addUndoAction(action1);
      store.actions.undo();

      let state = store.getState();
      expect(state.redoStack).toHaveLength(1);

      // Add new action - should clear redo stack
      store.actions.addUndoAction(action2);

      state = store.getState();
      expect(state.redoStack).toHaveLength(0);
      expect(state.undoStack).toHaveLength(1);
      expect(state.canRedo).toBe(false);
    });

    it("should limit undo stack size", () => {
      const maxStackSize = 50; // Assuming this is the limit

      // Add many actions
      for (let i = 0; i < maxStackSize + 10; i++) {
        store.actions.addUndoAction({
          type: `action-${i}`,
          description: `Action ${i}`,
          undo: vi.fn(),
          redo: vi.fn(),
          timestamp: new Date(),
        });
      }

      const state = store.getState();
      expect(state.undoStack.length).toBeLessThanOrEqual(maxStackSize);
    });

    it("should handle undo/redo with empty stacks", () => {
      expect(() => {
        store.actions.undo();
        store.actions.redo();
      }).not.toThrow();

      const state = store.getState();
      expect(state.canUndo).toBe(false);
      expect(state.canRedo).toBe(false);
    });

    it("should clear undo/redo history", () => {
      const action: UndoItem = {
        type: "action",
        description: "Test Action",
        undo: vi.fn(),
        redo: vi.fn(),
        timestamp: new Date(),
      };

      store.actions.addUndoAction(action);
      store.actions.undo();

      let state = store.getState();
      expect(state.undoStack.length + state.redoStack.length).toBeGreaterThan(
        0,
      );

      store.actions.clearUndoHistory();

      state = store.getState();
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
      expect(state.canUndo).toBe(false);
      expect(state.canRedo).toBe(false);
    });
  });

  describe("Viewport Management", () => {
    it("should set viewport position", () => {
      store.actions.setViewportPosition(150, 200);

      const state = store.getState();
      expect(state.viewport.x).toBe(150);
      expect(state.viewport.y).toBe(200);
    });

    it("should set viewport zoom", () => {
      store.actions.setViewportZoom(1.5);

      const state = store.getState();
      expect(state.viewport.zoom).toBe(1.5);
    });

    it("should update viewport transform", () => {
      store.actions.setViewportTransform(100, 150, 0.8);

      const state = store.getState();
      expect(state.viewport).toEqual({
        x: 100,
        y: 150,
        zoom: 0.8,
      });
    });

    it("should handle zoom constraints", () => {
      // Test minimum zoom
      store.actions.setViewportZoom(0.05); // Very small zoom
      let state = store.getState();
      expect(state.viewport.zoom).toBeGreaterThanOrEqual(0.1); // Assuming min zoom is 0.1

      // Test maximum zoom
      store.actions.setViewportZoom(10); // Very large zoom
      state = store.getState();
      expect(state.viewport.zoom).toBeLessThanOrEqual(5); // Assuming max zoom is 5
    });

    it("should reset viewport", () => {
      store.actions.setViewportTransform(200, 300, 2);
      store.actions.resetViewport();

      const state = store.getState();
      expect(state.viewport).toEqual({
        x: 0,
        y: 0,
        zoom: 1,
      });
    });
  });

  describe("Session Selectors", () => {
    describe("hasSelection", () => {
      it("should return true when selection exists", () => {
        const selection = SessionMockFactory.createSelection();
        store.actions.setSelection(selection);

        const state = store.getState();
        expect(SessionSelectors.hasSelection(state)).toBe(true);
      });

      it("should return false when no selection", () => {
        const state = store.getState();
        expect(SessionSelectors.hasSelection(state)).toBe(false);
      });
    });

    describe("getSelectedItems", () => {
      it("should return selected items", () => {
        const selection = SessionMockFactory.createSelection({
          items: ["node-1", "node-2", "node-3"],
        });
        store.actions.setSelection(selection);

        const state = store.getState();
        const selectedItems = SessionSelectors.getSelectedItems(state);

        expect(selectedItems).toEqual(["node-1", "node-2", "node-3"]);
      });

      it("should return empty array when no selection", () => {
        const state = store.getState();
        const selectedItems = SessionSelectors.getSelectedItems(state);

        expect(selectedItems).toEqual([]);
      });
    });

    describe("hasClipboard", () => {
      it("should return true when clipboard has content", () => {
        store.actions.copyToClipboard([
          { id: "node-1", type: "node", data: {} },
        ]);

        const state = store.getState();
        expect(SessionSelectors.hasClipboard(state)).toBe(true);
      });

      it("should return false when clipboard is empty", () => {
        const state = store.getState();
        expect(SessionSelectors.hasClipboard(state)).toBe(false);
      });
    });

    describe("isDragging", () => {
      it("should return true when drag is active", () => {
        const dragItem = SessionMockFactory.createDragItem();
        store.actions.startDrag(dragItem);

        const state = store.getState();
        expect(SessionSelectors.isDragging(state)).toBe(true);
      });

      it("should return false when no drag is active", () => {
        const state = store.getState();
        expect(SessionSelectors.isDragging(state)).toBe(false);
      });
    });

    describe("getViewportScale", () => {
      it("should return current zoom level", () => {
        store.actions.setViewportZoom(1.5);

        const state = store.getState();
        expect(SessionSelectors.getViewportScale(state)).toBe(1.5);
      });
    });
  });

  describe("Store Persistence", () => {
    it("should not persist session state (temporary by nature)", async () => {
      // Set various session states
      const dragItem = SessionMockFactory.createDragItem();
      const selection = SessionMockFactory.createSelection();
      const clipboardItems = [{ id: "node-1", type: "node", data: {} }];

      store.actions.startDrag(dragItem);
      store.actions.setSelection(selection);
      store.actions.copyToClipboard(clipboardItems);
      store.actions.setViewportTransform(100, 200, 1.5);

      // Wait for potential persistence
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create new store - session state should be reset
      const newStore = createSessionStore();
      const hydratedState = newStore.getState();

      expect(hydratedState.dragItem).toBeNull();
      expect(hydratedState.selection).toBeNull();
      expect(hydratedState.clipboard).toBeNull();
      expect(hydratedState.undoStack).toHaveLength(0);
      expect(hydratedState.redoStack).toHaveLength(0);
      expect(hydratedState.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });

  describe("Subscription Behavior", () => {
    TestPatterns.testSubscriptions(store, (store: SessionStore) => {
      const dragItem = SessionMockFactory.createDragItem();
      store.actions.startDrag(dragItem);
    });

    it("should notify on all session state changes", () => {
      const mockCallback = vi.fn();
      const unsubscribe = store.subscribe(mockCallback);

      // Drag operations
      store.actions.startDrag(SessionMockFactory.createDragItem());
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Selection operations
      store.actions.setSelection(SessionMockFactory.createSelection());
      expect(mockCallback).toHaveBeenCalledTimes(2);

      // Clipboard operations
      store.actions.copyToClipboard([{ id: "node-1", type: "node", data: {} }]);
      expect(mockCallback).toHaveBeenCalledTimes(3);

      // Undo operations
      store.actions.addUndoAction({
        type: "test",
        description: "Test",
        undo: vi.fn(),
        redo: vi.fn(),
        timestamp: new Date(),
      });
      expect(mockCallback).toHaveBeenCalledTimes(4);

      // Viewport operations
      store.actions.setViewportZoom(1.5);
      expect(mockCallback).toHaveBeenCalledTimes(5);

      unsubscribe();
    });
  });

  describe("Immutability and Pure Functions", () => {
    it("should maintain state immutability", () => {
      const state1 = store.getState();

      store.actions.setSelection(SessionMockFactory.createSelection());

      const state2 = store.getState();

      expect(state1).not.toBe(state2);
      expect(state1.selection).toBeNull();
      expect(state2.selection).not.toBeNull();
    });

    it("should ensure array immutability for undo/redo stacks", () => {
      const undoItem: UndoItem = {
        type: "test",
        description: "Test",
        undo: vi.fn(),
        redo: vi.fn(),
        timestamp: new Date(),
      };

      const state1 = store.getState();
      const undoStack1 = state1.undoStack;

      store.actions.addUndoAction(undoItem);

      const state2 = store.getState();
      const undoStack2 = state2.undoStack;

      expect(undoStack1).not.toBe(undoStack2);
      expect(undoStack1).toHaveLength(0);
      expect(undoStack2).toHaveLength(1);
    });

    it("should ensure selectors are pure functions", () => {
      store.actions.setSelection(
        SessionMockFactory.createSelection({ items: ["node-1", "node-2"] }),
      );

      const state = store.getState();

      const result1 = SessionSelectors.getSelectedItems(state);
      const result2 = SessionSelectors.getSelectedItems(state);
      const result3 = SessionSelectors.hasSelection(state);
      const result4 = SessionSelectors.hasSelection(state);

      expect(result1).toEqual(result2);
      expect(result3).toEqual(result4);

      // Original state should not be modified
      expect(state.selection?.items).toEqual(["node-1", "node-2"]);
    });
  });

  describe("Complex Session Scenarios", () => {
    it("should handle complete drag and drop workflow", () => {
      const dragItem = SessionMockFactory.createDragItem({
        type: "node",
        nodeType: "csv-parser",
      });

      // Start drag
      store.actions.startDrag(dragItem);
      expect(SessionSelectors.isDragging(store.getState())).toBe(true);

      // Update drag position
      store.actions.updateDragPosition(200, 300);
      expect(store.getState().dragItem?.position).toEqual({ x: 200, y: 300 });

      // End drag
      store.actions.endDrag();
      expect(SessionSelectors.isDragging(store.getState())).toBe(false);
    });

    it("should handle complex selection workflow", () => {
      // Start with empty selection
      expect(SessionSelectors.hasSelection(store.getState())).toBe(false);

      // Select first item
      store.actions.addToSelection(["node-1"]);
      expect(SessionSelectors.getSelectedItems(store.getState())).toEqual([
        "node-1",
      ]);

      // Add more items
      store.actions.addToSelection(["node-2", "node-3"]);
      expect(SessionSelectors.getSelectedItems(store.getState())).toEqual([
        "node-1",
        "node-2",
        "node-3",
      ]);

      // Remove one item
      store.actions.removeFromSelection(["node-2"]);
      expect(SessionSelectors.getSelectedItems(store.getState())).toEqual([
        "node-1",
        "node-3",
      ]);

      // Toggle item (add back)
      store.actions.toggleSelection("node-2");
      expect(SessionSelectors.getSelectedItems(store.getState())).toEqual([
        "node-1",
        "node-3",
        "node-2",
      ]);

      // Clear selection
      store.actions.clearSelection();
      expect(SessionSelectors.hasSelection(store.getState())).toBe(false);
    });

    it("should handle copy/paste workflow with undo", () => {
      const mockUndo = vi.fn();
      const mockRedo = vi.fn();

      // Copy items
      const items = [{ id: "node-1", type: "node", data: { label: "Node 1" } }];
      store.actions.copyToClipboard(items);
      expect(SessionSelectors.hasClipboard(store.getState())).toBe(true);

      // Simulate paste operation with undo
      store.actions.addUndoAction({
        type: "paste",
        description: "Paste nodes",
        undo: mockUndo,
        redo: mockRedo,
        timestamp: new Date(),
      });

      expect(store.getState().canUndo).toBe(true);

      // Undo the paste
      store.actions.undo();
      expect(mockUndo).toHaveBeenCalled();
      expect(store.getState().canRedo).toBe(true);

      // Redo the paste
      store.actions.redo();
      expect(mockRedo).toHaveBeenCalled();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle invalid viewport values", () => {
      // Test with negative zoom
      store.actions.setViewportZoom(-1);
      expect(store.getState().viewport.zoom).toBeGreaterThan(0);

      // Test with NaN values
      store.actions.setViewportTransform(NaN, NaN, NaN);
      const viewport = store.getState().viewport;
      expect(viewport.x).not.toBeNaN();
      expect(viewport.y).not.toBeNaN();
      expect(viewport.zoom).not.toBeNaN();
    });

    it("should handle large selections efficiently", () => {
      const largeSelection = [];
      for (let i = 0; i < 1000; i++) {
        largeSelection.push(`node-${i}`);
      }

      const startTime = Date.now();
      store.actions.addToSelection(largeSelection);
      const endTime = Date.now();

      expect(SessionSelectors.getSelectedItems(store.getState())).toHaveLength(
        1000,
      );
      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });

    it("should handle clipboard with large data", () => {
      const largeClipboardData = [];
      for (let i = 0; i < 100; i++) {
        largeClipboardData.push({
          id: `node-${i}`,
          type: "node",
          data: { complexData: new Array(1000).fill(i) },
        });
      }

      expect(() => {
        store.actions.copyToClipboard(largeClipboardData);
      }).not.toThrow();

      expect(SessionSelectors.hasClipboard(store.getState())).toBe(true);
    });

    it("should handle undo action execution errors", () => {
      const failingUndo = vi.fn(() => {
        throw new Error("Undo failed");
      });

      store.actions.addUndoAction({
        type: "failing-action",
        description: "Failing Action",
        undo: failingUndo,
        redo: vi.fn(),
        timestamp: new Date(),
      });

      // Should not crash the application
      expect(() => {
        store.actions.undo();
      }).not.toThrow();

      expect(failingUndo).toHaveBeenCalled();
    });
  });
});
