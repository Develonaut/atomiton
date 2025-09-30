// Pure transport exports only
// Only export types that are actually used by consumers

export type { AtomitonBridge, AtomitonBridgeResponse, RPCError } from "./types";

// Internal types (not exported, used only within RPC package):
// - ChannelClient: internal transport abstraction
// - ExecutionTransport: exported via renderer/index.ts
// - RPCRequest/RPCResponse: internal RPC protocol
// - Transport: internal transport abstraction
