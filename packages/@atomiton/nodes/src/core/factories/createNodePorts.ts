/**
 * Factory function for creating node ports
 */

import type { NodePort } from "#core/types/definition.js";
import type { NodePortDataType } from "#core/types/ports.js";
import { isNodePort } from "#core/utils/nodeUtils.js";

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

/**
 * Create a single node port
 * @param type - The port type (input, output, trigger, error)
 * @param options - The port configuration options or existing NodePort
 */
export function createNodePort(
  type: "input" | "output" | "trigger" | "error",
  options: NodePortInput | NodePort,
): NodePort {
  // Short-circuit if already a NodePort
  if (isNodePort(options)) {
    return options;
  }

  return {
    id: options.id,
    name: options.name,
    type,
    dataType: options.dataType,
    required: options.required ?? false,
    multiple: options.multiple ?? false,
    description: options.description,
    defaultValue: options.defaultValue,
  };
}

/**
 * Create input and output ports for a node
 */
export function createNodePorts(input?: NodePortsInput): INodePorts {
  return {
    input: (input?.input || []).map((p) => createNodePort("input", p)),
    output: (input?.output || []).map((p) => createNodePort("output", p)),
  };
}
export default createNodePorts;
