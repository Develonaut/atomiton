import type { EditorNode, NodePosition } from "#types/EditorNode";

export type { NodePosition } from "#types/EditorNode";

export function calculateNodePosition(
  existingNodes: EditorNode[],
  explicitPosition?: NodePosition,
): NodePosition {
  if (explicitPosition) {
    return explicitPosition;
  }

  if (existingNodes.length === 0) {
    return { x: 100, y: 100 };
  }

  let maxX = -Infinity;
  let rightmostY = 100;

  for (const node of existingNodes) {
    if (node.position.x > maxX) {
      maxX = node.position.x;
      rightmostY = node.position.y;
    }
  }

  return {
    x: maxX + 200,
    y: rightmostY,
  };
}
