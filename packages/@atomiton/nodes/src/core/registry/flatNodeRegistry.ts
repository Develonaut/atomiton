import type { NodeDefinition } from "#core/types/definition";

export type FlatNodeRegistry = {
  register: (node: NodeDefinition) => void;
  unregister: (nodeId: string) => boolean;
  get: (nodeId: string) => NodeDefinition | undefined;
  getAll: () => NodeDefinition[];
  getChildren: (parentId: string) => NodeDefinition[];
  getParent: (nodeId: string) => NodeDefinition | undefined;
  getRootNodes: () => NodeDefinition[];
  getDescendants: (parentId: string) => NodeDefinition[];
  getAncestors: (nodeId: string) => NodeDefinition[];
  findByType: (type: string) => NodeDefinition[];
  findByVersion: (version: string) => NodeDefinition[];
  search: (predicate: (node: NodeDefinition) => boolean) => NodeDefinition[];
  clear: () => void;
  size: () => number;
  has: (nodeId: string) => boolean;
  validateHierarchy: () => { valid: boolean; errors: string[] };
  toJSON: () => NodeDefinition[];
};

export function createFlatNodeRegistry(
  initialNodes?: NodeDefinition[],
): FlatNodeRegistry {
  const nodes = new Map<string, NodeDefinition>();
  const parentToChildren = new Map<string, Set<string>>();
  const childToParent = new Map<string, string>();

  const register = (node: NodeDefinition): void => {
    nodes.set(node.id, node);

    if (node.parentId) {
      childToParent.set(node.id, node.parentId);

      const siblings = parentToChildren.get(node.parentId) || new Set<string>();
      siblings.add(node.id);
      parentToChildren.set(node.parentId, siblings);
    }
  };

  const unregister = (nodeId: string): boolean => {
    const node = nodes.get(nodeId);
    if (!node) return false;

    const children = getChildren(nodeId);
    for (const child of children) {
      unregister(child.id);
    }

    nodes.delete(nodeId);

    if (node.parentId) {
      childToParent.delete(nodeId);
      const siblings = parentToChildren.get(node.parentId);
      if (siblings) {
        siblings.delete(nodeId);
        if (siblings.size === 0) {
          parentToChildren.delete(node.parentId);
        }
      }
    }

    return true;
  };

  const get = (nodeId: string): NodeDefinition | undefined => {
    return nodes.get(nodeId);
  };

  const getAll = (): NodeDefinition[] => {
    return Array.from(nodes.values());
  };

  const getChildren = (parentId: string): NodeDefinition[] => {
    const childIds = parentToChildren.get(parentId);
    if (!childIds) return [];

    return Array.from(childIds)
      .map((id) => nodes.get(id))
      .filter((node): node is NodeDefinition => node !== undefined);
  };

  const getParent = (nodeId: string): NodeDefinition | undefined => {
    const parentId = childToParent.get(nodeId);
    return parentId ? nodes.get(parentId) : undefined;
  };

  const getRootNodes = (): NodeDefinition[] => {
    return Array.from(nodes.values()).filter((node) => !node.parentId);
  };

  const getDescendants = (parentId: string): NodeDefinition[] => {
    const result: NodeDefinition[] = [];
    const children = getChildren(parentId);

    for (const child of children) {
      result.push(child);
      result.push(...getDescendants(child.id));
    }

    return result;
  };

  const getAncestors = (nodeId: string): NodeDefinition[] => {
    const result: NodeDefinition[] = [];
    let currentId = childToParent.get(nodeId);

    while (currentId) {
      const parent = nodes.get(currentId);
      if (parent) {
        result.push(parent);
        currentId = childToParent.get(currentId);
      } else {
        break;
      }
    }

    return result;
  };

  const findByType = (type: string): NodeDefinition[] => {
    return Array.from(nodes.values()).filter((node) => node.type === type);
  };

  const findByVersion = (version: string): NodeDefinition[] => {
    return Array.from(nodes.values()).filter(
      (node) => node.version === version,
    );
  };

  const search = (
    predicate: (node: NodeDefinition) => boolean,
  ): NodeDefinition[] => {
    return Array.from(nodes.values()).filter(predicate);
  };

  const clear = (): void => {
    nodes.clear();
    parentToChildren.clear();
    childToParent.clear();
  };

  const size = (): number => {
    return nodes.size;
  };

  const has = (nodeId: string): boolean => {
    return nodes.has(nodeId);
  };

  const validateHierarchy = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    for (const [childId, parentId] of childToParent) {
      if (!nodes.has(parentId)) {
        errors.push(`Orphan node ${childId}: parent ${parentId} not found`);
      }

      const ancestors = new Set<string>();
      let currentId: string | undefined = childId;
      while (currentId) {
        if (ancestors.has(currentId)) {
          errors.push(`Circular reference detected involving node ${childId}`);
          break;
        }
        ancestors.add(currentId);
        currentId = childToParent.get(currentId);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const toJSON = (): NodeDefinition[] => {
    return getAll();
  };

  // Initialize with nodes if provided
  if (initialNodes) {
    for (const node of initialNodes) {
      register(node);
    }
  }

  return {
    register,
    unregister,
    get,
    getAll,
    getChildren,
    getParent,
    getRootNodes,
    getDescendants,
    getAncestors,
    findByType,
    findByVersion,
    search,
    clear,
    size,
    has,
    validateHierarchy,
    toJSON,
  };
}

export function flatNodeRegistryFromJSON(
  nodes: NodeDefinition[],
): FlatNodeRegistry {
  return createFlatNodeRegistry(nodes);
}
