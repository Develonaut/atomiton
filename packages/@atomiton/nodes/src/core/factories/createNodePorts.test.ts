/**
 * Contract tests for createNodePorts factory
 *
 * Tests the contracts that createNodePorts establishes:
 * - Input validation and port creation
 * - Output shape and structure guarantees
 * - Default value application for port properties
 * - Port type assignment (input vs output)
 * - Data type preservation
 * - Edge cases and boundary conditions
 */

import { describe, expect, it } from "vitest";
import { createNodePorts, type NodePortInput } from "./createNodePorts";
import type { NodePortDataType } from "@/types/nodePort";

describe("createNodePorts - Contract Tests", () => {
  const basicInputPort: NodePortInput = {
    id: "input-1",
    name: "Input Data",
    dataType: "string",
  };

  const basicOutputPort: NodePortInput = {
    id: "output-1",
    name: "Output Data",
    dataType: "string",
  };

  describe("Input validation contracts", () => {
    it("accepts empty input object", () => {
      const result = createNodePorts({});

      expect(result).toBeDefined();
      expect(result.input).toEqual([]);
      expect(result.output).toEqual([]);
    });

    it("accepts minimal valid input with empty arrays", () => {
      const result = createNodePorts({
        input: [],
        output: [],
      });

      expect(result).toBeDefined();
      expect(result.input).toEqual([]);
      expect(result.output).toEqual([]);
    });

    it("handles undefined input and output arrays", () => {
      const result = createNodePorts({
        input: undefined,
        output: undefined,
      });

      expect(result.input).toEqual([]);
      expect(result.output).toEqual([]);
    });

    it("handles null input object gracefully", () => {
      expect(() => {
        // @ts-expect-error - Intentionally testing null input
        createNodePorts(null);
      }).toThrow();
    });

    it("handles undefined input object gracefully", () => {
      expect(() => {
        // @ts-expect-error - Intentionally testing undefined input
        createNodePorts(undefined);
      }).toThrow();
    });
  });

  describe("Input port creation contracts", () => {
    it("creates input ports with correct type", () => {
      const result = createNodePorts({
        input: [basicInputPort],
      });

      expect(result.input).toHaveLength(1);
      expect(result.input[0].type).toBe("input");
    });

    it("preserves all input port properties", () => {
      const detailedPort: NodePortInput = {
        id: "detailed-input",
        name: "Detailed Input Port",
        dataType: "object",
        required: true,
        multiple: true,
        description: "A detailed input port for testing",
        defaultValue: { key: "value" },
      };

      const result = createNodePorts({
        input: [detailedPort],
      });

      const port = result.input[0];
      expect(port.id).toBe("detailed-input");
      expect(port.name).toBe("Detailed Input Port");
      expect(port.dataType).toBe("object");
      expect(port.required).toBe(true);
      expect(port.multiple).toBe(true);
      expect(port.description).toBe("A detailed input port for testing");
      expect(port.defaultValue).toEqual({ key: "value" });
    });

    it("applies default values for optional properties", () => {
      const minimalPort: NodePortInput = {
        id: "minimal-input",
        name: "Minimal Port",
        dataType: "any",
      };

      const result = createNodePorts({
        input: [minimalPort],
      });

      const port = result.input[0];
      expect(port.required).toBe(false);
      expect(port.multiple).toBe(false);
      expect(port.description).toBeUndefined();
      expect(port.defaultValue).toBeUndefined();
    });

    it("preserves explicit false values", () => {
      const explicitPort: NodePortInput = {
        id: "explicit-input",
        name: "Explicit Port",
        dataType: "boolean",
        required: false,
        multiple: false,
      };

      const result = createNodePorts({
        input: [explicitPort],
      });

      const port = result.input[0];
      expect(port.required).toBe(false);
      expect(port.multiple).toBe(false);
    });
  });

  describe("Output port creation contracts", () => {
    it("creates output ports with correct type", () => {
      const result = createNodePorts({
        output: [basicOutputPort],
      });

      expect(result.output).toHaveLength(1);
      expect(result.output[0].type).toBe("output");
    });

    it("preserves all output port properties", () => {
      const detailedPort: NodePortInput = {
        id: "detailed-output",
        name: "Detailed Output Port",
        dataType: "array",
        required: false,
        multiple: false,
        description: "A detailed output port for testing",
        defaultValue: [],
      };

      const result = createNodePorts({
        output: [detailedPort],
      });

      const port = result.output[0];
      expect(port.id).toBe("detailed-output");
      expect(port.name).toBe("Detailed Output Port");
      expect(port.dataType).toBe("array");
      expect(port.required).toBe(false);
      expect(port.multiple).toBe(false);
      expect(port.description).toBe("A detailed output port for testing");
      expect(port.defaultValue).toEqual([]);
    });

    it("applies default values for optional properties", () => {
      const minimalPort: NodePortInput = {
        id: "minimal-output",
        name: "Minimal Port",
        dataType: "number",
      };

      const result = createNodePorts({
        output: [minimalPort],
      });

      const port = result.output[0];
      expect(port.required).toBe(false);
      expect(port.multiple).toBe(false);
      expect(port.description).toBeUndefined();
      expect(port.defaultValue).toBeUndefined();
    });
  });

  describe("Data type preservation contracts", () => {
    it("handles all supported data types", () => {
      const dataTypes: NodePortDataType[] = [
        "string",
        "number",
        "boolean",
        "object",
        "array",
        "any",
        "buffer",
        "stream",
        "date",
        "regex",
        "json",
        "xml",
        "html",
        "markdown",
        "csv",
        "binary",
      ];

      const inputPorts = dataTypes.map((dataType, index) => ({
        id: `input-${index}`,
        name: `Input ${dataType}`,
        dataType,
      }));

      const result = createNodePorts({
        input: inputPorts,
      });

      expect(result.input).toHaveLength(dataTypes.length);
      result.input.forEach((port, index) => {
        expect(port.dataType).toBe(dataTypes[index]);
      });
    });

    it("preserves complex data type semantics", () => {
      const complexPorts: NodePortInput[] = [
        { id: "json-port", name: "JSON Data", dataType: "json" },
        { id: "stream-port", name: "Data Stream", dataType: "stream" },
        { id: "buffer-port", name: "Binary Buffer", dataType: "buffer" },
      ];

      const result = createNodePorts({
        input: complexPorts,
        output: complexPorts,
      });

      expect(result.input[0].dataType).toBe("json");
      expect(result.input[1].dataType).toBe("stream");
      expect(result.input[2].dataType).toBe("buffer");
      expect(result.output[0].dataType).toBe("json");
      expect(result.output[1].dataType).toBe("stream");
      expect(result.output[2].dataType).toBe("buffer");
    });
  });

  describe("Multiple port handling contracts", () => {
    it("creates multiple input ports correctly", () => {
      const inputPorts: NodePortInput[] = [
        { id: "input-1", name: "First Input", dataType: "string" },
        { id: "input-2", name: "Second Input", dataType: "number" },
        { id: "input-3", name: "Third Input", dataType: "boolean" },
      ];

      const result = createNodePorts({
        input: inputPorts,
      });

      expect(result.input).toHaveLength(3);
      result.input.forEach((port, index) => {
        expect(port.type).toBe("input");
        expect(port.id).toBe(inputPorts[index].id);
        expect(port.name).toBe(inputPorts[index].name);
        expect(port.dataType).toBe(inputPorts[index].dataType);
      });
    });

    it("creates multiple output ports correctly", () => {
      const outputPorts: NodePortInput[] = [
        { id: "output-1", name: "Result", dataType: "object" },
        { id: "output-2", name: "Error", dataType: "string" },
      ];

      const result = createNodePorts({
        output: outputPorts,
      });

      expect(result.output).toHaveLength(2);
      result.output.forEach((port, index) => {
        expect(port.type).toBe("output");
        expect(port.id).toBe(outputPorts[index].id);
        expect(port.name).toBe(outputPorts[index].name);
        expect(port.dataType).toBe(outputPorts[index].dataType);
      });
    });

    it("handles mixed input and output ports", () => {
      const result = createNodePorts({
        input: [
          { id: "input-1", name: "Data In", dataType: "any" },
          { id: "input-2", name: "Config In", dataType: "object" },
        ],
        output: [
          { id: "output-1", name: "Data Out", dataType: "any" },
          { id: "output-2", name: "Status Out", dataType: "string" },
          { id: "output-3", name: "Error Out", dataType: "string" },
        ],
      });

      expect(result.input).toHaveLength(2);
      expect(result.output).toHaveLength(3);

      result.input.forEach((port) => expect(port.type).toBe("input"));
      result.output.forEach((port) => expect(port.type).toBe("output"));
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("handles empty port arrays", () => {
      const result = createNodePorts({
        input: [],
        output: [],
      });

      expect(result.input).toEqual([]);
      expect(result.output).toEqual([]);
    });

    it("handles very large port arrays", () => {
      const largeInputArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `input-${i}`,
        name: `Input Port ${i}`,
        dataType: "any" as NodePortDataType,
      }));

      const result = createNodePorts({
        input: largeInputArray,
      });

      expect(result.input).toHaveLength(1000);
      expect(result.input[999].id).toBe("input-999");
      expect(result.input[999].type).toBe("input");
    });

    it("handles ports with special characters in names", () => {
      const specialPort: NodePortInput = {
        id: "special-port",
        name: "Port with 'quotes' and \"double quotes\" and \n newlines & symbols!@#$%",
        dataType: "string",
        description: "Description with <HTML> tags & special chars",
      };

      const result = createNodePorts({
        input: [specialPort],
      });

      const port = result.input[0];
      expect(port.name).toBe(
        "Port with 'quotes' and \"double quotes\" and \n newlines & symbols!@#$%",
      );
      expect(port.description).toBe(
        "Description with <HTML> tags & special chars",
      );
    });

    it("handles ports with very long strings", () => {
      const longString = "a".repeat(10000);
      const longPort: NodePortInput = {
        id: longString,
        name: longString,
        dataType: "string",
        description: longString,
      };

      const result = createNodePorts({
        input: [longPort],
      });

      const port = result.input[0];
      expect(port.id).toHaveLength(10000);
      expect(port.name).toHaveLength(10000);
      expect(port.description).toHaveLength(10000);
    });

    it("handles ports with complex default values", () => {
      const complexDefault = {
        nested: {
          array: [1, 2, 3],
          object: { key: "value" },
          nullValue: null,
          undefinedValue: undefined,
        },
        circular: null as unknown,
      };
      complexDefault.circular = complexDefault;

      const complexPort: NodePortInput = {
        id: "complex-port",
        name: "Complex Port",
        dataType: "object",
        defaultValue: complexDefault,
      };

      const result = createNodePorts({
        input: [complexPort],
      });

      const port = result.input[0];
      expect(port.defaultValue).toBe(complexDefault);
      expect(
        (port.defaultValue as Record<string, unknown>).nested.array,
      ).toEqual([1, 2, 3]);
      expect((port.defaultValue as Record<string, unknown>).circular).toBe(
        complexDefault,
      );
    });

    it("preserves port object references", () => {
      const portInput = {
        id: "reference-port",
        name: "Reference Port",
        dataType: "any" as NodePortDataType,
        description: "Testing reference preservation",
      };

      const result = createNodePorts({
        input: [portInput],
      });

      // The created port should have the same values but be a new object
      const createdPort = result.input[0];
      expect(createdPort.id).toBe(portInput.id);
      expect(createdPort.name).toBe(portInput.name);
      expect(createdPort.description).toBe(portInput.description);
      expect(createdPort).not.toBe(portInput); // Different object reference
    });

    it("handles duplicate port IDs", () => {
      const duplicatePorts: NodePortInput[] = [
        { id: "duplicate", name: "First Port", dataType: "string" },
        { id: "duplicate", name: "Second Port", dataType: "number" },
      ];

      const result = createNodePorts({
        input: duplicatePorts,
      });

      // Should create both ports regardless of duplicate IDs
      expect(result.input).toHaveLength(2);
      expect(result.input[0].id).toBe("duplicate");
      expect(result.input[1].id).toBe("duplicate");
      expect(result.input[0].name).toBe("First Port");
      expect(result.input[1].name).toBe("Second Port");
    });
  });

  describe("Output guarantees", () => {
    it("always returns object with input and output arrays", () => {
      const result = createNodePorts({});

      expect(result).toHaveProperty("input");
      expect(result).toHaveProperty("output");
      expect(Array.isArray(result.input)).toBe(true);
      expect(Array.isArray(result.output)).toBe(true);
    });

    it("returns exactly two properties", () => {
      const result = createNodePorts({
        input: [basicInputPort],
        output: [basicOutputPort],
      });

      const keys = Object.keys(result);
      expect(keys).toHaveLength(2);
      expect(keys.sort()).toEqual(["input", "output"]);
    });

    it("creates port objects with required NodePort properties", () => {
      const result = createNodePorts({
        input: [basicInputPort],
        output: [basicOutputPort],
      });

      const inputPort = result.input[0];
      const outputPort = result.output[0];

      // Check all required properties exist
      [inputPort, outputPort].forEach((port) => {
        expect(port).toHaveProperty("id");
        expect(port).toHaveProperty("name");
        expect(port).toHaveProperty("type");
        expect(port).toHaveProperty("dataType");
        expect(port).toHaveProperty("required");
        expect(port).toHaveProperty("multiple");

        expect(typeof port.id).toBe("string");
        expect(typeof port.name).toBe("string");
        expect(typeof port.type).toBe("string");
        expect(typeof port.dataType).toBe("string");
        expect(typeof port.required).toBe("boolean");
        expect(typeof port.multiple).toBe("boolean");
      });

      expect(inputPort.type).toBe("input");
      expect(outputPort.type).toBe("output");
    });

    it("does not modify input arrays", () => {
      const inputPorts = [{ ...basicInputPort }];
      const outputPorts = [{ ...basicOutputPort }];
      const originalInputLength = inputPorts.length;
      const originalOutputLength = outputPorts.length;

      createNodePorts({
        input: inputPorts,
        output: outputPorts,
      });

      expect(inputPorts).toHaveLength(originalInputLength);
      expect(outputPorts).toHaveLength(originalOutputLength);
      expect(inputPorts[0]).not.toHaveProperty("type"); // Original should not be modified
    });

    it("maintains immutability of input data", () => {
      const originalPort = { ...basicInputPort };
      const result = createNodePorts({
        input: [originalPort],
      });

      // Modifying the result should not affect the original input
      result.input[0].name = "Modified Name";
      expect(originalPort.name).toBe("Input Data");
    });
  });
});
