/**
 * Session Store Types
 */

export interface DragItem {
  type: "node" | "connection" | "blueprint" | "file";
  id: string;
  data: unknown;
  source: string;
}

export interface Selection {
  type: "single" | "multiple";
  items: Array<{ id: string; type: string }>;
}

export interface Clipboard {
  type: string;
  data: unknown;
  timestamp: Date;
}

export interface UndoItem {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  data: {
    before: unknown;
    after: unknown;
  };
}

export interface SessionState {
  dragItem: DragItem | null;
  selection: Selection | null;
  clipboard: Clipboard | null;
  undoStack: UndoItem[];
  redoStack: UndoItem[];
  hoveredNodeId: string | null;
  focusedElementId: string | null;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    items: Array<{ id: string; label: string }>;
  } | null;
  commandPalette: {
    visible: boolean;
    searchQuery: string;
  };
  shortcuts: Map<string, string>;
  activeKeys: Set<string>;
  mousePosition: { x: number; y: number };
  scrollPosition: { x: number; y: number };
  zoomLevel: number;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
}
