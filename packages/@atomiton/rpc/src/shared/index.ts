// New tRPC exports (primary)
export * from "../trpc";
export * from "../schemas";

// Legacy IPC exports (backward compatibility)
export * as IPC from "#shared/channels";
export * from "#shared/types";

// Deprecated re-exports with warning
import * as channels from "#shared/channels";
import * as types from "#shared/types";

/**
 * @deprecated Use the new tRPC-based API instead. Legacy IPC exports will be removed in a future version.
 */
export const legacyIPC = {
  channels,
  types,
};
