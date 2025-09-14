/**
 * Factory function for creating composite node ports
 *
 * Aggregates and exposes ports from child nodes
 */

import type { INode, CompositeEdge } from "../base/INode";
import type { INodePorts } from "../base/createNodePorts";
import type { NodePortDefinition } from "../types";

export type CompositePortsInput = {
  nodes: INode[];
  edges: CompositeEdge[];
};

export function createCompositePorts(input: CompositePortsInput): INodePorts {
  return {
    get input(): NodePortDefinition[] {
      // Collect input ports from child nodes that aren't connected
      const connectedInputs = new Set(
        input.edges.map(
          (edge) => `${edge.target.nodeId}.${edge.target.portId}`,
        ),
      );

      const ports: NodePortDefinition[] = [];
      for (const node of input.nodes) {
        for (const port of node.inputPorts) {
          const portKey = `${node.id}.${port.id}`;
          if (!connectedInputs.has(portKey)) {
            ports.push({
              ...port,
              id: `${node.id}_${port.id}`,
              name: `${node.name} - ${port.name}`,
            });
          }
        }
      }
      return ports;
    },

    get output(): NodePortDefinition[] {
      // Collect output ports from child nodes
      const ports: NodePortDefinition[] = [];
      for (const node of input.nodes) {
        for (const port of node.outputPorts) {
          ports.push({
            ...port,
            id: `${node.id}_${port.id}`,
            name: `${node.name} - ${port.name}`,
          });
        }
      }
      return ports;
    },
  };
}
