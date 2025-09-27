import type { Flow } from "#types";
import { CURRENT_FLOW_VERSION } from "#types";

// Type for unversioned or legacy flow structures
type LegacyFlow = Record<string, unknown> & {
  nodes?: unknown[];
  edges?: unknown[];
  schemaVersion?: number;
  version?: number; // Some flows might use 'version' instead of 'schemaVersion'
};

// Type for partially migrated flow
type PartialFlow = LegacyFlow & {
  schemaVersion: number;
};

export type FlowMigration = {
  from: number;
  to: number;
  migrate: (flow: LegacyFlow) => PartialFlow;
};

/**
 * Detect the structure type of nodes array
 * @returns "flat" if nodes use parentId, "nested" if nodes have children, "unknown" otherwise
 */
export function detectNodeStructure(
  nodes: unknown[] | undefined,
): "flat" | "nested" | "unknown" {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return "unknown";
  }

  // Check if any node has children (nested structure)
  const hasChildren = nodes.some((node) => {
    if (typeof node !== "object" || node === null) return false;
    const n = node as Record<string, unknown>;
    return Array.isArray(n.children) && n.children.length > 0;
  });

  // Check if any node has parentId (flat structure)
  const hasParentId = nodes.some((node) => {
    if (typeof node !== "object" || node === null) return false;
    const n = node as Record<string, unknown>;
    return n.parentId !== undefined;
  });

  if (hasChildren) return "nested";
  if (hasParentId) return "flat";

  // Default to flat for simple arrays without hierarchy
  return "flat";
}

/**
 * Detect where version is stored in a node
 * @returns "top" if at node.version, "metadata" if at node.metadata.version, "none" if not found
 */
export function detectVersionLocation(
  node: unknown,
): "top" | "metadata" | "none" {
  if (typeof node !== "object" || node === null) {
    return "none";
  }

  const n = node as Record<string, unknown>;

  // Check top-level version
  if (n.version !== undefined) {
    return "top";
  }

  // Check metadata.version
  if (
    typeof n.metadata === "object" &&
    n.metadata !== null &&
    (n.metadata as Record<string, unknown>).version !== undefined
  ) {
    return "metadata";
  }

  return "none";
}

/**
 * Detect where type is stored in a node
 * @returns "top" if at node.type, "metadata" if at node.metadata.type, "none" if not found
 */
export function detectTypeLocation(node: unknown): "top" | "metadata" | "none" {
  if (typeof node !== "object" || node === null) {
    return "none";
  }

  const n = node as Record<string, unknown>;

  // Check top-level type
  if (n.type !== undefined) {
    return "top";
  }

  // Check metadata.type
  if (
    typeof n.metadata === "object" &&
    n.metadata !== null &&
    (n.metadata as Record<string, unknown>).type !== undefined
  ) {
    return "metadata";
  }

  return "none";
}

/**
 * Flatten a nested node structure into a flat structure with parentId references
 */
function flattenNodes(
  nodes: unknown[],
  parentId?: string,
): Record<string, unknown>[] {
  const flatNodes: Record<string, unknown>[] = [];

  for (const nodeItem of nodes || []) {
    // Type guard to ensure node is an object
    if (typeof nodeItem !== "object" || nodeItem === null) {
      continue;
    }

    const node = nodeItem as Record<string, unknown>;
    const { children, metadata, ...rest } = node;

    // Extract type and version from metadata if present
    const metadataObj = (metadata as Record<string, unknown>) || {};
    const nodeType = rest.type || metadataObj.type || "unknown";
    const nodeVersion = rest.version || metadataObj.version || "1.0.0";

    // Create flattened node
    const flatNode: Record<string, unknown> = {
      ...rest,
      type: nodeType,
      version: nodeVersion,
      parentId: parentId || undefined,
      metadata: metadata
        ? {
            ...metadataObj,
            type: undefined,
            version: undefined,
          }
        : undefined,
    };

    // Remove undefined parentId
    if (flatNode.parentId === undefined) {
      delete flatNode.parentId;
    }

    flatNodes.push(flatNode);

    // Recursively flatten children
    if (Array.isArray(children)) {
      flatNodes.push(...flattenNodes(children, node.id as string));
    }
  }

  return flatNodes;
}

/**
 * Migrate version and type from metadata to top level
 */
function migrateNodeFields(nodes: unknown[]): unknown[] {
  return nodes.map((nodeItem) => {
    if (typeof nodeItem !== "object" || nodeItem === null) {
      return nodeItem;
    }

    const node = nodeItem as Record<string, unknown>;
    const metadata = node.metadata as Record<string, unknown> | undefined;

    // Determine type location and value
    const typeLocation = detectTypeLocation(node);
    const nodeType =
      typeLocation === "top"
        ? node.type
        : typeLocation === "metadata" && metadata
          ? metadata.type || "unknown"
          : "unknown";

    // Determine version location and value
    const versionLocation = detectVersionLocation(node);
    const nodeVersion =
      versionLocation === "top"
        ? node.version
        : versionLocation === "metadata" && metadata
          ? metadata.version || "1.0.0"
          : "1.0.0";

    // Create updated node with type and version at top level
    const updatedNode: Record<string, unknown> = {
      ...node,
      type: nodeType,
      version: nodeVersion,
    };

    // Clean up metadata
    if (metadata) {
      const cleanedMetadata = { ...metadata };
      delete cleanedMetadata.type;
      delete cleanedMetadata.version;

      // Only include metadata if it has other properties
      if (Object.keys(cleanedMetadata).length > 0) {
        updatedNode.metadata = cleanedMetadata;
      } else {
        delete updatedNode.metadata;
      }
    }

    return updatedNode;
  });
}

export const migrations: FlowMigration[] = [
  {
    from: 0, // Unversioned
    to: 1,
    migrate: (flow: LegacyFlow): PartialFlow => {
      let migratedNodes = flow.nodes || [];

      // Detect and convert structure if needed
      const structure = detectNodeStructure(migratedNodes);

      if (structure === "nested") {
        // Flatten nested structure
        migratedNodes = flattenNodes(migratedNodes);
        console.log(
          `Migrated from nested to flat structure (${migratedNodes.length} nodes)`,
        );
      }

      // Migrate version and type fields to top level
      migratedNodes = migrateNodeFields(migratedNodes);

      return {
        ...flow,
        schemaVersion: 1,
        nodes: migratedNodes,
      };
    },
  },
];

/**
 * Comprehensive flow migration function
 * Detects structure type, migrates to flat structure, and applies schema migrations
 */
export function migrateFlow(flow: LegacyFlow): Flow {
  let current: PartialFlow = { ...flow } as PartialFlow;

  // Handle flows that use 'version' instead of 'schemaVersion'
  if (current.schemaVersion === undefined) {
    if (typeof current.version === "number") {
      current.schemaVersion = current.version;
      delete current.version;
    } else {
      // Assume version 0 for unversioned flows
      current.schemaVersion = 0;
    }
  }

  // Log initial state
  const initialStructure = detectNodeStructure(current.nodes);
  const initialVersion = current.schemaVersion;

  if (initialStructure !== "flat" || initialVersion < CURRENT_FLOW_VERSION) {
    console.log(`Starting flow migration:`);
    console.log(`  - Structure: ${initialStructure}`);
    console.log(`  - Schema version: ${initialVersion}`);
  }

  // Apply migrations sequentially
  while (current.schemaVersion < CURRENT_FLOW_VERSION) {
    const migration = migrations.find((m) => m.from === current.schemaVersion);
    if (!migration) {
      console.warn(
        `No migration found from version ${current.schemaVersion}. Stopping migration.`,
      );
      break;
    }

    try {
      const before = current.schemaVersion;
      current = migration.migrate(current);

      // Only log if migration actually changed something
      if (before !== current.schemaVersion) {
        console.log(
          `Migrated flow schema from v${migration.from} to v${migration.to}`,
        );
      }
    } catch (error) {
      console.error(
        `Failed to migrate flow from version ${migration.from} to ${migration.to}:`,
        error,
      );
      throw new Error(
        `Flow migration failed from version ${migration.from} to ${migration.to}`,
      );
    }
  }

  // Final validation
  const finalStructure = detectNodeStructure(current.nodes);
  if (finalStructure === "nested") {
    console.warn(
      "Warning: Flow still contains nested structure after migration",
    );
  }

  return current as unknown as Flow;
}

/**
 * Check if a flow needs migration
 */
export function needsMigration(flow: LegacyFlow): boolean {
  const currentVersion = flow.schemaVersion ?? 0;
  return currentVersion < CURRENT_FLOW_VERSION;
}

/**
 * Get the schema version of a flow
 */
export function getFlowSchemaVersion(flow: LegacyFlow): number {
  return (flow.schemaVersion as number) ?? 0;
}
