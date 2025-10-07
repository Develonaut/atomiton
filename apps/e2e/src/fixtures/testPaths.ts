import { createPathManager } from "@atomiton/storage/desktop";
import fs from "fs/promises";

/**
 * Create a PathManager instance for E2E tests with isolated file system
 *
 * @param testName - Unique name for the test (used to create isolated directory)
 * @returns PathManager configured for testing
 */
export function createTestPathManager(testName: string) {
  return createPathManager({
    context: "test",
    testId: `e2e-${testName}-${Date.now()}`,
  });
}

/**
 * Clean up test paths after test completion
 * Should be called in test cleanup/teardown
 *
 * @param pathManager - PathManager instance to clean up
 */
export async function cleanupTestPaths(
  pathManager: ReturnType<typeof createPathManager>,
): Promise<void> {
  const testRoot = pathManager.getUserDataPath();
  try {
    await fs.rm(testRoot, { recursive: true, force: true });
  } catch (err) {
    console.warn("Failed to cleanup test paths:", err);
  }
}

/**
 * Test environment helper for managing paths in E2E tests
 */
export class TestEnvironment {
  private pathManager: ReturnType<typeof createPathManager> | null = null;

  async setup(testName: string): Promise<void> {
    this.pathManager = createTestPathManager(testName);
    await this.pathManager.ensureDirectory(this.pathManager.getUserDataPath());
  }

  async teardown(): Promise<void> {
    if (this.pathManager) {
      await cleanupTestPaths(this.pathManager);
      this.pathManager = null;
    }
  }

  getPathManager(): ReturnType<typeof createPathManager> {
    if (!this.pathManager) {
      throw new Error("TestEnvironment not set up. Call setup() first.");
    }
    return this.pathManager;
  }
}
