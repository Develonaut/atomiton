import type { NodeDefinition } from "#core/types/definition";

export function getChildren(
  nodes: NodeDefinition[],
  parentId: string,
): NodeDefinition[] {
  return nodes.filter((node) => node.parentId === parentId);
}

export function getParent(
  nodes: NodeDefinition[],
  nodeId: string,
): NodeDefinition | undefined {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node?.parentId) return undefined;
  return nodes.find((n) => n.id === node.parentId);
}

export function getRootNodes(nodes: NodeDefinition[]): NodeDefinition[] {
  return nodes.filter((node) => !node.parentId);
}

export function getAllDescendants(
  nodes: NodeDefinition[],
  parentId: string,
): NodeDefinition[] {
  const result: NodeDefinition[] = [];
  const children = getChildren(nodes, parentId);

  for (const child of children) {
    result.push(child);
    result.push(...getAllDescendants(nodes, child.id));
  }

  return result;
}

export function getAncestors(
  nodes: NodeDefinition[],
  nodeId: string,
): NodeDefinition[] {
  const result: NodeDefinition[] = [];
  let current = getParent(nodes, nodeId);

  while (current) {
    result.push(current);
    current = getParent(nodes, current.id);
  }

  return result;
}
