/**
 * @atomiton/rpc - Renderer Transport
 *
 * Pure transport layer for renderer environments
 * - IPC transport for Electron
 * - WebSocket transport for browser
 * - HTTP transport for Node.js
 * - Memory transport for testing
 */

export {
  createRPCTransport,
  createHTTPTransport,
  createIPCTransport,
  createMemoryTransport,
  createWebSocketTransport,
  type ConductorTransport,
  type ChannelClient,
  type Transport,
} from "#renderer/createTransport";
