import type {
  NodeFieldsConfig,
  NodeMetadata,
  NodePort,
} from "@atomiton/nodes/definitions";
import type { NodeExecutionState } from "@atomiton/conductor/browser";
import type { Node as ReactFlowNode } from "@xyflow/react";

/**
 * Enhanced port with pre-calculated position for performance
 */
export type EditorNodePort = NodePort & {
  position: {
    top: string;
  };
};

/**
 * Data passed to React Flow node components
 * Contains everything needed to render and configure a node
 */
export type NodeData = {
  name: string;
  metadata: NodeMetadata;
  parameters: Record<string, unknown>; // Current parameter values
  fields: NodeFieldsConfig; // UI field configurations
  inputPorts: EditorNodePort[];
  outputPorts: EditorNodePort[];
  // Execution state fields (optional - only used during execution visualization)
  // Import NodeExecutionState from @atomiton/conductor/browser
  executionState?: NodeExecutionState;
  isCriticalPath?: boolean;
  weight?: number;
};

/**
 * EditorNode is a React Flow node with our specific data structure
 * Decoupled from AtomitonNode to avoid confusion and duplication
 *
 * For execution state visualization, add data attributes to the node:
 * - data-execution-state: NodeExecutionState value
 * - data-critical-path: "true" | "false"
 *
 * Example:
 * ```ts
 * const node: EditorNode = {
 *   id: '1',
 *   type: 'default',
 *   position: { x: 0, y: 0 },
 *   data: { executionState: 'executing', ...},
 *   'data-execution-state': 'executing',  // Add this for CSS styling
 *   'data-critical-path': 'true',         // Add this for critical path styling
 * };
 * ```
 */
export type EditorNode = ReactFlowNode<NodeData> & {
  /** Data attribute for execution state styling (applied to .react-flow__node wrapper) */
  "data-execution-state"?: NodeExecutionState;
  /** Data attribute for critical path styling (applied to .react-flow__node wrapper) */
  "data-critical-path"?: "true" | "false";
};

/**
 * Position type for node placement
 */
export type NodePosition = {
  x: number;
  y: number;
};

/**
 * Type guard to check if a node is an EditorNode
 */
export function isEditorNode(node: unknown): node is EditorNode {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const n = node as Record<string, unknown>;

  // Check React Flow required fields
  if (typeof n.id !== "string" || typeof n.type !== "string") {
    return false;
  }

  // Check position
  const position = n.position as Record<string, unknown>;
  if (
    typeof n.position !== "object" ||
    n.position === null ||
    typeof position.x !== "number" ||
    typeof position.y !== "number" ||
    !Number.isFinite(position.x) ||
    !Number.isFinite(position.y)
  ) {
    return false;
  }

  // Check data structure
  const data = n.data as Record<string, unknown>;
  if (
    typeof n.data !== "object" ||
    n.data === null ||
    typeof data.name !== "string" ||
    !data.metadata ||
    !data.parameters ||
    !Array.isArray(data.inputPorts) ||
    !Array.isArray(data.outputPorts) ||
    typeof data.fields !== "object" ||
    data.fields === null
  ) {
    return false;
  }

  return true;
}
