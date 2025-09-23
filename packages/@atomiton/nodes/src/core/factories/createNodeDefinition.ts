/**
 * createNode - Universal factory for creating node definitions
 *
 * A node is a node is a node. This factory creates any node definition
 * by combining its parts (metadata, parameters, ports, etc).
 */

import { generateNodeId } from "@atomiton/utils";

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
import type { NodeMetadata, NodeParameters, Node } from "../types/definition.js";
import createNodeMetadata, {
  type NodeMetadataInput,
} from "./createNodeMetadata";
import type { INodePorts } from "./createNodePorts";
import createNodePorts from "./createNodePorts";

export type CreateNodeInput = {
  // Basic info
  id?: string;
  type?: "atomic" | "composite";
  name?: string;
  position?: { x: number; y: number };

  metadata?: NodeMetadata | Record<string, unknown>;
  parameters?: NodeParameters | Record<string, unknown>;
  ports?: INodePorts | Record<string, unknown>;

  // Composite-specific
  children?: Node[];
  edges?: [];
};

/**
 * Create a node definition
 *
 * Simple factory that combines parts into a node.
 * No complex logic - just assembles the pieces.
 */
function createNode(input: CreateNodeInput): Node {
  const id = input.id || generateNodeId();
  const type = input.type || "composite";

  // Extract name from metadata if not provided
  const name: string =
    input.name ||
    (input.metadata as NodeMetadataInput)?.name ||
    `${titleCase(type)} Node`;

  // Ensure metadata has required fields, using appropriate default variant
  const metadataWithDefaults: NodeMetadataInput = {
    ...(input.metadata as NodeMetadataInput),
    variant: (input.metadata as NodeMetadataInput)?.variant || "test",
    name: name,
    description:
      (input.metadata as NodeMetadataInput)?.description || `${name} node`,
    category: (input.metadata as NodeMetadataInput)?.category || "utility",
    icon: (input.metadata as NodeMetadataInput)?.icon || "code-2",
  };

  const ports = createNodePorts({
    input: (input.ports as INodePorts)?.input || [],
    output: (input.ports as INodePorts)?.output || [],
  });

  // Simple assembly - a node is just its parts combined
  const node: Node = {
    id,
    name,
    type,
    position: input.position || { x: 0, y: 0 },
    metadata: createNodeMetadata(metadataWithDefaults),
    parameters: (input.parameters as NodeParameters) || ({} as NodeParameters),
    inputPorts: ports.input,
    outputPorts: ports.output,
  };

  // Add children/edges for composite nodes
  if (type === "composite") {
    node.children = input.children || [];
    node.edges = input.edges || [];
  }

  return node;
}

export default createNode;
export { createNode };
export { createNode as createNodeDefinition };
