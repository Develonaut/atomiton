import { contextBridge } from "electron";
import type { AtomitonRPC } from "#preload/types/api";

export type BridgeManager = {
  exposeAPI(api: AtomitonRPC): void;
};

export const createBridgeManager = (): BridgeManager => {
  const isContextIsolated = process.contextIsolated;

  const exposeViaContextBridge = (api: AtomitonRPC): void => {
    try {
      console.log("[PRELOAD] Exposing atomitonRPC API via contextBridge");
      contextBridge.exposeInMainWorld("atomitonRPC", api);
      console.log("[PRELOAD] atomitonRPC API exposed successfully");
    } catch (error) {
      console.error("[PRELOAD] Failed to expose atomitonRPC:", error);
      throw error;
    }
  };

  const exposeViaWindow = (api: AtomitonRPC): void => {
    console.log(
      "[PRELOAD] Context isolation disabled, setting atomitonRPC on window",
    );
    (window as Window & { atomitonRPC?: AtomitonRPC }).atomitonRPC = api;
  };

  const exposeAPI = (api: AtomitonRPC): void => {
    if (isContextIsolated) {
      exposeViaContextBridge(api);
    } else {
      exposeViaWindow(api);
    }
  };

  return {
    exposeAPI,
  };
};
