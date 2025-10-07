import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createPathManager } from "#paths/createPathManager";
import type { PathManager } from "#paths/createPathManager";
import fs from "fs/promises";
import path from "path";

describe("createPathManager - operations", () => {
  let pathManager: PathManager;
  let testRoot: string;

  beforeEach(() => {
    pathManager = createPathManager({
      context: "test",
      testId: `dir-ops-${Date.now()}`,
    });
    testRoot = pathManager.getUserDataPath();
  });

  afterEach(async () => {
    try {
      await fs.rm(testRoot, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should create directories when requested", async () => {
    const testDir = pathManager.getWorkspacePath("test-workspace");
    await pathManager.ensureDirectory(testDir);

    const stats = await fs.stat(testDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should create nested directories", async () => {
    const nestedDir = path.join(
      pathManager.getUserDataPath(),
      "nested",
      "deep",
      "directory",
    );
    await pathManager.ensureDirectory(nestedDir);

    const stats = await fs.stat(nestedDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should not error if directory already exists", async () => {
    const testDir = pathManager.getWorkspacePath("existing");
    await pathManager.ensureDirectory(testDir);

    // Should not throw
    await expect(pathManager.ensureDirectory(testDir)).resolves.toBeUndefined();
  });
});
