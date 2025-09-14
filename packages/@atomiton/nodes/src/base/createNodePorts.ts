/**
 * Factory function for creating type-safe node ports
 */

import type { NodePortDefinition } from "../types";
import type { PortDataType } from "./types";

export type NodePortInput = {
  id: string;
  name: string;
  dataType: PortDataType;
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
  input: NodePortDefinition[];
  output: NodePortDefinition[];
};

export function createNodePorts(input: NodePortsInput): INodePorts {
  const createPort = (
    port: NodePortInput,
    type: "input" | "output",
  ): NodePortDefinition => ({
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
