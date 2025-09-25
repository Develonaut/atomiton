import { BrowserWindow } from "electron";
import { setupHandlers } from "./handlers";

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
} from "../shared/types";
