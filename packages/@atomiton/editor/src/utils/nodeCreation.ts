import {
  createNode as createAtomitonNode,
  getNodeByType,
} from "@atomiton/nodes";
import { generateEdgeId, generateNodeId } from "@atomiton/utils";
import type { EditorEdge } from "../hooks/useEditorEdges";
import type { EditorNode, NodePosition } from "../types/EditorNode";
// Note: nodeMapping is internal to editor package, not exported

// Re-export NodePosition for external use
export type { NodePosition } from "../types/EditorNode";

/**
 * Calculate the position for a new node based on existing nodes
 * This is an editor-specific UI concern
 */
export function calculateNodePosition(
  existingNodes: EditorNode[],
  explicitPosition?: NodePosition,
): NodePosition {
  if (explicitPosition) {
    return explicitPosition;
  }

  if (existingNodes.length === 0) {
    return { x: 100, y: 100 };
  }

  let maxX = -Infinity;
  let rightmostY = 100;

  for (const node of existingNodes) {
    if (node.position.x > maxX) {
      maxX = node.position.x;
      rightmostY = node.position.y;
    }
  }

  return {
    x: maxX + 200,
    y: rightmostY,
  };
}

/**
 * Create a new node with complete metadata and default values
 * This uses the nodes package factory for domain logic, then maps to editor representation
 */
export function createNode(
  nodeType: string,
  position: NodePosition,
  nodeId?: string,
): EditorNode {
  const id = nodeId || generateNodeId();
  const nodeDefinition = getNodeByType(nodeType);

  if (!nodeDefinition) {
    // Create a basic editor node when type is unknown
    return {
      id,
      type: nodeType,
      name: nodeType,
      category: "unknown",
      position,
      selected: true,
      draggable: true,
      selectable: true,
      connectable: true,
      deletable: true,
      data: {},
      parameters: {},
      metadata: {},
      inputPorts: [],
      outputPorts: [],
      settings: {
        ui: { position },
      },
    };
  }

  // Create the base node using the nodes package factory for domain logic
  const baseNode = createAtomitonNode({
    id,
    name: nodeDefinition.metadata?.name || nodeType,
    description: nodeDefinition.metadata?.description,
    category: nodeDefinition.metadata?.category,
    version: nodeDefinition.metadata?.version || "1.0.0",
    type: "atomic",
    inputPorts: nodeDefinition.inputPorts,
    outputPorts: nodeDefinition.outputPorts,
    metadata: nodeDefinition.metadata,
  });

  // Map the domain node to editor representation - inline transformation
  const editorNode: EditorNode = {
    ...baseNode,
    position,
    selected: true,
    draggable: true,
    selectable: true,
    connectable: true,
    deletable: true,
    data: { ...baseNode.data, ...baseNode }, // Include node properties for ReactFlow
    settings: {
      ...baseNode.settings,
      ui: { position },
    },
  };

  // Add any additional editor-specific data
  editorNode.type = nodeType; // Use the specific node type
  editorNode.parameters = nodeDefinition.parameters?.defaults || {};
  editorNode.data = nodeDefinition.parameters?.defaults || {};

  return editorNode;
}

/**
 * Create an edge connecting the last node to a new node
 * This is editor-specific connectivity logic
 */
export function createEdgeFromLastNode(
  lastNodeId: string,
  targetNodeId: string,
): EditorEdge {
  return {
    id: generateEdgeId(lastNodeId),
    source: lastNodeId,
    target: targetNodeId,
    type: "default",
  };
}

/**
 * Update nodes array to deselect all nodes and add the new one
 * This is editor-specific selection management
 */
export function updateNodesWithNewNode(
  existingNodes: EditorNode[],
  newNode: EditorNode,
): EditorNode[] {
  return [
    ...existingNodes.map((node) => ({ ...node, selected: false })),
    newNode,
  ];
}

/**
 * Update edges array by adding a new edge
 * This is editor-specific edge management
 */
export function updateEdgesWithNewEdge(
  existingEdges: EditorEdge[],
  newEdge: EditorEdge,
): EditorEdge[] {
  return [...existingEdges, newEdge];
}

/**
 * Creates a minimal EditorNode for testing or default scenarios.
 * Provides sensible defaults for both AtomitonNode and editor properties.
 */
export function createDefaultEditorNode(
  id: string,
  type: string,
  position: NodePosition,
): EditorNode {
  return {
    // AtomitonNode properties with defaults
    id,
    type,
    name: type,
    category: "default",
    version: "1.0.0",
    description: `Default ${type} node`,
    inputPorts: [],
    outputPorts: [],
    metadata: {},
    data: {},

    // Editor-specific properties
    position,
    selected: false,
    draggable: true,
    selectable: true,
    connectable: true,
    deletable: true,
  };
}
