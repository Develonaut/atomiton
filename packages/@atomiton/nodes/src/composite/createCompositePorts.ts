/**
 * Factory function for creating composite node ports
 *
 * Aggregates and exposes ports from child nodes
 */

import type {
  IExecutableNode,
  CompositeEdge,
} from "../interfaces/IExecutableNode";
import type { NodePortDefinition } from "../types";
import {
  collectUnconnectedInputPorts,
  collectOutputPorts,
} from "./utils/portCollectors";

export type CompositePortsInput = {
  nodes: IExecutableNode[];
  edges: CompositeEdge[];
};

export type INodePorts = {
  input: NodePortDefinition[];
  output: NodePortDefinition[];
};

export function createCompositePorts(input: CompositePortsInput): INodePorts {
  return {
    get input() {
      return collectUnconnectedInputPorts(input.nodes, input.edges);
    },

    get output() {
      return collectOutputPorts(input.nodes);
    },
  };
}
