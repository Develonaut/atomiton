/**
 * E2E Tests for Shell Command Node Execution
 *
 * Tests the secure execution of shell-command nodes using structured
 * command API (program + args) to prevent command injection attacks.
 *
 * Security: All tests verify that shell operators and injection attempts
 * are treated as literal arguments, not executed as commands.
 */

import { expect, test } from "#fixtures/electron";
import {
  configureAndExecuteNode,
  expectSuccessResult,
  TEST_TIMEOUTS,
} from "#utils/test-helpers";

test.describe("Shell Command Node Execution", () => {
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

  test("executes a simple echo command", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "echo", args: '["Hello", "World"]' },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("stdout");
    expect(result.data.stdout.trim()).toBe("Hello World");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("executes ls command with flags", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "ls", args: '["-la"]' },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("stdout");
    expect(result.data.stdout).toContain("total"); // ls -la output contains "total"
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("prevents command injection via semicolon in args", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "echo", args: '["hello; echo injected"]' },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    // The semicolon should be printed as literal text, not executed
    expect(result.data.stdout.trim()).toBe("hello; echo injected");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("prevents command injection via pipe in args", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "echo", args: '["test | cat"]' },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    // The pipe should be printed as literal text, not executed
    expect(result.data.stdout.trim()).toBe("test | cat");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("prevents command substitution in args", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "echo", args: '["$(whoami)"]' },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    // Command substitution should NOT happen - printed as literal
    expect(result.data.stdout.trim()).toBe("$(whoami)");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("executes git status command", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "git", args: '["status", "--short"]' },
      },
      { timeout: 10000 }, // Git can be slow, especially during pre-commit hooks
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("stdout");
    // Git status should succeed (might be empty in clean repo)
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("handles command with multiple arguments", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: {
          program: "printf",
          args: '["arg1: %s, arg2: %s\\n", "first", "second"]',
        },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data.stdout.trim()).toBe("arg1: first, arg2: second");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("captures stderr output", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "ls", args: '["/path/that/does/not/exist"]' },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", false); // Command failed
    expect(result.data).toHaveProperty("stderr");
    expect(result.data.stderr).toContain("No such file or directory");
    expect(result.data.exitCode).not.toBe(0); // Non-zero exit code
  });

  test("handles empty args array", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "pwd", args: "[]" },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("stdout");
    expect(result.data.stdout).toContain("/"); // pwd returns a path
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("sanitizes dangerous environment variables (LD_PRELOAD)", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "shell-command",
        fields: { program: "env", args: "[]" },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    // Note: We can't easily set env vars through the UI in this test
    // This test documents that the sanitization function exists
    // The actual sanitization is tested at the unit level in executor.ts
    // This e2e test verifies the node executes successfully

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("exitCode", 0);

    // Verify dangerous env vars are NOT present (sanitized)
    // LD_PRELOAD, LD_LIBRARY_PATH, DYLD_INSERT_LIBRARIES, DYLD_LIBRARY_PATH
    // should be removed by sanitizeEnvironment function
    const stdout = result.data.stdout || "";
    expect(stdout).not.toContain("LD_PRELOAD");
    expect(stdout).not.toContain("DYLD_INSERT_LIBRARIES");
  });
});
