/**
 * Flow template operations API for browser conductor
 *
 * Provides access to read-only flow templates (bundled examples).
 * These are separate from user storage.
 */

import { createTransport } from "@atomiton/rpc/renderer";
import type { Transport } from "@atomiton/rpc/renderer";
import type { ConductorTransport, ExecutionResult, ErrorCode } from "#types";
import { createExecutionId, createNodeId } from "#types/branded";
import type { ConductorExecutionContext } from "#types/execution";
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
  // Create RPC transport for flow operations
  let rpcTransport: Transport | undefined;

  try {
    rpcTransport = createTransport();
  } catch (error) {
    console.warn("[FLOW] RPC transport unavailable:", error);
  }

  return {
    /**
     * List all available flow templates
     */
    async listTemplates(): Promise<ListTemplatesResponse> {
      if (!rpcTransport) {
        throw new Error("No transport available for flow operations");
      }
      return rpcTransport
        .channel("flow")
        .call("listTemplates", {}) as Promise<ListTemplatesResponse>;
    },

    /**
     * Get a specific flow template by ID
     */
    async getTemplate(id: string): Promise<GetTemplateResponse> {
      if (!rpcTransport) {
        throw new Error("No transport available for flow operations");
      }
      return rpcTransport
        .channel("flow")
        .call("getTemplate", { id }) as Promise<GetTemplateResponse>;
    },

    /**
     * Load a flow template by ID (convenience method)
     */
    async loadFlow(id: string): Promise<NodeDefinition> {
      const response = await this.getTemplate(id);
      return response.definition;
    },

    /**
     * Execute a flow (group node)
     * Alias to conductor.node.run() with flow-specific validation
     */
    async run(
      flow: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      // Validate it's a group node (flow)
      if (!flow.nodes || flow.nodes.length === 0) {
        throw new Error(
          "Flow must be a group node with child nodes. Use conductor.node.run() for atomic nodes.",
        );
      }

      // Delegate to transport for execution
      if (!transport) {
        return {
          success: false,
          error: {
            nodeId: flow.id,
            message:
              "No transport available for execution in browser environment",
            timestamp: new Date(),
            code: "NO_TRANSPORT" as ErrorCode,
          },
          duration: 0,
          executedNodes: [],
        };
      }

      // Execute via transport (same as node.run does)
      return transport.execute(flow, {
        nodeId: createNodeId(flow.id),
        executionId:
          contextOverrides?.executionId ||
          createExecutionId(
            `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ),
        variables: contextOverrides?.variables || {},
        input: contextOverrides?.input,
        parentContext: contextOverrides?.parentContext,
      });
    },
  };
}
