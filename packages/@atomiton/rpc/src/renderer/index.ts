/**
 * @atomiton/rpc - Renderer Transport
 *
 * Pure transport layer for renderer environments
 * Auto-detects environment and creates appropriate transport:
 * - IPC transport for Electron
 * - WebSocket transport for browser
 * - HTTP transport for Node.js
 * - Memory transport for testing
 */

// Export the auto-detecting transport creators
export {
  createHTTPTransport,
  createIPCTransport,
  createMemoryTransport,
  createRPCTransport,
  createWebSocketTransport,
} from "#renderer/createTransport";

// Re-export transport types
export type {
  ChannelClient,
  ExecutionTransport,
  Transport,
} from "#shared/types";
