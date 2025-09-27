import { trpcReact } from "#lib/trpc";

export const useNodeDefinitions = () => {
  return trpcReact.nodes.list.useQuery();
};

export const useNodeChildren = (parentId: string) => {
  return trpcReact.nodes.getChildren.useQuery(parentId, {
    enabled: !!parentId,
  });
};

export const useNodeByVersion = (type: string, version: string) => {
  return trpcReact.nodes.getByVersion.useQuery(
    { type, version },
    { enabled: !!type && !!version },
  );
};
