import {
  createChannelServer,
  type ChannelServer,
} from "#main/channels/createChannelServer";
import type { PathManager, PathMap } from "@atomiton/storage/desktop";
import type { IpcMain } from "electron";

// Types for path operations
export type GetWorkspacePathParams = { id: string };
export type GetFlowsDirectoryParams = { workspaceId?: string };
export type GetFlowPathParams = { flowId: string; workspaceId?: string };
export type GetConfigPathParams = { configName: string };
export type GetDatabasePathParams = { dbName: string };
export type GetExportPathParams = { filename: string };
export type EnsureDirectoryParams = { path: string };

/**
 * Creates a channel server for path management operations
 * Provides access to PathManager functionality via IPC
 */
export const createPathChannelServer = (
  ipcMain: IpcMain,
  pathManager: PathManager,
): ChannelServer => {
  const server = createChannelServer("path", ipcMain);

  server.handle(
    "getWorkspacePath",
    async (params: unknown): Promise<string> => {
      const { id } = params as GetWorkspacePathParams;
      return pathManager.getWorkspacePath(id);
    },
  );

  server.handle(
    "getFlowsDirectory",
    async (params: unknown): Promise<string> => {
      const { workspaceId } = (params || {}) as GetFlowsDirectoryParams;
      return pathManager.getFlowsDirectory(workspaceId);
    },
  );

  server.handle("getUserDataPath", async (): Promise<string> => {
    return pathManager.getUserDataPath();
  });

  server.handle("getFlowPath", async (params: unknown): Promise<string> => {
    const { flowId, workspaceId } = params as GetFlowPathParams;
    return pathManager.getFlowPath(flowId, workspaceId);
  });

  server.handle("getConfigPath", async (params: unknown): Promise<string> => {
    const { configName } = params as GetConfigPathParams;
    return pathManager.getConfigPath(configName);
  });

  server.handle("getDatabasePath", async (params: unknown): Promise<string> => {
    const { dbName } = params as GetDatabasePathParams;
    return pathManager.getDatabasePath(dbName);
  });

  server.handle("getExportPath", async (params: unknown): Promise<string> => {
    const { filename } = params as GetExportPathParams;
    return pathManager.getExportPath(filename);
  });

  server.handle("ensureDirectory", async (params: unknown): Promise<void> => {
    const { path: dirPath } = params as EnsureDirectoryParams;

    // Security: validate path is within managed directories
    const allowedBasePaths = Object.values(pathManager.getAllPaths());
    const isPathAllowed = allowedBasePaths.some((basePath) =>
      dirPath.startsWith(basePath),
    );

    if (!isPathAllowed) {
      throw new Error("Invalid path: must be within managed directories");
    }

    await pathManager.ensureDirectory(dirPath);
  });

  server.handle("getAllPaths", async (): Promise<PathMap> => {
    return pathManager.getAllPaths();
  });

  return server;
};
