import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { IStorageService } from "#main/services/types";

export function createStorageProcedures(storageService: IStorageService) {
  return {
    save: async ({ input }: { input: NodeDefinition }) => {
      const result = await storageService.save(input);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    load: async ({ input }: { input: string }) => {
      const result = await storageService.load(input);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    list: async () => {
      const result = await storageService.list();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },
  };
}
