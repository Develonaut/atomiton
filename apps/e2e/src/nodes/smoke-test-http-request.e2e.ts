/**
 * HTTP Request Node Smoke Test E2E
 * Validates tangible results from http-request smoke tests
 */

import { test, expect } from "#fixtures/electron";

test.describe("HTTP Request Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select http-request node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "http-request" }).click();
  });

  test("validates GET request", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    // Wait for test to complete
    const testLog = electronPage.locator(
      '[data-testid="smoke-test-http-request-GET-request"]',
    );
    await expect(testLog).toBeVisible({ timeout: 15000 });

    // Get the data-output attribute
    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(result.data.success).toBe(true);
    expect(result.data.status).toBe(200);
    expect(result.data.result).toBeDefined();
    expect(result.data.result.url).toContain("localhost:8888/get");
  });

  test("validates GET with query params", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-http-request-GET-with-query-params"]',
    );
    await expect(testLog).toBeVisible({ timeout: 15000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.success).toBe(true);
    expect(result.data.status).toBe(200);
    expect(result.data.result.args).toBeDefined();
    expect(result.data.result.args.param1).toBe("value1");
    expect(result.data.result.args.param2).toBe("value2");
  });

  test("validates POST with JSON body", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-http-request-POST-with-JSON-body"]',
    );
    await expect(testLog).toBeVisible({ timeout: 15000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.success).toBe(true);
    expect(result.data.status).toBe(200);
    expect(result.data.result.json).toEqual({ test: "data", number: 42 });
  });

  test("validates POST with custom headers", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-http-request-POST-with-custom-headers"]',
    );
    await expect(testLog).toBeVisible({ timeout: 15000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.success).toBe(true);
    expect(result.data.status).toBe(200);
    expect(result.data.result.headers).toBeDefined();
    // Headers are case-insensitive and lowercased by the server
    expect(result.data.result.headers["x-custom-header"]).toBe("test-value");
  });

  test("validates PUT request", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-http-request-PUT-request"]',
    );
    await expect(testLog).toBeVisible({ timeout: 15000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.success).toBe(true);
    expect(result.data.status).toBe(200);
    expect(result.data.result.json).toBeDefined();
    expect(result.data.result.json.updated).toBe(true);
    expect(typeof result.data.result.json.timestamp).toBe("number");
  });

  test("validates DELETE request", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-http-request-DELETE-request"]',
    );
    await expect(testLog).toBeVisible({ timeout: 15000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.success).toBe(true);
    expect(result.data.status).toBe(200);
    expect(result.data.result.url).toContain("localhost:8888/delete");
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 6/6 passed", {
      timeout: 30000,
    });
  });
});
