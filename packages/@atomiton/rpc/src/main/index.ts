import { setupHandlers } from "#main/handlers";
import type { BrowserWindow } from "electron";

/**
 * Setup IPC handlers for main process
 * @deprecated Use @atomiton/rpc/main/channels instead for direct channel setup
 */
export function setupIPC(mainWindow: BrowserWindow) {
  setupHandlers(mainWindow);
}

// Note: Types are exported from @atomiton/rpc/shared instead
// Main exports are focused on channel setup functionality
