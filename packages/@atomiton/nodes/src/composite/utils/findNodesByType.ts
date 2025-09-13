import type { INode } from "../../base/INode";
import type { CompositeNode } from "../CompositeNode";

export function findNodesByType(
  composite: CompositeNode,
  targetType: string,
): INode[] {
  const results: INode[] = [];

  for (const childNode of composite.getChildNodes()) {
    if (childNode.type === targetType) {
      results.push(childNode);
    }

    // Search recursively in nested composites
    if (childNode.isComposite()) {
      const childComposite = childNode as CompositeNode;
      results.push(...findNodesByType(childComposite, targetType));
    }
  }

  return results;
}
