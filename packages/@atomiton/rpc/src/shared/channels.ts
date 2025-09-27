// Define ALL IPC channels as constants
export const IPC = {
  // Node execution
  EXECUTE_NODE: "node:execute",
  NODE_PROGRESS: "node:progress",
  NODE_COMPLETE: "node:complete",
  NODE_ERROR: "node:error",

  // Storage operations
  STORAGE_GET: "storage:get",
  STORAGE_SET: "storage:set",
  STORAGE_DELETE: "storage:delete",

  // System
  PING: "system:ping",

  // Add more channels as needed
} as const;

export type IPCChannel = (typeof IPC)[keyof typeof IPC];
