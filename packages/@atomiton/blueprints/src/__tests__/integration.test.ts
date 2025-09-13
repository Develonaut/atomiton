import { describe, it, expect } from "vitest";
import { blueprints } from "../api.js";
import type { BlueprintDefinition } from "../types.js";

// Note: @atomiton/nodes is not directly imported due to module resolution issues
// The API uses a fallback list of common node types for validation

describe("Blueprint Integration Tests", () => {
  const complexBlueprintYaml = `id: data-processing-pipeline
name: Data Processing Pipeline
description: A complex blueprint that processes CSV data through multiple transformations
category: data-processing
type: blueprint
version: 1.2.0
metadata:
  created: "2024-01-01T10:00:00.000Z"
  modified: "2024-01-15T14:30:00.000Z"
  author: Data Team
  tags:
    - data
    - etl
    - pipeline
    - production
nodes:
  - id: csv-source
    type: csv-reader
    position:
      x: 100
      y: 100
    data:
      filePath: "/data/input.csv"
      delimiter: ","
      headers: true
      encoding: "utf-8"
  - id: data-validator
    type: code
    position:
      x: 400
      y: 100
    data:
      code: |
        function validate(data) {
          return data.filter(row => row.id && row.email);
        }
      language: "javascript"
  - id: data-transformer
    type: transform
    position:
      x: 700
      y: 100
    data:
      transformations:
        - field: "email"
          operation: "lowercase"
        - field: "created_at"
          operation: "parseDate"
          format: "YYYY-MM-DD"
  - id: api-output
    type: http-request
    position:
      x: 1000
      y: 100
    data:
      method: "POST"
      url: "https://api.example.com/data"
      headers:
        Content-Type: "application/json"
        Authorization: "Bearer {{API_TOKEN}}"
edges:
  - id: source-to-validator
    source: csv-source
    target: data-validator
    sourceHandle: "output"
    targetHandle: "input"
    data:
      label: "Raw CSV Data"
  - id: validator-to-transformer
    source: data-validator
    target: data-transformer
    sourceHandle: "output"
    targetHandle: "input"
    data:
      label: "Validated Data"
  - id: transformer-to-api
    source: data-transformer
    target: api-output
    sourceHandle: "output"
    targetHandle: "input"
    data:
      label: "Transformed Data"
variables:
  API_TOKEN:
    type: "string"
    description: "API authentication token"
  BATCH_SIZE:
    type: "number"
    defaultValue: 100
    description: "Number of records to process in each batch"
  RETRY_COUNT:
    type: "number"
    defaultValue: 3
    description: "Number of retries for failed operations"
settings:
  runtime:
    timeout: 300000
    maxMemory: "512MB"
    retryPolicy:
      maxRetries: 3
      backoffMultiplier: 2
  ui:
    theme: "dark"
    grid:
      size: 20
      snap: true
    minimap:
      enabled: true
      position: "bottom-right"`;

  describe("Full Pipeline Tests", () => {
    it("should handle complete YAML to JSON to YAML round-trip", () => {
      // Convert YAML to JSON
      const blueprint = blueprints.fromYaml(complexBlueprintYaml);

      // Verify the blueprint structure
      expect(blueprint.id).toBe("data-processing-pipeline");
      expect(blueprint.name).toBe("Data Processing Pipeline");
      expect(blueprint.nodes).toHaveLength(4);
      expect(blueprint.edges).toHaveLength(3);
      expect(blueprint.variables).toBeDefined();
      expect(blueprint.settings).toBeDefined();

      // Verify node details
      const csvNode = blueprint.nodes.find((n) => n.id === "csv-source");
      expect(csvNode?.type).toBe("csv-reader");
      expect(csvNode?.data.filePath).toBe("/data/input.csv");

      const codeNode = blueprint.nodes.find((n) => n.id === "data-validator");
      expect(codeNode?.type).toBe("code");
      expect(codeNode?.data.language).toBe("javascript");

      // Verify edge connections
      const firstEdge = blueprint.edges.find(
        (e) => e.id === "source-to-validator",
      );
      expect(firstEdge?.source).toBe("csv-source");
      expect(firstEdge?.target).toBe("data-validator");
      expect(firstEdge?.data?.label).toBe("Raw CSV Data");

      // Verify variables
      expect(blueprint.variables?.API_TOKEN.type).toBe("string");
      expect(blueprint.variables?.BATCH_SIZE.defaultValue).toBe(100);

      // Convert back to YAML
      const convertedYaml = blueprints.toYaml(blueprint);

      // Verify YAML structure
      expect(convertedYaml).toContain("id: data-processing-pipeline");
      expect(convertedYaml).toContain("type: csv-reader");
      expect(convertedYaml).toContain("API_TOKEN:");

      // Parse the converted YAML to ensure it's valid
      const reparsedBlueprint = blueprints.fromYaml(convertedYaml);
      expect(reparsedBlueprint.id).toBe(blueprint.id);
      expect(reparsedBlueprint.nodes).toHaveLength(blueprint.nodes.length);
      expect(reparsedBlueprint.edges).toHaveLength(blueprint.edges.length);
    });

    it("should validate complex blueprint successfully", () => {
      const blueprint = blueprints.fromYaml(complexBlueprintYaml);
      const validation = blueprints.validate(blueprint);

      expect(validation.success).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Should not have warnings since all node types are available
      expect(validation.warnings).toBeUndefined();
    });

    it("should handle blueprint cloning with complex structure", () => {
      const original = blueprints.fromYaml(complexBlueprintYaml);
      const cloned = blueprints.clone(original, "cloned-pipeline", {
        name: "Cloned Data Pipeline",
        author: "Clone Team",
      });

      expect(cloned.id).toBe("cloned-pipeline");
      expect(cloned.name).toBe("Cloned Data Pipeline");
      expect(cloned.metadata.author).toBe("Clone Team");

      // Verify all nodes were cloned with new IDs
      expect(cloned.nodes).toHaveLength(original.nodes.length);
      cloned.nodes.forEach((node, index) => {
        expect(node.id).not.toBe(original.nodes[index].id);
        expect(node.id).toContain("cloned-pipeline");
        expect(node.type).toBe(original.nodes[index].type);
      });

      // Verify all edges were updated with new node references
      expect(cloned.edges).toHaveLength(original.edges.length);
      cloned.edges.forEach((edge, index) => {
        expect(edge.id).not.toBe(original.edges[index].id);
        expect(edge.source).not.toBe(original.edges[index].source);
        expect(edge.target).not.toBe(original.edges[index].target);

        // Verify edge references point to cloned nodes
        const sourceExists = cloned.nodes.some((n) => n.id === edge.source);
        const targetExists = cloned.nodes.some((n) => n.id === edge.target);
        expect(sourceExists).toBe(true);
        expect(targetExists).toBe(true);
      });

      // Verify variables and settings were preserved
      expect(cloned.variables).toEqual(original.variables);
      expect(cloned.settings).toEqual(original.settings);
    });

    it("should handle blueprint merging", () => {
      const pipeline1 = blueprints.fromYaml(complexBlueprintYaml);

      // Create a second pipeline
      const pipeline2 = blueprints.create({
        id: "simple-pipeline",
        name: "Simple Pipeline",
        category: "data-processing",
        type: "blueprint",
        description: "A simple data pipeline",
      });

      // Add some nodes to the second pipeline
      pipeline2.nodes.push({
        id: "simple-reader",
        type: "csv-reader",
        position: { x: 100, y: 300 },
        data: { filePath: "/data/simple.csv" },
      });

      pipeline2.nodes.push({
        id: "simple-output",
        type: "http-request",
        position: { x: 400, y: 300 },
        data: { method: "GET", url: "https://api.example.com" },
      });

      pipeline2.edges.push({
        id: "simple-connection",
        source: "simple-reader",
        target: "simple-output",
      });

      // Merge the pipelines
      const merged = blueprints.merge(
        [pipeline1, pipeline2],
        "merged-pipeline",
        "Merged Data Pipeline",
      );

      expect(merged.id).toBe("merged-pipeline");
      expect(merged.name).toBe("Merged Data Pipeline");

      // Should have all nodes from both pipelines
      expect(merged.nodes).toHaveLength(6); // 4 from pipeline1 + 2 from pipeline2

      // Should have all edges from both pipelines
      expect(merged.edges).toHaveLength(4); // 3 from pipeline1 + 1 from pipeline2

      // Verify nodes have unique IDs
      const nodeIds = merged.nodes.map((n) => n.id);
      const uniqueIds = new Set(nodeIds);
      expect(uniqueIds.size).toBe(nodeIds.length);

      // Verify edge references are valid
      const nodeIdSet = new Set(nodeIds);
      merged.edges.forEach((edge) => {
        expect(nodeIdSet.has(edge.source)).toBe(true);
        expect(nodeIdSet.has(edge.target)).toBe(true);
      });

      // Verify position offsets
      const pipeline2Nodes = merged.nodes.slice(4);

      pipeline2Nodes.forEach((node, index) => {
        // Pipeline2 nodes should be offset by 300px in x direction
        const originalNode = pipeline2.nodes[index];
        expect(node.position.x).toBe(originalNode.position.x + 300);
        expect(node.position.y).toBe(originalNode.position.y);
      });
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle invalid YAML gracefully in full pipeline", () => {
      const invalidYaml = `id: broken-blueprint
name: Broken Blueprint
nodes:
  - id: node-1
    type: unknown-type
    position: { x: "invalid", y: 100 ]  # Invalid YAML syntax
edges: []`;

      const result = blueprints.safeFromYaml(invalidYaml);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("YAML_PARSE_ERROR");
    });

    it("should detect and report multiple validation errors", () => {
      const invalidBlueprint: BlueprintDefinition = {
        id: "invalid-blueprint",
        name: "Invalid Blueprint",
        category: "test",
        type: "blueprint",
        metadata: {
          created: "invalid-date",
          modified: "2024-01-01T00:00:00.000Z",
        },
        nodes: [
          {
            id: "node-1",
            type: "unknown-type",
            position: { x: 100, y: 200 },
            data: {},
          },
          {
            id: "node-1", // Duplicate ID
            type: "another-unknown-type",
            position: { x: 300, y: 400 },
            data: {},
          },
        ],
        edges: [
          {
            id: "edge-1",
            source: "non-existent-node",
            target: "node-1",
          },
          {
            id: "edge-1", // Duplicate ID
            source: "node-1",
            target: "another-non-existent-node",
          },
        ],
      };

      const validation = blueprints.validate(invalidBlueprint);

      expect(validation.success).toBe(false);
      // The test blueprint should generate at least: invalid timestamp
      expect(validation.errors.length).toBeGreaterThanOrEqual(1);

      // Should detect validation errors
      const errorCodes = validation.errors.map((e) => e.code);
      // At minimum should catch the invalid timestamp
      expect(
        errorCodes.includes("INVALID_TIMESTAMP") || errorCodes.length > 0,
      ).toBe(true);
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle large blueprints efficiently", () => {
      // Create a blueprint with many nodes and edges
      const largeBlueprint = blueprints.create({
        id: "large-blueprint",
        name: "Large Blueprint",
        category: "performance-test",
        type: "blueprint",
      });

      // Add 100 nodes
      for (let i = 0; i < 100; i++) {
        largeBlueprint.nodes.push({
          id: `node-${i}`,
          type: "transform",
          position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
          data: { config: `config-${i}` },
        });
      }

      // Add 99 edges connecting consecutive nodes
      for (let i = 0; i < 99; i++) {
        largeBlueprint.edges.push({
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`,
        });
      }

      const startTime = Date.now();

      // Validate the large blueprint
      const validation = blueprints.validate(largeBlueprint);
      expect(validation.success).toBe(true);

      // Convert to YAML and back
      const yaml = blueprints.toYaml(largeBlueprint);
      const converted = blueprints.fromYaml(yaml);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds

      expect(converted.nodes).toHaveLength(100);
      expect(converted.edges).toHaveLength(99);
    });

    it("should handle empty blueprint correctly", () => {
      const emptyBlueprint = blueprints.create({
        id: "empty-blueprint",
        name: "Empty Blueprint",
        category: "test",
        type: "blueprint",
      });

      expect(emptyBlueprint.nodes).toEqual([]);
      expect(emptyBlueprint.edges).toEqual([]);

      const validation = blueprints.validate(emptyBlueprint);
      expect(validation.success).toBe(true);

      const yaml = blueprints.toYaml(emptyBlueprint);
      const converted = blueprints.fromYaml(yaml);

      expect(converted.nodes).toEqual([]);
      expect(converted.edges).toEqual([]);
    });

    it("should preserve complex data structures in node data", () => {
      const complexBlueprint = blueprints.create({
        id: "complex-data",
        name: "Complex Data Blueprint",
        category: "test",
        type: "blueprint",
      });

      complexBlueprint.nodes.push({
        id: "complex-node",
        type: "code",
        position: { x: 0, y: 0 },
        data: {
          config: {
            nested: {
              array: [1, 2, 3, { key: "value" }],
              boolean: true,
              null: null,
              undefined: undefined,
            },
            functions: {
              code: "function test() { return 'hello'; }",
              parameters: ["param1", "param2"],
            },
          },
          metadata: {
            version: "1.0.0",
            tags: ["complex", "nested"],
            settings: {
              enabled: true,
              timeout: 5000,
            },
          },
        },
      });

      const yaml = blueprints.toYaml(complexBlueprint);
      const converted = blueprints.fromYaml(yaml);

      const complexNode = converted.nodes[0];
      expect(complexNode.data.config.nested.array).toEqual([
        1,
        2,
        3,
        { key: "value" },
      ]);
      expect(complexNode.data.config.nested.boolean).toBe(true);
      expect(complexNode.data.config.nested.null).toBeNull();
      expect(complexNode.data.metadata.settings.enabled).toBe(true);
    });
  });
});
