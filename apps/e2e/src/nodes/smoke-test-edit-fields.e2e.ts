/**
 * Edit Fields Node Smoke Test E2E
 * Validates tangible results from edit-fields smoke tests
 */

import { test, expect } from "#fixtures/electron";

test.describe("Edit Fields Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select edit-fields node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "edit-fields" }).click();
  });

  test("validates static values output", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    // Wait for test to complete
    const testLog = electronPage.locator(
      '[data-testid="smoke-test-edit-fields-static-values"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    // Get the data-output attribute
    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(result.data.result).toEqual({
      name: "John Doe",
      age: 30,
      active: true,
    });
  });

  test("validates template interpolation with $now", async ({
    electronPage,
  }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-edit-fields-with-template-interpolation-($now)"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.result.message).toBe("Hello World");
    // Verify timestamp is ISO format
    expect(result.data.result.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test("validates mixed data types", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-edit-fields-mixed-data-types"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.result.string).toBe("text");
    expect(result.data.result.number).toBe(42);
    expect(result.data.result.boolean).toBe(true);
    expect(result.data.result.array).toEqual([1, 2, 3]);
    expect(result.data.result.object).toEqual({ nested: "value" });
  });

  test("validates keepOnlySet functionality", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-edit-fields-keepOnlySet-enabled"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.result).toEqual({
      field1: "value1",
      field2: "value2",
    });
    // Ensure only these two fields exist
    expect(Object.keys(result.data.result)).toHaveLength(2);
  });

  test("validates user profile with timestamp", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-edit-fields-user-profile-with-timestamp"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.result.username).toBe("alice_wonder");
    expect(result.data.result.email).toBe("alice@example.com");
    expect(result.data.result.role).toBe("developer");
    expect(result.data.result.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test("validates complex nested structures", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-edit-fields-complex-nested-structure"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.result.user.profile.name).toBe("Alice");
    expect(result.data.result.user.profile.age).toBe(30);
    expect(result.data.result.user.settings.theme).toBe("dark");
    expect(result.data.result.user.settings.notifications).toBe(true);
    expect(result.data.result.metadata.version).toBe("1.0");
    expect(result.data.result.metadata.tags).toEqual(["important", "verified"]);
  });

  test("validates empty values", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-edit-fields-empty-values"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.result).toEqual({});
  });

  test("validates null and falsy values", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-edit-fields-null-and-falsy-values"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.result.field1).toBe("value");
    expect(result.data.result.field2).toBe(null);
    expect(result.data.result.field3).toBe(0);
    expect(result.data.result.field4).toBe(false);
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 8/8 passed", {
      timeout: 10000,
    });
  });
});
