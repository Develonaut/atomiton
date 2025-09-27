# Versioning & Migration Strategy

## Core Principle: Version What Gets Persisted

Only version schemas that are saved, shared, or need backward compatibility.

## What Needs Versioning

| Domain                | Needs Versioning? | Version Field | Type     | Example            |
| --------------------- | ----------------- | ------------- | -------- | ------------------ |
| **Flow Schema**       | ✅ YES            | `version`     | Integer  | `version: 1`       |
| **Node Types**        | ✅ YES            | `version`     | Semantic | `version: "2.1.0"` |
| **Storage Format**    | ✅ YES            | `version`     | String   | `version: "1.0"`   |
| **IPC Messages**      | ❌ NO             | -             | -        | Ephemeral data     |
| **Execution Results** | ❌ NO             | -             | -        | Not persisted      |
| **Editor State**      | ❌ NO             | -             | -        | Transient UI state |

## Version Field Convention

**Always use `version` field** - The TypeScript type provides context:

```typescript
// ✅ GOOD - Clean and consistent
flow.version; // Flow schema version
node.version; // Node type version
file.version; // File format version

// ❌ BAD - Redundant naming
flow.schemaVersion; // Why not just "version"?
node.typeVersion; // Unnecessarily verbose
file.formatVersion; // The type already tells us it's a file
```

## Implementation Examples

### 1. Flow Schema Versioning

```typescript
// @atomiton/workflow/src/types/Flow.ts
export interface Flow {
  version: number; // 1, 2, 3... for easy comparison
  id: string;
  name: string;
  nodes: FlowNode[];
  connections: Connection[];

  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdWith: string; // "atomiton@1.0.0"
    lastModifiedWith: string; // "atomiton@1.2.0"
  };
}

// Migration system
export const CURRENT_FLOW_VERSION = 2;

export interface FlowMigration {
  from: number;
  to: number;
  migrate: (flow: any) => any;
}

export const flowMigrations: FlowMigration[] = [
  {
    from: 1,
    to: 2,
    migrate: (flow) => ({
      ...flow,
      version: 2,
      // Add new required field with default
      settings: flow.settings || { timeout: 30000 },
    }),
  },
];

export function migrateFlow(flow: any): Flow {
  let current = flow;

  while (current.version < CURRENT_FLOW_VERSION) {
    const migration = flowMigrations.find((m) => m.from === current.version);

    if (!migration) {
      throw new Error(`No migration path from v${current.version}`);
    }

    current = migration.migrate(current);
  }

  return current;
}
```

### 2. Node Type Versioning

```typescript
// @atomiton/nodes/src/types/NodeDefinition.ts
export interface NodeDefinition {
  type: string; // "httpRequest"
  version: string; // "2.1.0" - Semantic versioning

  // Compatibility range
  compatible: {
    min: string; // "2.0.0"
    max: string; // "3.0.0"
  };

  schema: ZodSchema;

  // Deprecation tracking
  deprecated?: {
    since: string;
    removeAt: string;
    migrationGuide: string;
  };
}

// Node instance in a Flow
export interface FlowNode {
  id: string;
  type: string; // "httpRequest"
  version: string; // "2.0.1" - Specific version used
  position: { x: number; y: number };
  config: Record<string, any>;
}

// Node migration
export class HttpRequestNode {
  static migrations = [
    {
      from: "1.0.0",
      to: "2.0.0",
      migrate: (config: any) => ({
        ...config,
        headers: config.headers || {},
        url: config.endpoint || config.url, // Renamed field
      }),
    },
  ];

  static migrateConfig(config: any, fromVersion: string): any {
    let current = config;
    let currentVersion = fromVersion;

    for (const migration of this.migrations) {
      if (semver.lt(currentVersion, migration.to)) {
        current = migration.migrate(current);
        currentVersion = migration.to;
      }
    }

    return current;
  }
}
```

### 3. Storage Format Versioning

```typescript
// @atomiton/storage/src/formats/FlowFile.ts
export interface FlowFile {
  version: string; // "1.0" - File format version

  metadata: {
    application: "atomiton";
    applicationVersion: string;
    createdAt: string;
  };

  flow: Flow; // Contains its own version field

  checksum?: string; // For integrity
}

// Example YAML file:
/*
version: "1.0"
metadata:
  application: "atomiton"
  applicationVersion: "1.5.0"
  createdAt: "2024-01-01T00:00:00Z"
flow:
  version: 2
  id: "flow-123"
  nodes: [...]
checksum: "sha256:..."
*/
```

## Migration Strategies

### Strategy 1: Automatic Migration (Recommended)

```typescript
// Migrate immediately when loading
export async function loadFlow(data: any): Promise<Flow> {
  if (data.version < CURRENT_FLOW_VERSION) {
    console.log(
      `Migrating flow from v${data.version} to v${CURRENT_FLOW_VERSION}`,
    );
    data = migrateFlow(data);
  }

  return validateFlow(data);
}
```

### Strategy 2: Lazy Migration

```typescript
// Keep old version until save
export class FlowService {
  private flow: any;

  getFlow(): Flow {
    return this.flow; // Return as-is
  }

  saveFlow(): void {
    // Migrate only when saving
    if (this.flow.version < CURRENT_FLOW_VERSION) {
      this.flow = migrateFlow(this.flow);
    }
    storage.save(this.flow);
  }
}
```

### Strategy 3: Compatibility Mode

```typescript
// Support multiple versions simultaneously
export class NodeExecutor {
  execute(node: FlowNode) {
    const executor = this.getExecutorForVersion(node.type, node.version);

    if (!executor) {
      throw new Error(`No executor for ${node.type}@${node.version}`);
    }

    return executor.execute(node.config);
  }
}
```

## Testing Migrations

```typescript
describe("Flow Migrations", () => {
  test("migrates v1 to current", () => {
    const v1Flow = {
      version: 1,
      id: "test",
      nodes: [],
    };

    const migrated = migrateFlow(v1Flow);

    expect(migrated.version).toBe(CURRENT_FLOW_VERSION);
    expect(migrated.settings).toBeDefined();
  });

  test("handles missing migrations", () => {
    const futureFlow = { version: 999 };

    expect(() => migrateFlow(futureFlow)).toThrow("No migration path");
  });

  test("preserves data during migration", () => {
    const original = {
      version: 1,
      id: "test",
      customField: "preserved",
    };

    const migrated = migrateFlow(original);

    expect(migrated.customField).toBe("preserved");
  });
});
```

## Version Type Guidelines

| Use Case                 | Version Type | Why                       | Example                    |
| ------------------------ | ------------ | ------------------------- | -------------------------- |
| **Schema versions**      | Integer      | Easy comparison           | `version: 1` → `2` → `3`   |
| **Package/API versions** | Semantic     | Industry standard         | `version: "2.1.0"`         |
| **File formats**         | String       | Might need minor versions | `version: "1.0"` → `"1.1"` |

## Best Practices

### DO ✅

1. **Version at schema level, not instance level**

   ```typescript
   // GOOD - Schema version
   interface Flow {
     version: 1; // All flows of this schema
   }

   // BAD - Instance version
   interface Flow {
     id: "flow-123";
     instanceVersion: 1; // Specific to this flow
   }
   ```

2. **Provide migration paths**

   ```typescript
   // Never break without migration
   if (oldVersion) {
     return migrate(data);
   }
   ```

3. **Test migrations thoroughly**
   ```typescript
   // Test every migration path
   test.each(migrations)("migration from v%i to v%i", (from, to) => {
     // Test the migration
   });
   ```

### DON'T ❌

1. **Don't version ephemeral data**

   ```typescript
   // BAD - Execution results aren't saved
   interface ExecutionResult {
     version: "1.0.0"; // Why?
   }
   ```

2. **Don't skip versions in migrations**

   ```typescript
   // BAD - Can't skip from 1 to 3
   migrate(v1) → v3  // Where's v2?

   // GOOD - Sequential migrations
   migrate(v1) → v2 → v3
   ```

3. **Don't mix concerns**
   ```typescript
   // BAD - Multiple version concepts
   interface Flow {
     version: 1; // Schema
     flowVersion: "2.0.0"; // What is this?
     dataVersion: 3; // Too many!
   }
   ```

## Implementation Roadmap

### Phase 1: Add Versioning

- [ ] Add `version: 1` to Flow interface
- [ ] Add `version` to NodeDefinition (already exists ✅)
- [ ] Add `version` to FlowFile format
- [ ] Document version strategy

### Phase 2: Implement Migrations

- [ ] Create migration registry
- [ ] Add migration utilities
- [ ] Auto-migrate on load
- [ ] Add migration tests

### Phase 3: Compatibility

- [ ] Node version compatibility checking
- [ ] Deprecation warnings
- [ ] Version mismatch handling
- [ ] Backward compatibility tests

## Summary Rules

1. **Use `version` consistently** - Same field name everywhere
2. **Version what's persisted** - Flows, Nodes, Files
3. **Don't version ephemeral data** - Execution results, IPC messages
4. **Always provide migrations** - Never break without a path forward
5. **Use appropriate version types** - Integers for schemas, semantic for APIs
6. **Test migrations thoroughly** - They're critical for user experience

This approach is validated by:

- **Kubernetes**: API versioning strategy
- **Terraform**: State file versioning
- **n8n**: Workflow versioning
- **Elasticsearch**: Index migrations
