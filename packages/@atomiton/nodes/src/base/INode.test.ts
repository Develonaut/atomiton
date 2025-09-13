/**
 * INode Interface Tests
 *
 * Tests the core INode interface that all nodes must implement.
 * Validates the unified "a node is a node is a node" architecture.
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { INode, IAtomicNode, ICompositeNode } from "./INode.js";
import { isAtomicNode, isCompositeNode } from "./INode.js";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../types.js";

// Mock atomic node for testing
class MockAtomicNode implements IAtomicNode {
  readonly id = "mock-atomic";
  readonly name = "Mock Atomic Node";
  readonly type = "mock-atomic";

  async execute(_context: NodeExecutionContext): Promise<NodeExecutionResult> {
    return {
      success: true,
      outputs: { result: "mock-execution" },
      metadata: {
        executedAt: new Date().toISOString(),
        nodeId: this.id,
        nodeType: this.type,
      },
    };
  }

  validate() {
    return { valid: true, errors: [] };
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
      id: this.id,
      name: this.name,
      type: this.type,
      category: "test",
      description: "Mock atomic node for testing",
      version: "1.0.0",
      keywords: ["test", "mock"],
      runtime: { language: "typescript" as const },
      experimental: false,
      deprecated: false,
    };
  }

  isComposite(): false {
    return false;
  }

  dispose(): void {
    // No resources to clean up
  }
}

// Mock composite node for testing
class MockCompositeNode implements ICompositeNode {
  readonly id = "mock-composite";
  readonly name = "Mock Composite Node";
  readonly type = "mock-composite";
  private childNodes: INode[] = [];

  async execute(_context: NodeExecutionContext): Promise<NodeExecutionResult> {
    return {
      success: true,
      outputs: { result: "mock-composite-execution" },
      metadata: {
        executedAt: new Date().toISOString(),
        nodeId: this.id,
        nodeType: this.type,
      },
    };
  }

  validate() {
    return { valid: true, errors: [] };
  }

  get inputPorts(): NodePortDefinition[] {
    return [];
  }

  get outputPorts(): NodePortDefinition[] {
    return [
      {
        id: "result",
        name: "Result",
        type: "output",
        dataType: "object",
        required: true,
      },
    ];
  }

  get metadata() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      category: "test",
      description: "Mock composite node for testing",
      version: "1.0.0",
      keywords: ["test", "mock", "composite"],
      runtime: { language: "typescript" as const },
      experimental: false,
      deprecated: false,
    };
  }

  isComposite(): true {
    return true;
  }

  getChildNodes(): INode[] {
    return this.childNodes;
  }

  getExecutionFlow() {
    return [];
  }

  addChildNode(node: INode): void {
    this.childNodes.push(node);
  }

  removeChildNode(nodeId: string): boolean {
    const index = this.childNodes.findIndex((n) => n.id === nodeId);
    if (index !== -1) {
      this.childNodes.splice(index, 1);
      return true;
    }
    return false;
  }

  connectNodes() {
    // Mock implementation
  }

  setChildNodes(nodes: INode[]): void {
    this.childNodes = [...nodes];
  }

  dispose(): void {
    this.childNodes.forEach((child) => child.dispose());
    this.childNodes = [];
  }
}

describe("INode Interface Tests", () => {
  let atomicNode: IAtomicNode;
  let compositeNode: ICompositeNode;
  let mockContext: NodeExecutionContext;

  beforeEach(() => {
    atomicNode = new MockAtomicNode();
    compositeNode = new MockCompositeNode();

    mockContext = {
      nodeId: "test-node",
      inputs: {},
      startTime: new Date(),
      limits: { maxExecutionTimeMs: 30000 },
      reportProgress: () => {},
      log: {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
      },
    };
  });

  describe("INode Core Interface", () => {
    it("should implement required readonly properties", () => {
      expect(atomicNode.id).toBe("mock-atomic");
      expect(atomicNode.name).toBe("Mock Atomic Node");
      expect(atomicNode.type).toBe("mock-atomic");

      expect(compositeNode.id).toBe("mock-composite");
      expect(compositeNode.name).toBe("Mock Composite Node");
      expect(compositeNode.type).toBe("mock-composite");
    });

    it("should implement execute method returning Promise<NodeExecutionResult>", async () => {
      const atomicResult = await atomicNode.execute(mockContext);
      expect(atomicResult).toHaveProperty("success");
      expect(atomicResult).toHaveProperty("outputs");
      expect(atomicResult).toHaveProperty("metadata");
      expect(atomicResult.success).toBe(true);

      const compositeResult = await compositeNode.execute(mockContext);
      expect(compositeResult).toHaveProperty("success");
      expect(compositeResult).toHaveProperty("outputs");
      expect(compositeResult).toHaveProperty("metadata");
      expect(compositeResult.success).toBe(true);
    });

    it("should implement validate method", () => {
      const atomicValidation = atomicNode.validate();
      expect(atomicValidation).toHaveProperty("valid");
      expect(atomicValidation).toHaveProperty("errors");
      expect(Array.isArray(atomicValidation.errors)).toBe(true);

      const compositeValidation = compositeNode.validate();
      expect(compositeValidation).toHaveProperty("valid");
      expect(compositeValidation).toHaveProperty("errors");
      expect(Array.isArray(compositeValidation.errors)).toBe(true);
    });

    it("should implement getter API for ports (not methods)", () => {
      // Test that these are getters, not methods
      expect(typeof atomicNode.inputPorts).not.toBe("function");
      expect(typeof atomicNode.outputPorts).not.toBe("function");
      expect(Array.isArray(atomicNode.inputPorts)).toBe(true);
      expect(Array.isArray(atomicNode.outputPorts)).toBe(true);

      expect(typeof compositeNode.inputPorts).not.toBe("function");
      expect(typeof compositeNode.outputPorts).not.toBe("function");
      expect(Array.isArray(compositeNode.inputPorts)).toBe(true);
      expect(Array.isArray(compositeNode.outputPorts)).toBe(true);
    });

    it("should implement getter API for metadata (not method)", () => {
      // Test that metadata is a getter, not a method
      expect(typeof atomicNode.metadata).not.toBe("function");
      expect(typeof compositeNode.metadata).not.toBe("function");

      expect(atomicNode.metadata).toHaveProperty("id");
      expect(atomicNode.metadata).toHaveProperty("name");
      expect(atomicNode.metadata).toHaveProperty("type");
      expect(atomicNode.metadata).toHaveProperty("category");

      expect(compositeNode.metadata).toHaveProperty("id");
      expect(compositeNode.metadata).toHaveProperty("name");
      expect(compositeNode.metadata).toHaveProperty("type");
      expect(compositeNode.metadata).toHaveProperty("category");
    });

    it("should implement isComposite method", () => {
      expect(atomicNode.isComposite()).toBe(false);
      expect(compositeNode.isComposite()).toBe(true);
    });

    it("should implement dispose method", () => {
      expect(() => atomicNode.dispose()).not.toThrow();
      expect(() => compositeNode.dispose()).not.toThrow();
    });
  });

  describe("Type Guards", () => {
    it("should correctly identify atomic nodes", () => {
      expect(isAtomicNode(atomicNode)).toBe(true);
      expect(isAtomicNode(compositeNode)).toBe(false);
    });

    it("should correctly identify composite nodes", () => {
      expect(isCompositeNode(atomicNode)).toBe(false);
      expect(isCompositeNode(compositeNode)).toBe(true);
    });

    it("should provide proper TypeScript type narrowing", () => {
      if (isAtomicNode(atomicNode)) {
        // Should be typed as IAtomicNode here
        expect(atomicNode.isComposite()).toBe(false);
      }

      if (isCompositeNode(compositeNode)) {
        // Should be typed as ICompositeNode here
        expect(compositeNode.isComposite()).toBe(true);
        expect(typeof compositeNode.getChildNodes).toBe("function");
        expect(typeof compositeNode.addChildNode).toBe("function");
      }
    });
  });

  describe("Unified Execution Model", () => {
    it("should execute atomic and composite nodes through same interface", async () => {
      const nodes: INode[] = [atomicNode, compositeNode];

      for (const node of nodes) {
        const result = await node.execute(mockContext);
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("outputs");
        expect(result).toHaveProperty("metadata");
        expect(typeof result.success).toBe("boolean");
      }
    });

    it("should handle both atomic and composite nodes identically from conductor perspective", async () => {
      // Simulate conductor executing any node type
      const executeAnyNode = async (
        node: INode,
      ): Promise<NodeExecutionResult> => {
        // Conductor doesn't care if it's atomic or composite
        return await node.execute(mockContext);
      };

      const atomicResult = await executeAnyNode(atomicNode);
      const compositeResult = await executeAnyNode(compositeNode);

      expect(atomicResult.success).toBe(true);
      expect(compositeResult.success).toBe(true);
      expect(atomicResult).toHaveProperty("outputs");
      expect(compositeResult).toHaveProperty("outputs");
    });

    it("should allow treating all nodes uniformly", () => {
      const nodes: INode[] = [atomicNode, compositeNode];

      // All operations should work on all node types
      nodes.forEach((node) => {
        expect(typeof node.id).toBe("string");
        expect(typeof node.name).toBe("string");
        expect(typeof node.type).toBe("string");
        expect(Array.isArray(node.inputPorts)).toBe(true);
        expect(Array.isArray(node.outputPorts)).toBe(true);
        expect(typeof node.metadata).toBe("object");
        expect(typeof node.isComposite).toBe("function");
        expect(typeof node.validate).toBe("function");
        expect(typeof node.execute).toBe("function");
        expect(typeof node.dispose).toBe("function");
      });
    });
  });

  describe("IAtomicNode Specific Interface", () => {
    it("should implement IAtomicNode constraints", () => {
      // IAtomicNode should always return false for isComposite
      const atomicAsInterface: IAtomicNode = atomicNode;
      expect(atomicAsInterface.isComposite()).toBe(false);
    });

    it("should not have composite-specific methods", () => {
      // Atomic nodes should not have composite methods
      expect(
        (atomicNode as unknown as Record<string, unknown>).getChildNodes,
      ).toBeUndefined();
      expect(
        (atomicNode as unknown as Record<string, unknown>).addChildNode,
      ).toBeUndefined();
      expect(
        (atomicNode as unknown as Record<string, unknown>).getExecutionFlow,
      ).toBeUndefined();
    });
  });

  describe("ICompositeNode Specific Interface", () => {
    it("should implement ICompositeNode constraints", () => {
      // ICompositeNode should always return true for isComposite
      const compositeAsInterface: ICompositeNode = compositeNode;
      expect(compositeAsInterface.isComposite()).toBe(true);
    });

    it("should implement composite-specific methods", () => {
      expect(typeof compositeNode.getChildNodes).toBe("function");
      expect(typeof compositeNode.addChildNode).toBe("function");
      expect(typeof compositeNode.removeChildNode).toBe("function");
      expect(typeof compositeNode.connectNodes).toBe("function");
      expect(typeof compositeNode.setChildNodes).toBe("function");
      expect(typeof compositeNode.getExecutionFlow).toBe("function");
    });

    it("should manage child nodes correctly", () => {
      const childNode = new MockAtomicNode();

      expect(compositeNode.getChildNodes()).toHaveLength(0);

      compositeNode.addChildNode(childNode);
      expect(compositeNode.getChildNodes()).toHaveLength(1);
      expect(compositeNode.getChildNodes()[0]).toBe(childNode);

      const removed = compositeNode.removeChildNode(childNode.id);
      expect(removed).toBe(true);
      expect(compositeNode.getChildNodes()).toHaveLength(0);

      const notRemoved = compositeNode.removeChildNode("non-existent");
      expect(notRemoved).toBe(false);
    });

    it("should set child nodes in batch", () => {
      const child1 = new MockAtomicNode();
      const child2 = new MockAtomicNode();

      compositeNode.setChildNodes([child1, child2]);
      expect(compositeNode.getChildNodes()).toHaveLength(2);
      expect(compositeNode.getChildNodes()).toContain(child1);
      expect(compositeNode.getChildNodes()).toContain(child2);
    });
  });

  describe("Error Conditions and Edge Cases", () => {
    it("should handle execution with minimal context", async () => {
      const minimalContext: NodeExecutionContext = {
        nodeId: "test",
        inputs: {},
        startTime: new Date(),
        limits: { maxExecutionTimeMs: 1000 },
        reportProgress: () => {},
        log: {},
      };

      const result = await atomicNode.execute(minimalContext);
      expect(result.success).toBe(true);
    });

    it("should handle empty inputs gracefully", async () => {
      const emptyContext = { ...mockContext, inputs: {} };

      const atomicResult = await atomicNode.execute(emptyContext);
      const compositeResult = await compositeNode.execute(emptyContext);

      expect(atomicResult.success).toBe(true);
      expect(compositeResult.success).toBe(true);
    });

    it("should validate consistently", () => {
      // Multiple calls should return same result
      const validation1 = atomicNode.validate();
      const validation2 = atomicNode.validate();

      expect(validation1.valid).toBe(validation2.valid);
      expect(validation1.errors).toEqual(validation2.errors);
    });

    it("should handle disposal safely", () => {
      // Should be safe to call dispose multiple times
      expect(() => {
        atomicNode.dispose();
        atomicNode.dispose();
        atomicNode.dispose();
      }).not.toThrow();

      expect(() => {
        compositeNode.dispose();
        compositeNode.dispose();
        compositeNode.dispose();
      }).not.toThrow();
    });
  });

  describe("Interface Compliance", () => {
    it("should implement all required INode methods", () => {
      const requiredMethods = ["execute", "validate", "isComposite", "dispose"];
      const requiredProperties = [
        "id",
        "name",
        "type",
        "inputPorts",
        "outputPorts",
        "metadata",
      ];

      [atomicNode, compositeNode].forEach((node) => {
        requiredMethods.forEach((method) => {
          expect(
            typeof (node as unknown as Record<string, unknown>)[method],
          ).toBe("function");
        });

        requiredProperties.forEach((prop) => {
          expect(
            (node as unknown as Record<string, unknown>)[prop],
          ).toBeDefined();
        });
      });
    });

    it("should maintain consistent type information", () => {
      expect(atomicNode.id).toBe(atomicNode.metadata.id);
      expect(atomicNode.name).toBe(atomicNode.metadata.name);
      expect(atomicNode.type).toBe(atomicNode.metadata.type);

      expect(compositeNode.id).toBe(compositeNode.metadata.id);
      expect(compositeNode.name).toBe(compositeNode.metadata.name);
      expect(compositeNode.type).toBe(compositeNode.metadata.type);
    });

    it("should have well-formed metadata", () => {
      [atomicNode, compositeNode].forEach((node) => {
        const metadata = node.metadata;

        expect(typeof metadata.id).toBe("string");
        expect(typeof metadata.name).toBe("string");
        expect(typeof metadata.type).toBe("string");
        expect(typeof metadata.category).toBe("string");
        expect(typeof metadata.description).toBe("string");
        expect(typeof metadata.version).toBe("string");
        expect(Array.isArray(metadata.keywords)).toBe(true);
        expect(typeof metadata.experimental).toBe("boolean");
        expect(typeof metadata.deprecated).toBe("boolean");
      });
    });
  });
});
