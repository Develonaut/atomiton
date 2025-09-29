/**
 * Storage operations API for browser conductor
 */

import type { ConductorTransport } from "#types";
import { getBridge } from "#exports/browser/transport.js";
import type {
  FlowDefinition,
  FlowListResponse,
} from "#exports/browser/types.js";

/**
 * Create storage API for flow management
 */
export function createStorageAPI(transport: ConductorTransport | undefined) {
  return {
    async saveFlow(flow: FlowDefinition): Promise<FlowDefinition> {
      // Business logic: validate flow structure
      if (!flow.nodes || flow.nodes.length === 0) {
        throw new Error("Flow must contain at least one node");
      }

      // Business logic: add metadata
      const flowWithMetadata = {
        ...flow,
        savedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          const response = await bridge.call<FlowDefinition>(
            "storage",
            "saveFlow",
            { flow: flowWithMetadata },
          );
          return response.result || flowWithMetadata;
        }
      }

      throw new Error("No transport available for storage operations");
    },

    async loadFlow(id: string): Promise<FlowDefinition> {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          const response = await bridge.call<FlowDefinition>(
            "storage",
            "loadFlow",
            { id },
          );
          const flow = response.result;
          if (!flow) {
            throw new Error("Flow not found");
          }

          // Business logic: migration if needed
          if (flow.version === "0.9.0") {
            return { ...flow, version: "1.0.0" }; // Simple migration
          }

          return flow;
        }
      }

      throw new Error("No transport available for storage operations");
    },

    async listFlows(
      options: Record<string, unknown> = {},
    ): Promise<FlowListResponse> {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          const response = await bridge.call<FlowListResponse>(
            "storage",
            "listFlows",
            options,
          );
          const flows = response.result || response;

          // Business logic: sorting and filtering
          return {
            ...flows,
            flows: (flows.flows || []).filter((f) => !f.deleted),
          };
        }
      }

      throw new Error("No transport available for storage operations");
    },

    async deleteFlow(id: string): Promise<void> {
      if (transport) {
        const bridge = getBridge();
        if (bridge) {
          await bridge.call("storage", "deleteFlow", { id });
          return;
        }
      }

      throw new Error("No transport available for storage operations");
    },
  };
}
