import type { INode } from "../../base/INode";
import { CompositeNode, type CompositeNodeDefinition } from "../CompositeNode";

export function createCompositeFromDefinition(
  blueprint: CompositeNodeDefinition,
  nodeFactory?: (type: string, config: Record<string, unknown>) => INode,
): CompositeNode {
  const composite = new CompositeNode(blueprint);

  // If node factory provided, instantiate child nodes
  if (nodeFactory) {
    const childNodes: INode[] = [];

    for (const nodeSpec of blueprint.nodes) {
      const childNode = nodeFactory(nodeSpec.type, nodeSpec.config || {});
      childNodes.push(childNode);
    }

    composite.setChildNodes(childNodes);
  }

  return composite;
}
