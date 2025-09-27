import { trpcReact } from "#lib/trpc";
import type { Flow, StorageItem } from "#lib/rpcTypes";

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
      const flatFlow = {
        ...flow,
        nodes: flow.nodes.map((n: any) => ({
          ...n,
          version: n.version || "1.0.0",
          parentId: n.parentId || undefined,
        })),
      };
      return { flatFlow };
    },
  });
};

export const useLoadFlow = (id: string) => {
  return trpcReact.storage.load.useQuery(id, {
    select: (flow: Flow) => {
      return {
        ...flow,
        nodes:
          flow.nodes?.map((n: any) => ({
            ...n,
            version: n.version || "1.0.0",
            parentId: n.parentId,
          })) || [],
      };
    },
  });
};

export const useFlowList = () => {
  return trpcReact.storage.list.useQuery();
};