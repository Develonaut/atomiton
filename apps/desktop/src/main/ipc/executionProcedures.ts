import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { IExecutionService } from "#main/services/types";

export function createExecutionProcedures(executionService: IExecutionService) {
  return {
    execute: async ({
      input,
    }: {
      input: {
        executable: NodeDefinition;
        context?: Record<string, unknown>;
      };
    }) => {
      const { executable, context } = input;
      const result = await executionService.execute(executable, context);

      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },

    onProgress: ({ input: _input }: { input: string }) => {
      // TODO: Implement progress subscription when observable is available
      return null;
    },
  };
}
