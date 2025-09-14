/**
 * Factory function for creating composite nodes
 *
 * Composite nodes are nodes that contain and orchestrate other nodes
 */

import { z } from "zod";
import { createNodeMetadata } from "../base/createNodeMetadata";
import { createNodeParameters } from "../base/createNodeParameters";
import { createCompositeLogic } from "./createCompositeLogic";
import { createCompositePorts } from "./createCompositePorts";
import { createCompositeGraph } from "./createCompositeGraph";
import type { CompositeEdge, ICompositeNode, INode } from "../base/INode";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../types";
import type { NodeCategory } from "../base/types";

export type CompositeNodeInput = {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes?: INode[];
  edges?: CompositeEdge[];
  variables?: Record<string, unknown>;
  settings?: {
    timeout?: number;
    retries?: number;
    parallel?: boolean;
  };
};

export function createCompositeNode(input: CompositeNodeInput): ICompositeNode {
  // Create graph for child nodes and edges
  const graph = createCompositeGraph(input.nodes || [], input.edges || []);

  // Create metadata for the composite
  const metadata = createNodeMetadata({
    id: input.id,
    name: input.name,
    description: input.description,
    category: (input.category || "logic") as NodeCategory,
    icon: "git-branch",
    keywords: [input.id, input.name, "composite", "blueprint"],
  });

  // Create parameters for composite settings
  const parameters = createNodeParameters(
    {
      timeout: z.number().default(30000),
      retries: z.number().default(1),
      parallel: z.boolean().default(false),
    },
    {
      timeout: input.settings?.timeout ?? 30000,
      retries: input.settings?.retries ?? 1,
      parallel: input.settings?.parallel ?? false,
    },
    {
      timeout: {
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
      },
      retries: {
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
      },
      parallel: {
        controlType: "boolean",
        label: "Parallel Execution",
        helpText: "Execute child nodes in parallel when possible",
      },
    },
  );

  // Create logic for execution (to be used in future implementation)
  createCompositeLogic({
    id: input.id,
    nodes: graph.getChildNodes(),
    edges: graph.getExecutionFlow(),
    settings: input.settings,
  });

  // Create ports aggregation
  const ports = createCompositePorts({
    nodes: graph.getChildNodes(),
    edges: graph.getExecutionFlow(),
  });

  return {
    id: input.id,
    name: input.name,
    type: `composite-${input.id}`,
    metadata,
    parameters,
    isComposite: true,

    get inputPorts(): NodePortDefinition[] {
      return ports.input;
    },

    get outputPorts(): NodePortDefinition[] {
      return ports.output;
    },

    async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
      // Refresh logic with current nodes and edges
      const currentLogic = createCompositeLogic({
        id: input.id,
        nodes: graph.getChildNodes(),
        edges: graph.getExecutionFlow(),
        settings: input.settings,
      });

      return currentLogic.execute(context, parameters.withDefaults());
    },

    validate(): { valid: boolean; errors: string[] } {
      const errors: string[] = [];

      if (!input.id) errors.push("Composite node ID is required");
      if (!input.name) errors.push("Composite node name is required");

      const graphValidation = graph.validate();
      if (!graphValidation.valid) {
        errors.push(...graphValidation.errors);
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },

    // Delegate to graph
    getChildNodes: () => graph.getChildNodes(),
    getExecutionFlow: () => graph.getExecutionFlow(),
    addChildNode: (node: INode) => graph.addChildNode(node),
    removeChildNode: (nodeId: string) => graph.removeChildNode(nodeId),
    connectNodes: (sourceId: string, targetId: string, edge: CompositeEdge) =>
      graph.connectNodes(sourceId, targetId, edge),
    setChildNodes: (nodes: INode[]) => graph.setChildNodes(nodes),
    dispose: () => graph.dispose(),
  };
}
