/**
 * Event subscription API for browser conductor
 * Uses RPC transport layer for all event subscriptions
 */

import type {
  FlowSavedEvent,
  NodeCompleteEvent,
  NodeErrorEvent,
  NodeProgressEvent,
} from "#exports/browser/types.js";
import type { ConductorTransport } from "#types";
import type { Transport } from "@atomiton/rpc/renderer";
import { createTransport } from "@atomiton/rpc/renderer";

/**
 * Create events API for subscribing to conductor events
 * Note: transport parameter is for execution, events use RPC transport directly
 */
export function createEventsAPI(_transport: ConductorTransport | undefined) {
  // Create RPC transport for event subscriptions
  // This properly abstracts the bridge access through RPC layer
  let rpcTransport: Transport | undefined;

  try {
    rpcTransport = createTransport();
  } catch (error) {
    console.warn("[EVENTS] RPC transport unavailable:", error);
  }

  return {
    onNodeProgress: (callback: (data: NodeProgressEvent) => void) => {
      if (!rpcTransport) return () => {};
      return rpcTransport
        .channel("node")
        .listen("progress", callback as (data: unknown) => void);
    },

    onNodeComplete: (callback: (data: NodeCompleteEvent) => void) => {
      if (!rpcTransport) return () => {};
      return rpcTransport
        .channel("node")
        .listen("completed", callback as (data: unknown) => void);
    },

    onNodeError: (callback: (data: NodeErrorEvent) => void) => {
      if (!rpcTransport) return () => {};
      return rpcTransport
        .channel("node")
        .listen("error", callback as (data: unknown) => void);
    },

    onAuthExpired: (callback: () => void) => {
      if (!rpcTransport) return () => {};
      return rpcTransport
        .channel("auth")
        .listen("sessionExpired", callback as (data: unknown) => void);
    },

    onFlowSaved: (callback: (data: FlowSavedEvent) => void) => {
      if (!rpcTransport) return () => {};
      return rpcTransport
        .channel("storage")
        .listen("flowSaved", callback as (data: unknown) => void);
    },
  };
}
