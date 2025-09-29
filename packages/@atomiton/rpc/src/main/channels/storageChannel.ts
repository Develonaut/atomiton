import {
  createChannelServer,
  type ChannelServer,
} from "#main/channels/createChannelServer";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { IpcMain } from "electron";

// Types for storage channel operations
export type SaveFlowParams = {
  flow: {
    id?: string;
    name: string;
    nodes: NodeDefinition[];
    edges?: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
    metadata?: Record<string, unknown>;
  };
};

export type SaveFlowResult = {
  id: string;
  savedAt: string;
  version: string;
};

export type LoadFlowParams = {
  id: string;
};

export type LoadFlowResult = {
  id: string;
  name: string;
  nodes: NodeDefinition[];
  edges?: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
  metadata?: Record<string, unknown>;
  savedAt: string;
  version: string;
};

export type ListFlowsParams = {
  limit?: number;
  offset?: number;
  sortBy?: "name" | "savedAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type ListFlowsResult = {
  flows: Array<{
    id: string;
    name: string;
    nodeCount: number;
    savedAt: string;
    updatedAt: string;
    version: string;
  }>;
  total: number;
};

export type DeleteFlowParams = {
  id: string;
};

// Functional factory for storage channel server
export const createStorageChannelServer = (ipcMain: IpcMain): ChannelServer => {
  const server = createChannelServer("storage", ipcMain);

  // In-memory storage for demo (replace with actual storage implementation)
  const flows = new Map<string, LoadFlowResult>();

  // Register command handlers
  server.handle(
    "saveFlow",
    async (params: unknown): Promise<SaveFlowResult> => {
      const typedParams = params as SaveFlowParams;
      const flowId = typedParams.flow.id || crypto.randomUUID();
      const now = new Date().toISOString();

      const flowData: LoadFlowResult = {
        id: flowId,
        name: typedParams.flow.name,
        nodes: typedParams.flow.nodes,
        edges: typedParams.flow.edges || [],
        metadata: {
          ...typedParams.flow.metadata,
          nodeCount: typedParams.flow.nodes.length,
          edgeCount: typedParams.flow.edges?.length || 0,
        },
        savedAt: now,
        version: "1.0.0",
      };

      flows.set(flowId, flowData);

      console.log("Flow saved", {
        flowId,
        name: typedParams.flow.name,
        nodeCount: typedParams.flow.nodes.length,
        edgeCount: typedParams.flow.edges?.length || 0,
      });

      // Broadcast flow saved event
      server.broadcast("flowSaved", {
        id: flowId,
        name: typedParams.flow.name,
        savedAt: now,
      });

      return {
        id: flowId,
        savedAt: now,
        version: "1.0.0",
      };
    },
  );

  server.handle(
    "loadFlow",
    async (params: unknown): Promise<LoadFlowResult> => {
      const typedParams = params as LoadFlowParams;
      const flow = flows.get(typedParams.id);

      if (!flow) {
        throw new Error(`Flow with id ${typedParams.id} not found`);
      }

      console.log("Flow loaded", {
        flowId: typedParams.id,
        name: flow.name,
        nodeCount: flow.nodes.length,
      });

      return flow;
    },
  );

  server.handle(
    "listFlows",
    async (params: unknown): Promise<ListFlowsResult> => {
      const typedParams = (params || {}) as ListFlowsParams;
      const {
        limit = 50,
        offset = 0,
        sortBy = "savedAt",
        sortOrder = "desc",
      } = typedParams;

      const allFlows = Array.from(flows.values());

      // Sort flows
      allFlows.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortBy) {
          case "name":
            aValue = a.name;
            bValue = b.name;
            break;
          case "savedAt":
            aValue = a.savedAt;
            bValue = b.savedAt;
            break;
          case "updatedAt":
            aValue = a.savedAt; // Using savedAt as updatedAt for simplicity
            bValue = b.savedAt;
            break;
          default:
            aValue = a.savedAt;
            bValue = b.savedAt;
        }

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      // Apply pagination
      const paginatedFlows = allFlows.slice(offset, offset + limit);

      const result: ListFlowsResult = {
        flows: paginatedFlows.map((flow) => ({
          id: flow.id,
          name: flow.name,
          nodeCount: flow.nodes.length,
          savedAt: flow.savedAt,
          updatedAt: flow.savedAt,
          version: flow.version,
        })),
        total: allFlows.length,
      };

      console.log("Flows listed", {
        total: result.total,
        returned: result.flows.length,
        limit,
        offset,
      });

      return result;
    },
  );

  server.handle("deleteFlow", async (params: unknown): Promise<void> => {
    const typedParams = params as DeleteFlowParams;
    const flow = flows.get(typedParams.id);

    if (!flow) {
      throw new Error(`Flow with id ${typedParams.id} not found`);
    }

    flows.delete(typedParams.id);

    console.log("Flow deleted", {
      flowId: typedParams.id,
      name: flow.name,
    });

    // Broadcast flow deleted event
    server.broadcast("flowDeleted", {
      id: typedParams.id,
      name: flow.name,
      deletedAt: new Date().toISOString(),
    });
  });

  server.handle(
    "health",
    async (): Promise<{ status: string; flowCount: number }> => {
      return {
        status: "ok",
        flowCount: flows.size,
      };
    },
  );

  return server;
};
