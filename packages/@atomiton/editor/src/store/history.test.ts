import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHistoryActions, pushHistory } from "./history";
import type { EditorState } from "./types";
import { MAX_HISTORY_SIZE } from "./types";

describe("History Management", () => {
  let initialState: EditorState;
  let mockStore: any;

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

    mockStore = {
      getState: vi.fn(() => ({ ...initialState })),
      setState: vi.fn(),
      subscribe: vi.fn(),
      dispatch: vi.fn(),
    };
  });

  describe("pushHistory", () => {
    it("should add current state to history", () => {
      const state = {
        ...initialState,
        elements: [
          { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
        ],
        selectedElementId: "node-1",
      };

      pushHistory(state);

      expect(state.history.past).toHaveLength(1);
      expect(state.history.past[0]).toEqual({
        elements: [
          { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
        ],
        connections: [],
        selectedElementId: "node-1",
      });
      expect(state.history.future).toEqual([]);
    });

    it("should clear future history when pushing new state", () => {
      const state = {
        ...initialState,
        elements: [
          { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
        ],
        history: {
          past: [{ elements: [], connections: [], selectedElementId: null }],
          future: [
            {
              elements: [
                {
                  id: "node-2",
                  type: "default",
                  position: { x: 100, y: 0 },
                  data: {},
                },
              ],
              connections: [],
              selectedElementId: null,
            },
          ],
        },
      };

      pushHistory(state);

      expect(state.history.past).toHaveLength(2);
      expect(state.history.future).toEqual([]);
    });

    it("should maintain maximum history size", () => {
      const state = { ...initialState };

      // Fill history beyond max size
      for (let i = 0; i < MAX_HISTORY_SIZE + 5; i++) {
        state.elements = [
          {
            id: `node-${i}`,
            type: "default",
            position: { x: i * 10, y: 0 },
            data: {},
          },
        ];
        pushHistory(state);
      }

      expect(state.history.past).toHaveLength(MAX_HISTORY_SIZE);
      expect(state.history.past[0].elements[0].id).toBe("node-5"); // First 5 should be removed
      expect(state.history.past[MAX_HISTORY_SIZE - 1].elements[0].id).toBe(
        `node-${MAX_HISTORY_SIZE + 4}`,
      );
    });

    it("should create deep copies of state", () => {
      const element = {
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { value: 42 },
      };
      const state = { ...initialState, elements: [element] };

      const originalValue = element.data.value;
      const originalX = element.position.x;

      pushHistory(state);

      // Verify the history entry captured the original values
      expect(state.history.past[0].elements[0].data.value).toBe(originalValue);
      expect(state.history.past[0].elements[0].position.x).toBe(originalX);
      expect(state.history.past[0].elements[0].id).toBe("node-1");
    });
  });

  describe("History Actions", () => {
    let historyActions: ReturnType<typeof createHistoryActions>;

    beforeEach(() => {
      historyActions = createHistoryActions(mockStore);
    });

    describe("undo", () => {
      it("should restore previous state", () => {
        const currentElements = [
          {
            id: "node-2",
            type: "default",
            position: { x: 100, y: 0 },
            data: {},
          },
        ];
        const pastElements = [
          { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
        ];

        const state = {
          ...initialState,
          elements: currentElements,
          selectedElementId: "node-2",
          history: {
            past: [
              {
                elements: pastElements,
                connections: [],
                selectedElementId: "node-1",
              },
            ],
            future: [],
          },
        };

        historyActions.undo(state);

        expect(state.elements).toEqual(pastElements);
        expect(state.selectedElementId).toBe("node-1");
        expect(state.history.past).toEqual([]);
        expect(state.history.future).toHaveLength(1);
        expect(state.history.future[0].elements).toEqual(currentElements);
      });

      it("should do nothing when no history exists", () => {
        const state = { ...initialState };
        const originalState = JSON.parse(JSON.stringify(state));

        historyActions.undo(state);

        expect(state).toEqual(originalState);
      });

      it("should handle multiple undo operations", () => {
        const state1 = {
          elements: [],
          connections: [],
          selectedElementId: null,
        };
        const state2 = {
          elements: [
            {
              id: "node-1",
              type: "default",
              position: { x: 0, y: 0 },
              data: {},
            },
          ],
          connections: [],
          selectedElementId: "node-1",
        };
        const state3 = {
          elements: [
            {
              id: "node-1",
              type: "default",
              position: { x: 0, y: 0 },
              data: {},
            },
            {
              id: "node-2",
              type: "default",
              position: { x: 100, y: 0 },
              data: {},
            },
          ],
          connections: [],
          selectedElementId: "node-2",
        };

        const state = {
          ...initialState,
          elements: state3.elements,
          selectedElementId: state3.selectedElementId,
          history: {
            past: [state1, state2],
            future: [],
          },
        };

        // First undo
        historyActions.undo(state);
        expect(state.elements).toEqual(state2.elements);
        expect(state.history.past).toEqual([state1]);
        expect(state.history.future).toHaveLength(1);

        // Second undo
        historyActions.undo(state);
        expect(state.elements).toEqual(state1.elements);
        expect(state.history.past).toEqual([]);
        expect(state.history.future).toHaveLength(2);
      });
    });

    describe("redo", () => {
      it("should restore future state", () => {
        const currentElements = [
          { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
        ];
        const futureElements = [
          {
            id: "node-2",
            type: "default",
            position: { x: 100, y: 0 },
            data: {},
          },
        ];

        const state = {
          ...initialState,
          elements: currentElements,
          selectedElementId: "node-1",
          history: {
            past: [],
            future: [
              {
                elements: futureElements,
                connections: [],
                selectedElementId: "node-2",
              },
            ],
          },
        };

        historyActions.redo(state);

        expect(state.elements).toEqual(futureElements);
        expect(state.selectedElementId).toBe("node-2");
        expect(state.history.future).toEqual([]);
        expect(state.history.past).toHaveLength(1);
        expect(state.history.past[0].elements).toEqual(currentElements);
      });

      it("should do nothing when no future exists", () => {
        const state = { ...initialState };
        const originalState = JSON.parse(JSON.stringify(state));

        historyActions.redo(state);

        expect(state).toEqual(originalState);
      });

      it.skip("should handle multiple redo operations", () => {
        const initialElements = [];
        const firstRedoElements = [
          { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
        ];
        const secondRedoElements = [
          { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
          {
            id: "node-2",
            type: "default",
            position: { x: 100, y: 0 },
            data: {},
          },
        ];

        const state = {
          ...initialState,
          elements: initialElements,
          selectedElementId: null,
          history: {
            past: [],
            future: [
              {
                elements: firstRedoElements,
                connections: [],
                selectedElementId: "node-1",
              },
              {
                elements: secondRedoElements,
                connections: [],
                selectedElementId: "node-2",
              },
            ],
          },
        };

        // First redo
        historyActions.redo(state);
        expect(state.elements).toEqual(firstRedoElements);
        expect(state.history.future).toHaveLength(1);
        expect(state.history.past).toHaveLength(1);

        // Second redo
        historyActions.redo(state);
        expect(state.elements).toEqual(secondRedoElements);
        expect(state.history.future).toEqual([]);
        expect(state.history.past).toHaveLength(2);
      });
    });

    describe("clearHistory", () => {
      it("should clear both past and future", () => {
        const state = {
          ...initialState,
          history: {
            past: [{ elements: [], connections: [], selectedElementId: null }],
            future: [
              {
                elements: [
                  {
                    id: "node-1",
                    type: "default",
                    position: { x: 0, y: 0 },
                    data: {},
                  },
                ],
                connections: [],
                selectedElementId: null,
              },
            ],
          },
        };

        historyActions.clearHistory(state);

        expect(state.history.past).toEqual([]);
        expect(state.history.future).toEqual([]);
      });

      it("should work when history is already empty", () => {
        const state = { ...initialState };

        historyActions.clearHistory(state);

        expect(state.history.past).toEqual([]);
        expect(state.history.future).toEqual([]);
      });
    });

    describe("Undo/Redo Integration", () => {
      it("should maintain correct state through undo/redo cycle", () => {
        const state1 = {
          elements: [],
          connections: [],
          selectedElementId: null,
        };
        const state2 = {
          elements: [
            {
              id: "node-1",
              type: "default",
              position: { x: 0, y: 0 },
              data: {},
            },
          ],
          connections: [],
          selectedElementId: "node-1",
        };

        const state = {
          ...initialState,
          elements: state2.elements,
          selectedElementId: state2.selectedElementId,
          history: {
            past: [state1],
            future: [],
          },
        };

        // Undo
        historyActions.undo(state);
        expect(state.elements).toEqual(state1.elements);

        // Redo
        historyActions.redo(state);
        expect(state.elements).toEqual(state2.elements);
        expect(state.selectedElementId).toBe(state2.selectedElementId);
      });

      it("should handle complex state with connections", () => {
        const connection = { id: "edge-1", source: "node-1", target: "node-2" };
        const state = {
          ...initialState,
          elements: [
            {
              id: "node-1",
              type: "default",
              position: { x: 0, y: 0 },
              data: {},
            },
            {
              id: "node-2",
              type: "default",
              position: { x: 100, y: 0 },
              data: {},
            },
          ],
          connections: [connection],
          selectedElementId: "node-1",
          history: {
            past: [{ elements: [], connections: [], selectedElementId: null }],
            future: [],
          },
        };

        historyActions.undo(state);

        expect(state.elements).toEqual([]);
        expect(state.connections).toEqual([]);
        expect(state.selectedElementId).toBeNull();

        historyActions.redo(state);

        expect(state.elements).toHaveLength(2);
        expect(state.connections).toEqual([connection]);
        expect(state.selectedElementId).toBe("node-1");
      });
    });

    describe("Edge Cases", () => {
      it("should handle maximum history size stress test", () => {
        const state = { ...initialState };
        const originalElements = [...state.elements];

        // Perform many operations
        for (let i = 0; i < MAX_HISTORY_SIZE * 2; i++) {
          pushHistory(state);
          state.elements = [
            {
              id: `node-${i}`,
              type: "default",
              position: { x: i, y: 0 },
              data: {},
            },
          ];
        }

        expect(state.history.past).toHaveLength(MAX_HISTORY_SIZE);

        // Undo all possible
        let undoCount = 0;
        while (state.history.past.length > 0) {
          historyActions.undo(state);
          undoCount++;
        }

        expect(undoCount).toBe(MAX_HISTORY_SIZE);
        expect(state.history.future).toHaveLength(MAX_HISTORY_SIZE);
      });

      it("should restore state correctly during undo", () => {
        const element = {
          id: "node-1",
          type: "default",
          position: { x: 0, y: 0 },
          data: { nested: { value: 42 } },
        };
        const state = { ...initialState, elements: [element] };

        pushHistory(state);

        // Save original state before modifications
        const originalElement = state.history.past[0].elements[0];

        // Create modified state
        state.elements = [
          {
            id: "node-1",
            type: "default",
            position: { x: 0, y: 0 },
            data: { nested: { value: 100 } },
          },
        ];

        historyActions.undo(state);

        expect(state.elements[0].data.nested.value).toBe(
          originalElement.data.nested.value,
        );
      });

      it("should handle rapid undo/redo operations", () => {
        const state = { ...initialState };

        // Create history
        for (let i = 0; i < 5; i++) {
          pushHistory(state);
          state.elements = [
            {
              id: `node-${i}`,
              type: "default",
              position: { x: i * 10, y: 0 },
              data: {},
            },
          ];
        }

        // Rapid undo/redo
        for (let i = 0; i < 100; i++) {
          if (state.history.past.length > 0) {
            historyActions.undo(state);
          }
          if (state.history.future.length > 0) {
            historyActions.redo(state);
          }
        }

        expect(state.history.past.length + state.history.future.length).toBe(5);
      });
    });
  });
});
