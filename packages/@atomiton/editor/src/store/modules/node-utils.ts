/**
 * Domain: Node Utilities
 *
 * Purpose: Pure utility functions for node operations
 *
 * Responsibilities:
 * - Node position calculation
 * - Node creation logic
 * - Selection state management
 * - Auto-connection logic
 */

import type { Edge, Node } from "@xyflow/react";

export interface NodeCreationOptions {
  nodeType: string;
  position?: { x: number; y: number };
  selected?: boolean;
}

export const generateNodeId = (): string => {
  return `node-${Date.now()}`;
};

export const calculateNodePosition = (
  existingNodes: Node[],
  fallbackPosition = { x: 100, y: 100 },
): { x: number; y: number } => {
  if (existingNodes.length === 0) {
    return fallbackPosition;
  }

  const rightmostNode = existingNodes.reduce((prev, current) =>
    prev.position.x > current.position.x ? prev : current,
  );

  return {
    x: rightmostNode.position.x + 200,
    y: rightmostNode.position.y,
  };
};

export const createNode = (
  options: NodeCreationOptions,
  existingNodes: Node[],
): Node => {
  const nodeId = generateNodeId();
  const nodePosition = options.position || calculateNodePosition(existingNodes);

  return {
    id: nodeId,
    type: options.nodeType,
    position: nodePosition,
    data: {},
    selected: options.selected ?? true,
  };
};

export const updateNodeSelection = (
  nodes: Node[],
  selectedNodeId: string,
): Node[] => {
  return nodes.map((node) => ({
    ...node,
    selected: node.id === selectedNodeId,
  }));
};

export const createAutoConnection = (
  existingNodes: Node[],
  newNodeId: string,
): Edge | null => {
  if (existingNodes.length === 0) {
    return null;
  }

  const lastNode = existingNodes[existingNodes.length - 1];

  return {
    id: `edge-${lastNode.id}-${newNodeId}`,
    source: lastNode.id,
    target: newNodeId,
    type: "default",
  };
};

export const prepareNodeAddition = (
  options: NodeCreationOptions,
  existingNodes: Node[],
  existingEdges: Edge[],
): {
  newNode: Node;
  updatedNodes: Node[];
  updatedEdges: Edge[];
} => {
  const newNode = createNode(options, existingNodes);
  const updatedNodes = [
    ...updateNodeSelection(existingNodes, newNode.id),
    newNode,
  ];

  const autoEdge = createAutoConnection(existingNodes, newNode.id);
  const updatedEdges = autoEdge ? [...existingEdges, autoEdge] : existingEdges;

  return {
    newNode,
    updatedNodes,
    updatedEdges,
  };
};
