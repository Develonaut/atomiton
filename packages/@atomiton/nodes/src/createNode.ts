/**
 * Unified public factory for creating nodes
 *
 * This is the single public API for creating any type of node.
 * It returns a Node data structure (not a runtime instance).
 * The atomic/composite distinction is handled internally.
 */

import { generateNodeId } from "@atomiton/utils";
import type { Node } from "./types";
import {
  parseVersion,
  validateInitialVersion,
  createVersionLock,
} from "./validation/version";

export type CreateNodeInput = {
  // Common fields for all nodes
  id?: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;

  // Type discriminator
  type?: "atomic" | "composite";

  // For composite nodes
  nodes?: Node["nodes"];
  edges?: Node["edges"];
  variables?: Node["variables"];

  // For atomic nodes
  inputPorts?: Node["inputPorts"];
  outputPorts?: Node["outputPorts"];

  // Shared optional fields
  settings?: Node["settings"];
  metadata?: Partial<Node["metadata"]>;
};

/**
 * Create a node data structure
 *
 * @param input - Node configuration
 * @returns Node data structure for storage/editing
 */
export function createNode(input: CreateNodeInput): Node {
  const id = input.id || generateNodeId();
  const now = new Date().toISOString();
  const type = input.type || "composite"; // Default to composite for blueprints

  // Validate version
  const version = input.version || "1.0.0";
  const versionValidation = parseVersion(version);

  if (!versionValidation.valid) {
    throw new Error(`Invalid version format: ${versionValidation.error}`);
  }

  // For new nodes, validate it's a proper initial version
  if (!input.id) {
    // If no ID provided, assume it's a new node
    const initialValidation = validateInitialVersion(version);
    if (!initialValidation.valid) {
      throw new Error(`Invalid initial version: ${initialValidation.reason}`);
    }
  }

  // Create version lock for integrity
  const versionLock = createVersionLock(id, version, now);

  // Base node structure
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

  // Add type-specific fields
  if (type === "composite") {
    // Composite nodes have nodes and edges
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
    // Atomic nodes have ports
    return {
      ...node,
      inputPorts: input.inputPorts || [],
      outputPorts: input.outputPorts || [],
      parameters: {},
    };
  }
}
