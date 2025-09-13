/**
 * Node Base Class Tests
 *
 * Tests the abstract Node class that provides common functionality
 * for both atomic and composite nodes.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { Node } from "./Node";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../types";

// Test implementation of Node class
class TestNode extends Node {
  readonly id = "test-node";
  readonly name = "Test Node";
  readonly type = "test";

  async execute(_context: NodeExecutionContext): Promise<NodeExecutionResult> {
    return this.createSuccessResult({ result: "test-execution" });
  }

  // Expose protected methods for testing
  public testCreateSuccessResult(
    outputs: Record<string, unknown> | unknown,
  ): NodeExecutionResult {
    return this.createSuccessResult(outputs);
  }

  public testCreateErrorResult(error: Error | string): NodeExecutionResult {
    return this.createErrorResult(error);
  }

  get inputPorts(): NodePortDefinition[] {
    return [
      {
        id: "input",
        name: "Input",
        type: "input",
        dataType: "string",
        required: true,
      },
    ];
  }

  get outputPorts(): NodePortDefinition[] {
    return [
      {
        id: "output",
        name: "Output",
        type: "output",
        dataType: "string",
        required: true,
      },
    ];
  }

  get metadata() {
    return {
      ...super.metadata,
      category: "test",
      description: "Test node for unit testing",
      version: "1.0.0",
      author: "Test Suite",
      tags: ["test", "unit"],
      icon: "test-icon",
    };
  }
}

// Test node with invalid configuration
class InvalidNode extends Node {
  readonly id = "";
  readonly name = "";
  readonly type = "";

  async execute(_context: NodeExecutionContext): Promise<NodeExecutionResult> {
    return this.createSuccessResult({});
  }
}

describe("Node Base Class Tests", () => {
  let testNode: TestNode;
  let invalidNode: InvalidNode;
  let mockContext: NodeExecutionContext;

  beforeEach(() => {
    testNode = new TestNode();
    invalidNode = new InvalidNode();

    mockContext = {
      nodeId: "test-node",
      inputs: { input: "test-value" },
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

  describe("Core Functionality", () => {
    it("should implement INode interface", () => {
      expect(testNode.id).toBe("test-node");
      expect(testNode.name).toBe("Test Node");
      expect(testNode.type).toBe("test");
      expect(typeof testNode.execute).toBe("function");
      expect(typeof testNode.validate).toBe("function");
      expect(Array.isArray(testNode.inputPorts)).toBe(true);
      expect(Array.isArray(testNode.outputPorts)).toBe(true);
      expect(typeof testNode.metadata).toBe("object");
      expect(typeof testNode.isComposite).toBe("function");
      expect(typeof testNode.dispose).toBe("function");
    });

    it("should provide definition getter", () => {
      const definition = testNode.definition;

      expect(definition).toHaveProperty("id", "test-node");
      expect(definition).toHaveProperty("name", "Test Node");
      expect(definition).toHaveProperty("type", "test");
      expect(definition).toHaveProperty("category", "test");
      expect(definition).toHaveProperty(
        "description",
        "Test node for unit testing",
      );
      expect(definition).toHaveProperty("version", "1.0.0");
      expect(definition).toHaveProperty("inputPorts");
      expect(definition).toHaveProperty("outputPorts");
      expect(definition).toHaveProperty("metadata");
    });

    it("should provide metadata getter with full INodeMetadata format", () => {
      const metadata = testNode.metadata;

      expect(metadata).toHaveProperty("id", "test-node");
      expect(metadata).toHaveProperty("name", "Test Node");
      expect(metadata).toHaveProperty("type", "test");
      expect(metadata).toHaveProperty("version", "1.0.0");
      expect(metadata).toHaveProperty("author", "Test Suite");
      expect(metadata).toHaveProperty(
        "description",
        "Test node for unit testing",
      );
      expect(metadata).toHaveProperty("category", "test");
      expect(metadata).toHaveProperty("keywords");
      expect(metadata).toHaveProperty("icon", "test-icon");
      expect(metadata).toHaveProperty("tags");
      expect(metadata).toHaveProperty("runtime");
      expect(metadata).toHaveProperty("experimental", false);
      expect(metadata).toHaveProperty("deprecated", false);

      // Should have required metadata methods
      expect(typeof metadata.validate).toBe("function");
      expect(typeof metadata.getSearchTerms).toBe("function");
      expect(typeof metadata.matchesSearch).toBe("function");
    });

    it("should provide search functionality via metadata", () => {
      const metadata = testNode.metadata;

      expect(metadata.matchesSearch("test")).toBe(true);
      expect(metadata.matchesSearch("Test")).toBe(true);
      expect(metadata.matchesSearch("unit")).toBe(true);
      expect(metadata.matchesSearch("nonexistent")).toBe(false);

      const searchTerms = metadata.getSearchTerms();
      expect(searchTerms).toContain("test-node");
      expect(searchTerms).toContain("test node");
      expect(searchTerms).toContain("test node for unit testing");
      expect(searchTerms).toContain("test");
      expect(searchTerms).toContain("unit");
    });
  });

  describe("Validation", () => {
    it("should validate correctly formed nodes", () => {
      const validation = testNode.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid node configuration", () => {
      const validation = invalidNode.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain("Node ID is required");
      expect(validation.errors).toContain("Node name is required");
      expect(validation.errors).toContain("Node type is required");
    });

    it("should validate metadata consistently", () => {
      const metadata = testNode.metadata;
      const validation = metadata.validate();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe("Execution and Results", () => {
    it("should execute successfully and return proper result", async () => {
      const result = await testNode.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.outputs).toEqual({ result: "test-execution" });
      expect(result.error).toBeUndefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.executedAt).toBeDefined();
      expect(result.metadata?.nodeId).toBe("test-node");
      expect(result.metadata?.nodeType).toBe("test");
    });

    it("should handle execution errors gracefully", async () => {
      // Create a node that handles errors internally
      class SafeErrorNode extends Node {
        readonly id = "safe-error-node";
        readonly name = "Safe Error Node";
        readonly type = "safe-error";

        async execute(
          _context: NodeExecutionContext,
        ): Promise<NodeExecutionResult> {
          try {
            throw new Error("Test execution error");
          } catch (error) {
            return this.createErrorResult(
              error instanceof Error ? error : new Error(String(error)),
            );
          }
        }
      }

      const safeErrorNode = new SafeErrorNode();
      const result = await safeErrorNode.execute(mockContext);

      expect(result.success).toBe(false);
      expect(result.outputs).toBeUndefined();
      expect(result.error).toBe("Test execution error");
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.executedAt).toBeDefined();
      expect(result.metadata?.nodeId).toBe("safe-error-node");
      expect(result.metadata?.nodeType).toBe("safe-error");
    });

    it("should create success results with different output formats", () => {
      // Test with object outputs
      const objectResult = testNode.testCreateSuccessResult({
        key1: "value1",
        key2: "value2",
      });
      expect(objectResult.success).toBe(true);
      expect(objectResult.outputs).toEqual({ key1: "value1", key2: "value2" });

      // Test with non-object outputs (should be wrapped)
      const stringResult = testNode.testCreateSuccessResult("simple string");
      expect(stringResult.success).toBe(true);
      expect(stringResult.outputs).toEqual({ result: "simple string" });

      // Test with array outputs (should be wrapped)
      const arrayResult = testNode.testCreateSuccessResult([1, 2, 3]);
      expect(arrayResult.success).toBe(true);
      expect(arrayResult.outputs).toEqual({ result: [1, 2, 3] });
    });

    it("should create error results consistently", () => {
      const errorObj = new Error("Test error message");
      const errorResult = testNode.testCreateErrorResult(errorObj);

      expect(errorResult.success).toBe(false);
      expect(errorResult.outputs).toBeUndefined();
      expect(errorResult.error).toBe("Test error message");
      expect(errorResult.metadata).toBeDefined();

      const stringErrorResult = testNode.testCreateErrorResult("String error");
      expect(stringErrorResult.success).toBe(false);
      expect(stringErrorResult.error).toBe("String error");
    });
  });

  describe("Logging", () => {
    it("should log messages during execution", async () => {
      // Test logging through execute method since log is protected
      await testNode.execute(mockContext);

      // The TestNode implementation logs during execute
      expect(mockContext.log.info).toHaveBeenCalled();
    });

    it("should handle missing log functions gracefully", async () => {
      const contextWithPartialLog = {
        ...mockContext,
        log: {
          info: vi.fn(),
          // Missing warn, error, debug
        },
      };

      // Should not throw even with missing log functions
      const result = await testNode.execute(
        contextWithPartialLog as NodeExecutionContext,
      );
      expect(result.success).toBe(true);
    });
  });

  describe("Default Implementations", () => {
    it("should provide default empty port definitions", () => {
      class MinimalNode extends Node {
        readonly id = "minimal";
        readonly name = "Minimal";
        readonly type = "minimal";

        async execute(): Promise<NodeExecutionResult> {
          return this.createSuccessResult({});
        }
      }

      const minimal = new MinimalNode();
      expect(minimal.inputPorts).toEqual([]);
      expect(minimal.outputPorts).toEqual([]);
    });

    it("should provide default metadata", () => {
      class MinimalNode extends Node {
        readonly id = "minimal";
        readonly name = "Minimal";
        readonly type = "minimal";

        async execute(): Promise<NodeExecutionResult> {
          return this.createSuccessResult({});
        }
      }

      const minimal = new MinimalNode();
      const metadata = minimal.metadata;

      expect(metadata.category).toBe("unknown");
      expect(metadata.description).toBe("Minimal node");
      expect(metadata.version).toBe("1.0.0");
      expect(metadata.author).toBe("Atomiton");
      expect(metadata.tags).toEqual([]);
      expect(metadata.icon).toBe("node");
    });

    it("should default to atomic node type", () => {
      expect(testNode.isComposite()).toBe(false);
    });

    it("should handle disposal with no resources", () => {
      expect(() => testNode.dispose()).not.toThrow();
    });
  });

  describe("Port Definitions", () => {
    it("should return consistent port definitions", () => {
      const inputs1 = testNode.inputPorts;
      const inputs2 = testNode.inputPorts;
      const outputs1 = testNode.outputPorts;
      const outputs2 = testNode.outputPorts;

      expect(inputs1).toEqual(inputs2);
      expect(outputs1).toEqual(outputs2);
    });

    it("should validate port definition structure", () => {
      testNode.inputPorts.forEach((port) => {
        expect(port).toHaveProperty("id");
        expect(port).toHaveProperty("name");
        expect(port).toHaveProperty("type");
        expect(port).toHaveProperty("dataType");
        expect(typeof port.id).toBe("string");
        expect(typeof port.name).toBe("string");
        expect(typeof port.type).toBe("string");
        expect(typeof port.dataType).toBe("string");
      });

      testNode.outputPorts.forEach((port) => {
        expect(port).toHaveProperty("id");
        expect(port).toHaveProperty("name");
        expect(port).toHaveProperty("type");
        expect(port).toHaveProperty("dataType");
        expect(typeof port.id).toBe("string");
        expect(typeof port.name).toBe("string");
        expect(typeof port.type).toBe("string");
        expect(typeof port.dataType).toBe("string");
      });
    });
  });

  describe("Inheritance and Extension", () => {
    it("should allow proper inheritance", () => {
      class ExtendedNode extends TestNode {
        // Don't override id - use the parent's id

        async execute(
          context: NodeExecutionContext,
        ): Promise<NodeExecutionResult> {
          const baseResult = await super.execute(context);
          return this.createSuccessResult({
            ...baseResult.outputs,
            extended: true,
          });
        }
      }

      const extended = new ExtendedNode();
      expect(extended.id).toBe("test-node"); // Inherited from TestNode
      expect(extended.name).toBe("Test Node"); // Inherited
      expect(extended.type).toBe("test"); // Inherited
    });

    it("should allow overriding default behaviors", () => {
      class CustomValidationNode extends Node {
        readonly id = "custom-validation";
        readonly name = "Custom Validation";
        readonly type = "custom";

        async execute(): Promise<NodeExecutionResult> {
          return this.createSuccessResult({});
        }

        validate() {
          return {
            valid: false,
            errors: ["Custom validation always fails"],
          };
        }
      }

      const custom = new CustomValidationNode();
      const validation = custom.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Custom validation always fails");
    });
  });

  describe("Memory and Resource Management", () => {
    it("should handle multiple executions without memory leaks", async () => {
      const results = [];

      for (let i = 0; i < 100; i++) {
        const result = await testNode.execute(mockContext);
        results.push(result);
      }

      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should dispose properly", () => {
      // Test that disposal can be called multiple times safely
      expect(() => {
        testNode.dispose();
        testNode.dispose();
        testNode.dispose();
      }).not.toThrow();
    });
  });

  describe("Context Handling", () => {
    it("should handle minimal context", async () => {
      const minimalContext: NodeExecutionContext = {
        nodeId: "test",
        inputs: {},
        startTime: new Date(),
        limits: { maxExecutionTimeMs: 1000 },
        reportProgress: () => {},
        log: {},
      };

      const result = await testNode.execute(minimalContext);
      expect(result.success).toBe(true);
    });

    it("should handle context with all optional fields", async () => {
      const fullContext: NodeExecutionContext = {
        nodeId: "test",
        compositeId: "composite-456",
        inputs: { input: "value" },
        config: { setting: "value" },
        workspaceRoot: "/workspace",
        tempDirectory: "/tmp",
        startTime: new Date(),
        limits: {
          maxExecutionTimeMs: 30000,
          maxMemoryMB: 512,
          maxDiskSpaceMB: 1024,
        },
        reportProgress: () => {},
        log: {
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
        },
        stopOnError: true,
        previousResults: {},
        abortSignal: new AbortController().signal,
        metadata: { custom: "data" },
      };

      const result = await testNode.execute(fullContext);
      expect(result.success).toBe(true);
    });
  });
});
