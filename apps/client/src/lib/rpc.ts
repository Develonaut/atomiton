interface RPCExecuteInput {
  executable: {
    id: string;
    type: string;
    version: string;
  };
  context: {
    variables: Record<string, any>;
  };
}

interface RPCExecuteResult {
  success: boolean;
  error?: string;
  data?: any;
}

interface RPCHealthResult {
  status: string;
  timestamp: number;
}

interface RPCInfoResult {
  version: string;
  environment: string;
}

interface NativeRPC {
  node: {
    execute: (input: RPCExecuteInput) => Promise<RPCExecuteResult>;
  };
  flow: {
    execute: (input: RPCExecuteInput) => Promise<RPCExecuteResult>;
  };
  system: {
    health: () => Promise<RPCHealthResult>;
    info: () => Promise<RPCInfoResult>;
  };
}

declare global {
  interface Window {
    rpc?: NativeRPC;
  }
}

const createFallbackRPC = (): NativeRPC => ({
  node: {
    execute: async (input: RPCExecuteInput) => {
      console.log("[RPC] Fallback node.execute called with:", input);
      throw new Error(
        "RPC not available - not running in Electron environment",
      );
    },
  },
  flow: {
    execute: async (input: RPCExecuteInput) => {
      console.log("[RPC] Fallback flow.execute called with:", input);
      throw new Error(
        "RPC not available - not running in Electron environment",
      );
    },
  },
  system: {
    health: async () => {
      console.log("[RPC] Fallback system.health called");
      throw new Error(
        "RPC not available - not running in Electron environment",
      );
    },
    info: async () => {
      console.log("[RPC] Fallback system.info called");
      throw new Error(
        "RPC not available - not running in Electron environment",
      );
    },
  },
});

const createLoggedRPC = (nativeRPC: NativeRPC): NativeRPC => ({
  node: {
    execute: async (input: RPCExecuteInput) => {
      console.log("[RPC] node.execute called with:", input);
      try {
        const result = await nativeRPC.node.execute(input);
        console.log("[RPC] node.execute result:", result);
        return result;
      } catch (error) {
        console.error("[RPC] node.execute error:", error);
        throw error;
      }
    },
  },
  flow: {
    execute: async (input: RPCExecuteInput) => {
      console.log("[RPC] flow.execute called with:", input);
      try {
        const result = await nativeRPC.flow.execute(input);
        console.log("[RPC] flow.execute result:", result);
        return result;
      } catch (error) {
        console.error("[RPC] flow.execute error:", error);
        throw error;
      }
    },
  },
  system: {
    health: async () => {
      console.log("[RPC] system.health called");
      try {
        const result = await nativeRPC.system.health();
        console.log("[RPC] system.health result:", result);
        return result;
      } catch (error) {
        console.error("[RPC] system.health error:", error);
        throw error;
      }
    },
    info: async () => {
      console.log("[RPC] system.info called");
      try {
        const result = await nativeRPC.system.info();
        console.log("[RPC] system.info result:", result);
        return result;
      } catch (error) {
        console.error("[RPC] system.info error:", error);
        throw error;
      }
    },
  },
});

export const rpc: NativeRPC = window.rpc
  ? createLoggedRPC(window.rpc)
  : createFallbackRPC();

export const isRPCAvailable = (): boolean => {
  const available = !!window.rpc;
  console.log("[RPC] Availability check:", available);
  return available;
};

export type {
  RPCExecuteInput,
  RPCExecuteResult,
  RPCHealthResult,
  RPCInfoResult,
};
