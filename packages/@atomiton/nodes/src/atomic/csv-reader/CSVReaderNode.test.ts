/**
 * CSV Reader Node Tests
 *
 * Comprehensive tests for CSVReaderNode to validate unified architecture compliance
 * and proper atomic node behavior.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { csvReader } from "./CSVReaderNode";
import { CSVReaderLogic } from "./CSVReaderNodeLogic";
import type { CSVReaderConfig } from "./CSVReaderNodeConfig";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import { isAtomicNode, isCompositeNode } from "../../base/INode";
import type { IAtomicNode } from "../../base/INode";

describe("CSVReaderNode - Unified Architecture Tests", () => {
  let mockContext: NodeExecutionContext;

  beforeEach(() => {
    mockContext = {
      nodeId: "csv-reader-1",
      inputs: {},
      config: {
        hasHeaders: true,
        delimiter: ",",
      },
      startTime: new Date(),
      limits: { maxExecutionTimeMs: 30000 },
      reportProgress: () => {},
      log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    };
  });

  describe("INode Interface Compliance", () => {
    it("should implement INode interface correctly", () => {
      expect(csvReader.id).toBe("csv-reader");
      expect(csvReader.name).toBe("CSV Reader");
      expect(csvReader.type).toBe("csv-reader");

      // Test that required methods exist
      expect(typeof csvReader.execute).toBe("function");
      expect(typeof csvReader.validate).toBe("function");
      expect(typeof csvReader.isComposite).toBe("function");
      expect(typeof csvReader.dispose).toBe("function");
    });

    it("should implement getter API for ports (not methods)", () => {
      // Critical: These should be getters, not methods
      expect(typeof csvReader.inputPorts).not.toBe("function");
      expect(typeof csvReader.outputPorts).not.toBe("function");

      expect(Array.isArray(csvReader.inputPorts)).toBe(true);
      expect(Array.isArray(csvReader.outputPorts)).toBe(true);
    });

    it("should implement getter API for metadata (not method)", () => {
      // Critical: This should be a getter, not a method
      expect(typeof csvReader.metadata).not.toBe("function");
      expect(typeof csvReader.metadata).toBe("object");

      expect(csvReader.metadata).toHaveProperty("id");
      expect(csvReader.metadata).toHaveProperty("name");
      expect(csvReader.metadata).toHaveProperty("type");
      expect(csvReader.metadata).toHaveProperty("category");
      expect(csvReader.metadata).toHaveProperty("description");
    });

    it("should be identified as atomic node", () => {
      expect(csvReader.isComposite()).toBe(false);
      expect(isAtomicNode(csvReader)).toBe(true);
      expect(isCompositeNode(csvReader)).toBe(false);

      // TypeScript type narrowing test
      if (isAtomicNode(csvReader)) {
        // Should be typed as IAtomicNode here
        const atomicNode: IAtomicNode = csvReader;
        expect(atomicNode.isComposite()).toBe(false);
      }
    });

    it("should have proper metadata structure", () => {
      const metadata = csvReader.metadata;

      expect(metadata.id).toBe("csv-reader");
      expect(metadata.name).toBe("CSV Reader");
      expect(metadata.type).toBe("csv-reader");
      expect(metadata.category).toBe("io");
      expect(metadata.description).toBe("Read CSV files and spreadsheet data");
      expect(metadata.version).toBe("1.0.0");
      expect(metadata.author).toBe("Atomiton Core Team");
      expect(Array.isArray(metadata.tags)).toBe(true);
      expect(metadata.tags).toContain("csv");
      expect(metadata.tags).toContain("data");
      expect(metadata.icon).toBe("table-2");

      // Required INodeMetadata methods
      expect(typeof metadata.validate).toBe("function");
      expect(typeof metadata.getSearchTerms).toBe("function");
      expect(typeof metadata.matchesSearch).toBe("function");
    });
  });

  describe("Unified Execution Model", () => {
    it("should execute via unified execute() method", async () => {
      const result = await csvReader.execute(mockContext);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
      expect(typeof result.success).toBe("boolean");
    });

    it("should return proper NodeExecutionResult structure", async () => {
      const result = await csvReader.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.outputs).toBeDefined();
      expect(result.outputs).toHaveProperty("data");
      expect(result.outputs).toHaveProperty("headers");
      expect(result.outputs).toHaveProperty("rowCount");
      expect(result.error).toBeUndefined();
      // Note: metadata structure may vary by implementation
      if (result.metadata) {
        expect(result.metadata.executedAt).toBeDefined();
        expect(result.metadata.nodeId).toBeDefined();
        expect(result.metadata.nodeType).toBeDefined();
      }
    });

    it("should handle execution context properly", async () => {
      const contextWithData = {
        ...mockContext,
        inputs: { someInput: "test-value" },
        config: {
          hasHeaders: false,
          delimiter: ";",
        },
      };

      const result = await csvReader.execute(contextWithData);
      expect(result.success).toBe(true);

      // Should have logged execution info
      expect(mockContext.log.info).toHaveBeenCalled();
    });

    it("should be executable by conductor (any INode executor)", async () => {
      // Simulate conductor executing any node via INode interface
      const executeAsINode = async (
        node: typeof csvReader,
      ): Promise<NodeExecutionResult> => {
        // Conductor doesn't care about node type - just executes via interface
        return await node.execute(mockContext);
      };

      const result = await executeAsINode(csvReader);
      expect(result.success).toBe(true);
      expect(result.outputs).toBeDefined();
    });
  });

  describe("Port Definitions", () => {
    it("should have empty input ports (for current implementation)", () => {
      expect(csvReader.inputPorts).toEqual([]);
    });

    it("should have well-defined output ports", () => {
      const outputPorts = csvReader.outputPorts;

      expect(outputPorts).toHaveLength(3);

      const dataPort = outputPorts.find((p) => p.id === "data");
      expect(dataPort).toBeDefined();
      expect(dataPort?.name).toBe("Data");
      expect(dataPort?.type).toBe("output");
      expect(dataPort?.dataType).toBe("array");
      expect(dataPort?.required).toBe(true);

      const headersPort = outputPorts.find((p) => p.id === "headers");
      expect(headersPort).toBeDefined();
      expect(headersPort?.name).toBe("Headers");
      expect(headersPort?.dataType).toBe("array");

      const rowCountPort = outputPorts.find((p) => p.id === "rowCount");
      expect(rowCountPort).toBeDefined();
      expect(rowCountPort?.name).toBe("Row Count");
      expect(rowCountPort?.dataType).toBe("number");
    });

    it("should return consistent port definitions on multiple calls", () => {
      const ports1 = csvReader.inputPorts;
      const ports2 = csvReader.inputPorts;
      const outPorts1 = csvReader.outputPorts;
      const outPorts2 = csvReader.outputPorts;

      expect(ports1).toEqual(ports2);
      expect(outPorts1).toEqual(outPorts2);
    });
  });

  describe("Logic Integration", () => {
    it("should integrate with CSVReaderLogic correctly", async () => {
      const logic = new CSVReaderLogic();

      // Test that logic can be used independently
      const config: CSVReaderConfig = {
        enabled: true,
        timeout: 30000,
        retries: 3,
        hasHeaders: true,
        delimiter: ",",
      };

      const result = await logic.execute(mockContext, config);
      expect(result.success).toBe(true);
      expect(result.outputs).toHaveProperty("data");
    });

    it("should validate configuration through logic", () => {
      const logic = new CSVReaderLogic();

      const validConfig = { hasHeaders: true, delimiter: "," };
      const invalidConfig = { hasHeaders: "not a boolean", delimiter: 123 };

      expect(logic.validateConfig(validConfig)).toBe(true);
      expect(logic.validateConfig(invalidConfig)).toBe(false);
    });

    it("should use default configuration when needed", () => {
      const logic = new CSVReaderLogic();
      const defaults = logic.getDefaultConfig();

      expect(defaults.hasHeaders).toBe(true);
      expect(defaults.delimiter).toBe(",");
    });
  });

  describe("Error Handling", () => {
    it("should handle execution errors gracefully", async () => {
      // Create a context that might cause issues
      const errorContext = {
        ...mockContext,
        inputs: { malformedInput: undefined },
        config: undefined, // No config provided
      };

      const result = await csvReader.execute(errorContext);

      // Should still succeed (has default config handling)
      expect(result.success).toBe(true);
    });

    it("should validate node structure", () => {
      const validation = csvReader.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should handle disposal safely", () => {
      expect(() => csvReader.dispose()).not.toThrow();
      expect(() => csvReader.dispose()).not.toThrow(); // Multiple calls
    });
  });

  describe("Search and Discovery", () => {
    it("should be searchable via metadata", () => {
      const metadata = csvReader.metadata;

      expect(metadata.matchesSearch("csv")).toBe(true);
      expect(metadata.matchesSearch("CSV")).toBe(true);
      expect(metadata.matchesSearch("reader")).toBe(true);
      expect(metadata.matchesSearch("data")).toBe(true);
      expect(metadata.matchesSearch("spreadsheet")).toBe(true);
      expect(metadata.matchesSearch("nonexistent")).toBe(false);
    });

    it("should provide search terms", () => {
      const metadata = csvReader.metadata;
      const searchTerms = metadata.getSearchTerms();

      expect(searchTerms).toContain("csv-reader");
      expect(searchTerms).toContain("csv reader");
      expect(searchTerms).toContain("read csv files and spreadsheet data");
      expect(searchTerms).toContain("io");
      expect(searchTerms).toContain("csv");
      expect(searchTerms).toContain("data");
    });
  });

  describe("Performance and Scalability", () => {
    it("should execute efficiently", async () => {
      const startTime = performance.now();

      const result = await csvReader.execute(mockContext);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(100); // Should complete quickly
    });

    it("should handle multiple executions without interference", async () => {
      const results = await Promise.all([
        csvReader.execute(mockContext),
        csvReader.execute({ ...mockContext, nodeId: "csv-reader-2" }),
        csvReader.execute({ ...mockContext, nodeId: "csv-reader-3" }),
      ]);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.outputs).toBeDefined();
      });
    });

    it("should maintain consistent state across operations", async () => {
      // Extract only data properties from metadata (exclude functions)
      const extractDataProps = (meta: any) => {
        const { validate, getSearchTerms, matchesSearch, ...dataProps } = meta;
        return dataProps;
      };

      const initialMetadata = extractDataProps(csvReader.metadata);
      const initialPorts = csvReader.outputPorts;

      // Execute multiple times
      await csvReader.execute(mockContext);
      await csvReader.execute(mockContext);
      await csvReader.execute(mockContext);

      // Should maintain consistent state
      expect(extractDataProps(csvReader.metadata)).toEqual(initialMetadata);
      expect(csvReader.outputPorts).toEqual(initialPorts);
    });
  });

  describe("Integration with Factory Pattern", () => {
    it("should work with node registration system", () => {
      // Test that the node exports correctly for factory registration
      expect(csvReader).toBeDefined();
      expect(csvReader.id).toBe("csv-reader");
      expect(csvReader.definition).toBeDefined();
      expect(csvReader.definition.id).toBe(csvReader.id);
      expect(csvReader.definition.type).toBe(csvReader.type);
    });

    it("should have consistent definition and metadata", () => {
      const definition = csvReader.definition;
      const metadata = csvReader.metadata;

      expect(definition.id).toBe(metadata.id);
      expect(definition.name).toBe(metadata.name);
      expect(definition.type).toBe(metadata.type);
      expect(definition.category).toBe(metadata.category);
    });
  });

  describe("Mock Data and Testing", () => {
    it("should return mock data in current implementation", async () => {
      const result = await csvReader.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.outputs?.data).toBeDefined();

      const data = result.outputs?.data as Array<Record<string, string>>;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Check mock data structure
      if (data.length > 0) {
        expect(data[0]).toHaveProperty("id");
        expect(data[0]).toHaveProperty("name");
        expect(data[0]).toHaveProperty("category");
      }
    });

    it("should handle headers configuration correctly", async () => {
      const contextWithHeaders = {
        ...mockContext,
        config: { hasHeaders: true, delimiter: "," },
      };

      const resultWithHeaders = await csvReader.execute(contextWithHeaders);
      expect(resultWithHeaders.success).toBe(true);
      expect(resultWithHeaders.outputs?.headers).toBeDefined();
      expect(Array.isArray(resultWithHeaders.outputs?.headers)).toBe(true);

      const contextWithoutHeaders = {
        ...mockContext,
        config: { hasHeaders: false, delimiter: "," },
      };

      const resultWithoutHeaders = await csvReader.execute(
        contextWithoutHeaders,
      );
      expect(resultWithoutHeaders.success).toBe(true);
      expect(Array.isArray(resultWithoutHeaders.outputs?.headers)).toBe(true);
    });
  });
});
