import { setupMainProcessHandler } from "@atomiton/conductor/desktop";
import type { IStorageEngine } from "@atomiton/storage/desktop";

export function initializeConductor(storage: IStorageEngine) {
  // Set up the conductor handler in the main process
  // This will handle execution requests from the renderer via IPC
  const handler = setupMainProcessHandler({
    concurrency: 4,
    storage,
    timeout: 60000,
  });

  return handler;
}
