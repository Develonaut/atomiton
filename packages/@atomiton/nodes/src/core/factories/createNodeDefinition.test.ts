/**
 * createNode Smoke Test - Comprehensive node creation testing
 */

import { describe, expect, it } from "vitest";
import { createNode } from "#core/factories/createNodeDefinition";

describe("createNode Smoke Test", () => {
  describe("Atomic Node Creation", () => {
    it("creates atomic node with minimal config", () => {
      const node = createNode({
        type: "atomic",
        name: "Basic Atomic Node",
        metadata: { category: "utility" },
      });

      expect(node.type).toBe("atomic");
      expect(node.name).toBe("Basic Atomic Node");
      expect(node.metadata.category).toBe("utility");
      expect(node.id).toBeDefined();
      expect(node.metadata.version).toBe("1.0.0");
      expect(node.inputPorts).toEqual([]);
      expect(node.outputPorts).toEqual([]);
      expect(node.parameters).toEqual({});
    });

    it("creates atomic node with full metadata", () => {
      const customMetadata = {
        variant: "csv-reader",
        tags: ["data", "import"],
        icon: "file" as const,
        color: "#10b981",
      };

      const node = createNode({
        id: "csv-reader-node", // Existing node, so any version is allowed
        type: "atomic",
        name: "CSV Reader",
        metadata: {
          ...customMetadata,
          description: "Reads and parses CSV files",
          category: "data",
          version: "2.0.0",
        },
      });

      expect(node.type).toBe("atomic");
      expect(node.name).toBe("CSV Reader");
      expect(node.metadata.description).toBe("Reads and parses CSV files");
      expect(node.metadata.category).toBe("data");
      expect(node.metadata.version).toBe("2.0.0");
      expect(node.metadata?.variant).toBe("csv-reader");
      expect(node.metadata?.tags).toEqual(["data", "import"]);
      expect(node.metadata?.icon).toBe("file");
      expect(node.metadata?.author).toBeDefined();
      expect(node.metadata?.source).toBeDefined();
    });

    it("creates atomic node with ports", () => {
      const inputPorts = [
        {
          id: "input",
          name: "Input Data",
          type: "input" as const,
          dataType: "any" as const,
          required: true,
        },
        {
          id: "config",
          name: "Configuration",
          type: "input" as const,
          dataType: "object" as const,
          required: false,
        },
      ];

      const outputPorts = [
        {
          id: "output",
          name: "Processed Data",
          type: "output" as const,
          dataType: "any" as const,
        },
        {
          id: "error",
          name: "Error",
          type: "output" as const,
          dataType: "string" as const,
        },
      ];

      const node = createNode({
        type: "atomic",
        name: "Data Processor",
        metadata: { category: "data" },
        ports: { input: inputPorts, output: outputPorts },
      });

      expect(node.inputPorts).toEqual(inputPorts);
      expect(node.outputPorts).toEqual(outputPorts);
    });

    it("creates atomic node with different variants", () => {
      const variants = [
        { variant: "http-request", name: "HTTP Request", category: "io" },
        { variant: "shell-command", name: "Shell Command", category: "system" },
        { variant: "code", name: "Code Runner", category: "data" },
        { variant: "parallel", name: "Parallel Executor", category: "logic" },
        { variant: "loop", name: "Loop Controller", category: "logic" },
        {
          variant: "image-composite",
          name: "Image Compositor",
          category: "media",
        },
      ];

      variants.forEach(({ variant, name, category }) => {
        const node = createNode({
          type: "atomic",
          name,
          metadata: { variant, category },
        });

        expect(node.metadata?.variant).toBe(variant);
        expect(node.name).toBe(name);
        expect(node.metadata.category).toBe(category);
      });
    });
  });

  describe("Composite Node Creation", () => {
    it("creates composite node with minimal config", () => {
      const node = createNode({
        type: "composite",
        name: "Basic Blueprint",
        metadata: { category: "user" },
      });

      expect(node.type).toBe("composite");
      expect(node.name).toBe("Basic Blueprint");
      expect(node.metadata.category).toBe("user");
      expect(node.id).toBeDefined();
      expect(node.metadata.version).toBe("1.0.0");
      expect(node.children).toEqual([]);
      expect(node.edges).toEqual([]);
    });

    it("creates composite node with full metadata and variants", () => {
      const customMetadata = {
        variant: "data-pipeline",
        tags: ["etl", "pipeline", "data"],
        icon: "git-branch" as const,
        color: "#f59e0b",
        source: "system" as const,
      };

      const node = createNode({
        id: "etl-pipeline-node", // Existing node, so any version is allowed
        type: "composite",
        name: "Data Transform Pipeline",
        metadata: {
          ...customMetadata,
          description: "ETL pipeline for data transformation",
          category: "composite",
          version: "3.1.0",
        },
      });

      expect(node.type).toBe("composite");
      expect(node.name).toBe("Data Transform Pipeline");
      expect(node.metadata.description).toBe(
        "ETL pipeline for data transformation",
      );
      expect(node.metadata.category).toBe("composite");
      expect(node.metadata.version).toBe("3.1.0");
      expect(node.metadata?.variant).toBe("data-pipeline");
      expect(node.metadata?.tags).toEqual(["etl", "pipeline", "data"]);
      expect(node.metadata?.icon).toBe("git-branch");
      expect(node.metadata?.source).toBe("system");
    });

    it("creates composite node with child nodes and edges", () => {
      const childNode1 = createNode({
        id: "node1",
        name: "Code Node",
        type: "atomic",
        position: { x: 100, y: 100 },
        metadata: { category: "data" },
      });

      const childNode2 = createNode({
        id: "node2",
        name: "Transform Node",
        type: "atomic",
        position: { x: 300, y: 100 },
        metadata: { category: "data" },
      });

      const node = createNode({
        type: "composite",
        name: "Processing Blueprint",
        metadata: { category: "user" },
        children: [childNode1, childNode2],
        edges: [],
      });

      expect(node.children).toHaveLength(2);
      expect(node.children?.[0]?.id).toBe("node1");
      expect(node.children?.[1]?.id).toBe("node2");
      expect(node.edges).toEqual([]);
    });

    it("creates composite node with custom parameters", () => {
      const customParameters = {
        apiKey: "test-key",
        maxRetries: 3,
      };

      const node = createNode({
        type: "composite",
        name: "API Integration",
        metadata: { category: "communication" },
        parameters: customParameters,
      });

      expect(node.parameters).toEqual(customParameters);
    });

    it("creates composite node with runtime metadata", () => {
      const runtimeMetadata = {
        runtime: {
          language: "typescript" as const,
        },
        experimental: true,
      };

      const node = createNode({
        type: "composite",
        name: "High Performance Pipeline",
        metadata: {
          category: "system",
          ...runtimeMetadata,
        },
      });

      expect(node.metadata.runtime?.language).toBe("typescript");
      expect(node.metadata.experimental).toBe(true);
    });

    it("creates composite nodes with different variants", () => {
      const variants = [
        { variant: "hello-world", name: "Hello World", category: "user" },
        {
          variant: "data-transform",
          name: "Data Transform",
          category: "data",
        },
        {
          variant: "image-processor",
          name: "Image Processor",
          category: "media",
        },
        {
          variant: "api-workflow",
          name: "API Workflow",
          category: "communication",
        },
        {
          variant: "batch-processor",
          name: "Batch Processor",
          category: "utility",
        },
      ];

      variants.forEach(({ variant, name, category }) => {
        const node = createNode({
          type: "composite",
          name,
          metadata: { variant, category },
        });

        expect(node.metadata?.variant).toBe(variant);
        expect(node.name).toBe(name);
        expect(node.metadata.category).toBe(category);
      });
    });
  });

  describe("Default Behavior", () => {
    it("defaults to composite type when type is not specified", () => {
      const node = createNode({
        name: "Default Node",
      });

      expect(node.type).toBe("composite");
      expect(node.children).toBeDefined();
      expect(node.edges).toBeDefined();
      expect(node.inputPorts).toBeDefined();
      expect(node.outputPorts).toBeDefined();
    });

    it("uses default values for optional fields", () => {
      const node = createNode({
        name: "Minimal Node",
      });

      expect(node.metadata.description).toBe("Minimal Node node");
      expect(node.metadata.category).toBe("utility");
      expect(node.metadata.version).toBe("1.0.0");
      expect(node.metadata?.author).toBeDefined();
    });

    it("preserves custom ID when provided", () => {
      const customId = "custom-node-123";
      const node = createNode({
        id: customId,
        name: "Custom ID Node",
        type: "atomic",
      });

      expect(node.id).toBe(customId);
    });

    it("generates unique IDs for multiple nodes", () => {
      const node1 = createNode({ name: "Node 1" });
      const node2 = createNode({ name: "Node 2" });
      const node3 = createNode({ name: "Node 3" });

      expect(node1.id).toBeDefined();
      expect(node2.id).toBeDefined();
      expect(node3.id).toBeDefined();
      expect(node1.id).not.toBe(node2.id);
      expect(node2.id).not.toBe(node3.id);
      expect(node1.id).not.toBe(node3.id);
    });
  });

  describe("Metadata Handling", () => {
    it("generates unique node IDs consistently", () => {
      const node1 = createNode({
        name: "Test Node 1",
        type: "atomic",
      });
      const node2 = createNode({
        name: "Test Node 2",
        type: "atomic",
      });

      expect(node1.id).toBeDefined();
      expect(node2.id).toBeDefined();
      expect(node1.id).not.toBe(node2.id);
      expect(node1.metadata.id).toBe(node1.id);
      expect(node2.metadata.id).toBe(node2.id);
    });

    it("merges custom metadata with defaults", () => {
      const customMetadata = {
        variant: "custom-processor",
        experimental: true,
      };

      const node = createNode({
        name: "Custom Metadata Node",
        type: "atomic",
        metadata: customMetadata,
      });

      expect(node.metadata?.variant).toBe("custom-processor");
      expect(node.metadata?.experimental).toBe(true);
      expect(node.metadata?.author).toBeDefined();
      expect(node.metadata?.source).toBeDefined();
    });

    it("allows overriding default metadata values", () => {
      const node = createNode({
        name: "System Node",
        type: "composite",
        metadata: {
          author: "System",
          source: "system" as const,
        },
      });

      expect(node.metadata?.author).toBe("System");
      expect(node.metadata?.source).toBe("system");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty strings in optional fields", () => {
      const node = createNode({
        name: "Node with Empty Fields",
        metadata: {
          description: "",
          category: "utility",
          version: "1.0.0",
        },
      });

      expect(node.metadata.description).toBe("");
      expect(node.metadata.category).toBe("utility");
      expect(node.metadata.version).toBe("1.0.0");
    });

    it("handles very long names and descriptions", () => {
      const longName = "A".repeat(500);
      const longDescription = "B".repeat(1000);

      const node = createNode({
        name: longName,
        metadata: {
          description: longDescription,
        },
        type: "atomic",
      });

      expect(node.name).toBe(longName);
      expect(node.metadata.description).toBe(longDescription);
    });

    it("handles special characters in names and descriptions", () => {
      const specialName = "Node-123_with.special@chars!#$%";
      const specialDescription =
        "Description with 'quotes' and \"double quotes\" and \n newlines";

      const node = createNode({
        name: specialName,
        metadata: {
          description: specialDescription,
        },
        type: "composite",
      });

      expect(node.name).toBe(specialName);
      expect(node.metadata.description).toBe(specialDescription);
    });

    it("handles nodes with complex metadata examples", () => {
      const complexMetadata = {
        variant: "complex-node",
        examples: [
          {
            name: "Basic Example",
            description: "A simple usage example",
            config: { setting: "value" },
          },
          {
            name: "Advanced Example",
            description: "Complex nested configuration",
            config: {
              nested: {
                deep: {
                  value: "deep value",
                },
              },
            },
          },
        ],
      };

      const node = createNode({
        name: "Complex Metadata Node",
        type: "atomic",
        metadata: complexMetadata,
      });

      expect(node.metadata?.variant).toBe("complex-node");
      expect(node.metadata?.examples).toHaveLength(2);
      expect(node.metadata?.examples?.[1]?.config).toEqual({
        nested: { deep: { value: "deep value" } },
      });
    });
  });
});
