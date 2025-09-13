/**
 * CompositeNode - Implementation of composite executable pattern
 *
 * A CompositeNode is a node that contains and orchestrates other nodes.
 * In the UI/Editor domain, this is called a "Blueprint", but in the code
 * domain, it's a "Composite Node" - emphasizing the composition pattern.
 *
 * Mental Model: "A blueprint is just a node that happens to contain other nodes"
 */

import type { CompositeEdge, ICompositeNode, INode } from "../base/INode.js";
import { Node } from "../base/Node.js";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../types.js";
import { CompositeExecutor } from "./CompositeExecutor.js";

export type CompositeNodeDefinition = {
  id: string;
  name: string;
  description?: string;
  category: string;
  version: string;
  metadata?: {
    author?: string;
    tags?: string[];
    icon?: string;
    created?: string;
    updated?: string;
  };
  // Composite-specific properties
  nodes: CompositeChildNode[];
  edges: CompositeEdge[];
  variables?: Record<string, unknown>;
  settings?: {
    timeout?: number;
    retries?: number;
    parallel?: boolean;
  };
};

export type CompositeChildNode = {
  id: string;
  type: string;
  position?: { x: number; y: number };
  config?: Record<string, unknown>;
};

/**
 * CompositeNode - A node that contains and executes other nodes
 *
 * This is the code representation of what users call a "Blueprint"
 */
export class CompositeNode extends Node implements ICompositeNode {
  readonly id: string;
  readonly name: string;
  readonly type = "composite";

  private childNodes = new Map<string, INode>();
  private executionFlow: CompositeEdge[] = [];
  private compositeDefinition: CompositeNodeDefinition;
  private executor: CompositeExecutor;

  constructor(definition: CompositeNodeDefinition) {
    super();
    this.compositeDefinition = definition;
    this.id = definition.id;
    this.name = definition.name;
    this.executor = new CompositeExecutor();

    // Initialize from definition
    this.initializeFromDefinition(definition);
  }

  /**
   * Execute this composite node
   * Orchestrates execution of child nodes according to the execution flow
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", `Executing composite node: ${this.name}`, {
        childNodeCount: this.childNodes.size,
        edgeCount: this.executionFlow.length,
      });

      // Execute the composite using the dedicated executor
      const result = await this.executor.execute(
        Array.from(this.childNodes.values()),
        this.executionFlow,
        context,
        this.compositeDefinition.settings,
      );

      this.log(context, "info", `Composite node execution completed`, {
        result,
      });
      return this.createSuccessResult(result);
    } catch (error) {
      this.log(context, "error", `Composite node execution failed`, { error });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Validate this composite node
   */
  validate(): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate();
    const errors = [...baseValidation.errors];

    // Validate child nodes
    for (const [nodeId, node] of this.childNodes) {
      const nodeValidation = node.validate();
      if (!nodeValidation.valid) {
        errors.push(
          `Child node ${nodeId}: ${nodeValidation.errors.join(", ")}`,
        );
      }
    }

    // Validate edges reference existing nodes
    for (const edge of this.executionFlow) {
      if (!this.childNodes.has(edge.source.nodeId)) {
        errors.push(
          `Edge ${edge.id}: source node ${edge.source.nodeId} not found`,
        );
      }
      if (!this.childNodes.has(edge.target.nodeId)) {
        errors.push(
          `Edge ${edge.id}: target node ${edge.target.nodeId} not found`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get input ports for this composite
   * Input ports are the exposed inputs from child nodes
   */
  getInputPorts(): NodePortDefinition[] {
    // For now, return empty - in a full implementation, this would
    // analyze child nodes and expose selected inputs as composite inputs
    return [];
  }

  /**
   * Get output ports for this composite
   * Output ports are the exposed outputs from child nodes
   */
  getOutputPorts(): NodePortDefinition[] {
    // For now, return empty - in a full implementation, this would
    // analyze child nodes and expose selected outputs as composite outputs
    return [];
  }

  /**
   * Get metadata for this composite node
   */
  get metadata() {
    return {
      ...super.metadata,
      category: this.compositeDefinition.category,
      description:
        this.compositeDefinition.description || `Composite node: ${this.name}`,
      version: this.compositeDefinition.version,
      author:
        this.compositeDefinition.metadata?.author || super.metadata.author,
      tags: this.compositeDefinition.metadata?.tags || [
        "composite",
        "blueprint",
      ],
      icon: this.compositeDefinition.metadata?.icon || "blueprint",
    };
  }

  /**
   * This is a composite node
   */
  isComposite(): true {
    return true;
  }

  /**
   * Get child nodes
   */
  getChildNodes(): INode[] {
    return Array.from(this.childNodes.values());
  }

  /**
   * Get execution flow
   */
  getExecutionFlow(): CompositeEdge[] {
    return [...this.executionFlow];
  }

  /**
   * Add a child node
   */
  addChildNode(node: INode): void {
    this.childNodes.set(node.id, node);
  }

  /**
   * Remove a child node
   */
  removeChildNode(nodeId: string): boolean {
    return this.childNodes.delete(nodeId);
  }

  /**
   * Connect two child nodes
   */
  connectNodes(sourceId: string, targetId: string, edge: CompositeEdge): void {
    // Validate nodes exist
    if (!this.childNodes.has(sourceId)) {
      throw new Error(`Source node ${sourceId} not found`);
    }
    if (!this.childNodes.has(targetId)) {
      throw new Error(`Target node ${targetId} not found`);
    }

    // Add edge to execution flow
    this.executionFlow.push(edge);
  }

  /**
   * Get the composite definition (for serialization)
   */
  getDefinition(): CompositeNodeDefinition {
    return { ...this.compositeDefinition };
  }

  /**
   * Override definition getter to return compatible definition shape
   */
  get definition() {
    return {
      ...this.compositeDefinition,
      type: this.type,
      description:
        this.compositeDefinition.description || `Composite node: ${this.name}`,
      inputPorts: this.inputPorts,
      outputPorts: this.outputPorts,
      metadata: {
        category: this.compositeDefinition.category,
        description:
          this.compositeDefinition.description ||
          `Composite node: ${this.name}`,
        version: this.compositeDefinition.version,
        author: this.compositeDefinition.metadata?.author || "Unknown",
        tags: this.compositeDefinition.metadata?.tags || [],
        icon: this.compositeDefinition.metadata?.icon || "workflow",
      },
    };
  }

  /**
   * Initialize from definition
   */
  private initializeFromDefinition(definition: CompositeNodeDefinition): void {
    // Store edges
    this.executionFlow = [...definition.edges];

    // Note: Child nodes would be instantiated by a NodeFactory
    // For now, we'll store the definitions and instantiate them later
    // This prevents circular dependencies during construction
  }

  /**
   * Set child nodes (called by NodeFactory after instantiation)
   */
  setChildNodes(nodes: INode[]): void {
    this.childNodes.clear();
    for (const node of nodes) {
      this.childNodes.set(node.id, node);
    }
  }
}
