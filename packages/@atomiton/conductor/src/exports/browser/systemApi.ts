/**
 * System operations API for browser conductor
 */

import type { ConductorTransport, HealthResult } from "#types";
import { getBridge } from "#exports/browser/transport.js";

/**
 * Create system API for health checks and system operations
 */
export function createSystemAPI(transport: ConductorTransport | undefined) {
  return {
    /**
     * Check system health via transport or return browser status
     */
    async health(): Promise<HealthResult> {
      if (transport?.health) {
        return transport.health();
      }

      return {
        status: "ok",
        timestamp: Date.now(),
        message: "Browser conductor operational (no transport)",
      };
    },

    async restart(): Promise<void> {
      const confirmed =
        typeof window !== "undefined" && window?.confirm
          ? window.confirm("System will restart. Continue?")
          : false;
      if (!confirmed) return;

      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          await bridge.call("system", "restart");
          return;
        }
      }

      throw new Error("Restart not available in browser environment");
    },
  };
}
