/**
 * Parallel Node Smoke Test E2E
 * Validates tangible results from parallel smoke tests
 */

import { test, expect } from "#fixtures/electron";

test.describe("Parallel Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select parallel node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "parallel" }).click();
  });

  test("validates allSettled strategy", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-allSettled-strategy-(default)"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(result.data).toBeDefined();
    expect(result.data.results).toBeDefined();
    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.completed).toBeGreaterThanOrEqual(0);
    expect(result.data.failed).toBeGreaterThanOrEqual(0);
    expect(result.data.duration).toBeGreaterThanOrEqual(0);
    expect(result.data.success).toBeDefined();
  });

  test("validates all strategy", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-all-strategy-(fail-if-any-fails)"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.success).toBeDefined();
  });

  test("validates race strategy", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-race-strategy-(first-to-complete)"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.success).toBeDefined();
  });

  test("validates minimum concurrency", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-minimum-concurrency-(1)"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.completed).toBeGreaterThanOrEqual(0);
    expect(result.data.success).toBeDefined();
  });

  test("validates high concurrency", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-high-concurrency"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.completed).toBeGreaterThanOrEqual(0);
    expect(result.data.success).toBeDefined();
  });

  test("validates operation timeout", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-with-operation-timeout"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.duration).toBeGreaterThanOrEqual(0);
  });

  test("validates global timeout", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-with-global-timeout"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.duration).toBeGreaterThanOrEqual(0);
  });

  test("validates failFast enabled", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-with-failFast-enabled"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.success).toBeDefined();
  });

  test("validates without maintainOrder", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-without-maintainOrder"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.success).toBeDefined();
  });

  test("validates race with failFast", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-parallel-race-with-failFast"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.results).toBeDefined();
    expect(result.data.success).toBeDefined();
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 10/10 passed", {
      timeout: 15000,
    });
  });
});
