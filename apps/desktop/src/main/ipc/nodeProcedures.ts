import type { INodeService } from "#main/services/types";

export function createNodeProcedures(nodeService: INodeService) {
  return {
    list: async () => {
      const result = await nodeService.list();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    getChildren: async ({ input }: { input: string }) => {
      const result = await nodeService.getChildren(input);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    getByVersion: async ({
      input,
    }: {
      input: { type: string; version: string };
    }) => {
      const { type, version } = input;
      const result = await nodeService.getByVersion(type, version);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },
  };
}
