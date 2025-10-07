import { createPathManager, type PathManager } from "@atomiton/storage/desktop";
import { app } from "electron";

let pathManagerInstance: PathManager | null = null;

/**
 * Initialize the PathManager service
 * Should be called early in the app lifecycle, before other services
 */
export function initializePathManager(): PathManager {
  if (pathManagerInstance) {
    return pathManagerInstance;
  }

  const isDev = process.env.NODE_ENV === "development";
  const isTest = process.env.NODE_ENV === "test";

  pathManagerInstance = createPathManager({
    context: isTest ? "test" : isDev ? "development" : "production",
    appName: "Atomiton",
    testId: process.env.TEST_ID,
    electronApp: {
      getPath: (name) => app.getPath(name),
    },
  });

  return pathManagerInstance;
}

/**
 * Get the PathManager instance
 * Throws if not initialized
 */
export function getPathManager(): PathManager {
  if (!pathManagerInstance) {
    throw new Error(
      "PathManager not initialized. Call initializePathManager() first.",
    );
  }
  return pathManagerInstance;
}

/**
 * Reset the PathManager instance (for testing)
 */
export function resetPathManager(): void {
  pathManagerInstance = null;
}
