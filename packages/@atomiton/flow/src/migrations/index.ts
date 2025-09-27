import type { Flow } from "#types";
import { CURRENT_FLOW_VERSION } from "#types";

// Type for unversioned or legacy flow structures
type LegacyFlow = Record<string, unknown> & {
  nodes?: unknown[];
  edges?: unknown[];
  schemaVersion?: number;
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

export const migrations: FlowMigration[] = [
  {
    from: 0, // Unversioned
    to: 1,
    migrate: (flow: LegacyFlow): PartialFlow => {
      // Migrate to flat node structure
      const flatNodes: Record<string, unknown>[] = [];

      const flatten = (nodes: unknown[], parentId?: string) => {
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

          flatNodes.push({
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
          });

          // Recursively flatten children
          if (Array.isArray(children)) {
            flatten(children, node.id as string);
          }
        }
      };

      // Start flattening from root nodes
      if (Array.isArray(flow.nodes)) {
        flatten(flow.nodes);
      }

      return {
        ...flow,
        schemaVersion: 1,
        nodes: flatNodes,
      };
    },
  },
];

export function migrateFlow(flow: LegacyFlow): Flow {
  let current: PartialFlow = flow as PartialFlow;

  // Add schema version if missing (assume version 0 for unversioned flows)
  if (current.schemaVersion === undefined) {
    current = { ...current, schemaVersion: 0 };
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
      current = migration.migrate(current);
      console.log(
        `Successfully migrated flow from version ${migration.from} to ${migration.to}`,
      );
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

  return current as Flow;
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