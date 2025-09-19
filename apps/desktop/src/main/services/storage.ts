import { app } from "electron";
import { createFileSystemStorage } from "@atomiton/storage";

export function initializeStorage() {
  try {
    return createFileSystemStorage({ baseDir: app.getPath("userData") });
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    app.quit();
    process.exit(1);
  }
}
