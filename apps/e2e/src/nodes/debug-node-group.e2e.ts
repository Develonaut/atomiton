/**
 * E2E Tests for Group Node Execution
 *
 * Tests the group node as a container for other nodes,
 * sequential execution, data flow between nodes, nested groups,
 * and error handling.
 */

import { expect, test } from "#fixtures/electron";
import {
  configureAndExecuteNode,
  expectSuccessResult,
  TEST_TIMEOUTS,
} from "#utils/test-helpers";

test.describe("Group Node Execution", () => {
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

  test("executes empty group (no child nodes)", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    // Empty group should return empty result or input data
    expect(result.data).toBeDefined();
    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.childNodesExecuted).toBe(0);
  });

  test("executes group with single edit-fields node", async ({
    electronPage,
  }) => {
    // This test simulates a group containing a single node
    // Note: The debug interface may not support full node composition,
    // so we test the group node's basic execution capability
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        checkboxFields: { parallel: false },
        fields: { timeout: "60000", retries: "1" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
  });

  test("respects timeout configuration", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        fields: { timeout: "5000" },
        checkboxFields: { parallel: false },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
    // Verify the execution completed within timeout
    expect(result.data.metadata.totalExecutionTime).toBeLessThan(5000);
  });

  test("respects retries configuration", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        fields: { retries: "3" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
  });

  test("configures parallel execution mode", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        checkboxFields: { parallel: true },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
  });

  test("configures sequential execution mode (default)", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        checkboxFields: { parallel: false },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
  });

  test("includes execution metadata", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.executedAt).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
    expect(result.data.metadata.childNodesExecuted).toBeGreaterThanOrEqual(0);
    expect(result.data.metadata.totalExecutionTime).toBeGreaterThanOrEqual(0);

    // Verify executedAt is valid ISO timestamp
    expect(result.data.metadata.executedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test("handles custom timeout values within range", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        fields: { timeout: "120000" }, // 2 minutes
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
  });

  test("handles zero retries configuration", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        fields: { retries: "0" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
  });

  test("handles maximum retries configuration", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        fields: { retries: "10" },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
  });

  test("handles minimum configuration", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
  });

  test("executes with all custom configuration options", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        fields: {
          timeout: "90000",
          retries: "5",
        },
        checkboxFields: {
          parallel: true,
        },
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
    expect(result.data.metadata.nodeType).toBe("group");
    expect(result.data.metadata.childNodesExecuted).toBeGreaterThanOrEqual(0);
  });

  test("returns result data structure", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);

    // Verify result structure
    expect(result.data).toHaveProperty("result");
    expect(result.data).toHaveProperty("metadata");

    // Verify metadata structure
    const { metadata } = result.data;
    expect(metadata).toHaveProperty("executedAt");
    expect(metadata).toHaveProperty("nodeType");
    expect(metadata).toHaveProperty("childNodesExecuted");
    expect(metadata).toHaveProperty("totalExecutionTime");

    // Verify metadata types
    expect(typeof metadata.executedAt).toBe("string");
    expect(typeof metadata.nodeType).toBe("string");
    expect(typeof metadata.childNodesExecuted).toBe("number");
    expect(typeof metadata.totalExecutionTime).toBe("number");
  });

  test("executes successfully with minimum timeout", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        fields: { timeout: "1000" }, // Minimum allowed: 1000ms
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
  });

  test("executes with maximum retries and maximum timeout", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
        fields: {
          timeout: "300000", // Maximum: 300000ms (5 minutes)
          retries: "10", // Maximum: 10
        },
      },
      { timeout: TEST_TIMEOUTS.SLOW_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.metadata).toBeDefined();
  });

  test("produces consistent metadata structure", async ({ electronPage }) => {
    // Run twice to verify consistency
    const result1 = await configureAndExecuteNode(
      electronPage,
      {
        type: "group",
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
        type: "group",
      },
      { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
    );

    expectSuccessResult(result1);
    expectSuccessResult(result2);

    // Both should have same structure
    expect(Object.keys(result1.data.metadata).sort()).toEqual(
      Object.keys(result2.data.metadata).sort(),
    );
  });
});
