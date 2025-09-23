import type { NodeDefinition } from "#core/types";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { fromYaml } from "./fromYaml";
import { toYaml } from "./toYaml";

describe("toYaml", () => {
  describe("basic serialization", () => {
    it("should serialize minimal node definition", () => {
      const definition: NodeDefinition = {
        id: "test-1",
        name: "Test Node",
        type: "atomic",
        position: { x: 100, y: 200 },
        metadata: {
          id: "test-1",
          name: "Test Node",
          variant: "test",
          version: "1.0.0",
          author: "Test",
          description: "Test description",
          category: "test",
          icon: "file",
          source: "user",
        },
        parameters: {
          schema: {} as any,
          defaults: {},
          fields: {},
          parse: (p) => p,
          safeParse: (p) => ({ success: true, data: p }),
          isValid: () => true,
          withDefaults: (p) => p || {},
        },
        inputPorts: [],
        outputPorts: [],
      };

      const yamlStr = toYaml(definition);
      const parsed = yaml.load(yamlStr) as any;

      expect(parsed.id).toBe("test-1");
      expect(parsed.name).toBe("Test Node");
      expect(parsed.type).toBe("atomic");
    });

    it("should serialize composite with nodes and edges", () => {
      const definition: NodeDefinition = {
        id: "composite-1",
        name: "Test Composite",
        type: "composite",
        position: { x: 0, y: 0 },
        metadata: {
          id: "composite-1",
          name: "Test Composite",
          variant: "composite",
          version: "1.0.0",
          author: "Test",
          description: "Composite test",
          category: "logic",
          icon: "layers",
          source: "system",
        },
        parameters: {
          schema: {} as any,
          defaults: {},
          fields: {},
          parse: (p) => p,
          safeParse: (p) => ({ success: true, data: p }),
          isValid: () => true,
          withDefaults: (p) => p || {},
        },
        inputPorts: [],
        outputPorts: [],
        children: [
          {
            id: "child-1",
            name: "Child Node",
            type: "atomic",
            position: { x: 50, y: 50 },
            metadata: {} as any,
            parameters: {} as any,
            inputPorts: [],
            outputPorts: [],
          },
        ],
        edges: [
          {
            id: "edge-1",
            source: "child-1",
            target: "child-2",
            sourceHandle: "output",
            targetHandle: "input",
          },
        ],
      };

      const yamlStr = toYaml(definition);
      const parsed = yaml.load(yamlStr) as any;

      expect(parsed.nodes).toHaveLength(1);
      expect(parsed.edges).toHaveLength(1);
      expect(parsed.nodes[0].id).toBe("child-1");
    });
  });

  describe("parameter serialization", () => {
    it("should serialize parameters with fields and defaults", () => {
      const definition: NodeDefinition = {
        id: "test-1",
        name: "Test",
        type: "atomic",
        position: { x: 0, y: 0 },
        metadata: {} as any,
        parameters: {
          schema: {} as any,
          defaults: {
            filePath: "/tmp/test.txt",
            maxSize: 100,
            enabled: true,
          },
          fields: {
            filePath: {
              controlType: "text",
              label: "File Path",
              required: true,
              placeholder: "Enter path",
            },
            maxSize: {
              controlType: "number",
              label: "Max Size",
              min: 0,
              max: 1000,
            },
            enabled: {
              controlType: "boolean",
              label: "Enabled",
            },
          },
          parse: (p) => p,
          safeParse: (p) => ({ success: true, data: p }),
          isValid: () => true,
          withDefaults: (p) => p || {},
        },
        inputPorts: [],
        outputPorts: [],
      };

      const yamlStr = toYaml(definition);
      const parsed = yaml.load(yamlStr) as any;

      expect(parsed.parameters.filePath.default).toBe("/tmp/test.txt");
      expect(parsed.parameters.filePath.control).toBe("text");
      expect(parsed.parameters.filePath.required).toBe(true);

      expect(parsed.parameters.maxSize.min).toBe(0);
      expect(parsed.parameters.maxSize.max).toBe(1000);
    });
  });

  describe("port serialization", () => {
    it("should serialize ports correctly", () => {
      const definition: NodeDefinition = {
        id: "test-1",
        name: "Test",
        type: "atomic",
        position: { x: 0, y: 0 },
        metadata: {} as any,
        parameters: {} as any,
        inputPorts: [
          {
            id: "input",
            name: "Input",
            type: "input",
            dataType: "any",
            required: true,
            description: "Main input",
          },
        ],
        outputPorts: [
          {
            id: "output",
            name: "Output",
            type: "output",
            dataType: "string",
          },
          {
            id: "error",
            name: "Error",
            type: "error",
            dataType: "object",
          },
        ],
      };

      const yamlStr = toYaml(definition);
      const parsed = yaml.load(yamlStr) as any;

      expect(parsed.inputPorts).toHaveLength(1);
      expect(parsed.outputPorts).toHaveLength(2);
      expect(parsed.inputPorts[0].required).toBe(true);
      expect(parsed.outputPorts[1].type).toBe("error");
    });
  });

  describe("roundtrip testing", () => {
    it("should maintain data through serialization and parsing", () => {
      const original: NodeDefinition = {
        id: "roundtrip-test",
        name: "Roundtrip Test",
        type: "composite",
        position: { x: 100, y: 200 },
        metadata: {
          id: "roundtrip-test",
          name: "Roundtrip Test",
          variant: "test",
          version: "1.2.3",
          author: "Test Author",
          description: "Testing roundtrip",
          category: "test",
          icon: "check",
          source: "user",
          tags: ["test", "roundtrip"],
          keywords: ["test", "yaml", "serialization"],
        },
        parameters: {
          schema: {} as any,
          defaults: {
            testParam: "value",
          },
          fields: {
            testParam: {
              controlType: "text",
              label: "Test Param",
            },
          },
          parse: (p) => p,
          safeParse: (p) => ({ success: true, data: p }),
          isValid: () => true,
          withDefaults: (p) => p || {},
        },
        inputPorts: [
          {
            id: "in",
            name: "Input",
            type: "input",
            dataType: "any",
          },
        ],
        outputPorts: [
          {
            id: "out",
            name: "Output",
            type: "output",
            dataType: "any",
          },
        ],
      };

      const yamlStr = toYaml(original);
      const restored = fromYaml(yamlStr);

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.type).toBe(original.type);
      expect(restored.metadata?.version).toBe(original.metadata.version);
      expect(restored.metadata?.tags).toEqual(original.metadata.tags);
      expect(restored.parameters.defaults.testParam).toBe("value");
    });
  });


  describe("error handling", () => {
    it("should handle circular references gracefully", () => {
      const definition: any = {
        id: "test-1",
        name: "Test",
        type: "atomic",
        metadata: {} as any,
        parameters: {} as any,
        inputPorts: [],
        outputPorts: [],
      };

      // Create circular reference
      definition.circular = definition;

      // Should not throw, YAML library handles this
      expect(() => toYaml(definition)).not.toThrow();
    });
  });
});
