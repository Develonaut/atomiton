/**
 * Flow template operations API for browser conductor
 *
 * Provides access to read-only flow templates (bundled examples).
 * These are separate from user storage.
 */

import type { ConductorTransport } from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

export type FlowTemplateInfo = {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
};

export type ListTemplatesResponse = {
  templates: FlowTemplateInfo[];
};

export type GetTemplateResponse = {
  definition: NodeDefinition;
};

/**
 * Create flow template API
 */
export function createFlowAPI(transport: ConductorTransport | undefined) {
  return {
    /**
     * List all available flow templates
     */
    async listTemplates(): Promise<ListTemplatesResponse> {
      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const response = await window.atomiton?.__bridge__.call(
          "flow",
          "listTemplates",
          {},
        );
        return response.result as ListTemplatesResponse;
      }

      throw new Error("No transport available for flow operations");
    },

    /**
     * Get a specific flow template by ID
     */
    async getTemplate(id: string): Promise<GetTemplateResponse> {
      if (
        transport &&
        typeof window !== "undefined" &&
        window.atomiton?.__bridge__
      ) {
        const response = await window.atomiton?.__bridge__.call(
          "flow",
          "getTemplate",
          { id },
        );
        return response.result as GetTemplateResponse;
      }

      throw new Error("No transport available for flow operations");
    },

    /**
     * Load a flow template by ID (convenience method)
     */
    async loadFlow(id: string): Promise<NodeDefinition> {
      const response = await this.getTemplate(id);
      return response.definition;
    },
  };
}
