import {
  createStorage,
  createFileSystemEngine,
} from "@atomiton/storage/desktop";
import { app } from "electron";
import path from "path";

export function initializeStorage() {
  try {
    return createStorage({
      engine: createFileSystemEngine({
        baseDir: path.join(app.getPath("userData"), "atomiton-data"),
      }),
    });
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    app.quit();
    process.exit(1);
  }
}
