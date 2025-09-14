/**
 * Factory function for creating composite node graph
 *
 * Manages the graph structure (nodes and edges) within a composite
 */

import type { INode, CompositeEdge } from "../base/INode";

export type CompositeGraph = {
  getChildNodes(): INode[];
  getExecutionFlow(): CompositeEdge[];
  addChildNode(node: INode): void;
  removeChildNode(nodeId: string): boolean;
  connectNodes(sourceId: string, targetId: string, edge: CompositeEdge): void;
  setChildNodes(nodes: INode[]): void;
  validate(): { valid: boolean; errors: string[] };
  dispose(): void;
};

export function createCompositeGraph(
  initialNodes: INode[] = [],
  initialEdges: CompositeEdge[] = [],
): CompositeGraph {
  const childNodes = [...initialNodes];
  const executionFlow = [...initialEdges];

  return {
    getChildNodes(): INode[] {
      return [...childNodes];
    },

    getExecutionFlow(): CompositeEdge[] {
      return [...executionFlow];
    },

    addChildNode(node: INode): void {
      childNodes.push(node);
    },

    removeChildNode(nodeId: string): boolean {
      const index = childNodes.findIndex((n) => n.id === nodeId);
      if (index !== -1) {
        childNodes.splice(index, 1);
        // Also remove related edges
        executionFlow.splice(
          0,
          executionFlow.length,
          ...executionFlow.filter(
            (edge) =>
              edge.source.nodeId !== nodeId && edge.target.nodeId !== nodeId,
          ),
        );
        return true;
      }
      return false;
    },

    connectNodes(
      sourceId: string,
      targetId: string,
      edge: CompositeEdge,
    ): void {
      executionFlow.push(edge);
    },

    setChildNodes(nodes: INode[]): void {
      childNodes.splice(0, childNodes.length, ...nodes);
    },

    validate(): { valid: boolean; errors: string[] } {
      const errors: string[] = [];

      if (childNodes.length === 0) {
        errors.push("Composite node must have at least one child node");
      }

      // Validate all child nodes
      for (const node of childNodes) {
        const validation = node.validate();
        if (!validation.valid) {
          errors.push(
            `Child node ${node.name}: ${validation.errors.join(", ")}`,
          );
        }
      }

      // Validate edges reference existing nodes
      for (const edge of executionFlow) {
        const sourceExists = childNodes.some(
          (n) => n.id === edge.source.nodeId,
        );
        const targetExists = childNodes.some(
          (n) => n.id === edge.target.nodeId,
        );

        if (!sourceExists) {
          errors.push(
            `Edge references non-existent source node: ${edge.source.nodeId}`,
          );
        }
        if (!targetExists) {
          errors.push(
            `Edge references non-existent target node: ${edge.target.nodeId}`,
          );
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },

    dispose(): void {
      for (const node of childNodes) {
        node.dispose();
      }
      childNodes.length = 0;
      executionFlow.length = 0;
    },
  };
}
