import type { Node, Edge } from "@xyflow/react";

/**
 * Editor configuration options
 */
export interface EditorConfig {
  /**
   * Called when the editor state should be saved
   */
  onSave?: (state: {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string | null;
    isLoading: boolean;
    isDirty: boolean;
  }) => Promise<void>;
  /**
   * Called when the editor state should be loaded
   */
  onLoad?: () => Promise<{
    nodes: Node[];
    edges: Edge[];
  }>;
  /**
   * Whether auto-save is enabled
   */
  autoSave?: boolean;
  /**
   * Auto-save interval in milliseconds
   */
  autoSaveInterval?: number;
  /**
   * Whether undo/redo is enabled
   */
  enableHistory?: boolean;
  /**
   * Maximum history size
   */
  maxHistorySize?: number;
}
