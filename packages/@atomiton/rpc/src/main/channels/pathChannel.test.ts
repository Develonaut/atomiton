import type { PathManager } from "@atomiton/storage/desktop";
import type { IpcMain } from "electron";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPathChannelServer } from "#main/channels/pathChannel";

describe("pathChannel - integration", () => {
  let mockIpcMain: IpcMain;
  let mockPathManager: PathManager;
  let mainHandler:
    | ((event: unknown, method: string, args: unknown) => Promise<unknown>)
    | null;

  beforeEach(() => {
    mainHandler = null;

    // Mock IpcMain
    mockIpcMain = {
      handle: vi.fn(
        (
          channel: string,
          handler: (
            event: unknown,
            method: string,
            args: unknown,
          ) => Promise<unknown>,
        ) => {
          if (channel === "path:call") {
            mainHandler = handler;
          }
        },
      ),
      removeHandler: vi.fn(),
    } as unknown as IpcMain;

    // Mock PathManager with realistic implementations
    mockPathManager = {
      getWorkspacePath: vi.fn((id: string) => `/test/workspaces/${id}`),
      getFlowsDirectory: vi.fn((workspaceId?: string) =>
        workspaceId ? `/test/workspaces/${workspaceId}/flows` : "/test/flows",
      ),
      getUserDataPath: vi.fn(() => "/test/userData"),
      getFlowPath: vi.fn((flowId: string, workspaceId?: string) =>
        workspaceId
          ? `/test/workspaces/${workspaceId}/flows/${flowId}.flow.yaml`
          : `/test/flows/${flowId}.flow.yaml`,
      ),
      getConfigPath: vi.fn(
        (configName: string) => `/test/config/${configName}`,
      ),
      getDatabasePath: vi.fn((dbName: string) => `/test/database/${dbName}`),
      getExportPath: vi.fn((filename: string) => `/test/exports/${filename}`),
      getLogsPath: vi.fn(() => "/test/logs"),
      getTempPath: vi.fn(() => "/test/temp"),
      ensureDirectory: vi.fn(async () => {}),
      sanitizePath: vi.fn((component: string) =>
        component.replace(/[./]/g, "_"),
      ),
      getContext: vi.fn(() => "test"),
      getAllPaths: vi.fn(() => ({
        userData: "/test/userData",
        documents: "/test/documents",
        temp: "/test/temp",
        logs: "/test/logs",
        workspaces: "/test/workspaces",
        flows: "/test/flows",
        nodePackages: "/test/node-packages",
        templates: "/test/templates",
        exports: "/test/exports",
        config: "/test/config",
        database: "/test/database",
      })),
    } as PathManager;
  });

  // Helper to call a method through the channel
  const callMethod = async (
    method: string,
    params: unknown = undefined,
  ): Promise<{ result?: unknown; error?: string; channelError?: boolean }> => {
    if (!mainHandler) {
      throw new Error("Channel not initialized");
    }
    return mainHandler(null, method, params) as Promise<{
      result?: unknown;
      error?: string;
      channelError?: boolean;
    }>;
  };

  describe("handler registration", () => {
    it("should register main IPC handler", () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        "path:call",
        expect.any(Function),
      );
    });

    it("should handle unknown methods gracefully", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const result = await callMethod("unknownMethod", {});

      expect(result).toHaveProperty("error");
      expect(result).toHaveProperty("channelError", true);
    });
  });

  describe("getWorkspacePath", () => {
    it("should return workspace path for given ID", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getWorkspacePath", {
        id: "workspace-123",
      });

      expect(response.result).toBe("/test/workspaces/workspace-123");
      expect(mockPathManager.getWorkspacePath).toHaveBeenCalledWith(
        "workspace-123",
      );
    });
  });

  describe("getFlowsDirectory", () => {
    it("should return global flows directory when no workspace specified", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getFlowsDirectory", {});

      expect(response.result).toBe("/test/flows");
      expect(mockPathManager.getFlowsDirectory).toHaveBeenCalledWith(undefined);
    });

    it("should return workspace-specific flows directory", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getFlowsDirectory", {
        workspaceId: "workspace-123",
      });

      expect(response.result).toBe("/test/workspaces/workspace-123/flows");
      expect(mockPathManager.getFlowsDirectory).toHaveBeenCalledWith(
        "workspace-123",
      );
    });
  });

  describe("getUserDataPath", () => {
    it("should return user data path", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getUserDataPath", undefined);

      expect(response.result).toBe("/test/userData");
      expect(mockPathManager.getUserDataPath).toHaveBeenCalled();
    });
  });

  describe("getFlowPath", () => {
    it("should return global flow path", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getFlowPath", { flowId: "flow-123" });

      expect(response.result).toBe("/test/flows/flow-123.flow.yaml");
      expect(mockPathManager.getFlowPath).toHaveBeenCalledWith(
        "flow-123",
        undefined,
      );
    });

    it("should return workspace-specific flow path", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getFlowPath", {
        flowId: "flow-123",
        workspaceId: "workspace-456",
      });

      expect(response.result).toBe(
        "/test/workspaces/workspace-456/flows/flow-123.flow.yaml",
      );
      expect(mockPathManager.getFlowPath).toHaveBeenCalledWith(
        "flow-123",
        "workspace-456",
      );
    });
  });

  describe("getConfigPath", () => {
    it("should return config file path", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getConfigPath", {
        configName: "settings.json",
      });

      expect(response.result).toBe("/test/config/settings.json");
      expect(mockPathManager.getConfigPath).toHaveBeenCalledWith(
        "settings.json",
      );
    });
  });

  describe("getDatabasePath", () => {
    it("should return database file path", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getDatabasePath", {
        dbName: "app.db",
      });

      expect(response.result).toBe("/test/database/app.db");
      expect(mockPathManager.getDatabasePath).toHaveBeenCalledWith("app.db");
    });
  });

  describe("getExportPath", () => {
    it("should return export file path", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getExportPath", {
        filename: "export.json",
      });

      expect(response.result).toBe("/test/exports/export.json");
      expect(mockPathManager.getExportPath).toHaveBeenCalledWith("export.json");
    });
  });

  describe("getAllPaths", () => {
    it("should return all managed paths", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("getAllPaths", undefined);

      expect(response.result).toEqual({
        userData: "/test/userData",
        documents: "/test/documents",
        temp: "/test/temp",
        logs: "/test/logs",
        workspaces: "/test/workspaces",
        flows: "/test/flows",
        nodePackages: "/test/node-packages",
        templates: "/test/templates",
        exports: "/test/exports",
        config: "/test/config",
        database: "/test/database",
      });
      expect(mockPathManager.getAllPaths).toHaveBeenCalled();
    });
  });

  describe("ensureDirectory - security", () => {
    it("should allow directory creation within managed paths", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("ensureDirectory", {
        path: "/test/userData/subdir",
      });

      expect(response.result).toBeUndefined();
      expect(response.error).toBeUndefined();
      expect(mockPathManager.ensureDirectory).toHaveBeenCalledWith(
        "/test/userData/subdir",
      );
    });

    it("should block directory creation outside managed paths", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("ensureDirectory", {
        path: "/etc/passwd",
      });

      expect(response.error).toContain(
        "Invalid path: must be within managed directories",
      );
      expect(response.channelError).toBe(true);
      expect(mockPathManager.ensureDirectory).not.toHaveBeenCalled();
    });

    it("should block path traversal attempts", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      // Path that attempts to traverse outside managed directories
      const response = await callMethod("ensureDirectory", {
        path: "/completely/different/path",
      });

      expect(response.error).toContain(
        "Invalid path: must be within managed directories",
      );
      expect(response.channelError).toBe(true);
      expect(mockPathManager.ensureDirectory).not.toHaveBeenCalled();
    });

    it("should allow nested directory within managed paths", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      const response = await callMethod("ensureDirectory", {
        path: "/test/workspaces/my-workspace/flows/nested",
      });

      expect(response.result).toBeUndefined();
      expect(response.error).toBeUndefined();
      expect(mockPathManager.ensureDirectory).toHaveBeenCalledWith(
        "/test/workspaces/my-workspace/flows/nested",
      );
    });

    it("should validate against all managed base paths", async () => {
      createPathChannelServer(mockIpcMain, mockPathManager);

      // Should work for any managed base path
      let response = await callMethod("ensureDirectory", {
        path: "/test/config/subdir",
      });
      expect(response.error).toBeUndefined();
      expect(mockPathManager.ensureDirectory).toHaveBeenCalledWith(
        "/test/config/subdir",
      );

      response = await callMethod("ensureDirectory", {
        path: "/test/database/nested/dir",
      });
      expect(response.error).toBeUndefined();
      expect(mockPathManager.ensureDirectory).toHaveBeenCalledWith(
        "/test/database/nested/dir",
      );

      response = await callMethod("ensureDirectory", {
        path: "/test/exports/year/month",
      });
      expect(response.error).toBeUndefined();
      expect(mockPathManager.ensureDirectory).toHaveBeenCalledWith(
        "/test/exports/year/month",
      );
    });
  });
});
