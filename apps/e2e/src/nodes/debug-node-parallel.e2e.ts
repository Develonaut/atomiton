/**
 * E2E Tests for Parallel Node Execution
 *
 * Tests the parallel node with various execution strategies,
 * concurrency settings, timeout configurations, and error handling.
 */

import { expect, test } from "#fixtures/electron";
import {
  configureAndExecuteNode,
  expectSuccessResult,
  TEST_TIMEOUTS,
} from "#utils/test-helpers";

test.describe("Parallel Node Execution", () => {
  test.beforeEach(async ({ electronPage }) => {
    // Navigate directly to debug/nodes to reset state
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    // Wait for node selector to be ready
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });
  });

  test("executes with default configuration", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures concurrency level", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { concurrency: "10" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("uses allSettled strategy (default)", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        selectFields: { strategy: "All Settled - Complete all" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("uses all strategy", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        selectFields: { strategy: "All - Fail if any fails" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("uses race strategy", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        selectFields: { strategy: "Race - First to complete" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures operation timeout", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { operationTimeout: "10000" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures global timeout", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { globalTimeout: "60000" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("enables fail fast mode", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        checkboxFields: { failFast: true },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("disables fail fast mode (default)", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        checkboxFields: { failFast: false },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("enables maintain order (default)", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        checkboxFields: { maintainOrder: true },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("disables maintain order", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        checkboxFields: { maintainOrder: false },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures minimum concurrency (1)", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { concurrency: "1" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures maximum concurrency (50)", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { concurrency: "50" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures minimum operation timeout", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { operationTimeout: "1000" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures maximum operation timeout", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { operationTimeout: "300000" },
      },
      { timeout: TEST_TIMEOUTS.SLOW_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures minimum global timeout", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { globalTimeout: "5000" },
      },
      { timeout: TEST_TIMEOUTS.SLOW_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures maximum global timeout", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { globalTimeout: "600000" },
      },
      { timeout: TEST_TIMEOUTS.SLOW_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("executes with all configuration options", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: {
          concurrency: "15",
          operationTimeout: "45000",
          globalTimeout: "180000",
        },
        selectFields: { strategy: "All Settled - Complete all" },
        checkboxFields: {
          failFast: false,
          maintainOrder: true,
        },
      },
      { timeout: TEST_TIMEOUTS.SLOW_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("returns execution statistics", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
    expect(result.data.completed).toBeDefined();
    expect(result.data.failed).toBeDefined();
    expect(result.data.duration).toBeDefined();
    expect(typeof result.data.completed).toBe("number");
    expect(typeof result.data.failed).toBe("number");
    expect(typeof result.data.duration).toBe("number");
  });

  test("handles empty operations array gracefully", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("combines race strategy with fail fast", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        selectFields: { strategy: "Race - First to complete" },
        checkboxFields: { failFast: true },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("combines all strategy with maintain order", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        selectFields: { strategy: "All - Fail if any fails" },
        checkboxFields: { maintainOrder: true },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("validates result data structure", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();

    // Verify result structure
    expect(result.data).toHaveProperty("results");
    expect(result.data).toHaveProperty("completed");
    expect(result.data).toHaveProperty("failed");
    expect(result.data).toHaveProperty("duration");
    expect(result.data).toHaveProperty("success");

    // Verify types
    expect(Array.isArray(result.data.results)).toBe(true);
    expect(typeof result.data.completed).toBe("number");
    expect(typeof result.data.failed).toBe("number");
    expect(typeof result.data.duration).toBe("number");
    expect(typeof result.data.success).toBe("boolean");
  });

  test("produces consistent results across executions", async ({
    electronPage,
  }) => {
    // Run twice to verify consistency
    const result1 = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { concurrency: "5" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    // Reset state
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    const result2 = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { concurrency: "5" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result1);
    expectSuccessResult(result2);

    // Both should have same structure
    expect(Object.keys(result1.data).sort()).toEqual(
      Object.keys(result2.data).sort(),
    );
  });

  test("handles high concurrency configuration", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { concurrency: "40" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("handles low concurrency configuration", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: { concurrency: "2" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });

  test("configures balanced timeout settings", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "parallel",
        fields: {
          operationTimeout: "30000",
          globalTimeout: "120000",
        },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toBeDefined();
  });
});
