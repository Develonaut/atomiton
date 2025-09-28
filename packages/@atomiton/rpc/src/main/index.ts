import { setupHandlers } from "#main/handlers";
import type { BrowserWindow } from "electron";

export function setupIPC(mainWindow: BrowserWindow) {
  setupHandlers(mainWindow);
}

// Export pure transport types
export type {
  RPCRequest,
  RPCResponse,
  RPCError,
} from "#shared/types";
