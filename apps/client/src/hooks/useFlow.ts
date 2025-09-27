import { trpcReact } from "#lib/trpc";
import type { Flow } from "#lib/rpcTypes";
import {
  migrateFlow,
  needsMigration,
} from "@atomiton/flow/migrations";

export const useExecuteFlow = () => {
  return trpcReact.execution.execute.useMutation({
    onSuccess: (data) => {
      console.log("Execution complete:", data);
    },
    onError: (error) => {
      console.error("Execution failed:", error);
    },
  });
};

export const useSaveFlow = () => {
  return trpcReact.storage.save.useMutation({
    onMutate: (flow: Flow) => {
      // Always migrate flows before saving
      const migratedFlow = migrateFlow(flow);
      return { migratedFlow };
    },
  });
};

export const useLoadFlow = (id: string) => {
  return trpcReact.storage.load.useQuery(id, {
    select: (flow: Flow) => {
      // The backend already migrates flows on load, but ensure consistency
      const migratedFlow = migrateFlow(flow);

      // Log if additional migration was needed (shouldn't happen if backend is working correctly)
      if (needsMigration(flow)) {
        console.warn(
          `Flow "${id}" required additional migration on client side`,
        );
      }

      return migratedFlow;
    },
  });
};

export const useFlowList = () => {
  return trpcReact.storage.list.useQuery();
};
