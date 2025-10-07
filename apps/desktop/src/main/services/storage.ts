import {
  createStorage,
  createFileSystemEngine,
} from "@atomiton/storage/desktop";
import { app } from "electron";
import path from "path";
import { getPathManager } from "#main/services/pathManager";

export function initializeStorage() {
  try {
    const pathManager = getPathManager();
    return createStorage({
      engine: createFileSystemEngine({
        baseDir: path.join(pathManager.getUserDataPath(), "atomiton-data"),
      }),
    });
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    app.quit();
    process.exit(1);
  }
}
