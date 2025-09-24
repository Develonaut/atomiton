import type { Node as AtomitonNode } from "@atomiton/nodes/definitions";
import type { Node as ReactFlowNode } from "@xyflow/react";

/**
 * EditorNode extends AtomitonNode with editor-specific properties.
 * Ensures compatibility with ReactFlow while maintaining domain properties.
 */
export type EditorNode = AtomitonNode & {
  // ReactFlow requires a type field
  type: string;

  // Make data required for ReactFlow compatibility
  data: Record<string, unknown>;

  // Editor position - required for ReactFlow
  position: {
    x: number;
    y: number;
  };

  // Editor-specific properties
  selected?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  deletable?: boolean;
  focusable?: boolean;
  hidden?: boolean;
  dragging?: boolean;
  resizing?: boolean;
  zIndex?: number;
  ariaLabel?: string;

  // React Flow compatibility
  style?: React.CSSProperties;
  className?: string;
  sourcePosition?: ReactFlowNode["sourcePosition"];
  targetPosition?: ReactFlowNode["targetPosition"];
  dragHandle?: string;
  parentId?: string;
  parentNode?: string;
  expandParent?: boolean;
  extent?: ReactFlowNode["extent"];
  positionAbsolute?: {
    x: number;
    y: number;
  };
  measured?: ReactFlowNode["measured"];
  width?: number;
  height?: number;
};

/**
 * Type guard to check if a node is an EditorNode
 */
export function isEditorNode(node: unknown): node is EditorNode {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const n = node as Record<string, unknown>;
  const position = n.position as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.type === "string" &&
    typeof n.position === "object" &&
    n.position !== null &&
    typeof position.x === "number" &&
    typeof position.y === "number" &&
    Number.isFinite(position.x) &&
    Number.isFinite(position.y)
  );
}

/**
 * Position type for node placement
 */
export type NodePosition = {
  x: number;
  y: number;
};
