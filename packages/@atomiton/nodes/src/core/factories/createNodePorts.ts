/**
 * Factory function for creating atomic node ports
 */

import type { NodePortDataType, NodePort } from "../types/definition.js";

export type NodePortInput = {
  id: string;
  name: string;
  dataType: NodePortDataType;
  required?: boolean;
  multiple?: boolean;
  description?: string;
  defaultValue?: unknown;
};

export type NodePortsInput = {
  input?: NodePortInput[];
  output?: NodePortInput[];
};

export type INodePorts = {
  input: NodePort[];
  output: NodePort[];
};

function createNodePorts(input: NodePortsInput): INodePorts {
  const createPort = (
    port: NodePortInput,
    type: "input" | "output",
  ): NodePort => ({
    id: port.id,
    name: port.name,
    type,
    dataType: port.dataType,
    required: port.required ?? false,
    multiple: port.multiple ?? false,
    description: port.description,
    defaultValue: port.defaultValue,
  });

  return {
    input: (input.input || []).map((p) => createPort(p, "input")),
    output: (input.output || []).map((p) => createPort(p, "output")),
  };
}

export { createNodePorts };
export default createNodePorts;
