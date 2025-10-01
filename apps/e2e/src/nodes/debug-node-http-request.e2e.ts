/**
 * E2E Tests for HTTP Request Node Execution
 *
 * Tests the actual execution of http-request nodes with various configurations,
 * including JSON validation for headers and body parameters.
 */

import { expect, test } from "#fixtures/electron";

test.describe("HTTP Request Node Execution", () => {
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

  test("makes a GET request to a public API", async ({
    sharedElectronPage,
  }) => {
    // Select http-request node type using custom Select component
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click(); // Open the dropdown

    // Click the http-request option in the dropdown menu (use role="option" to be specific)
    await sharedElectronPage
      .getByRole("option", { name: "http-request" })
      .click();

    // Fill in the URL field for a simple GET request
    const urlField = sharedElectronPage.locator('[data-testid="field-url"]');
    await urlField.fill("https://httpbin.org/get");

    // GET is the default method, so we don't need to select it

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution

    // Verify execution completed
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("http-request execution complete");

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
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data).toHaveProperty("data");
    expect(result.data.data).toHaveProperty("url", "https://httpbin.org/get");
  });

  test("makes a POST request with JSON body from string", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "http-request" })
      .click();

    // Fill in URL
    const urlField = sharedElectronPage.locator('[data-testid="field-url"]');
    await urlField.fill("https://httpbin.org/post");

    // Select POST method (custom Select component)
    const methodField = sharedElectronPage.locator(
      '[data-testid="field-method"]',
    );
    await methodField.click();
    await sharedElectronPage.getByRole("option", { name: "POST" }).click();

    // Fill body with JSON string (will be validated by jsonString schema)
    const bodyField = sharedElectronPage.locator('[data-testid="field-body"]');
    await bodyField.fill('{"test": "data", "number": 42}');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data.data).toHaveProperty("json");
    expect(result.data.data.json).toEqual({ test: "data", number: 42 });
  });

  test("makes a request with custom headers from JSON string", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "http-request" })
      .click();

    // Fill in URL
    const urlField = sharedElectronPage.locator('[data-testid="field-url"]');
    await urlField.fill("https://httpbin.org/headers");

    // Fill headers with JSON string (will be validated by jsonString schema)
    const headersField = sharedElectronPage.locator(
      '[data-testid="field-headers"]',
    );
    await headersField.fill(
      '{"X-Custom-Header": "test-value", "X-Another-Header": "another-value"}',
    );

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data.data).toHaveProperty("headers");
    expect(result.data.data.headers).toHaveProperty(
      "X-Custom-Header",
      "test-value",
    );
    expect(result.data.data.headers).toHaveProperty(
      "X-Another-Header",
      "another-value",
    );
  });

  test("handles PUT request with JSON body", async ({ sharedElectronPage }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "http-request" })
      .click();

    // Fill in URL
    const urlField = sharedElectronPage.locator('[data-testid="field-url"]');
    await urlField.fill("https://httpbin.org/put");

    // Select PUT method (custom Select component)
    const methodField = sharedElectronPage.locator(
      '[data-testid="field-method"]',
    );
    await methodField.click();
    await sharedElectronPage.getByRole("option", { name: "PUT" }).click();

    // Fill body with JSON string
    const bodyField = sharedElectronPage.locator('[data-testid="field-body"]');
    await bodyField.fill('{"updated": true, "timestamp": 1234567890}');

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data.data).toHaveProperty("json");
    expect(result.data.data.json).toEqual({
      updated: true,
      timestamp: 1234567890,
    });
  });

  test("handles DELETE request", async ({ sharedElectronPage }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "http-request" })
      .click();

    // Fill in URL
    const urlField = sharedElectronPage.locator('[data-testid="field-url"]');
    await urlField.fill("https://httpbin.org/delete");

    // Select DELETE method (custom Select component)
    const methodField = sharedElectronPage.locator(
      '[data-testid="field-method"]',
    );
    await methodField.click();
    await sharedElectronPage.getByRole("option", { name: "DELETE" }).click();

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("status", 200);
    expect(result.data.data).toHaveProperty(
      "url",
      "https://httpbin.org/delete",
    );
  });

  test("includes response headers in output", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.click();
    await sharedElectronPage
      .getByRole("option", { name: "http-request" })
      .click();

    // Fill in URL
    const urlField = sharedElectronPage.locator('[data-testid="field-url"]');
    await urlField.fill("https://httpbin.org/get");

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 3000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("headers");
    expect(result.data.headers).toHaveProperty("content-type");
    expect(result.data.headers["content-type"]).toContain("application/json");
  });
});
