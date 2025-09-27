// Deprecated tRPC exports - use native RPC from "#lib/rpc" instead

const createFallbackMethod = (methodName: string) => {
  return () => {
    throw new Error(
      `tRPC method '${methodName}' is deprecated. Use the native RPC from "#lib/rpc" instead.`,
    );
  };
};

// Stub tRPC client for backward compatibility
export const trpc = {
  system: {
    health: { query: createFallbackMethod("system.health.query") },
    info: { query: createFallbackMethod("system.info.query") },
  },
  execution: {
    execute: { mutate: createFallbackMethod("execution.execute.mutate") },
  },
  nodes: {
    list: { query: createFallbackMethod("nodes.list.query") },
    getChildren: { query: createFallbackMethod("nodes.getChildren.query") },
    getByVersion: { query: createFallbackMethod("nodes.getByVersion.query") },
  },
  storage: {
    save: { mutate: createFallbackMethod("storage.save.mutate") },
    load: { query: createFallbackMethod("storage.load.query") },
    list: { query: createFallbackMethod("storage.list.query") },
  },
};

// Stub tRPC React hooks for backward compatibility
export const trpcReact = {
  execution: {
    execute: {
      useMutation: createFallbackMethod("execution.execute.useMutation"),
    },
  },
  storage: {
    save: { useMutation: createFallbackMethod("storage.save.useMutation") },
    load: { useQuery: createFallbackMethod("storage.load.useQuery") },
    list: { useQuery: createFallbackMethod("storage.list.useQuery") },
  },
  nodes: {
    list: { useQuery: createFallbackMethod("nodes.list.useQuery") },
    getChildren: {
      useQuery: createFallbackMethod("nodes.getChildren.useQuery"),
    },
    getByVersion: {
      useQuery: createFallbackMethod("nodes.getByVersion.useQuery"),
    },
  },
};
