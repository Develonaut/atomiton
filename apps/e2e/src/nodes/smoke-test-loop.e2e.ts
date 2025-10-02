/**
 * Loop Node Smoke Test E2E
 * Validates tangible results from loop smoke tests
 */

import { expect, test } from "#fixtures/electron";

type LoopResult = {
  item: unknown;
  index: number;
  processed: boolean;
  timestamp: string;
};

test.describe("Loop Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select loop node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "loop" }).click();
  });

  test("validates forEach with numbers", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    // Wait for test to complete
    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-forEach-with-numbers"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    // Get the data-output attribute
    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBe(5);
    // Validate structure of first result
    expect(result.data.results[0]).toHaveProperty("item");
    expect(result.data.results[0]).toHaveProperty("index");
    expect(result.data.results[0]).toHaveProperty("processed");
    expect(result.data.results[0]).toHaveProperty("timestamp");
    // Verify items are correct
    expect(result.data.results.map((r: LoopResult) => r.item)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    if (result.data.metadata) {
      expect(result.data.metadata.iterations).toBe(5);
      expect(result.data.metadata.loopType).toBe("forEach");
    }
  });

  test("validates forEach with objects", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-forEach-with-objects"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBe(3);
    // Validate structure with metadata
    expect(result.data.results[0]).toHaveProperty("item");
    expect(result.data.results[0]).toHaveProperty("index");
    // Verify items are correct
    expect(result.data.results[0].item).toEqual({ id: 1, name: "Alice" });
    expect(result.data.results[1].item).toEqual({ id: 2, name: "Bob" });
    expect(result.data.results[2].item).toEqual({ id: 3, name: "Charlie" });
    if (result.data.metadata) {
      expect(result.data.metadata.iterations).toBe(3);
    }
  });

  test("validates forEach without collecting results", async ({
    electronPage,
  }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-forEach-without-collecting-results"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    // When collectResults is false, results array should be empty
    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBe(0);
    // Metadata might not be present when collectResults is false
    if (result.data.metadata) {
      expect(result.data.metadata.iterations).toBe(3);
      expect(result.data.metadata.loopType).toBe("forEach");
    }
  });

  test("validates forEach with empty array", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-forEach-with-empty-array"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBe(0);
    if (result.data.metadata) {
      expect(result.data.metadata.iterations).toBe(0);
    }
  });

  test("validates times with small count", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-times-with-small-count"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBe(3);
    if (result.data.metadata) {
      expect(result.data.metadata.iterations).toBe(3);
      expect(result.data.metadata.loopType).toBe("times");
    }
  });

  test("validates times with default count", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-times-with-default-count-(10)"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBe(10);
    if (result.data.metadata) {
      expect(result.data.metadata.iterations).toBe(10);
    }
  });

  test("validates times with large count", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-times-with-large-count"]',
    );
    await expect(testLog).toBeVisible({ timeout: 15000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBe(50);
    if (result.data.metadata) {
      expect(result.data.metadata.iterations).toBe(50);
    }
  });

  test("validates while with simple condition", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-while-with-simple-condition"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.results)).toBe(true);
    // Condition is "iteration < 5" which should give 5 iterations (0-4)
    expect(result.data.results.length).toBeGreaterThanOrEqual(5);
    if (result.data.metadata) {
      expect(result.data.metadata.loopType).toBe("while");
      expect(result.data.metadata.iterations).toBeGreaterThanOrEqual(5);
    }
  });

  test("validates while with complex condition", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-while-with-complex-condition"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBeGreaterThan(0);
    if (result.data.metadata) {
      expect(result.data.metadata.loopType).toBe("while");
    }
  });

  test("validates while with always-false (no iterations)", async ({
    electronPage,
  }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-loop-while-with-always-false-(no-iterations)"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.results)).toBe(true);
    expect(result.data.results.length).toBe(0);
    if (result.data.metadata) {
      expect(result.data.metadata.iterations).toBe(0);
    }
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 10/10 passed", {
      timeout: 30000,
    });
  });
});
