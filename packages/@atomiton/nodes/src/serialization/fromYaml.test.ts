import { describe, expect, it } from "vitest";
import { fromYaml } from "./fromYaml";

describe("fromYaml", () => {
  describe("basic parsing", () => {
    it("should parse minimal valid YAML", () => {
      const yaml = `
id: test-node-1
name: Test Node
type: atomic
`;
      const result = fromYaml(yaml);

      expect(result.id).toBe("test-node-1");
      expect(result.name).toBe("Test Node");
      expect(result.type).toBe("atomic");
    });

    it("should handle composite type with nodes and edges", () => {
      const yaml = `
id: composite-1
name: Test Composite
type: composite
nodes:
  - id: node-1
    name: First Node
    type: atomic
  - id: node-2
    name: Second Node
    type: atomic
edges:
  - id: edge-1
    source: node-1
    target: node-2
`;
      const result = fromYaml(yaml);

      expect(result.type).toBe("composite");
      expect(result.children).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.children?.[0].id).toBe("node-1");
      expect(result.edges?.[0].source).toBe("node-1");
    });

    it("should parse metadata correctly", () => {
      const yaml = `
id: test-node
name: Test Node
metadata:
  version: 2.0.0
  author: Test Author
  description: Test description
  category: data
  tags:
    - tag1
    - tag2
  keywords:
    - keyword1
    - keyword2
`;
      const result = fromYaml(yaml);

      expect(result.metadata?.version).toBe("2.0.0");
      expect(result.metadata?.author).toBe("Test Author");
      expect(result.metadata?.tags).toEqual(["tag1", "tag2"]);
      expect(result.metadata?.keywords).toEqual(["keyword1", "keyword2"]);
    });
  });

  describe("parameter parsing", () => {
    it("should parse parameters with defaults and controls", () => {
      const yaml = `
id: test-node
name: Test Node
parameters:
  filePath:
    type: string
    default: /tmp/file.txt
    control: text
    required: true
  maxSize:
    type: number
    default: 100
    control: range
    min: 0
    max: 1000
    step: 10
  enabled:
    type: boolean
    default: true
    control: checkbox
`;
      const result = fromYaml(yaml);

      expect(result.parameters.defaults.filePath).toBe("/tmp/file.txt");
      expect(result.parameters.defaults.maxSize).toBe(100);
      expect(result.parameters.defaults.enabled).toBe(true);

      expect(result.parameters.fields.filePath.controlType).toBe("text");
      expect(result.parameters.fields.filePath.required).toBe(true);

      expect(result.parameters.fields.maxSize.controlType).toBe("range");
      expect(result.parameters.fields.maxSize.min).toBe(0);
      expect(result.parameters.fields.maxSize.max).toBe(1000);
    });

    it("should handle select options", () => {
      const yaml = `
id: test-node
name: Test Node
parameters:
  operation:
    type: string
    default: read
    control: select
    options:
      - read
      - write
      - delete
`;
      const result = fromYaml(yaml);

      expect(result.parameters.fields.operation.controlType).toBe("select");
      expect(result.parameters.fields.operation.options).toEqual([
        { value: "read", label: "read" },
        { value: "write", label: "write" },
        { value: "delete", label: "delete" },
      ]);
    });
  });

  describe("port parsing", () => {
    it("should parse input and output ports", () => {
      const yaml = `
id: test-node
name: Test Node
inputPorts:
  - id: input
    name: Input
    type: input
    dataType: any
    required: true
  - id: config
    name: Configuration
    type: input
    dataType: object
outputPorts:
  - id: output
    name: Output
    type: output
    dataType: string
  - id: error
    name: Error
    type: error
    dataType: object
`;
      const result = fromYaml(yaml);

      expect(result.inputPorts).toHaveLength(2);
      expect(result.outputPorts).toHaveLength(2);

      expect(result.inputPorts[0].id).toBe("input");
      expect(result.inputPorts[0].required).toBe(true);

      expect(result.outputPorts[1].type).toBe("error");
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid YAML", () => {
      const invalidYaml = `
id: test
name: [
  invalid yaml
`;
      expect(() => fromYaml(invalidYaml)).toThrow("Failed to parse YAML");
    });

    it("should throw error for missing required fields", () => {
      const yaml = `
name: Test Node
`;
      expect(() => fromYaml(yaml)).toThrow(
        "YAML must contain id and name fields"
      );
    });

    it("should handle empty YAML", () => {
      expect(() => fromYaml("")).toThrow();
    });
  });

  describe("backward compatibility", () => {
    it("should handle top-level description and category", () => {
      const yaml = `
id: test-node
name: Test Node
description: Top level description
category: data
version: 1.0.0
`;
      const result = fromYaml(yaml);

      expect(result.metadata?.description).toBe("Top level description");
      expect(result.metadata?.category).toBe("data");
      expect(result.metadata?.version).toBe("1.0.0");
    });

    it("should merge top-level and nested metadata", () => {
      const yaml = `
id: test-node
name: Test Node
category: data
metadata:
  author: Test Author
  version: 2.0.0
`;
      const result = fromYaml(yaml);

      expect(result.metadata?.category).toBe("data");
      expect(result.metadata?.author).toBe("Test Author");
      expect(result.metadata?.version).toBe("2.0.0");
    });
  });

  describe("additional fields", () => {
    it("should preserve variables and settings", () => {
      const yaml = `
id: test-node
name: Test Node
variables:
  inputPath:
    type: string
    defaultValue: /input
settings:
  runtime:
    timeout: 5000
  ui:
    color: "#FF0000"
`;
      const result = fromYaml(yaml) as any;

      expect(result.variables).toBeDefined();
      expect(result.variables.inputPath.defaultValue).toBe("/input");
      expect(result.settings.runtime.timeout).toBe(5000);
    });
  });
});
