import { describe, it, expect } from "vitest";
import { blueprints, BlueprintsAPI } from "../api.js";
import type { BlueprintDefinition } from "../types.js";

// Note: @atomiton/nodes is not directly imported due to module resolution issues
// The API uses a fallback list of common node types for validation

describe("BlueprintsAPI", () => {
  const sampleBlueprint: BlueprintDefinition = {
    id: "test-blueprint",
    name: "Test Blueprint",
    description: "A test blueprint",
    category: "test",
    type: "blueprint",
    version: "1.0.0",
    metadata: {
      created: "2024-01-01T00:00:00.000Z",
      modified: "2024-01-01T00:00:00.000Z",
      author: "Test Author",
      tags: ["test"],
    },
    nodes: [
      {
        id: "node-1",
        type: "test-node",
        position: { x: 100, y: 200 },
        data: { config: "test" },
      },
    ],
    edges: [],
  };

  const sampleYaml = `id: test-blueprint
name: Test Blueprint
description: A test blueprint
category: test
type: blueprint
version: 1.0.0
metadata:
  created: "2024-01-01T00:00:00.000Z"
  modified: "2024-01-01T00:00:00.000Z"
  author: Test Author
  tags:
    - test
nodes:
  - id: node-1
    type: test-node
    position:
      x: 100
      y: 200
    data:
      config: test
edges: []`;

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = BlueprintsAPI.getInstance();
      const instance2 = BlueprintsAPI.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(blueprints);
    });

    it("should not allow direct instantiation", () => {
      // TypeScript should prevent this, but test runtime behavior
      expect(
        () => new (BlueprintsAPI as unknown as new () => BlueprintsAPI)(),
      ).toThrow(
        "BlueprintsAPI is a singleton. Use BlueprintsAPI.getInstance() instead.",
      );
    });
  });

  describe("Conversion Methods", () => {
    describe("fromYaml", () => {
      it("should convert valid YAML to blueprint", () => {
        const result = blueprints.fromYaml(sampleYaml);

        expect(result.id).toBe("test-blueprint");
        expect(result.name).toBe("Test Blueprint");
        expect(result.nodes).toHaveLength(1);
      });

      it("should throw error for invalid YAML", () => {
        expect(() => {
          blueprints.fromYaml("invalid: yaml: [");
        }).toThrow("Blueprint fromYaml failed");
      });

      it("should respect transformation options", () => {
        const result = blueprints.fromYaml(sampleYaml, {
          validateResult: false,
        });
        expect(result).toBeDefined();
      });
    });

    describe("safeFromYaml", () => {
      it("should return success result for valid YAML", () => {
        const result = blueprints.safeFromYaml(sampleYaml);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.error).toBeUndefined();
      });

      it("should return error result for invalid YAML", () => {
        const result = blueprints.safeFromYaml("invalid: yaml: [");

        expect(result.success).toBe(false);
        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error?.code).toBe("YAML_PARSE_ERROR");
      });
    });

    describe("toYaml", () => {
      it("should convert blueprint to YAML", () => {
        const yamlResult = blueprints.toYaml(sampleBlueprint);

        expect(typeof yamlResult).toBe("string");
        expect(yamlResult).toContain("id: test-blueprint");
        expect(yamlResult).toContain("name: Test Blueprint");
      });

      it("should throw error for invalid blueprint", () => {
        const invalidBlueprint = {
          ...sampleBlueprint,
          nodes: [
            { id: "node-1", type: "test", position: { x: 0, y: 0 }, data: {} },
            { id: "node-1", type: "test", position: { x: 0, y: 0 }, data: {} }, // Duplicate
          ],
        } as BlueprintDefinition;

        expect(() => {
          blueprints.toYaml(invalidBlueprint);
        }).toThrow("Blueprint toYaml failed");
      });
    });

    describe("safeToYaml", () => {
      it("should return success result for valid blueprint", () => {
        const result = blueprints.safeToYaml(sampleBlueprint);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(typeof result.data).toBe("string");
        expect(result.error).toBeUndefined();
      });

      it("should return error result for invalid blueprint", () => {
        const invalidBlueprint = {
          ...sampleBlueprint,
          metadata: {
            created: "invalid-date",
            modified: "invalid-date",
          },
        } as BlueprintDefinition;

        const result = blueprints.safeToYaml(invalidBlueprint);

        expect(result.success).toBe(false);
        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
      });
    });
  });

  describe("Validation Methods", () => {
    describe("validate", () => {
      it("should validate correct blueprint", () => {
        const result = blueprints.validate(sampleBlueprint);

        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should reject invalid blueprint", () => {
        const invalid = { name: "Invalid" };
        const result = blueprints.validate(invalid);

        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should use provided validation context", () => {
        const context = {
          availableNodeTypes: ["test-node"],
          strictMode: true,
        };

        const result = blueprints.validate(sampleBlueprint, context);
        expect(result.success).toBe(true);
      });
    });

    describe("isValid", () => {
      it("should return true for valid blueprint", () => {
        expect(blueprints.isValid(sampleBlueprint)).toBe(true);
      });

      it("should return false for invalid blueprint", () => {
        expect(blueprints.isValid({ name: "Invalid" })).toBe(false);
      });
    });

    describe("isValidYaml", () => {
      it("should return true for valid blueprint YAML", () => {
        expect(blueprints.isValidYaml(sampleYaml)).toBe(true);
      });

      it("should return false for invalid YAML", () => {
        expect(blueprints.isValidYaml("invalid: yaml: [")).toBe(false);
      });
    });
  });

  describe("Schema Methods", () => {
    describe("getSchema", () => {
      it("should return blueprint schema", () => {
        const schema = blueprints.getSchema();

        expect(schema.version).toBe("1.0.0");
        expect(schema.type).toBe("blueprint");
        expect(schema.properties).toBeDefined();
        expect(schema.required).toContain("id");
        expect(schema.required).toContain("name");
      });
    });

    describe("getSchemaVersion", () => {
      it("should return current schema version", () => {
        expect(blueprints.getSchemaVersion()).toBe("1.0.0");
      });
    });

    describe("getRequiredFields", () => {
      it("should return required fields", () => {
        const required = blueprints.getRequiredFields();

        expect(required).toContain("id");
        expect(required).toContain("name");
        expect(required).toContain("category");
        expect(required).toContain("type");
        expect(required).toContain("metadata");
        expect(required).toContain("nodes");
        expect(required).toContain("edges");
      });
    });

    describe("getOptionalFields", () => {
      it("should return optional fields", () => {
        const optional = blueprints.getOptionalFields();

        expect(optional).toContain("description");
        expect(optional).toContain("version");
        expect(optional).toContain("variables");
        expect(optional).toContain("settings");
      });
    });
  });

  describe("Utility Methods", () => {
    describe("normalize", () => {
      it("should normalize a blueprint", () => {
        const normalized = blueprints.normalize(sampleBlueprint);

        expect(normalized.id).toBe(sampleBlueprint.id);
        expect(normalized.name).toBe(sampleBlueprint.name);
      });

      it("should throw error for invalid blueprint", () => {
        const invalidBlueprint = {
          ...sampleBlueprint,
          metadata: {
            created: "invalid-date",
            modified: "invalid-date",
          },
        } as BlueprintDefinition;

        expect(() => {
          blueprints.normalize(invalidBlueprint);
        }).toThrow("Blueprint normalization failed");
      });
    });

    describe("extractMetadata", () => {
      it("should extract metadata from YAML", () => {
        const metadata = blueprints.extractMetadata(sampleYaml);

        expect(metadata).toBeDefined();
        expect(metadata?.id).toBe("test-blueprint");
        expect(metadata?.name).toBe("Test Blueprint");
        expect(metadata?.version).toBe("1.0.0");
      });

      it("should return null for invalid YAML", () => {
        const metadata = blueprints.extractMetadata("invalid: yaml: [");
        expect(metadata).toBeNull();
      });
    });

    describe("migrate", () => {
      it("should migrate valid blueprint", () => {
        const migrated = blueprints.migrate(sampleBlueprint);

        expect(migrated.id).toBe(sampleBlueprint.id);
        expect(migrated.name).toBe(sampleBlueprint.name);
      });

      it("should throw error for invalid blueprint", () => {
        const invalid = { name: "Invalid" };

        expect(() => {
          blueprints.migrate(invalid);
        }).toThrow("Blueprint migration failed");
      });
    });

    describe("create", () => {
      it("should create a new blueprint with required fields", () => {
        const params = {
          id: "new-blueprint",
          name: "New Blueprint",
          category: "user",
          type: "blueprint",
          description: "A new blueprint",
          author: "Creator",
          tags: ["new", "test"],
        };

        const created = blueprints.create(params);

        expect(created.id).toBe("new-blueprint");
        expect(created.name).toBe("New Blueprint");
        expect(created.category).toBe("user");
        expect(created.type).toBe("blueprint");
        expect(created.description).toBe("A new blueprint");
        expect(created.metadata.author).toBe("Creator");
        expect(created.metadata.tags).toEqual(["new", "test"]);
        expect(created.nodes).toEqual([]);
        expect(created.edges).toEqual([]);
        expect(created.version).toBe("1.0.0");
      });

      it("should set creation timestamps", () => {
        const params = {
          id: "time-test",
          name: "Time Test",
          category: "test",
          type: "blueprint",
        };

        const before = new Date();
        const created = blueprints.create(params);
        const after = new Date();

        const createdTime = new Date(created.metadata.created);
        const modifiedTime = new Date(created.metadata.modified);

        expect(createdTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(createdTime.getTime()).toBeLessThanOrEqual(after.getTime());
        expect(modifiedTime.getTime()).toBe(createdTime.getTime());
      });
    });
  });

  describe("Advanced Methods", () => {
    describe("clone", () => {
      it("should clone blueprint with new ID", () => {
        const cloned = blueprints.clone(sampleBlueprint, "cloned-blueprint");

        expect(cloned.id).toBe("cloned-blueprint");
        expect(cloned.name).toBe("Test Blueprint (Copy)");
        expect(cloned.metadata.created).not.toBe(
          sampleBlueprint.metadata.created,
        );
        expect(cloned.metadata.modified).not.toBe(
          sampleBlueprint.metadata.modified,
        );
      });

      it("should generate new node IDs by default", () => {
        const cloned = blueprints.clone(sampleBlueprint, "cloned-blueprint");

        expect(cloned.nodes[0].id).not.toBe(sampleBlueprint.nodes[0].id);
        expect(cloned.nodes[0].id).toContain("cloned-blueprint");
      });

      it("should preserve node IDs when requested", () => {
        const cloned = blueprints.clone(sampleBlueprint, "cloned-blueprint", {
          preserveNodeIds: true,
        });

        expect(cloned.nodes[0].id).toBe(sampleBlueprint.nodes[0].id);
      });

      it("should allow custom name and author", () => {
        const cloned = blueprints.clone(sampleBlueprint, "custom-clone", {
          name: "Custom Clone",
          author: "New Author",
        });

        expect(cloned.name).toBe("Custom Clone");
        expect(cloned.metadata.author).toBe("New Author");
      });
    });

    describe("merge", () => {
      it("should merge multiple blueprints", () => {
        const blueprint2: BlueprintDefinition = {
          ...sampleBlueprint,
          id: "blueprint-2",
          name: "Blueprint 2",
          nodes: [
            {
              id: "node-2",
              type: "another-node",
              position: { x: 300, y: 400 },
              data: {},
            },
          ],
        };

        const merged = blueprints.merge(
          [sampleBlueprint, blueprint2],
          "merged-blueprint",
          "Merged Blueprint",
        );

        expect(merged.id).toBe("merged-blueprint");
        expect(merged.name).toBe("Merged Blueprint");
        expect(merged.nodes).toHaveLength(2);
        expect(merged.description).toContain(
          "Merged blueprint from 2 source blueprints",
        );
      });

      it("should offset node positions to prevent overlap", () => {
        const blueprint2: BlueprintDefinition = {
          ...sampleBlueprint,
          id: "blueprint-2",
          nodes: [
            {
              id: "node-2",
              type: "test-node",
              position: { x: 100, y: 200 }, // Same position as original
              data: {},
            },
          ],
        };

        const merged = blueprints.merge(
          [sampleBlueprint, blueprint2],
          "merged-blueprint",
          "Merged Blueprint",
        );

        expect(merged.nodes[0].position.x).toBe(100); // First blueprint unchanged
        expect(merged.nodes[1].position.x).toBe(400); // Second blueprint offset by 300
      });

      it("should generate unique node and edge IDs", () => {
        const blueprint2: BlueprintDefinition = {
          ...sampleBlueprint,
          id: "blueprint-2",
        };

        const merged = blueprints.merge(
          [sampleBlueprint, blueprint2],
          "merged-blueprint",
          "Merged Blueprint",
        );

        expect(merged.nodes[0].id).not.toBe(merged.nodes[1].id);
        expect(merged.nodes[0].id).toContain("merged-blueprint_bp0");
        expect(merged.nodes[1].id).toContain("merged-blueprint_bp1");
      });

      it("should throw error for empty blueprint array", () => {
        expect(() => {
          blueprints.merge([], "empty-merge", "Empty Merge");
        }).toThrow("Cannot merge empty blueprint array");
      });
    });
  });

  describe("Version and Package Info", () => {
    it("should return package version", () => {
      expect(blueprints.getVersion()).toBe("0.1.0");
    });
  });
});
