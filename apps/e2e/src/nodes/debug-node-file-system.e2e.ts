/**
 * E2E Tests for File System Node Execution
 *
 * Tests are independent and can run in parallel for maximum speed.
 */

import { expect, test } from "#fixtures/electron";
import {
  configureAndExecuteNode,
  expectSuccessResult,
  TEST_TIMEOUTS,
} from "#utils/test-helpers";
import fs from "fs";
import path from "node:path";

test.describe.configure({ mode: "serial" });

test.describe("File System Node Execution", () => {
  const testOutputDir = ".tmp/file-system-tests";
  const testFile = path.join(testOutputDir, "pipeline-test.txt");
  const content = "Pipeline test content";

  test.beforeAll(async () => {
    // Clean up and create test directory
    await fs.promises.rm(testOutputDir, { recursive: true, force: true });
    await fs.promises.mkdir(testOutputDir, { recursive: true });
  });

  test.beforeEach(async ({ electronPage }) => {
    // Navigate directly to debug/nodes to reset state (more reliable than reload)
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    // Wait for node selector to be ready
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });
  });

  test.afterAll(async () => {
    await fs.promises.rm(testOutputDir, { recursive: true, force: true });
  });

  test("writes a file", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "file-system",
        selectFields: { operation: "write" },
        fields: { path: testFile, content: content },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.size).toBeGreaterThan(0);
  });

  test("lists files in directory", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "file-system",
        selectFields: { operation: "list" },
        fields: { path: testOutputDir },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.files.length).toBeGreaterThan(0);
    expect(
      result.data.files.some((f: string) => f.includes("pipeline-test.txt")),
    ).toBe(true);
  });

  test("reads the file", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "file-system",
        selectFields: { operation: "read" },
        fields: { path: testFile },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.content).toBe(content);
  });

  test("checks if file exists", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "file-system",
        selectFields: { operation: "exists" },
        fields: { path: testFile },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.exists).toBe(true);
  });

  test("deletes the file", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "file-system",
        selectFields: { operation: "delete" },
        fields: { path: testFile },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.deleted).toBe(true);

    // Verify file no longer exists
    await expect(fs.promises.access(testFile)).rejects.toThrow();
  });
});
