/**
 * createNode Smoke Test - Comprehensive node creation testing
 */

import { describe, expect, it } from "vitest";
import { createNode } from "../../createNode";

describe("createNode Smoke Test", () => {
  describe("Atomic Node Creation", () => {
    it("creates atomic node with minimal config", () => {
      const node = createNode({
        type: "atomic",
        name: "Basic Atomic Node",
        category: "test",
      });

      expect(node.type).toBe("atomic");
      expect(node.name).toBe("Basic Atomic Node");
      expect(node.category).toBe("test");
      expect(node.id).toBeDefined();
      expect(node.version).toBe("1.0.0");
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
        description: "Reads and parses CSV files",
        category: "data",
        version: "2.0.0",
        metadata: customMetadata,
      });

      expect(node.type).toBe("atomic");
      expect(node.name).toBe("CSV Reader");
      expect(node.description).toBe("Reads and parses CSV files");
      expect(node.category).toBe("data");
      expect(node.version).toBe("2.0.0");
      expect(node.metadata?.variant).toBe("csv-reader");
      expect(node.metadata?.tags).toEqual(["data", "import"]);
      expect(node.metadata?.icon).toBe("file");
      expect(node.metadata?.color).toBe("#10b981");
      expect(node.metadata?.created).toBeDefined();
      expect(node.metadata?.modified).toBeDefined();
      expect(node.metadata?.author).toBe("User");
      expect(node.metadata?.source).toBe("user");
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
        category: "processing",
        inputPorts,
        outputPorts,
      });

      expect(node.inputPorts).toEqual(inputPorts);
      expect(node.outputPorts).toEqual(outputPorts);
    });

    it("creates atomic node with different variants", () => {
      const variants = [
        { variant: "http-request", name: "HTTP Request", category: "network" },
        { variant: "shell-command", name: "Shell Command", category: "system" },
        { variant: "code", name: "Code Runner", category: "transform" },
        { variant: "parallel", name: "Parallel Executor", category: "control" },
        { variant: "loop", name: "Loop Controller", category: "control" },
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
          category,
          metadata: { variant },
        });

        expect(node.metadata?.variant).toBe(variant);
        expect(node.name).toBe(name);
        expect(node.category).toBe(category);
      });
    });
  });

  describe("Composite Node Creation", () => {
    it("creates composite node with minimal config", () => {
      const node = createNode({
        type: "composite",
        name: "Basic Blueprint",
        category: "user",
      });

      expect(node.type).toBe("composite");
      expect(node.name).toBe("Basic Blueprint");
      expect(node.category).toBe("user");
      expect(node.id).toBeDefined();
      expect(node.version).toBe("1.0.0");
      expect(node.nodes).toEqual([]);
      expect(node.edges).toEqual([]);
      expect(node.variables).toEqual({});
      expect(node.settings?.runtime?.timeout).toBe(30000);
      expect(node.settings?.runtime?.parallel).toBe(false);
      expect(node.settings?.ui?.color).toBe("#6366f1");
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
        description: "ETL pipeline for data transformation",
        category: "templates",
        version: "3.1.0",
        metadata: customMetadata,
      });

      expect(node.type).toBe("composite");
      expect(node.name).toBe("Data Transform Pipeline");
      expect(node.description).toBe("ETL pipeline for data transformation");
      expect(node.category).toBe("templates");
      expect(node.version).toBe("3.1.0");
      expect(node.metadata?.variant).toBe("data-pipeline");
      expect(node.metadata?.tags).toEqual(["etl", "pipeline", "data"]);
      expect(node.metadata?.icon).toBe("git-branch");
      expect(node.metadata?.color).toBe("#f59e0b");
      expect(node.metadata?.source).toBe("system");
    });

    it("creates composite node with nodes and edges", () => {
      const nodes = [
        {
          id: "node1",
          name: "Code Node",
          category: "transform",
          type: "atomic",
          position: { x: 100, y: 100 },
          data: { code: "return input * 2" },
        },
        {
          id: "node2",
          name: "Transform Node",
          category: "transform",
          type: "atomic",
          position: { x: 300, y: 100 },
          data: { expression: "$.value" },
        },
      ];

      const edges = [
        {
          id: "edge1",
          source: "node1",
          target: "node2",
          sourceHandle: "output",
          targetHandle: "input",
        },
      ];

      const node = createNode({
        type: "composite",
        name: "Processing Blueprint",
        category: "user",
        nodes,
        edges,
      });

      expect(node.nodes).toEqual(nodes);
      expect(node.edges).toEqual(edges);
    });

    it("creates composite node with variables", () => {
      const variables = {
        apiKey: {
          name: "API Key",
          type: "string",
          description: "API authentication key",
          required: true,
        },
        maxRetries: {
          name: "Max Retries",
          type: "number",
          description: "Maximum number of retry attempts",
          defaultValue: 3,
        },
      };

      const node = createNode({
        type: "composite",
        name: "API Integration",
        category: "integration",
        variables,
      });

      expect(node.variables).toEqual(variables);
    });

    it("creates composite node with custom settings", () => {
      const customSettings = {
        runtime: {
          timeout: 60000,
          parallel: true,
        },
        ui: {
          color: "#ef4444",
        },
      };

      const node = createNode({
        type: "composite",
        name: "High Performance Pipeline",
        category: "advanced",
        settings: customSettings,
      });

      expect(node.settings?.runtime?.timeout).toBe(60000);
      expect(node.settings?.runtime?.parallel).toBe(true);
      expect(node.settings?.ui?.color).toBe("#ef4444");
    });

    it("creates composite nodes with different variants", () => {
      const variants = [
        { variant: "hello-world", name: "Hello World", category: "examples" },
        {
          variant: "data-transform",
          name: "Data Transform",
          category: "templates",
        },
        {
          variant: "image-processor",
          name: "Image Processor",
          category: "media",
        },
        {
          variant: "api-workflow",
          name: "API Workflow",
          category: "integration",
        },
        {
          variant: "batch-processor",
          name: "Batch Processor",
          category: "automation",
        },
      ];

      variants.forEach(({ variant, name, category }) => {
        const node = createNode({
          type: "composite",
          name,
          category,
          metadata: { variant },
        });

        expect(node.metadata?.variant).toBe(variant);
        expect(node.name).toBe(name);
        expect(node.category).toBe(category);
      });
    });
  });

  describe("Default Behavior", () => {
    it("defaults to composite type when type is not specified", () => {
      const node = createNode({
        name: "Default Node",
      });

      expect(node.type).toBe("composite");
      expect(node.nodes).toBeDefined();
      expect(node.edges).toBeDefined();
      expect(node.inputPorts).toBeUndefined();
      expect(node.outputPorts).toBeUndefined();
    });

    it("uses default values for optional fields", () => {
      const node = createNode({
        name: "Minimal Node",
      });

      expect(node.description).toBe("");
      expect(node.category).toBe("user");
      expect(node.version).toBe("1.0.0");
      expect(node.metadata?.author).toBe("User");
      expect(node.metadata?.source).toBe("user");
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
    it("sets creation and modification timestamps", () => {
      const beforeCreation = new Date().toISOString();
      const node = createNode({
        name: "Timestamped Node",
        type: "atomic",
      });
      const afterCreation = new Date().toISOString();

      expect(node.metadata?.created).toBeDefined();
      expect(node.metadata?.modified).toBeDefined();
      expect(node.metadata?.created).toBe(node.metadata?.modified);

      const createdTime = new Date(node.metadata!.created!).getTime();
      const beforeTime = new Date(beforeCreation).getTime();
      const afterTime = new Date(afterCreation).getTime();

      expect(createdTime).toBeGreaterThanOrEqual(beforeTime);
      expect(createdTime).toBeLessThanOrEqual(afterTime);
    });

    it("merges custom metadata with defaults", () => {
      const customMetadata = {
        variant: "custom-processor",
        customField: "customValue",
      };

      const node = createNode({
        name: "Custom Metadata Node",
        type: "atomic",
        metadata: customMetadata,
      });

      expect(node.metadata?.variant).toBe("custom-processor");
      expect(node.metadata?.customField).toBe("customValue");
      expect(node.metadata?.created).toBeDefined();
      expect(node.metadata?.modified).toBeDefined();
      expect(node.metadata?.author).toBe("User");
      expect(node.metadata?.source).toBe("user");
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
        description: "",
        category: "",
        version: "",
      });

      expect(node.description).toBe("");
      expect(node.category).toBe("user");
      expect(node.version).toBe("1.0.0");
    });

    it("handles very long names and descriptions", () => {
      const longName = "A".repeat(500);
      const longDescription = "B".repeat(1000);

      const node = createNode({
        name: longName,
        description: longDescription,
        type: "atomic",
      });

      expect(node.name).toBe(longName);
      expect(node.description).toBe(longDescription);
    });

    it("handles special characters in names and descriptions", () => {
      const specialName = "Node-123_with.special@chars!#$%";
      const specialDescription =
        "Description with 'quotes' and \"double quotes\" and \n newlines";

      const node = createNode({
        name: specialName,
        description: specialDescription,
        type: "composite",
      });

      expect(node.name).toBe(specialName);
      expect(node.description).toBe(specialDescription);
    });

    it("handles nodes with deeply nested metadata", () => {
      const deepMetadata = {
        variant: "complex-node",
        customData: {
          level1: {
            level2: {
              level3: {
                value: "deep value",
              },
            },
          },
        },
      };

      const node = createNode({
        name: "Deep Metadata Node",
        type: "atomic",
        metadata: deepMetadata,
      });

      expect(node.metadata?.variant).toBe("complex-node");
      expect(
        (
          node.metadata?.customData as {
            level1?: { level2?: { level3?: { value?: string } } };
          }
        )?.level1?.level2?.level3?.value,
      ).toBe("deep value");
    });
  });
});
