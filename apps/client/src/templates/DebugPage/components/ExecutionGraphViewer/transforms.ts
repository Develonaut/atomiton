import type { NodeProgressEvent } from "@atomiton/conductor/browser";
import {
  getLayoutedElements,
  type EditorEdge,
  type EditorNode,
} from "@atomiton/editor";
import type { NodeMetadata } from "@atomiton/nodes/definitions";

/**
 * Create minimal metadata for execution visualization
 */
function createExecutionNodeMetadata(
  nodeId: string,
  nodeName: string,
  nodeType: string,
): NodeMetadata {
  return {
    id: nodeId,
    name: nodeName,
    author: "system",
    description: `${nodeType} node`,
    category: "group",
    icon: "layers",
    keywords: [],
    tags: [],
  };
}

/**
 * Transform progress event node into EditorNode with execution state
 */
function transformToEditorNode(
  node: NodeProgressEvent["nodes"][number],
  criticalPath: string[],
): EditorNode {
  const metadata = createExecutionNodeMetadata(node.id, node.name, node.type);
  const isCriticalPath = criticalPath.includes(node.id);

  return {
    id: node.id,
    type: "default",
    position: { x: 0, y: 0 }, // Will be calculated by layout
    data: {
      name: node.name,
      metadata,
      parameters: {},
      fields: {},
      inputPorts: [],
      outputPorts: [],
      // Execution state fields
      executionState: node.state,
      isCriticalPath,
      weight: node.weight,
    },
    // Data attributes for CSS styling
    "data-execution-state": node.state,
    "data-critical-path": isCriticalPath ? "true" : "false",
  };
}

/**
 * Transform progress event edges into EditorEdge format
 */
function transformToEditorEdges(
  edges: Array<{ from: string; to: string }>,
): EditorEdge[] {
  return edges.map((edge, index) => ({
    id: `edge-${edge.from}-${edge.to}-${index}`,
    source: edge.from,
    target: edge.to,
  }));
}

/**
 * Transform progress event into layouted nodes and edges
 *
 * This is the main transformation function that:
 * 1. Extracts nodes and critical path from the progress event
 * 2. Transforms each node into EditorNode format with execution state
 * 3. Transforms edges into EditorEdge format
 * 4. Applies auto-layout (left-to-right) to position nodes
 *
 * @param event - Progress event from conductor
 * @returns Layouted nodes and edges ready for rendering
 */
export function transformProgressEvent(event: NodeProgressEvent): {
  nodes: EditorNode[];
  edges: EditorEdge[];
} {
  // Defensive check: validate event structure
  if (!event?.nodes || !Array.isArray(event.nodes)) {
    console.error("Invalid progress event: missing nodes array", event);
    return { nodes: [], edges: [] };
  }

  if (!event?.graph) {
    console.error("Invalid progress event: missing graph data", event);
    return { nodes: [], edges: [] };
  }

  try {
    const criticalPath = event.graph.criticalPath ?? [];

    // Transform nodes
    const executionNodes = event.nodes.map((node) =>
      transformToEditorNode(node, criticalPath),
    );

    // Transform edges
    const editorEdges = transformToEditorEdges(event.graph.edges ?? []);

    // Apply auto-layout (left-to-right)
    return getLayoutedElements(executionNodes, editorEdges, {
      direction: "LR",
    });
  } catch (error) {
    console.error("Error transforming progress event:", error);
    return { nodes: [], edges: [] };
  }
}
