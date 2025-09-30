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

// Only export the auto-detecting transport creator (not individual transport creators)
export { createRPCTransport } from "#renderer/createTransport";

// Re-export transport types
export type { ExecutionTransport } from "#shared/types";
