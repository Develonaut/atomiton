/**
 * Storage operations API for browser conductor
 */

import type { ConductorTransport } from "#types";
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
      if (!flow.nodes || flow.nodes.length === 0) {
        throw new Error("Flow must contain at least one node");
      }

      const flowWithMetadata = {
        ...flow,
        savedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const response = await window.atomiton?.__bridge__.call(
          "storage",
          "saveFlow",
          { flow: flowWithMetadata },
        );
        return (response.result as FlowDefinition) || flowWithMetadata;
      }

      throw new Error("No transport available for storage operations");
    },

    async loadFlow(id: string): Promise<FlowDefinition> {
      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const response = await window.atomiton?.__bridge__.call(
          "storage",
          "loadFlow",
          { id },
        );
        const flow = response.result as FlowDefinition;
        if (!flow) {
          throw new Error("Flow not found");
        }

        if (flow.version === "0.9.0") {
          return { ...flow, version: "1.0.0" }; // Simple migration
        }

        return flow;
      }

      throw new Error("No transport available for storage operations");
    },

    async listFlows(
      options: Record<string, unknown> = {},
    ): Promise<FlowListResponse> {
      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const response = await window.atomiton?.__bridge__.call(
          "storage",
          "listFlows",
          options,
        );
        const flows =
          (response.result as FlowListResponse) ||
          (response as FlowListResponse);

        return {
          ...flows,
          flows: (flows.flows || []).filter((f) => !f.deleted),
        };
      }

      throw new Error("No transport available for storage operations");
    },

    async deleteFlow(id: string): Promise<void> {
      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        await window.atomiton?.__bridge__.call("storage", "deleteFlow", { id });
        return;
      }

      throw new Error("No transport available for storage operations");
    },
  };
}
