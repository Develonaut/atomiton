/**
 * Unified public factory for creating nodes
 *
 * This is the single public API for creating any type of node.
 * It returns a Node data structure (not a runtime instance).
 * The atomic/composite distinction is handled internally.
 */

import { generateNodeId } from "@atomiton/utils";
import type { CompositeDefinition, CompositeNodeSpec } from "./composite/types";
import type { Node, NodeEdge } from "./types";
import {
  createVersionLock,
  parseVersion,
  validateInitialVersion,
} from "./validation/version";

export type CreateNodeInput = {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;

  type?: "atomic" | "composite";

  nodes?: CompositeNodeSpec[];
  edges?: NodeEdge[];
  variables?: Record<string, unknown>;

  inputPorts?: Node["inputPorts"];
  outputPorts?: Node["outputPorts"];

  settings?: Node["settings"];
  metadata?: Partial<Node["metadata"]>;
};

export function createNode(
  input: CreateNodeInput & { type: "composite" },
): CompositeDefinition;
export function createNode(input: CreateNodeInput & { type: "atomic" }): Node;
export function createNode(input: CreateNodeInput): CompositeDefinition;

/**
 * Create a node data structure
 *
 * @param input - Node configuration
 * @returns Node data structure for storage/editing (CompositeDefinition for composite nodes, Node for atomic)
 */
export function createNode(input: CreateNodeInput): Node {
  const id = input.id || generateNodeId();
  const now = new Date().toISOString();
  const type = input.type || "composite";

  const version = input.version || "1.0.0";
  const versionValidation = parseVersion(version);

  if (!versionValidation.valid) {
    throw new Error(`Invalid version format: ${versionValidation.error}`);
  }

  if (!input.id) {
    const initialValidation = validateInitialVersion(version);
    if (!initialValidation.valid) {
      throw new Error(`Invalid initial version: ${initialValidation.reason}`);
    }
  }

  const versionLock = createVersionLock(id, version, now);

  const node: Node = {
    id,
    name: input.name,
    description: input.description || "",
    category: input.category || "user",
    type,
    version,
    metadata: {
      created: now,
      modified: now,
      author: "User",
      source: "user",
      versionLock,
      ...input.metadata,
    },
  };

  if (type === "composite") {
    return {
      ...node,
      nodes: input.nodes || [],
      edges: input.edges || [],
      variables: input.variables || {},
      settings: {
        runtime: {
          timeout: 30000,
          parallel: false,
        },
        ui: {
          color: "#6366f1",
        },
        ...input.settings,
      },
    };
  } else {
    return {
      ...node,
      inputPorts: input.inputPorts || [],
      outputPorts: input.outputPorts || [],
      parameters: {},
    };
  }
}
