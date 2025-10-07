import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStorageChannelServer } from "#main/channels/storageChannel";
import type { IpcMain } from "electron";

describe("storageChannel - integration", () => {
  let mockIpcMain: IpcMain;
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
          if (channel === "storage:call") {
            mainHandler = handler;
          }
        },
      ),
      removeHandler: vi.fn(),
    } as unknown as IpcMain;
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
      createStorageChannelServer(mockIpcMain);

      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        "storage:call",
        expect.any(Function),
      );
    });

    it("should handle unknown methods gracefully", async () => {
      createStorageChannelServer(mockIpcMain);

      const result = await callMethod("unknownMethod", {});

      expect(result).toHaveProperty("error");
      expect(result).toHaveProperty("channelError", true);
    });
  });

  describe("saveFlow", () => {
    it("should save a new flow and generate an ID", async () => {
      createStorageChannelServer(mockIpcMain);

      const response = await callMethod("saveFlow", {
        flow: {
          name: "Test Flow",
          nodes: [
            {
              id: "node-1",
              type: "code",
              data: { code: "console.log('test')" },
            },
          ],
          edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
          metadata: { author: "test" },
        },
      });

      expect(response.result).toHaveProperty("id");
      expect(response.result).toHaveProperty("savedAt");
      expect(response.result).toHaveProperty("version", "1.0.0");
      expect((response.result as { id: string }).id).toMatch(/^[a-f0-9-]{36}$/); // UUID format
    });

    it("should use existing ID when provided", async () => {
      createStorageChannelServer(mockIpcMain);

      const flowId = "existing-flow-123";
      const response = await callMethod("saveFlow", {
        flow: {
          id: flowId,
          name: "Existing Flow",
          nodes: [],
        },
      });

      expect((response.result as { id: string }).id).toBe(flowId);
    });

    it("should include metadata with node and edge counts", async () => {
      createStorageChannelServer(mockIpcMain);

      const saveResponse = await callMethod("saveFlow", {
        flow: {
          name: "Metadata Flow",
          nodes: [
            { id: "n1", type: "code" },
            { id: "n2", type: "code" },
            { id: "n3", type: "code" },
          ],
          edges: [
            { id: "e1", source: "n1", target: "n2" },
            { id: "e2", source: "n2", target: "n3" },
          ],
          metadata: { custom: "value" },
        },
      });

      const loadResponse = await callMethod("loadFlow", {
        id: (saveResponse.result as { id: string }).id,
      });

      expect(
        (loadResponse.result as { metadata: { nodeCount: number } }).metadata,
      ).toHaveProperty("nodeCount", 3);
      expect(
        (loadResponse.result as { metadata: { edgeCount: number } }).metadata,
      ).toHaveProperty("edgeCount", 2);
      expect(
        (loadResponse.result as { metadata: { custom: string } }).metadata,
      ).toHaveProperty("custom", "value");
    });
  });

  describe("loadFlow", () => {
    it("should load a saved flow by ID", async () => {
      createStorageChannelServer(mockIpcMain);

      const saveResponse = await callMethod("saveFlow", {
        flow: {
          name: "Load Test Flow",
          nodes: [{ id: "node-1", type: "code" }],
          edges: [],
        },
      });

      const loadResponse = await callMethod("loadFlow", {
        id: (saveResponse.result as { id: string }).id,
      });

      expect((loadResponse.result as { name: string }).name).toBe(
        "Load Test Flow",
      );
      expect((loadResponse.result as { nodes: unknown[] }).nodes).toHaveLength(
        1,
      );
      expect((loadResponse.result as { id: string }).id).toBe(
        (saveResponse.result as { id: string }).id,
      );
    });

    it("should throw error for non-existent flow", async () => {
      createStorageChannelServer(mockIpcMain);

      const response = await callMethod("loadFlow", {
        id: "non-existent-flow",
      });

      expect(response.error).toContain(
        "Flow with id non-existent-flow not found",
      );
      expect(response.channelError).toBe(true);
    });

    it("should return all flow properties", async () => {
      createStorageChannelServer(mockIpcMain);

      const saveResponse = await callMethod("saveFlow", {
        flow: {
          name: "Complete Flow",
          nodes: [{ id: "n1", type: "code" }],
          edges: [{ id: "e1", source: "n1", target: "n2" }],
          metadata: { version: "1.0" },
        },
      });

      const loadResponse = await callMethod("loadFlow", {
        id: (saveResponse.result as { id: string }).id,
      });

      expect(loadResponse.result).toHaveProperty("id");
      expect(loadResponse.result).toHaveProperty("name");
      expect(loadResponse.result).toHaveProperty("nodes");
      expect(loadResponse.result).toHaveProperty("edges");
      expect(loadResponse.result).toHaveProperty("metadata");
      expect(loadResponse.result).toHaveProperty("savedAt");
      expect(loadResponse.result).toHaveProperty("version");
    });
  });

  describe("listFlows", () => {
    it("should return empty list when no flows exist", async () => {
      createStorageChannelServer(mockIpcMain);

      const response = await callMethod("listFlows", {});

      expect(
        (response.result as { flows: unknown[]; total: number }).flows,
      ).toHaveLength(0);
      expect(
        (response.result as { flows: unknown[]; total: number }).total,
      ).toBe(0);
    });

    it("should list all saved flows", async () => {
      createStorageChannelServer(mockIpcMain);

      await callMethod("saveFlow", { flow: { name: "Flow 1", nodes: [] } });
      await callMethod("saveFlow", { flow: { name: "Flow 2", nodes: [] } });
      await callMethod("saveFlow", { flow: { name: "Flow 3", nodes: [] } });

      const response = await callMethod("listFlows", {});

      expect(
        (response.result as { flows: unknown[]; total: number }).flows,
      ).toHaveLength(3);
      expect(
        (response.result as { flows: unknown[]; total: number }).total,
      ).toBe(3);
    });

    it("should include flow summary information", async () => {
      createStorageChannelServer(mockIpcMain);

      await callMethod("saveFlow", {
        flow: {
          name: "Summary Flow",
          nodes: [{ id: "n1" }, { id: "n2" }],
        },
      });

      const response = await callMethod("listFlows", {});
      const flow = (
        response.result as {
          flows: Array<{
            id: string;
            name: string;
            nodeCount: number;
            savedAt: string;
            updatedAt: string;
            version: string;
          }>;
        }
      ).flows[0];

      expect(flow).toHaveProperty("id");
      expect(flow).toHaveProperty("name", "Summary Flow");
      expect(flow).toHaveProperty("nodeCount", 2);
      expect(flow).toHaveProperty("savedAt");
      expect(flow).toHaveProperty("updatedAt");
      expect(flow).toHaveProperty("version");
    });

    it("should apply pagination with limit and offset", async () => {
      createStorageChannelServer(mockIpcMain);

      // Create 5 flows
      for (let i = 1; i <= 5; i++) {
        await callMethod("saveFlow", {
          flow: { name: `Flow ${i}`, nodes: [] },
        });
      }

      const response = await callMethod("listFlows", { limit: 2, offset: 1 });

      expect(
        (response.result as { flows: unknown[]; total: number }).flows,
      ).toHaveLength(2);
      expect(
        (response.result as { flows: unknown[]; total: number }).total,
      ).toBe(5); // Total count should be all flows
    });

    it("should sort flows by name ascending", async () => {
      createStorageChannelServer(mockIpcMain);

      await callMethod("saveFlow", { flow: { name: "Charlie", nodes: [] } });
      await callMethod("saveFlow", { flow: { name: "Alpha", nodes: [] } });
      await callMethod("saveFlow", { flow: { name: "Bravo", nodes: [] } });

      const response = await callMethod("listFlows", {
        sortBy: "name",
        sortOrder: "asc",
      });

      const names = (
        response.result as { flows: Array<{ name: string }> }
      ).flows.map((f) => f.name);
      expect(names).toEqual(["Alpha", "Bravo", "Charlie"]);
    });

    it("should sort flows by name descending", async () => {
      createStorageChannelServer(mockIpcMain);

      await callMethod("saveFlow", { flow: { name: "Charlie", nodes: [] } });
      await callMethod("saveFlow", { flow: { name: "Alpha", nodes: [] } });
      await callMethod("saveFlow", { flow: { name: "Bravo", nodes: [] } });

      const response = await callMethod("listFlows", {
        sortBy: "name",
        sortOrder: "desc",
      });

      const names = (
        response.result as { flows: Array<{ name: string }> }
      ).flows.map((f) => f.name);
      expect(names).toEqual(["Charlie", "Bravo", "Alpha"]);
    });

    it("should use default pagination values", async () => {
      createStorageChannelServer(mockIpcMain);

      // Create 3 flows
      for (let i = 1; i <= 3; i++) {
        await callMethod("saveFlow", {
          flow: { name: `Flow ${i}`, nodes: [] },
        });
      }

      const response = await callMethod("listFlows", {});

      // Default limit is 50, offset is 0, sortBy is "savedAt", sortOrder is "desc"
      expect((response.result as { flows: unknown[] }).flows).toHaveLength(3);
    });
  });

  describe("deleteFlow", () => {
    it("should delete an existing flow", async () => {
      createStorageChannelServer(mockIpcMain);

      const saveResponse = await callMethod("saveFlow", {
        flow: { name: "To Delete", nodes: [] },
      });

      await callMethod("deleteFlow", {
        id: (saveResponse.result as { id: string }).id,
      });

      const loadResponse = await callMethod("loadFlow", {
        id: (saveResponse.result as { id: string }).id,
      });
      expect(loadResponse.error).toContain("Flow with id");
      expect(loadResponse.channelError).toBe(true);
    });

    it("should throw error when deleting non-existent flow", async () => {
      createStorageChannelServer(mockIpcMain);

      const response = await callMethod("deleteFlow", { id: "non-existent" });

      expect(response.error).toContain("Flow with id non-existent not found");
      expect(response.channelError).toBe(true);
    });

    it("should remove flow from list after deletion", async () => {
      createStorageChannelServer(mockIpcMain);

      await callMethod("saveFlow", { flow: { name: "Flow 1", nodes: [] } });
      const toDelete = await callMethod("saveFlow", {
        flow: { name: "Flow 2", nodes: [] },
      });
      await callMethod("saveFlow", { flow: { name: "Flow 3", nodes: [] } });

      await callMethod("deleteFlow", {
        id: (toDelete.result as { id: string }).id,
      });

      const response = await callMethod("listFlows", {});
      expect(
        (response.result as { flows: unknown[]; total: number }).flows,
      ).toHaveLength(2);
      expect(
        (response.result as { flows: unknown[]; total: number }).total,
      ).toBe(2);
    });
  });

  describe("health", () => {
    it("should return ok status with flow count", async () => {
      createStorageChannelServer(mockIpcMain);

      const response = await callMethod("health", undefined);

      expect(
        (response.result as { status: string; flowCount: number }).status,
      ).toBe("ok");
      expect(
        (response.result as { status: string; flowCount: number }).flowCount,
      ).toBe(0);
    });

    it("should return correct flow count", async () => {
      createStorageChannelServer(mockIpcMain);

      await callMethod("saveFlow", { flow: { name: "Flow 1", nodes: [] } });
      await callMethod("saveFlow", { flow: { name: "Flow 2", nodes: [] } });

      const response = await callMethod("health", undefined);

      expect((response.result as { flowCount: number }).flowCount).toBe(2);
    });
  });

  describe("flow lifecycle", () => {
    it("should handle complete CRUD lifecycle", async () => {
      createStorageChannelServer(mockIpcMain);

      // Create
      const created = await callMethod("saveFlow", {
        flow: { name: "Lifecycle Flow", nodes: [{ id: "n1" }] },
      });
      expect((created.result as { id: string }).id).toBeDefined();

      // Read
      const loaded = await callMethod("loadFlow", {
        id: (created.result as { id: string }).id,
      });
      expect((loaded.result as { name: string }).name).toBe("Lifecycle Flow");

      // Update (save with same ID)
      const updated = await callMethod("saveFlow", {
        flow: {
          id: (created.result as { id: string }).id,
          name: "Updated Flow",
          nodes: [{ id: "n1" }, { id: "n2" }],
        },
      });
      expect((updated.result as { id: string }).id).toBe(
        (created.result as { id: string }).id,
      );

      const reloaded = await callMethod("loadFlow", {
        id: (created.result as { id: string }).id,
      });
      expect((reloaded.result as { name: string }).name).toBe("Updated Flow");
      expect((reloaded.result as { nodes: unknown[] }).nodes).toHaveLength(2);

      // List
      const list = await callMethod("listFlows", {});
      expect((list.result as { total: number }).total).toBeGreaterThan(0);

      // Delete
      await callMethod("deleteFlow", {
        id: (created.result as { id: string }).id,
      });
      const deletedCheck = await callMethod("loadFlow", {
        id: (created.result as { id: string }).id,
      });
      expect(deletedCheck.error).toBeDefined();
    });
  });
});
