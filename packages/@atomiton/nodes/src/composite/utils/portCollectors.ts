/**
 * Utility functions for collecting ports from composite nodes
 * These functions handle the logic for determining which ports
 * should be exposed from a composite node based on its child nodes
 */

import type { CompositeEdge, INode } from "../../base/INode";
import type { NodePortDefinition } from "../../types";

/**
 * Create a composite port from a child node's port
 * This is the common logic shared between input and output ports
 */
function createCompositePort(
  node: INode,
  port: NodePortDefinition,
): NodePortDefinition {
  return {
    ...port,
    id: formatCompositePortId(node.id, port.id),
    name: formatCompositePortName(node.name, port.name),
  };
}

/**
 * Factory for creating a composite input port
 */
export function createCompositeInputPort(
  node: INode,
  port: NodePortDefinition,
): NodePortDefinition {
  return createCompositePort(node, port);
}

/**
 * Factory for creating a composite output port
 */
export function createCompositeOutputPort(
  node: INode,
  port: NodePortDefinition,
): NodePortDefinition {
  return createCompositePort(node, port);
}

/**
 * Collect unconnected input ports from child nodes
 * These become the input ports of the composite node
 */
export function collectUnconnectedInputPorts(
  nodes: INode[],
  edges: CompositeEdge[],
): NodePortDefinition[] {
  // Build a set of connected input ports (target ports in edges)
  const connectedInputs = new Set(
    edges.map((edge) => `${edge.target}.${edge.targetHandle || "input"}`),
  );

  const ports: NodePortDefinition[] = [];

  for (const node of nodes) {
    // Check if node has inputPorts and it's iterable
    if (!node.inputPorts || !Array.isArray(node.inputPorts)) {
      continue;
    }

    for (const port of node.inputPorts) {
      const portKey = `${node.id}.${port.id}`;

      // Only expose ports that aren't connected internally
      if (!connectedInputs.has(portKey)) {
        ports.push(createCompositeInputPort(node, port));
      }
    }
  }

  return ports;
}

/**
 * Collect all output ports from child nodes
 * These become the output ports of the composite node
 */
export function collectOutputPorts(nodes: INode[]): NodePortDefinition[] {
  const ports: NodePortDefinition[] = [];

  for (const node of nodes) {
    // Check if node has outputPorts and it's iterable
    if (!node.outputPorts || !Array.isArray(node.outputPorts)) {
      continue;
    }

    for (const port of node.outputPorts) {
      ports.push(createCompositeOutputPort(node, port));
    }
  }

  return ports;
}

/**
 * Build a map of connected ports for quick lookup
 */
export function buildConnectedPortsMap(edges: CompositeEdge[]): {
  inputs: Set<string>;
  outputs: Set<string>;
} {
  const inputs = new Set<string>();
  const outputs = new Set<string>();

  for (const edge of edges) {
    inputs.add(`${edge.target}.${edge.targetHandle || "input"}`);
    outputs.add(`${edge.source}.${edge.sourceHandle || "output"}`);
  }

  return { inputs, outputs };
}

/**
 * Format a port ID for a composite node
 */
export function formatCompositePortId(nodeId: string, portId: string): string {
  return `${nodeId}_${portId}`;
}

/**
 * Format a port name for a composite node
 */
export function formatCompositePortName(
  nodeName: string,
  portName: string,
): string {
  return `${nodeName} - ${portName}`;
}
