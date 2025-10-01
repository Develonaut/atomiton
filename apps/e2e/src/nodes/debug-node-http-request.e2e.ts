/**
 * E2E Tests for HTTP Request Node Execution
 *
 * Tests the actual execution of http-request nodes with various configurations,
 * including JSON validation for headers and body parameters.
 */

import { expect, test } from "#fixtures/electron";
import {
  configureAndExecuteNode,
  expectSuccessResult,
  TEST_TIMEOUTS,
} from "#utils/test-helpers";

const TEST_BASE_URL = "http://localhost:8888";

test.describe("HTTP Request Node Execution", () => {
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

  test("makes a GET request to a public API", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "http-request",
        fields: { url: `${TEST_BASE_URL}/get` },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data).toHaveProperty("data");
    expect(result.data.data).toHaveProperty("url", `${TEST_BASE_URL}/get`);
  });

  test("makes a POST request with JSON body from string", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "http-request",
        fields: {
          url: `${TEST_BASE_URL}/post`,
          body: '{"test": "data", "number": 42}',
        },
        selectFields: { method: "POST" },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data.data).toHaveProperty("json");
    expect(result.data.data.json).toEqual({ test: "data", number: 42 });
  });

  test("makes a request with custom headers from JSON string", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "http-request",
        fields: {
          url: `${TEST_BASE_URL}/headers`,
          headers:
            '{"X-Custom-Header": "test-value", "X-Another-Header": "another-value"}',
        },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data.data).toHaveProperty("headers");
    // HTTP headers are case-insensitive and Node.js lowercases them
    expect(result.data.data.headers).toHaveProperty(
      "x-custom-header",
      "test-value",
    );
    expect(result.data.data.headers).toHaveProperty(
      "x-another-header",
      "another-value",
    );
  });

  test("handles PUT request with JSON body", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "http-request",
        fields: {
          url: `${TEST_BASE_URL}/put`,
          body: '{"updated": true, "timestamp": 1234567890}',
        },
        selectFields: { method: "PUT" },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data.data).toHaveProperty("json");
    expect(result.data.data.json).toEqual({
      updated: true,
      timestamp: 1234567890,
    });
  });

  test("handles DELETE request", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "http-request",
        fields: { url: `${TEST_BASE_URL}/delete` },
        selectFields: { method: "DELETE" },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data.data).toHaveProperty("url", `${TEST_BASE_URL}/delete`);
  });

  test("includes response headers in output", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "http-request",
        fields: { url: `${TEST_BASE_URL}/get` },
      },
      { timeout: TEST_TIMEOUTS.NETWORK_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data).toHaveProperty("headers");
    expect(result.data.headers).toHaveProperty("content-type");
    expect(result.data.headers["content-type"]).toContain("application/json");
  });
});
