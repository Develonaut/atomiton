/**
 * Dagre auto-layout utilities for ReactFlow graphs
 *
 * Provides automatic node positioning using the Dagre graph layout algorithm.
 * Supports left-to-right (LR) and top-to-bottom (TB) layouts.
 */

import dagre from "@dagrejs/dagre";
import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";

export type LayoutDirection = "LR" | "TB";

export type LayoutOptions = {
  direction?: LayoutDirection;
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
};

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: "LR", // Left-to-right as requested
  nodeWidth: 150,
  nodeHeight: 80,
  rankSep: 100,
  nodeSep: 50,
};

/**
 * Apply dagre auto-layout to ReactFlow nodes and edges
 *
 * @param nodes - ReactFlow nodes to layout
 * @param edges - ReactFlow edges defining connections
 * @param options - Layout configuration options
 * @returns New nodes and edges with calculated positions
 *
 * @example
 * ```typescript
 * const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
 *   nodes,
 *   edges,
 *   { direction: 'LR', rankSep: 100 }
 * );
 * ```
 */
export function getLayoutedElements<T extends Record<string, unknown> = Record<string, unknown>>(
  nodes: ReactFlowNode<T>[],
  edges: ReactFlowEdge[],
  options: LayoutOptions = {},
): { nodes: ReactFlowNode<T>[]; edges: ReactFlowEdge[] } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create dagre graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run dagre layout algorithm
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        // Center the node at the calculated position
        x: nodeWithPosition.x - opts.nodeWidth / 2,
        y: nodeWithPosition.y - opts.nodeHeight / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

/**
 * Calculate bounding box for a set of nodes
 * Useful for viewport fitting after layout
 *
 * @param nodes - ReactFlow nodes
 * @returns Bounding box { x, y, width, height }
 */
export function getNodesBounds(nodes: ReactFlowNode[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  nodes.forEach((node) => {
    const { x, y } = node.position;
    const width = (node.width as number) || DEFAULT_OPTIONS.nodeWidth;
    const height = (node.height as number) || DEFAULT_OPTIONS.nodeHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
