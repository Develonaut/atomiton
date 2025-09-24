import { createConductor } from "@atomiton/conductor/desktop";
import type { IStorageEngine } from "@atomiton/storage/desktop";

export function initializeConductor(
  storage: IStorageEngine,
): ReturnType<typeof createConductor> | null {
  // Create the conductor in the main process
  // This will handle execution requests from the renderer via events
  try {
    const conductor = createConductor({
      concurrency: 4,
      storage,
      timeout: 60000,
    });

    return conductor;
  } catch (error) {
    console.error("Failed to initialize conductor:", error);
    return null;
  }
}
