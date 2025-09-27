import { trpcReact } from "#lib/trpc";
import type { Flow } from "#lib/rpcTypes";

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
  return trpcReact.storage.save.useMutation();
};

export const useLoadFlow = (id: string) => {
  return trpcReact.storage.load.useQuery(id);
};

export const useFlowList = () => {
  return trpcReact.storage.list.useQuery();
};
