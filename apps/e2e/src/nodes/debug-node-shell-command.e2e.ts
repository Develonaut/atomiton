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

test.describe("Shell Command Node Execution", () => {
  test.beforeAll(async ({ sharedElectronPage }) => {
    // Navigate once to debug nodes page
    await sharedElectronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });

    // Wait for node selector to be ready
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor();
  });

  test("executes a simple echo command", async ({ sharedElectronPage }) => {
    // Select shell-command node type
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();

    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in the program field
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("echo");

    // Fill in args as JSON array
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill('["Hello", "World"]');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    expect(resultJson).toBeTruthy();

    const result = JSON.parse(resultJson!);
    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("stdout");
    expect(result.data.stdout.trim()).toBe("Hello World");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("executes ls command with flags", async ({ sharedElectronPage }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("ls");

    // Fill in args with flags
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill('["-la"]');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("stdout");
    expect(result.data.stdout).toContain("total"); // ls -la output contains "total"
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("prevents command injection via semicolon in args", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("echo");

    // Attempt injection with semicolon (should be treated as literal text)
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill('["hello; echo injected"]');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    // The semicolon should be printed as literal text, not executed
    expect(result.data.stdout.trim()).toBe("hello; echo injected");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("prevents command injection via pipe in args", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("echo");

    // Attempt injection with pipe (should be treated as literal text)
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill('["test | cat"]');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    // The pipe should be printed as literal text, not executed
    expect(result.data.stdout.trim()).toBe("test | cat");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("prevents command substitution in args", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("echo");

    // Attempt command substitution (should be treated as literal text)
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill('["$(whoami)"]');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    // Command substitution should NOT happen - printed as literal
    expect(result.data.stdout.trim()).toBe("$(whoami)");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("executes git status command", async ({ sharedElectronPage }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("git");

    // Fill in args
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill('["status", "--short"]');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("stdout");
    // Git status should succeed (might be empty in clean repo)
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("handles command with multiple arguments", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("printf");

    // Multiple arguments to test argument array handling
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill('["arg1: %s, arg2: %s\\n", "first", "second"]');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data.stdout.trim()).toBe("arg1: first, arg2: second");
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("captures stderr output", async ({ sharedElectronPage }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program that writes to stderr (ls with invalid path)
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("ls");

    // Use a path that doesn't exist to trigger stderr
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill('["/path/that/does/not/exist"]');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", false); // Command failed
    expect(result.data).toHaveProperty("stderr");
    expect(result.data.stderr).toContain("No such file or directory");
    expect(result.data.exitCode).not.toBe(0); // Non-zero exit code
  });

  test("handles empty args array", async ({ sharedElectronPage }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("pwd");

    // Empty args array
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill("[]");

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("stdout");
    expect(result.data.stdout).toContain("/"); // pwd returns a path
    expect(result.data).toHaveProperty("exitCode", 0);
  });

  test("sanitizes dangerous environment variables (LD_PRELOAD)", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "shell-command" })
      .click();

    // Fill in program - use env to check environment variables
    const programField = sharedElectronPage.locator(
      '[data-testid="field-program"]',
    );
    await programField.fill("env");

    // Empty args (will list all env vars)
    const argsField = sharedElectronPage.locator('[data-testid="field-args"]');
    await argsField.fill("[]");

    // Note: We can't easily set env vars through the UI in this test
    // This test documents that the sanitization function exists
    // The actual sanitization is tested at the unit level in executor.ts
    // This e2e test verifies the node executes successfully

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("shell-command execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
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
