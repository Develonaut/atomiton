import {
  getAllNodeDefinitions,
  type NodeDefinition,
} from "@atomiton/nodes/definitions";

export const nodeProcedures = {
  list: async () => {
    const nodes = getAllNodeDefinitions();
    return nodes.map((node) => ({
      ...node,
      version: node.version || "1.0.0",
      parentId: node.parentId || undefined,
      metadata: {
        ...node.metadata,
        version: undefined,
      },
    }));
  },

  getChildren: async ({ input: parentId }: { input: string }) => {
    const nodes = getAllNodeDefinitions();
    return nodes.filter((n) => (n as NodeDefinition & { parentId?: string }).parentId === parentId);
  },

  getByVersion: async ({
    input,
  }: {
    input: { type: string; version: string };
  }) => {
    const { type, version } = input;
    const nodes = getAllNodeDefinitions();
    return nodes.find((n) => n.type === type && n.version === version);
  },
};