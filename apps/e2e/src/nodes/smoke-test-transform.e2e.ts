/**
 * Transform Node Smoke Test E2E
 * Validates all 11 transformation operations with tangible results
 */

import { test, expect } from "#fixtures/electron";

test.describe("Transform Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select transform node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "transform" }).click();
  });

  test("validates map - double numbers", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-map---double-numbers"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(result.data).toEqual([2, 4, 6, 8, 10]);
    expect(result.operation).toBe("map");
    expect(result.inputCount).toBe(5);
    expect(result.outputCount).toBe(5);
  });

  test("validates map - extract properties", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-map---extract-properties"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    expect(result.operation).toBe("map");
  });

  test("validates filter - even numbers", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-filter---even-numbers"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([2, 4, 6, 8, 10]);
    expect(result.operation).toBe("filter");
    expect(result.inputCount).toBe(10);
    expect(result.outputCount).toBe(5);
  });

  test("validates filter - adults only", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-filter---adults-only"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe("Alice");
    expect(result.data[1].name).toBe("Charlie");
  });

  test("validates reduce - sum numbers", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-reduce---sum-numbers"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toBe(15);
    expect(result.operation).toBe("reduce");
  });

  test("validates reduce - concatenate strings", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-reduce---concatenate-strings"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toBe("Hello World!");
    expect(result.operation).toBe("reduce");
  });

  test("validates sort - ascending", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-sort---ascending"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([1, 2, 3, 5, 8, 9]);
    expect(result.operation).toBe("sort");
  });

  test("validates sort - descending", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-sort---descending"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([9, 8, 5, 3, 2, 1]);
    expect(result.operation).toBe("sort");
  });

  test("validates sort - by property", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-sort---by-property"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data[0].name).toBe("Alice");
    expect(result.data[1].name).toBe("Bob");
    expect(result.data[2].name).toBe("Charlie");
  });

  test("validates group - by category", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-group---by-category"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toHaveProperty("fruit");
    expect(result.data).toHaveProperty("vegetable");
    expect(result.data.fruit).toHaveLength(2);
    expect(result.data.vegetable).toHaveLength(2);
  });

  test("validates flatten - depth 1", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-flatten---depth-1"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.operation).toBe("flatten");
  });

  test("validates flatten - depth 2", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-flatten---depth-2"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("validates unique - remove duplicates", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-unique---remove-duplicates"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.operation).toBe("unique");
    expect(result.inputCount).toBe(9);
    expect(result.outputCount).toBe(5);
  });

  test("validates unique - strings", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-unique---strings"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual(["apple", "banana", "cherry"]);
  });

  test("validates reverse - numbers", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-reverse---numbers"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([5, 4, 3, 2, 1]);
    expect(result.operation).toBe("reverse");
  });

  test("validates reverse - strings", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-reverse---strings"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual(["fourth", "third", "second", "first"]);
  });

  test("validates limit - first 3", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-limit---first-3"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([1, 2, 3]);
    expect(result.operation).toBe("limit");
    expect(result.inputCount).toBe(10);
    expect(result.outputCount).toBe(3);
  });

  test("validates limit - first 5", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-limit---first-5"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual(["a", "b", "c", "d", "e"]);
    expect(result.outputCount).toBe(5);
  });

  test("validates skip - first 3", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-skip---first-3"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([4, 5, 6, 7, 8, 9, 10]);
    expect(result.operation).toBe("skip");
    expect(result.inputCount).toBe(10);
    expect(result.outputCount).toBe(7);
  });

  test("validates skip - first 5", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-skip---first-5"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual(["f", "g", "h"]);
    expect(result.outputCount).toBe(3);
  });

  test("validates slice - middle section", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-slice---middle-section"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([3, 4, 5]);
    expect(result.operation).toBe("slice");
    expect(result.inputCount).toBe(10);
    expect(result.outputCount).toBe(3);
  });

  test("validates slice - from index to end", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-transform-slice---from-index-to-end"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data).toEqual([6, 7, 8, 9, 10]);
    expect(result.outputCount).toBe(5);
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 22/22 passed", {
      timeout: 15000,
    });
  });
});
