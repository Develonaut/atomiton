import type {
  NodeDefinition,
  LegacyNodeDefinition,
} from "#core/types/definition";
import type {
  LegacyNodeMetadata,
  FlatNodeMetadata,
} from "#core/types/metadata";

export function convertLegacyToFlat(
  nodes: LegacyNodeDefinition[],
  parentId?: string,
): NodeDefinition[] {
  const result: NodeDefinition[] = [];

  for (const node of nodes) {
    const { nodes: children, edges, metadata, ...rest } = node;

    const flatMetadata: FlatNodeMetadata = {
      id: metadata.id,
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      author: metadata.author,
      authorId: metadata.authorId,
      source: metadata.source,
      icon: metadata.icon,
      keywords: metadata.keywords,
      tags: metadata.tags,
      runtime: metadata.runtime,
      experimental: metadata.experimental,
      deprecated: metadata.deprecated,
      documentationUrl: metadata.documentationUrl,
      examples: metadata.examples,
    };

    result.push({
      ...rest,
      type: metadata.type,
      version: metadata.version,
      parentId,
      metadata: flatMetadata,
    });

    if (children && children.length > 0) {
      result.push(...convertLegacyToFlat(children, node.id));
    }
  }

  return result;
}

export function convertFlatToLegacy(
  flatNodes: NodeDefinition[],
): LegacyNodeDefinition[] {
  const nodeMap = new Map<string, LegacyNodeDefinition>();
  const childrenMap = new Map<string, LegacyNodeDefinition[]>();
  const roots: LegacyNodeDefinition[] = [];

  for (const flatNode of flatNodes) {
    const { parentId, type, version, metadata, nodes, ...rest } = flatNode;

    const legacyMetadata: LegacyNodeMetadata = {
      id: metadata.id,
      name: metadata.name,
      type: type as LegacyNodeMetadata["type"],
      version,
      author: metadata.author,
      authorId: metadata.authorId,
      source: metadata.source,
      description: metadata.description,
      category: metadata.category,
      icon: metadata.icon,
      keywords: metadata.keywords,
      tags: metadata.tags,
      runtime: metadata.runtime,
      experimental: metadata.experimental,
      deprecated: metadata.deprecated,
      documentationUrl: metadata.documentationUrl,
      examples: metadata.examples,
    };

    const node: LegacyNodeDefinition = {
      ...rest,
      metadata: legacyMetadata,
      // Convert nested nodes if they exist
      nodes: nodes ? convertFlatToLegacy(nodes) : undefined,
    };

    nodeMap.set(flatNode.id, node);

    if (parentId) {
      const siblings = childrenMap.get(parentId) || [];
      siblings.push(node);
      childrenMap.set(parentId, siblings);
    } else {
      roots.push(node);
    }
  }

  for (const [parentId, children] of childrenMap) {
    const parent = nodeMap.get(parentId);
    if (parent) {
      parent.nodes = children;
    }
  }

  return roots;
}

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
