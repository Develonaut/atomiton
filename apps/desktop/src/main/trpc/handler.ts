import { appRouter } from "@atomiton/rpc/shared";
import type { BrowserWindow } from "electron";
import { createIPCHandler } from "electron-trpc/main";
import { nodeProcedures } from "@/main/procedures/nodes";
import { executionProcedures } from "@/main/procedures/execution";
import { storageProcedures } from "@/main/procedures/storage";

export const createTRPCHandler = (mainWindow: BrowserWindow) => {
  return createIPCHandler({
    router: appRouter,
    windows: [mainWindow],
    createContext: async () => ({
      user: null,
      platform: "desktop" as const,
      environment: (process.env.NODE_ENV || "production") as "development" | "production" | "test",
      version: "0.2.0",
      capabilities: {
        fileSystem: true,
        network: true,
        storage: true,
      },
    }),
    async resolve(opts: any) {
      const { input, path } = opts;

      if (path === "execution.execute") {
        return executionProcedures.execute({ input });
      }

      if (path === "execution.onProgress") {
        return executionProcedures.onProgress({ input });
      }

      if (path === "nodes.list") {
        return nodeProcedures.list();
      }

      if (path === "nodes.getChildren") {
        return nodeProcedures.getChildren({ input });
      }

      if (path === "nodes.getByVersion") {
        return nodeProcedures.getByVersion({ input });
      }

      if (path === "storage.save") {
        return storageProcedures.save({ input });
      }

      if (path === "storage.load") {
        return storageProcedures.load({ input });
      }

      if (path === "storage.list") {
        return storageProcedures.list();
      }

      return undefined;
    },
  });
};
