/**
 * Factory function for creating composite node ports
 *
 * Aggregates and exposes ports from child nodes
 */

import type { INode, CompositeEdge } from "../base/INode";
import type { INodePorts } from "../base/createNodePorts";
import {
  collectUnconnectedInputPorts,
  collectOutputPorts,
} from "./utils/portCollectors";

export type CompositePortsInput = {
  nodes: INode[];
  edges: CompositeEdge[];
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
