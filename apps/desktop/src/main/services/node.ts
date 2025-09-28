import {
  getAllNodeDefinitions,
  type NodeDefinition,
} from "@atomiton/nodes/definitions";
import type { INodeService, ServiceResult } from "#main/services/types";
import type { ErrorBoundaryService } from "#main/services/errorBoundary";

export type NodeService = INodeService;

export const createNodeService = (
  errorBoundary?: ErrorBoundaryService,
): NodeService => {
  const list = async (): Promise<ServiceResult<NodeDefinition[]>> => {
    try {
      const nodes = getAllNodeDefinitions();
      const processedNodes = nodes.map((node) => ({
        ...node,
        version: node.version || "1.0.0",
        parentId: node.parentId || undefined,
        metadata: {
          ...node.metadata,
          version: undefined,
        },
      }));

      return {
        success: true,
        data: processedNodes,
      };
    } catch (error) {
      errorBoundary?.logError(error, {
        service: "NodeService",
        operation: "list",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list nodes",
        code: "NODE_LIST_ERROR",
      };
    }
  };

  const getChildren = async (
    parentId: string,
  ): Promise<ServiceResult<NodeDefinition[]>> => {
    try {
      const nodes = getAllNodeDefinitions();
      const children = nodes.filter(
        (n) =>
          (n as NodeDefinition & { parentId?: string }).parentId === parentId,
      );

      return {
        success: true,
        data: children,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get children",
        code: "NODE_CHILDREN_ERROR",
      };
    }
  };

  const getByVersion = async (
    type: string,
    version: string,
  ): Promise<ServiceResult<NodeDefinition | undefined>> => {
    try {
      const nodes = getAllNodeDefinitions();
      const node = nodes.find((n) => n.type === type && n.version === version);

      return {
        success: true,
        data: node,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get node by version",
        code: "NODE_VERSION_ERROR",
      };
    }
  };

  return {
    list,
    getChildren,
    getByVersion,
  };
};
