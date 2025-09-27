import { describe, test, expect, vi } from "vitest";
import {
  migrateFlow,
  detectNodeStructure,
  detectVersionLocation,
  detectTypeLocation,
  needsMigration,
  getFlowSchemaVersion,
} from "#migrations/index";

describe("Flow Migration Utilities", () => {
  describe("detectNodeStructure", () => {
    test("detects nested structure", () => {
      const nodes: Record<string, unknown>[] = [
        {
          id: "root",
          type: "group",
          children: [
            {
              id: "child1",
              type: "http",
            },
          ],
        },
      ];

      expect(detectNodeStructure(nodes)).toBe("nested");
    });

    test("detects flat structure with parentId", () => {
      const nodes = [
        {
          id: "root",
          type: "group",
        },
        {
          id: "child1",
          type: "http",
          parentId: "root",
        },
      ];

      expect(detectNodeStructure(nodes)).toBe("flat");
    });

    test("defaults to flat for simple arrays", () => {
      const nodes = [
        {
          id: "node1",
          type: "http",
        },
        {
          id: "node2",
          type: "transform",
        },
      ];

      expect(detectNodeStructure(nodes)).toBe("flat");
    });

    test("returns unknown for empty or invalid arrays", () => {
      expect(detectNodeStructure(undefined)).toBe("unknown");
      expect(detectNodeStructure([])).toBe("unknown");
      expect(detectNodeStructure(null as unknown[])).toBe("unknown");
    });
  });

  describe("detectVersionLocation", () => {
    test("detects version at top level", () => {
      const node = {
        id: "node1",
        version: "2.0.0",
        metadata: {},
      };

      expect(detectVersionLocation(node)).toBe("top");
    });

    test("detects version in metadata", () => {
      const node = {
        id: "node1",
        metadata: {
          version: "1.5.0",
        },
      };

      expect(detectVersionLocation(node)).toBe("metadata");
    });

    test("returns none when version not found", () => {
      const node = {
        id: "node1",
        metadata: {},
      };

      expect(detectVersionLocation(node)).toBe("none");
    });

    test("handles invalid inputs", () => {
      expect(detectVersionLocation(null)).toBe("none");
      expect(detectVersionLocation(undefined)).toBe("none");
      expect(detectVersionLocation("string")).toBe("none");
    });
  });

  describe("detectTypeLocation", () => {
    test("detects type at top level", () => {
      const node = {
        id: "node1",
        type: "http",
        metadata: {},
      };

      expect(detectTypeLocation(node)).toBe("top");
    });

    test("detects type in metadata", () => {
      const node = {
        id: "node1",
        metadata: {
          type: "transform",
        },
      };

      expect(detectTypeLocation(node)).toBe("metadata");
    });

    test("returns none when type not found", () => {
      const node = {
        id: "node1",
        metadata: {},
      };

      expect(detectTypeLocation(node)).toBe("none");
    });
  });

  describe("migrateFlow", () => {
    // Mock console methods to verify logging
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    test("migrates nested structure to flat", () => {
      const nestedFlow = {
        nodes: [
          {
            id: "root",
            type: "group",
            name: "Root Group",
            position: { x: 0, y: 0 },
            children: [
              {
                id: "child1",
                name: "HTTP Node",
                position: { x: 100, y: 100 },
                metadata: {
                  type: "http",
                  version: "1.0.0",
                },
              },
              {
                id: "child2",
                name: "Transform Node",
                position: { x: 200, y: 100 },
                metadata: {
                  type: "transform",
                  version: "1.1.0",
                },
              },
            ],
          },
        ],
      };

      const migrated = migrateFlow(nestedFlow);

      expect(migrated.schemaVersion).toBe(1);
      expect(migrated.nodes).toHaveLength(3);

      // Check root node
      const root = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "root");
      expect(root).toBeDefined();
      expect(root?.parentId).toBeUndefined();
      expect(root?.type).toBe("group");

      // Check child nodes
      const child1 = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "child1");
      expect(child1).toBeDefined();
      expect(child1?.parentId).toBe("root");
      expect(child1?.type).toBe("http");
      expect(child1?.version).toBe("1.0.0");
      expect((child1?.metadata as Record<string, unknown>)?.version).toBeUndefined();
      expect((child1?.metadata as Record<string, unknown>)?.type).toBeUndefined();

      const child2 = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "child2");
      expect(child2).toBeDefined();
      expect(child2?.parentId).toBe("root");
      expect(child2?.type).toBe("transform");
      expect(child2?.version).toBe("1.1.0");
    });

    test("migrates version from metadata to top level", () => {
      const oldVersionFlow = {
        nodes: [
          {
            id: "node1",
            name: "Node 1",
            metadata: {
              type: "http",
              version: "2.0.0",
              description: "HTTP Request Node",
            },
          },
          {
            id: "node2",
            name: "Node 2",
            type: "transform",
            metadata: {
              version: "1.5.0",
            },
          },
        ],
      };

      const migrated = migrateFlow(oldVersionFlow);

      expect(migrated.schemaVersion).toBe(1);

      const node1 = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "node1");
      expect(node1?.version).toBe("2.0.0");
      expect(node1?.type).toBe("http");
      expect((node1?.metadata as Record<string, unknown>)?.version).toBeUndefined();
      expect((node1?.metadata as Record<string, unknown>)?.type).toBeUndefined();
      expect((node1?.metadata as Record<string, unknown>)?.description).toBe("HTTP Request Node");

      const node2 = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "node2");
      expect(node2?.version).toBe("1.5.0");
      expect(node2?.type).toBe("transform");
      expect((node2?.metadata as Record<string, unknown>)?.version).toBeUndefined();
    });

    test("handles already flat structure", () => {
      const flatFlow = {
        schemaVersion: 1,
        nodes: [
          {
            id: "node1",
            type: "http",
            version: "1.0.0",
            name: "HTTP Node",
            position: { x: 0, y: 0 },
          },
          {
            id: "node2",
            type: "transform",
            version: "1.0.0",
            parentId: "node1",
            name: "Transform Node",
            position: { x: 100, y: 0 },
          },
        ],
      };

      const migrated = migrateFlow(flatFlow);

      expect(migrated.schemaVersion).toBe(1);
      expect(migrated.nodes).toEqual(flatFlow.nodes);
    });

    test("handles deeply nested structures", () => {
      const deeplyNested = {
        nodes: [
          {
            id: "level1",
            type: "group",
            children: [
              {
                id: "level2",
                metadata: { type: "group" },
                children: [
                  {
                    id: "level3",
                    metadata: { type: "group" },
                    children: [
                      {
                        id: "leaf",
                        metadata: { type: "http", version: "3.0.0" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const migrated = migrateFlow(deeplyNested);

      expect(migrated.nodes).toHaveLength(4);

      const leaf = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "leaf");
      expect(leaf?.parentId).toBe("level3");
      expect(leaf?.type).toBe("http");
      expect(leaf?.version).toBe("3.0.0");

      const level3 = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "level3");
      expect(level3?.parentId).toBe("level2");

      const level2 = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "level2");
      expect(level2?.parentId).toBe("level1");

      const level1 = migrated.nodes?.find((n: Record<string, unknown>) => n.id === "level1");
      expect(level1?.parentId).toBeUndefined();
    });

    test("preserves other flow properties", () => {
      const flow = {
        id: "flow-123",
        name: "Test Flow",
        description: "A test flow",
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
          },
        ],
        nodes: [
          {
            id: "node1",
            metadata: { type: "http" },
          },
        ],
      };

      const migrated = migrateFlow(flow);

      expect(migrated.id).toBe("flow-123");
      expect(migrated.name).toBe("Test Flow");
      expect(migrated.description).toBe("A test flow");
      expect(migrated.edges).toEqual(flow.edges);
    });

    test("handles flows with 'version' instead of 'schemaVersion'", () => {
      const flow = {
        version: 0,
        nodes: [
          {
            id: "node1",
            metadata: { type: "http" },
          },
        ],
      };

      const migrated = migrateFlow(flow);

      expect(migrated.schemaVersion).toBe(1);
      expect(migrated.version).toBeUndefined();
    });

    test("adds default version when missing", () => {
      const flow = {
        nodes: [
          {
            id: "node1",
            type: "http",
          },
        ],
      };

      const migrated = migrateFlow(flow);

      const node = migrated.nodes?.[0] as Record<string, unknown>;
      expect(node.version).toBe("1.0.0");
    });

    test("handles empty metadata after cleanup", () => {
      const flow = {
        nodes: [
          {
            id: "node1",
            metadata: {
              type: "http",
              version: "1.0.0",
            },
          },
        ],
      };

      const migrated = migrateFlow(flow);

      const node = migrated.nodes?.[0] as Record<string, unknown>;
      expect(node.metadata).toBeUndefined();
    });
  });

  describe("needsMigration", () => {
    test("returns true for unversioned flows", () => {
      const flow = {
        nodes: [],
      };

      expect(needsMigration(flow)).toBe(true);
    });

    test("returns true for outdated versions", () => {
      const flow = {
        schemaVersion: 0,
        nodes: [],
      };

      expect(needsMigration(flow)).toBe(true);
    });

    test("returns false for current version", () => {
      const flow = {
        schemaVersion: 1,
        nodes: [],
      };

      expect(needsMigration(flow)).toBe(false);
    });
  });

  describe("getFlowSchemaVersion", () => {
    test("returns schemaVersion when present", () => {
      const flow = {
        schemaVersion: 1,
        nodes: [],
      };

      expect(getFlowSchemaVersion(flow)).toBe(1);
    });

    test("returns 0 for unversioned flows", () => {
      const flow = {
        nodes: [],
      };

      expect(getFlowSchemaVersion(flow)).toBe(0);
    });
  });
});
