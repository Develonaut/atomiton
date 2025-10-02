/**
 * Shell Command Node Smoke Test E2E
 * Validates tangible results from shell command smoke tests
 */

import { test, expect } from "#fixtures/electron";

test.describe("Shell Command Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select shell-command node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "shell-command" }).click();
  });

  test("validates simple echo", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-shell-command-simple-echo"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(result.data).toBeDefined();
    expect(result.data.stdout).toBeDefined();
    expect(result.data.stdout.trim()).toBe("Hello World");
    expect(result.data.exitCode).toBe(0);
    expect(result.data.success).toBe(true);
  });

  test("validates echo with special characters", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-shell-command-echo-with-special-characters"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    // The semicolon should be printed as literal text, not executed as command injection
    expect(result.data.stdout.trim()).toBe("test; echo injected");
    expect(result.data.exitCode).toBe(0);
    expect(result.data.success).toBe(true);
  });

  test("validates ls command", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-shell-command-ls-command"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.stdout).toBeDefined();
    expect(result.data.exitCode).toBe(0);
    expect(result.data.success).toBe(true);
  });

  test("validates pwd command", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-shell-command-pwd-command"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.stdout).toBeDefined();
    expect(result.data.stdout).toContain("/"); // pwd returns a path
    expect(result.data.exitCode).toBe(0);
    expect(result.data.success).toBe(true);
  });

  test("validates git status", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-shell-command-git-status"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.stdout).toBeDefined();
    expect(result.data.exitCode).toBe(0);
    expect(result.data.success).toBe(true);
  });

  test("validates printf with multiple args", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-shell-command-printf-with-multiple-args"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.stdout.trim()).toBe("arg1: first, arg2: second");
    expect(result.data.exitCode).toBe(0);
    expect(result.data.success).toBe(true);
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 6/6 passed", {
      timeout: 15000,
    });
  });
});
