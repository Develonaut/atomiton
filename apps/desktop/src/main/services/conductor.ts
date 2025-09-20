import { setupMainProcessHandler } from "@atomiton/conductor/desktop";
import type { IStorageEngine } from "@atomiton/storage/desktop";

export function initializeConductor(storage: IStorageEngine) {
  // Set up the conductor handler in the main process
  // This will handle execution requests from the renderer via IPC
  try {
    const handler = setupMainProcessHandler({
      concurrency: 4,
      storage,
      timeout: 60000,
    });

    return handler;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Main process handler requires Electron main process context")) {
      // This is expected when running outside Electron (e.g., during dev build)
      console.warn("Conductor initialization skipped: Not in Electron context");
      return null;
    }
    throw error; // Re-throw unexpected errors
  }
}
