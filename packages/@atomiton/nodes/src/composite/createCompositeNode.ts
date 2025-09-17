/**
 * Factory function for creating composite nodes
 *
 * Composite nodes are nodes that contain and orchestrate other nodes
 */

import { generateNodeId } from "@atomiton/utils";
import { z } from "zod";
import { createAtomicMetadata } from "../atomic/createAtomicMetadata";
import { createAtomicParameters } from "../atomic/createAtomicParameters";
import type {
  CompositeEdge,
  ICompositeNode,
  IExecutableNode,
} from "../interfaces/IExecutableNode";
import type { NodeCategory } from "../types";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../exports/executable/execution-types";
import type { NodePortDefinition } from "../types";
import type { CompositeNodeSpec } from "./types";
import { createCompositeGraph } from "./createCompositeGraph";
import { createCompositeExecutable } from "./createCompositeExecutable";
import { createCompositePorts } from "./createCompositePorts";
import { validateNodeTypesStrict } from "./validation/validateNodeTypes";

export type CompositeNodeInput = {
  id?: string; // Optional - will be generated if not provided
  name: string;
  description: string;
  category: string;
  nodes?: IExecutableNode[];
  edges?: CompositeEdge[];
  variables?: Record<string, unknown>;
  settings?: {
    timeout?: number;
    retries?: number;
    parallel?: boolean;
  };
};

export type CompositeTemplateInput = {
  id?: string; // Optional - will be generated if not provided
  name: string;
  description: string;
  category: string;
  nodes?: CompositeNodeSpec[];
  edges?: CompositeEdge[];
  variables?: Record<string, unknown>;
  settings?: {
    timeout?: number;
    retries?: number;
    parallel?: boolean;
  };
};

// Overloaded function signatures
export function createCompositeNode(input: CompositeNodeInput): ICompositeNode;
export function createCompositeNode(
  input: CompositeTemplateInput,
): ICompositeNode;
export function createCompositeNode(
  input: CompositeNodeInput | CompositeTemplateInput,
): ICompositeNode {
  // Generate ID if not provided
  const id = input.id || generateNodeId();

  // For template inputs with CompositeNodeSpec[], skip strict validation
  // Runtime conversion will happen when the composite is executed
  if (input.nodes && input.nodes.length > 0) {
    // Check if we have actual INode implementations
    const hasFullNodes = input.nodes.every((node) => "execute" in node);

    if (hasFullNodes) {
      try {
        validateNodeTypesStrict(input.nodes as IExecutableNode[]);
      } catch (error) {
        throw new Error(
          `Failed to create composite node "${input.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    // For CompositeNodeSpec[], validation happens at execution time
  }

  // Create graph for child nodes and edges
  // Type assertion: CompositeNodeSpec[] can be treated as INode[] at runtime
  const graph = createCompositeGraph(
    (input.nodes || []) as IExecutableNode[],
    input.edges || [],
  );

  // Create metadata for the composite
  const metadata = createAtomicMetadata({
    id,
    name: input.name,
    description: input.description,
    category: (input.category || "logic") as NodeCategory,
    icon: "git-branch",
    keywords: [id, input.name, "composite", "blueprint"],
  });

  // Create parameters for composite settings
  const parameters = createAtomicParameters(
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

  // Create executable for execution (to be used in future implementation)
  const compositeExecutable = createCompositeExecutable({
    id,
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
    id,
    name: input.name,
    type: "composite" as const,
    metadata,
    parameters,

    get inputPorts(): NodePortDefinition[] {
      return ports.input;
    },

    get outputPorts(): NodePortDefinition[] {
      return ports.output;
    },

    async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
      // Refresh executable with current nodes and edges
      const currentExecutable = createCompositeExecutable({
        id,
        nodes: graph.getChildNodes(),
        edges: graph.getExecutionFlow(),
        settings: input.settings,
      });

      return currentExecutable.execute(context, parameters.withDefaults());
    },

    validate(): { valid: boolean; errors: string[] } {
      const errors: string[] = [];

      if (!id) errors.push("Composite node ID is required");
      if (!input.name) errors.push("Composite node name is required");

      // Validate node types
      try {
        const nodes = graph.getChildNodes();
        if (nodes.length > 0) {
          validateNodeTypesStrict(nodes);
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }

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
    addChildNode: (node: IExecutableNode) => graph.addChildNode(node),
    removeChildNode: (nodeId: string) => graph.removeChildNode(nodeId),
    connectNodes: (sourceId: string, targetId: string, edge: CompositeEdge) =>
      graph.connectNodes(sourceId, targetId, edge),
    setChildNodes: (nodes: IExecutableNode[]) => graph.setChildNodes(nodes),
    dispose: () => graph.dispose(),
  };
}
