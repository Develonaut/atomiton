/**
 * Event subscription API for browser conductor
 */

import type { ConductorTransport } from "#types";
import { getBridge } from "#exports/browser/transport.js";
import type {
  FlowSavedEvent,
  NodeCompleteEvent,
  NodeErrorEvent,
  NodeProgressEvent,
} from "#exports/browser/types.js";

/**
 * Create events API for subscribing to conductor events
 */
export function createEventsAPI(transport: ConductorTransport | undefined) {
  return {
    onNodeProgress: (callback: (data: NodeProgressEvent) => void) => {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          return bridge.listen(
            "node",
            "progress",
            callback as (data: unknown) => void,
          );
        }
      }
      return () => {}; // no-op unsubscribe
    },

    onNodeComplete: (callback: (data: NodeCompleteEvent) => void) => {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          return bridge.listen(
            "node",
            "completed",
            callback as (data: unknown) => void,
          );
        }
      }
      return () => {}; // no-op unsubscribe
    },

    onNodeError: (callback: (data: NodeErrorEvent) => void) => {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          return bridge.listen(
            "node",
            "error",
            callback as (data: unknown) => void,
          );
        }
      }
      return () => {}; // no-op unsubscribe
    },

    onAuthExpired: (callback: () => void) => {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          return bridge.listen(
            "auth",
            "sessionExpired",
            callback as (data: unknown) => void,
          );
        }
      }
      return () => {}; // no-op unsubscribe
    },

    onFlowSaved: (callback: (data: FlowSavedEvent) => void) => {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          return bridge.listen(
            "storage",
            "flowSaved",
            callback as (data: unknown) => void,
          );
        }
      }
      return () => {}; // no-op unsubscribe
    },
  };
}
