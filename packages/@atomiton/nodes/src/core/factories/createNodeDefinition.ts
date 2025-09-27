/**
 * createNodeDefinition - Universal factory for creating node definitions
 *
 * A node is a node is a node. This factory creates any node definition
 * by combining its parts (metadata, parameters, ports, etc).
 */

import createNodeMetadata, {
  type NodeMetadataInput,
} from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodePortInput } from "#core/factories/createNodePorts";
import createNodePorts from "#core/factories/createNodePorts";
import { isNodeParameters } from "#core/utils/nodeUtils";
import type {
  NodeDefinition,
  NodeEdge,
  NodeMetadata,
  NodeParameters,
  NodePort,
} from "#core/types/definition.js";
import { generateNodeId } from "@atomiton/utils";

export type CreateNodeInput = {
  id?: string;
  type?: string;
  version?: string;
  parentId?: string;
  name?: string;
  position?: { x: number; y: number };
  metadata?: NodeMetadata | NodeMetadataInput;
  parameters?: NodeParameters | Parameters<typeof createNodeParameters>[0];
  inputPorts?: NodePort[] | NodePortInput[];
  outputPorts?: NodePort[] | NodePortInput[];
  nodes?: NodeDefinition[];
  edges?: NodeEdge[];
};

/**
 * Create a node definition
 *
 * Simple factory that combines parts into a node.
 * Delegates validation and creation to sub-factories.
 */
function createNodeDefinition(input: CreateNodeInput): NodeDefinition {
  const id = input.id || generateNodeId();
  const type = input.type || "unknown";
  const version = input.version || "1.0.0";
  const parentId = input.parentId;

  const name =
    input.name ||
    (input.metadata && "name" in input.metadata
      ? input.metadata.name
      : undefined) ||
    "Unnamed Node";
  const position = input.position || { x: 0, y: 0 };
  const metadata = createNodeMetadata(input.metadata || {});
  const parameters = isNodeParameters(input.parameters)
    ? input.parameters
    : createNodeParameters(input.parameters || {}, undefined);

  const ports = createNodePorts({
    input: input.inputPorts,
    output: input.outputPorts,
  });

  const node: NodeDefinition = {
    id,
    type,
    version,
    parentId,
    name,
    position,
    metadata,
    parameters,
    inputPorts: ports.input,
    outputPorts: ports.output,
  };

  // Add nodes/edges if provided (makes this a container/group node)
  if (input.nodes) {
    node.nodes = input.nodes;
  }
  if (input.edges) {
    node.edges = input.edges;
  }

  return node;
}

export { createNodeDefinition };

export default createNodeDefinition;
