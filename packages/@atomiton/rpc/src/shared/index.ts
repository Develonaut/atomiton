// Pure transport exports only
export {
  createContext,
  router,
  publicProcedure,
  middleware,
  appRouter,
  type Context,
  type AppRouter,
} from "#trpc";

// Channel constants
export { IPC, type IPCChannel } from "#shared/channels";

// Pure transport types
export type { RPCRequest, RPCResponse, RPCError } from "#shared/types";
