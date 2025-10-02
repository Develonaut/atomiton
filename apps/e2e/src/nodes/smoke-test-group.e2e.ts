/**
 * Group Node Smoke Test E2E
 * Validates tangible results from group smoke tests
 */

import { test, expect } from "#fixtures/electron";

test.describe("Group Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select group node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "group" }).click();
  });

  test("validates empty group execution", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    // Wait for test to complete
    const testLog = electronPage.locator(
      '[data-testid="smoke-test-group-empty-group"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    // Get the data-output attribute
    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
    expect(result.data.metadata.childNodesExecuted).toBe(0);
    expect(result.data.metadata.executedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test("validates sequential mode execution", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-group-sequential-mode-(default)"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
    expect(result.data.metadata.totalExecutionTime).toBeGreaterThanOrEqual(0);
    expect(result.data.metadata.totalExecutionTime).toBeLessThan(30000);
  });

  test("validates parallel mode execution", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-group-parallel-mode"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
    expect(result.data.metadata.executedAt).toBeDefined();
  });

  test("validates custom timeout configuration", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-group-with-custom-timeout"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.totalExecutionTime).toBeLessThan(60000);
  });

  test("validates maximum retries configuration", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-group-with-maximum-retries"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
  });

  test("validates minimal config execution", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-group-minimal-config"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
    expect(result.data.metadata.childNodesExecuted).toBeGreaterThanOrEqual(0);

    // Verify all metadata properties exist
    expect(result.data.metadata).toHaveProperty("executedAt");
    expect(result.data.metadata).toHaveProperty("nodeType");
    expect(result.data.metadata).toHaveProperty("childNodesExecuted");
    expect(result.data.metadata).toHaveProperty("totalExecutionTime");

    // Verify types
    expect(typeof result.data.metadata.executedAt).toBe("string");
    expect(typeof result.data.metadata.nodeType).toBe("string");
    expect(typeof result.data.metadata.childNodesExecuted).toBe("number");
    expect(typeof result.data.metadata.totalExecutionTime).toBe("number");
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 6/6 passed", {
      timeout: 10000,
    });
  });
});
