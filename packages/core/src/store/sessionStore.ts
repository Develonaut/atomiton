/**
 * Session Store - Temporary state management for current session
 * Manages transient data and cross-component communication
 */

import { storeClient } from "../clients/StoreClient";
import type { ZustandStore, StateUpdater } from "../clients/StoreClient";

export interface DragItem {
  type: "node" | "connection" | "blueprint" | "file";
  id: string;
  data: unknown;
  source: string;
}

export interface Selection {
  type: "node" | "connection" | "multiple";
  ids: string[];
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Clipboard {
  type: "nodes" | "blueprint" | "text" | "data";
  data: unknown;
  timestamp: Date;
  source: string;
}

export interface UndoItem {
  type: string;
  description: string;
  data: unknown;
  timestamp: Date;
}

export interface SessionState {
  // Current user session
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  sessionStarted: Date;

  // Drag and drop state
  dragItem: DragItem | null;
  dropTarget: string | null;
  isDragging: boolean;

  // Selection state
  selection: Selection | null;
  multiSelectMode: boolean;
  selectionBox?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };

  // Clipboard
  clipboard: Clipboard | null;

  // Undo/Redo stacks
  undoStack: UndoItem[];
  redoStack: UndoItem[];
  maxUndoItems: number;

  // Temporary data storage
  tempData: Map<string, unknown>;

  // Inter-component messages
  messages: Array<{
    id: string;
    from: string;
    to: string;
    type: string;
    payload: unknown;
    timestamp: Date;
  }>;

  // Active operations
  activeOperations: Map<
    string,
    {
      type: string;
      description: string;
      progress?: number;
      cancellable?: boolean;
    }
  >;

  // Editor state
  editorMode: "edit" | "preview" | "debug";
  zoomLevel: number;
  panPosition: { x: number; y: number };

  // Debug state
  debugEnabled: boolean;
  debugBreakpoints: string[];
  debugCurrentNode: string | null;
}

// Initial state
const initialSessionState: SessionState = {
  userId: null,
  userName: null,
  userRole: null,
  sessionStarted: new Date(),
  dragItem: null,
  dropTarget: null,
  isDragging: false,
  selection: null,
  multiSelectMode: false,
  clipboard: null,
  undoStack: [],
  redoStack: [],
  maxUndoItems: 50,
  tempData: new Map(),
  messages: [],
  activeOperations: new Map(),
  editorMode: "edit",
  zoomLevel: 1,
  panPosition: { x: 0, y: 0 },
  debugEnabled: false,
  debugBreakpoints: [],
  debugCurrentNode: null,
};

/**
 * Session Store wrapper class
 */
export class SessionStore {
  private zustandStore: ZustandStore<SessionState>;
  public actions: SessionActions;

  constructor(zustandStore: ZustandStore<SessionState>) {
    this.zustandStore = zustandStore;
    this.actions = new SessionActions(this);
  }

  /**
   * Get current state
   */
  getState(): SessionState & {
    canUndo: boolean;
    canRedo: boolean;
    viewport: { x: number; y: number; zoom: number };
  } {
    const state = this.zustandStore.getState();

    // Add computed properties for backward compatibility
    return {
      ...state,
      // Computed properties
      get canUndo(): boolean {
        return state.undoStack.length > 0;
      },
      get canRedo(): boolean {
        return state.redoStack.length > 0;
      },
      get viewport(): { x: number; y: number; zoom: number } {
        return {
          x: state.panPosition.x,
          y: state.panPosition.y,
          zoom: state.zoomLevel,
        };
      },
    };
  }

  /**
   * Update state
   */
  setState(updater: StateUpdater<SessionState>): void {
    this.zustandStore.setState(updater);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: SessionState) => void): () => void {
    return this.zustandStore.subscribe(callback);
  }
}

/**
 * Create the session store
 */
export function createSessionStore(): SessionStore {
  const zustandStore = storeClient.createZustandStore<SessionState>({
    initialState: initialSessionState,
    persist: false, // Session data is not persisted
  });

  return new SessionStore(zustandStore);
}

/**
 * Session store actions
 */
export class SessionActions {
  private store: SessionStore;

  constructor(store: SessionStore) {
    this.store = store;
  }

  /**
   * Set user session info
   */
  setUserSession(userId: string, userName: string, userRole: string): void {
    this.store.setState((state) => ({
      ...state,
      userId,
      userName,
      userRole,
      sessionStarted: new Date(),
    }));
  }

  /**
   * Clear user session
   */
  clearUserSession(): void {
    this.store.setState((state) => ({
      ...state,
      userId: null,
      userName: null,
      userRole: null,
    }));
  }

  /**
   * Start drag operation
   */
  startDrag(item: DragItem): void {
    this.store.setState((state) => ({
      ...state,
      dragItem: item,
      isDragging: true,
    }));
  }

  /**
   * Update drop target
   */
  setDropTarget(targetId: string | null): void {
    this.store.setState((state) => ({
      ...state,
      dropTarget: targetId,
    }));
  }

  /**
   * Update drag position
   */
  updateDragPosition(x: number, y: number): void {
    this.store.setState((state) => {
      if (!state.dragItem) return state;

      return {
        ...state,
        dragItem: {
          ...state.dragItem,
          position: { x, y },
        },
      };
    });
  }

  /**
   * End drag operation
   */
  endDrag(): void {
    this.store.setState((state) => ({
      ...state,
      dragItem: null,
      dropTarget: null,
      isDragging: false,
    }));
  }

  /**
   * Set selection
   */
  setSelection(selection: Selection | null): void {
    this.store.setState((state) => ({
      ...state,
      selection,
    }));
  }

  /**
   * Add to selection
   */
  addToSelection(items: string[]): void {
    this.store.setState((state) => {
      const currentSelection = state.selection;

      if (!currentSelection) {
        return {
          ...state,
          selection: {
            type: items.length > 1 ? "multiple" : "node",
            ids: items,
            // Support legacy 'items' property for tests
            get items() {
              return this.ids;
            },
          } as Selection & { items?: string[] },
        };
      }

      const newIds = [...new Set([...currentSelection.ids, ...items])];
      return {
        ...state,
        selection: {
          ...currentSelection,
          type: newIds.length > 1 ? "multiple" : currentSelection.type,
          ids: newIds,
          // Support legacy 'items' property for tests
          get items() {
            return this.ids;
          },
        } as Selection & { items?: string[] },
      };
    });
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.store.setState((state) => ({
      ...state,
      selection: null,
    }));
  }

  /**
   * Remove from selection
   */
  removeFromSelection(items: string[]): void {
    this.store.setState((state) => {
      const currentSelection = state.selection;
      if (!currentSelection) return state;

      const itemsSet = new Set(items);
      const newIds = currentSelection.ids.filter(
        (itemId) => !itemsSet.has(itemId),
      );

      if (newIds.length === 0) {
        return { ...state, selection: null };
      }

      return {
        ...state,
        selection: {
          ...currentSelection,
          type: newIds.length > 1 ? "multiple" : "node",
          ids: newIds,
          // Support legacy 'items' property for tests
          get items() {
            return this.ids;
          },
        } as Selection & { items?: string[] },
      };
    });
  }

  /**
   * Toggle selection
   */
  toggleSelection(id: string): void {
    this.store.setState((state) => {
      const currentSelection = state.selection;

      if (!currentSelection) {
        return {
          ...state,
          selection: {
            type: "node",
            ids: [id],
            // Support legacy 'items' property for tests
            get items() {
              return this.ids;
            },
          } as Selection & { items?: string[] },
        };
      }

      const hasItem = currentSelection.ids.includes(id);

      if (hasItem) {
        const newIds = currentSelection.ids.filter((itemId) => itemId !== id);
        return {
          ...state,
          selection:
            newIds.length > 0
              ? ({
                  ...currentSelection,
                  type: newIds.length > 1 ? "multiple" : "node",
                  ids: newIds,
                  // Support legacy 'items' property for tests
                  get items() {
                    return this.ids;
                  },
                } as Selection & { items?: string[] })
              : null,
        };
      } else {
        const newIds = [...currentSelection.ids, id];
        return {
          ...state,
          selection: {
            ...currentSelection,
            type: newIds.length > 1 ? "multiple" : "node",
            ids: newIds,
            // Support legacy 'items' property for tests
            get items() {
              return this.ids;
            },
          } as Selection & { items?: string[] },
        };
      }
    });
  }

  /**
   * Toggle multi-select mode
   */
  toggleMultiSelectMode(): void {
    this.store.setState((state) => ({
      ...state,
      multiSelectMode: !state.multiSelectMode,
    }));
  }

  /**
   * Copy to clipboard
   */
  copyToClipboard(
    type: Clipboard["type"],
    data: unknown,
    source: string,
  ): void {
    this.store.setState((state) => ({
      ...state,
      clipboard: {
        type,
        data,
        timestamp: new Date(),
        source,
      },
    }));
  }

  /**
   * Cut to clipboard
   */
  cutToClipboard(type: Clipboard["type"], data: unknown, source: string): void {
    this.store.setState((state) => ({
      ...state,
      clipboard: {
        type,
        data,
        timestamp: new Date(),
        source,
        isCut: true, // Mark as cut operation
      },
    }));
  }

  /**
   * Clear clipboard
   */
  clearClipboard(): void {
    this.store.setState((state) => ({
      ...state,
      clipboard: null,
    }));
  }

  /**
   * Add undo item
   */
  addUndoItem(item: Omit<UndoItem, "timestamp">): void {
    this.store.setState((state) => {
      const newUndoStack = [
        ...state.undoStack,
        { ...item, timestamp: new Date() },
      ].slice(-state.maxUndoItems);

      return {
        ...state,
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack on new action
      };
    });
  }

  /**
   * Add undo action (alias for addUndoItem)
   */
  addUndoAction(item: Omit<UndoItem, "timestamp">): void {
    this.addUndoItem(item);
  }

  /**
   * Perform undo
   */
  undo(): UndoItem | null {
    let undoItem: UndoItem | null = null;

    this.store.setState((state) => {
      if (state.undoStack.length === 0) return state;

      const newUndoStack = [...state.undoStack];
      undoItem = newUndoStack.pop()!;

      return {
        ...state,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, undoItem],
      };
    });

    return undoItem;
  }

  /**
   * Clear undo/redo history
   */
  clearUndoHistory(): void {
    this.store.setState((state) => ({
      ...state,
      undoStack: [],
      redoStack: [],
    }));
  }

  /**
   * Perform redo
   */
  redo(): UndoItem | null {
    let redoItem: UndoItem | null = null;

    this.store.setState((state) => {
      if (state.redoStack.length === 0) return state;

      const newRedoStack = [...state.redoStack];
      redoItem = newRedoStack.pop()!;

      return {
        ...state,
        undoStack: [...state.undoStack, redoItem],
        redoStack: newRedoStack,
      };
    });

    return redoItem;
  }

  /**
   * Set temporary data
   */
  setTempData(key: string, value: unknown): void {
    this.store.setState((state) => {
      const newTempData = new Map(state.tempData);
      newTempData.set(key, value);
      return {
        ...state,
        tempData: newTempData,
      };
    });
  }

  /**
   * Get temporary data
   */
  getTempData(key: string): unknown {
    return this.store.getState().tempData.get(key);
  }

  /**
   * Clear temporary data
   */
  clearTempData(key?: string): void {
    this.store.setState((state) => {
      if (key) {
        const newTempData = new Map(state.tempData);
        newTempData.delete(key);
        return {
          ...state,
          tempData: newTempData,
        };
      }

      return {
        ...state,
        tempData: new Map(),
      };
    });
  }

  /**
   * Send message between components
   */
  sendMessage(from: string, to: string, type: string, payload: unknown): void {
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      type,
      payload,
      timestamp: new Date(),
    };

    this.store.setState((state) => ({
      ...state,
      messages: [...state.messages, message].slice(-100), // Keep last 100 messages
    }));
  }

  /**
   * Clear messages
   */
  clearMessages(to?: string): void {
    this.store.setState((state) => ({
      ...state,
      messages: to ? state.messages.filter((m) => m.to !== to) : [],
    }));
  }

  /**
   * Start operation
   */
  startOperation(
    id: string,
    type: string,
    description: string,
    cancellable = false,
  ): void {
    this.store.setState((state) => {
      const newOperations = new Map(state.activeOperations);
      newOperations.set(id, {
        type,
        description,
        progress: 0,
        cancellable,
      });
      return {
        ...state,
        activeOperations: newOperations,
      };
    });
  }

  /**
   * Update operation progress
   */
  updateOperationProgress(id: string, progress: number): void {
    this.store.setState((state) => {
      const operation = state.activeOperations.get(id);
      if (!operation) return state;

      const newOperations = new Map(state.activeOperations);
      newOperations.set(id, {
        ...operation,
        progress,
      });

      return {
        ...state,
        activeOperations: newOperations,
      };
    });
  }

  /**
   * End operation
   */
  endOperation(id: string): void {
    this.store.setState((state) => {
      const newOperations = new Map(state.activeOperations);
      newOperations.delete(id);
      return {
        ...state,
        activeOperations: newOperations,
      };
    });
  }

  /**
   * Set editor mode
   */
  setEditorMode(mode: SessionState["editorMode"]): void {
    this.store.setState((state) => ({
      ...state,
      editorMode: mode,
    }));
  }

  /**
   * Update editor viewport
   */
  updateViewport(
    zoomLevel?: number,
    panPosition?: { x: number; y: number },
  ): void {
    this.store.setState((state) => ({
      ...state,
      zoomLevel: zoomLevel ?? state.zoomLevel,
      panPosition: panPosition ?? state.panPosition,
    }));
  }

  /**
   * Set viewport position
   */
  setViewportPosition(x: number, y: number): void {
    this.updateViewport(undefined, { x, y });
  }

  /**
   * Set viewport zoom
   */
  setViewportZoom(zoom: number): void {
    const clampedZoom = Math.max(0.1, Math.min(5, zoom)); // Clamp between 0.1 and 5
    this.updateViewport(clampedZoom, undefined);
  }

  /**
   * Set viewport transform (combined position and zoom)
   */
  setViewportTransform(x: number, y: number, zoom: number): void {
    const clampedZoom = Math.max(0.1, Math.min(5, zoom));
    this.updateViewport(clampedZoom, { x, y });
  }

  /**
   * Reset viewport to default
   */
  resetViewport(): void {
    this.updateViewport(1, { x: 0, y: 0 });
  }

  /**
   * Toggle debug mode
   */
  toggleDebugMode(): void {
    this.store.setState((state) => ({
      ...state,
      debugEnabled: !state.debugEnabled,
    }));
  }

  /**
   * Add debug breakpoint
   */
  addBreakpoint(nodeId: string): void {
    this.store.setState((state) => ({
      ...state,
      debugBreakpoints: [...state.debugBreakpoints, nodeId],
    }));
  }

  /**
   * Remove debug breakpoint
   */
  removeBreakpoint(nodeId: string): void {
    this.store.setState((state) => ({
      ...state,
      debugBreakpoints: state.debugBreakpoints.filter((id) => id !== nodeId),
    }));
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.store.setState(() => ({
      ...initialSessionState,
      sessionStarted: new Date(),
    }));
  }
}

/**
 * Session store selectors
 */
export class SessionSelectors {
  /**
   * Check if selection exists
   */
  static hasSelection(state: SessionState): boolean {
    return state.selection !== null && state.selection.ids.length > 0;
  }

  /**
   * Get selected items
   */
  static getSelectedItems(state: SessionState): string[] {
    return state.selection?.ids || [];
  }

  /**
   * Check if clipboard has content
   */
  static hasClipboard(state: SessionState): boolean {
    return state.clipboard !== null;
  }

  /**
   * Check if drag is active
   */
  static isDragging(state: SessionState): boolean {
    return state.isDragging && state.dragItem !== null;
  }

  /**
   * Get viewport scale (zoom level)
   */
  static getViewportScale(state: SessionState): number {
    return state.zoomLevel || 1;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(state: SessionState): boolean {
    return state.userId !== null;
  }

  /**
   * Get messages for a component
   */
  static getMessagesFor(
    state: SessionState,
    componentId: string,
  ): SessionState["messages"] {
    return state.messages.filter((m) => m.to === componentId);
  }

  /**
   * Check if undo is available
   */
  static canUndo(state: SessionState): boolean {
    return state.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  static canRedo(state: SessionState): boolean {
    return state.redoStack.length > 0;
  }

  /**
   * Get active operation count
   */
  static getActiveOperationCount(state: SessionState): number {
    return state.activeOperations.size;
  }

  /**
   * Check if any operation is in progress
   */
  static hasActiveOperations(state: SessionState): boolean {
    return state.activeOperations.size > 0;
  }

  /**
   * Get session duration
   */
  static getSessionDuration(state: SessionState): number {
    return Date.now() - state.sessionStarted.getTime();
  }
}
