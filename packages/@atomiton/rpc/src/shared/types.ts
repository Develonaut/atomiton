// ============================================================================
// PURE TRANSPORT TYPES - NO BUSINESS LOGIC
// This is the SOURCE OF TRUTH for all transport types
//
// DEPENDENCY RULE: This file can import from @atomiton/nodes ONLY
// ============================================================================

/**
 * Electron IPC Bridge Interface
 * Exposed via contextBridge in preload script
 *
 * NOTE: This type is COPIED to apps/desktop/src/preload/preload.d.ts
 * for preload compilation (preload is security-boxed and cannot import packages).
 * Use scripts/validate-preload-types.ts to ensure they stay in sync.
 */
export type AtomitonBridge = {
  call(
    channel: string,
    command: string,
    args?: unknown,
  ): Promise<AtomitonBridgeResponse>;

  listen(
    channel: string,
    event: string,
    callback: (data: unknown) => void,
  ): () => void;

  send?(channel: string, event: string, data?: unknown): void;
};

/**
 * Response wrapper from bridge calls
 */
export type AtomitonBridgeResponse<T = unknown> = {
  result?: T;
  status?: string;
  error?: RPCError;
};

/**
 * Standard RPC error format
 */
export type RPCError = {
  code: string;
  message: string;
  data?: unknown;
  stack?: string;
};

/**
 * RPC Request/Response (JSON-RPC style)
 */
export type RPCRequest<T = unknown> = {
  id: string;
  method: string;
  params: T;
};

export type RPCResponse<T = unknown> = {
  id: string;
  result?: T;
  error?: RPCError;
};

/**
 * Channel client interface
 * Abstraction over different transport mechanisms
 */
export type ChannelClient = {
  call: (command: string, args?: unknown) => Promise<unknown>;
  listen: (event: string, callback: (data: unknown) => void) => () => void;
  send?: (event: string, data?: unknown) => void;
};

/**
 * Transport abstraction
 * Provides channel-based communication
 */
export type Transport = {
  channel: (name: string) => ChannelClient;
};

/**
 * Execution Transport Interface
 * Generic transport for execution and health check operations
 * Uses 'unknown' for type safety without coupling to specific implementations
 */
export type ExecutionTransport = {
  execute(node: unknown, context: unknown): Promise<unknown>;
  health(): Promise<unknown>;
};
