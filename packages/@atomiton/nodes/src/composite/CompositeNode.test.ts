/**
 * CompositeNode Tests
 *
 * Tests for CompositeNode to validate unified architecture compliance
 * and proper composite node behavior with child node orchestration.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CompositeNode, type CompositeNodeDefinition } from "./CompositeNode";
import { Node } from "../base/Node";
import type { INode } from "../base/INode";
import { isAtomicNode, isCompositeNode } from "../base/INode";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../types";
import type { CompositeEdge } from "../base/INode";

// Mock atomic node for testing
class MockAtomicNode extends Node {
  readonly id: string;
  readonly name: string;
  readonly type: string;

  constructor(id: string, name?: string) {
    super();
    this.id = id;
    this.name = name || `Mock Node ${id}`;
    this.type = "mock";
  }

  async execute(_context: NodeExecutionContext): Promise<NodeExecutionResult> {
    return this.createSuccessResult({
      nodeId: this.id,
      executedAt: new Date().toISOString(),
      result: `Executed ${this.id}`,
    });
  }

  get inputPorts(): NodePortDefinition[] {
    return [
      {
        id: "input",
        name: "Input",
        type: "input",
        dataType: "string",
        required: false,
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
      description: `Mock node for testing: ${this.name}`,
      version: "1.0.0",
      author: "Test Suite",
      tags: ["test", "mock"],
      icon: "test",
    };
  }
}

describe("CompositeNode - Unified Architecture Tests", () => {
  let compositeDefinition: CompositeNodeDefinition;
  let compositeNode: CompositeNode;
  let childNode1: MockAtomicNode;
  let childNode2: MockAtomicNode;
  let mockContext: NodeExecutionContext;

  beforeEach(() => {
    childNode1 = new MockAtomicNode("child-1", "Child Node 1");
    childNode2 = new MockAtomicNode("child-2", "Child Node 2");

    compositeDefinition = {
      id: "test-composite",
      name: "Test Composite",
      description: "A test composite node",
      category: "test",
      version: "1.0.0",
      metadata: {
        author: "Test Suite",
        tags: ["test", "composite"],
        icon: "composite-icon",
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
      },
      nodes: [
        { id: "child-1", type: "mock", position: { x: 0, y: 0 } },
        { id: "child-2", type: "mock", position: { x: 200, y: 0 } },
      ],
      edges: [
        {
          id: "edge-1",
          source: { nodeId: "child-1", portId: "output" },
          target: { nodeId: "child-2", portId: "input" },
        },
      ],
      variables: { testVar: "test-value" },
      settings: {
        timeout: 30000,
        retries: 3,
        parallel: false,
      },
    };

    compositeNode = new CompositeNode(compositeDefinition);
    compositeNode.setChildNodes([childNode1, childNode2]);

    mockContext = {
      nodeId: "test-composite-instance",
      inputs: {},
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
      expect(compositeNode.id).toBe("test-composite");
      expect(compositeNode.name).toBe("Test Composite");
      expect(compositeNode.type).toBe("composite");

      // Test that required methods exist
      expect(typeof compositeNode.execute).toBe("function");
      expect(typeof compositeNode.validate).toBe("function");
      expect(typeof compositeNode.isComposite).toBe("function");
      expect(typeof compositeNode.dispose).toBe("function");
    });

    it("should implement getter API for ports (not methods)", () => {
      // Critical: These should be getters, not methods
      expect(typeof compositeNode.inputPorts).not.toBe("function");
      expect(typeof compositeNode.outputPorts).not.toBe("function");

      expect(Array.isArray(compositeNode.inputPorts)).toBe(true);
      expect(Array.isArray(compositeNode.outputPorts)).toBe(true);
    });

    it("should implement getter API for metadata (not method)", () => {
      // Critical: This should be a getter, not a method
      expect(typeof compositeNode.metadata).not.toBe("function");
      expect(typeof compositeNode.metadata).toBe("object");

      expect(compositeNode.metadata).toHaveProperty("id");
      expect(compositeNode.metadata).toHaveProperty("name");
      expect(compositeNode.metadata).toHaveProperty("type");
      expect(compositeNode.metadata).toHaveProperty("category");
    });

    it("should be identified as composite node", () => {
      expect(compositeNode.isComposite()).toBe(true);
      expect(isAtomicNode(compositeNode)).toBe(false);
      expect(isCompositeNode(compositeNode)).toBe(true);
    });

    it("should have proper metadata structure", () => {
      const metadata = compositeNode.metadata;

      expect(metadata.id).toBe("test-composite");
      expect(metadata.name).toBe("Test Composite");
      expect(metadata.type).toBe("composite");
      expect(metadata.category).toBe("test");
      expect(metadata.description).toBe("A test composite node");
      expect(metadata.version).toBe("1.0.0");
      expect(metadata.author).toBe("Test Suite");
      expect(Array.isArray(metadata.tags)).toBe(true);
      expect(metadata.tags).toContain("test");
      expect(metadata.tags).toContain("composite");
      expect(metadata.icon).toBe("composite-icon");

      // Required INodeMetadata methods
      expect(typeof metadata.validate).toBe("function");
      expect(typeof metadata.getSearchTerms).toBe("function");
      expect(typeof metadata.matchesSearch).toBe("function");
    });
  });

  describe("ICompositeNode Specific Interface", () => {
    it("should implement ICompositeNode interface", () => {
      expect(typeof compositeNode.getChildNodes).toBe("function");
      expect(typeof compositeNode.addChildNode).toBe("function");
      expect(typeof compositeNode.removeChildNode).toBe("function");
      expect(typeof compositeNode.connectNodes).toBe("function");
      expect(typeof compositeNode.setChildNodes).toBe("function");
      expect(typeof compositeNode.getExecutionFlow).toBe("function");
    });

    it("should manage child nodes correctly", () => {
      const childNodes = compositeNode.getChildNodes();
      expect(childNodes).toHaveLength(2);
      expect(childNodes).toContain(childNode1);
      expect(childNodes).toContain(childNode2);
    });

    it("should add and remove child nodes", () => {
      const newChild = new MockAtomicNode("child-3", "Child Node 3");

      compositeNode.addChildNode(newChild);
      expect(compositeNode.getChildNodes()).toHaveLength(3);
      expect(compositeNode.getChildNodes()).toContain(newChild);

      const removed = compositeNode.removeChildNode("child-3");
      expect(removed).toBe(true);
      expect(compositeNode.getChildNodes()).toHaveLength(2);
      expect(compositeNode.getChildNodes()).not.toContain(newChild);

      const notRemoved = compositeNode.removeChildNode("non-existent");
      expect(notRemoved).toBe(false);
    });

    it("should manage execution flow", () => {
      const executionFlow = compositeNode.getExecutionFlow();
      expect(Array.isArray(executionFlow)).toBe(true);
      expect(executionFlow).toHaveLength(1);
      expect(executionFlow[0].id).toBe("edge-1");
      expect(executionFlow[0].source.nodeId).toBe("child-1");
      expect(executionFlow[0].target.nodeId).toBe("child-2");
    });

    it("should connect nodes", () => {
      const newEdge: CompositeEdge = {
        id: "edge-2",
        source: { nodeId: "child-2", portId: "output" },
        target: { nodeId: "child-1", portId: "input" },
      };

      compositeNode.connectNodes("child-2", "child-1", newEdge);
      const edges = compositeNode.getExecutionFlow();
      expect(edges).toHaveLength(2);
      expect(edges.find((e) => e.id === "edge-2")).toBeDefined();
    });

    it("should validate edge connections", () => {
      expect(() => {
        const invalidEdge: CompositeEdge = {
          id: "invalid-edge",
          source: { nodeId: "non-existent", portId: "output" },
          target: { nodeId: "child-1", portId: "input" },
        };
        compositeNode.connectNodes("non-existent", "child-1", invalidEdge);
      }).toThrow("Source node non-existent not found");
    });

    it("should set child nodes in batch", () => {
      const newChild1 = new MockAtomicNode("new-1");
      const newChild2 = new MockAtomicNode("new-2");

      compositeNode.setChildNodes([newChild1, newChild2]);
      const childNodes = compositeNode.getChildNodes();

      expect(childNodes).toHaveLength(2);
      expect(childNodes).toContain(newChild1);
      expect(childNodes).toContain(newChild2);
      expect(childNodes).not.toContain(childNode1);
      expect(childNodes).not.toContain(childNode2);
    });
  });

  describe("Unified Execution Model", () => {
    it("should execute via unified execute() method", async () => {
      const result = await compositeNode.execute(mockContext);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
      expect(result).toHaveProperty("metadata");
      expect(typeof result.success).toBe("boolean");
    });

    it("should return proper NodeExecutionResult structure", async () => {
      const result = await compositeNode.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.outputs).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.executedAt).toBeDefined();
      expect(result.metadata?.nodeId).toBe("test-composite");
      expect(result.metadata?.nodeType).toBe("composite");
    });

    it("should be executable by conductor (same as atomic nodes)", async () => {
      // Simulate conductor executing any node via INode interface
      const executeAsINode = async (
        node: INode,
      ): Promise<NodeExecutionResult> => {
        // Conductor doesn't care if it's atomic or composite
        return await node.execute(mockContext);
      };

      const result = await executeAsINode(compositeNode);
      expect(result.success).toBe(true);
      expect(result.outputs).toBeDefined();
    });

    it("should orchestrate child node execution", async () => {
      const result = await compositeNode.execute(mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.log.info).toHaveBeenCalledWith(
        expect.stringContaining("Executing composite node"),
        expect.objectContaining({
          childNodeCount: 2,
          edgeCount: 1,
        }),
      );
    });
  });

  describe("Validation", () => {
    it("should validate correctly formed composite", () => {
      const validation = compositeNode.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid child nodes", () => {
      // Add an invalid child node
      class InvalidChild extends MockAtomicNode {
        validate() {
          return { valid: false, errors: ["Invalid child configuration"] };
        }
      }

      const invalidChild = new InvalidChild("invalid-child");
      compositeNode.addChildNode(invalidChild);

      const validation = compositeNode.validate();
      expect(validation.valid).toBe(false);
      expect(
        validation.errors.some((e) =>
          e.includes("Invalid child configuration"),
        ),
      ).toBe(true);
    });

    it("should detect invalid edge references", () => {
      // Add edge that references non-existent node
      const invalidEdge: CompositeEdge = {
        id: "invalid-edge",
        source: { nodeId: "non-existent", portId: "output" },
        target: { nodeId: "child-1", portId: "input" },
      };

      // Manually add to execution flow to test validation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (compositeNode as any).executionFlow.push(invalidEdge);

      const validation = compositeNode.validate();
      expect(validation.valid).toBe(false);
      expect(
        validation.errors.some((e) =>
          e.includes("source node non-existent not found"),
        ),
      ).toBe(true);
    });

    it("should validate base node requirements", () => {
      // Create composite with empty id
      const invalidDefinition = { ...compositeDefinition, id: "" };
      const invalidComposite = new CompositeNode(invalidDefinition);

      const validation = invalidComposite.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Node ID is required");
    });
  });

  describe("Definition and Serialization", () => {
    it("should provide composite definition", () => {
      const definition = compositeNode.getDefinition();

      expect(definition.id).toBe("test-composite");
      expect(definition.name).toBe("Test Composite");
      expect(definition.category).toBe("test");
      expect(definition.version).toBe("1.0.0");
      expect(definition.nodes).toHaveLength(2);
      expect(definition.edges).toHaveLength(1);
      expect(definition.variables).toEqual({ testVar: "test-value" });
      expect(definition.settings?.timeout).toBe(30000);
    });

    it("should have consistent definition getter", () => {
      const definition = compositeNode.definition;

      expect(definition.id).toBe("test-composite");
      expect(definition.type).toBe("composite");
      expect(definition.inputPorts).toEqual(compositeNode.inputPorts);
      expect(definition.outputPorts).toEqual(compositeNode.outputPorts);
    });

    it("should preserve metadata in definition", () => {
      const definition = compositeNode.getDefinition();

      expect(definition.metadata?.author).toBe("Test Suite");
      expect(definition.metadata?.tags).toContain("test");
      expect(definition.metadata?.icon).toBe("composite-icon");
      expect(definition.metadata?.created).toBe("2024-01-01T00:00:00Z");
    });
  });

  describe("Error Handling", () => {
    it("should handle execution errors gracefully", async () => {
      // Create composite with failing child
      class FailingChild extends MockAtomicNode {
        async execute(): Promise<NodeExecutionResult> {
          throw new Error("Child execution failed");
        }
      }

      const failingChild = new FailingChild("failing-child");
      const simpleComposite = new CompositeNode({
        ...compositeDefinition,
        id: "failing-composite",
        nodes: [{ id: "failing-child", type: "failing" }],
        edges: [],
      });
      simpleComposite.setChildNodes([failingChild]);

      const result = await simpleComposite.execute(mockContext);

      // Should handle error appropriately
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
      expect(result).toHaveProperty("metadata");
    });

    it("should handle empty composite", async () => {
      const emptyComposite = new CompositeNode({
        ...compositeDefinition,
        id: "empty-composite",
        nodes: [],
        edges: [],
      });
      emptyComposite.setChildNodes([]);

      const result = await emptyComposite.execute(mockContext);
      expect(result).toHaveProperty("success");
    });

    it("should handle disposal safely", () => {
      expect(() => compositeNode.dispose()).not.toThrow();
      expect(() => compositeNode.dispose()).not.toThrow(); // Multiple calls
    });
  });

  describe("Search and Discovery", () => {
    it("should be searchable via metadata", () => {
      const metadata = compositeNode.metadata;

      expect(metadata.matchesSearch("composite")).toBe(true);
      expect(metadata.matchesSearch("test")).toBe(true);
      expect(metadata.matchesSearch("Test Composite")).toBe(true);
      expect(metadata.matchesSearch("nonexistent")).toBe(false);
    });

    it("should provide search terms", () => {
      const metadata = compositeNode.metadata;
      const searchTerms = metadata.getSearchTerms();

      expect(searchTerms).toContain("test-composite");
      expect(searchTerms).toContain("test composite");
      expect(searchTerms).toContain("a test composite node");
      expect(searchTerms).toContain("test");
      expect(searchTerms).toContain("composite");
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle multiple child nodes efficiently", () => {
      const manyChildren: INode[] = [];
      for (let i = 0; i < 50; i++) {
        manyChildren.push(new MockAtomicNode(`child-${i}`));
      }

      const startTime = performance.now();
      compositeNode.setChildNodes(manyChildren);
      const endTime = performance.now();

      expect(compositeNode.getChildNodes()).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should maintain consistent state across operations", async () => {
      // Extract only data properties from metadata (exclude functions)
      const extractDataProps = (meta: any) => {
        const { validate, getSearchTerms, matchesSearch, ...dataProps } = meta;
        return dataProps;
      };

      const initialMetadata = extractDataProps(compositeNode.metadata);
      const initialChildren = compositeNode.getChildNodes();

      // Execute multiple times
      await compositeNode.execute(mockContext);
      await compositeNode.execute(mockContext);

      // Should maintain consistent state
      expect(extractDataProps(compositeNode.metadata)).toEqual(initialMetadata);
      expect(compositeNode.getChildNodes()).toEqual(initialChildren);
    });

    it("should handle concurrent executions", async () => {
      const contexts = [
        { ...mockContext, nodeId: "instance-1" },
        { ...mockContext, nodeId: "instance-2" },
        { ...mockContext, nodeId: "instance-3" },
      ];

      const results = await Promise.all(
        contexts.map((context) => compositeNode.execute(context)),
      );

      results.forEach((result) => {
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("outputs");
      });
    });
  });

  describe("Integration with Factory Pattern", () => {
    it("should work with node registration system", () => {
      expect(compositeNode).toBeDefined();
      expect(compositeNode.id).toBe("test-composite");
      expect(compositeNode.definition).toBeDefined();
      expect(compositeNode.definition.id).toBe(compositeNode.id);
      expect(compositeNode.definition.type).toBe(compositeNode.type);
    });

    it("should have consistent definition and metadata", () => {
      const definition = compositeNode.definition;
      const metadata = compositeNode.metadata;

      expect(definition.id).toBe(metadata.id);
      expect(definition.name).toBe(metadata.name);
      expect(definition.type).toBe(metadata.type);
      expect(definition.category).toBe(metadata.category);
    });
  });

  describe("Blueprint Conceptual Mapping", () => {
    it("should represent blueprint as composite node", () => {
      // Test that this composite represents what users think of as a "blueprint"
      expect(compositeNode.isComposite()).toBe(true);
      expect(compositeNode.getChildNodes().length).toBeGreaterThan(0);
      expect(compositeNode.getExecutionFlow().length).toBeGreaterThan(0);
    });

    it("should maintain blueprint-level settings", () => {
      const definition = compositeNode.getDefinition();
      expect(definition.settings).toBeDefined();
      expect(definition.settings?.timeout).toBe(30000);
      expect(definition.settings?.retries).toBe(3);
      expect(definition.settings?.parallel).toBe(false);
    });

    it("should handle blueprint variables", () => {
      const definition = compositeNode.getDefinition();
      expect(definition.variables).toBeDefined();
      expect(definition.variables?.testVar).toBe("test-value");
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle minimal composite definition", () => {
      const minimalDefinition: CompositeNodeDefinition = {
        id: "minimal",
        name: "Minimal",
        category: "test",
        version: "1.0.0",
        nodes: [],
        edges: [],
      };

      const minimal = new CompositeNode(minimalDefinition);
      expect(minimal.validate().valid).toBe(true);
      expect(minimal.getChildNodes()).toHaveLength(0);
      expect(minimal.getExecutionFlow()).toHaveLength(0);
    });

    it("should handle large number of edges", () => {
      const manyEdges: CompositeEdge[] = [];
      for (let i = 0; i < 100; i++) {
        manyEdges.push({
          id: `edge-${i}`,
          source: { nodeId: "child-1", portId: "output" },
          target: { nodeId: "child-2", portId: "input" },
        });
      }

      const definition = {
        ...compositeDefinition,
        edges: manyEdges,
      };

      const composite = new CompositeNode(definition);
      composite.setChildNodes([childNode1, childNode2]);

      expect(composite.getExecutionFlow()).toHaveLength(100);
      expect(composite.validate().valid).toBe(true);
    });

    it("should handle complex nested scenarios", () => {
      // Create another composite as a child (conceptually)
      const childComposite = new CompositeNode({
        id: "child-composite",
        name: "Child Composite",
        category: "test",
        version: "1.0.0",
        nodes: [],
        edges: [],
      });

      compositeNode.addChildNode(childComposite);
      expect(compositeNode.getChildNodes()).toHaveLength(3);

      // Should work - composite can contain other composites
      const validation = compositeNode.validate();
      expect(validation.valid).toBe(true);
    });
  });
});
