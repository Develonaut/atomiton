import { setupHandlers } from "#main/handlers";
import type { BrowserWindow } from "electron";

export function setupIPC(mainWindow: BrowserWindow) {
  setupHandlers(mainWindow);
}

// Export types for main process usage
export type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "#shared/types";
