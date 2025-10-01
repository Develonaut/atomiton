import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Standard timeout values for different operation types
 */
export const TEST_TIMEOUTS = {
  FAST_OPERATION: 1000, // File system, edit-fields
  STANDARD_OPERATION: 2000, // Spreadsheet parsing
  NETWORK_OPERATION: 3000, // HTTP requests
  SLOW_OPERATION: 5000, // Initial page load
} as const;

/**
 * Selects a node type from the node-type-selector dropdown
 */
export async function selectNodeType(
  page: Page,
  nodeType: string,
): Promise<void> {
  await page.locator('[data-testid="node-type-selector"]').click();
  await page.getByRole("option", { name: nodeType }).click();
}

/**
 * Executes the configured node and returns parsed result
 */
export async function executeNodeAndGetResult(
  page: Page,
  options?: { timeout?: number },
): Promise<any> {
  // Click execute button
  await page.locator('[data-testid="execute-node-button"]').click();

  // Wait for result to appear
  const resultElement = page.locator('[data-testid="execution-result-json"]');
  await expect(resultElement).toBeVisible({
    timeout: options?.timeout || TEST_TIMEOUTS.STANDARD_OPERATION,
  });

  // Parse and return JSON result
  const dataOutput = await resultElement.getAttribute("data-output");
  return JSON.parse(dataOutput!);
}

/**
 * Fills a text input field
 */
export async function fillTextField(
  page: Page,
  fieldName: string,
  value: string,
): Promise<void> {
  await page.locator(`[data-testid="field-${fieldName}"]`).fill(value);
}

/**
 * Selects an option from a select dropdown field
 */
export async function selectFieldOption(
  page: Page,
  fieldName: string,
  optionName: string,
): Promise<void> {
  await page.locator(`[data-testid="field-${fieldName}"]`).click();
  await page.getByRole("option", { name: optionName }).click();
}

/**
 * Fills a CodeMirror editor field
 */
export async function fillCodeMirrorField(
  page: Page,
  fieldName: string,
  content: string,
): Promise<void> {
  const editor = page
    .locator(`[data-testid="field-${fieldName}"]`)
    .locator(".cm-content");
  await editor.click();
  await editor.fill(content);
}

/**
 * Sets a checkbox field state
 */
export async function setCheckboxField(
  page: Page,
  fieldName: string,
  checked: boolean,
): Promise<void> {
  const checkbox = page.locator(`[data-testid="field-${fieldName}"]`);
  if (checked) {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }
}

/**
 * Configuration for a node test
 */
export type NodeConfig = {
  type: string;
  fields?: Record<string, string | number | boolean>;
  selectFields?: Record<string, string>;
  codeMirrorFields?: Record<string, string>;
  checkboxFields?: Record<string, boolean>;
}

/**
 * Configures and executes a node, returning the result
 * This is the highest-level helper that combines all operations
 */
export async function configureAndExecuteNode(
  page: Page,
  config: NodeConfig,
  options?: { timeout?: number },
): Promise<any> {
  // Select node type
  await selectNodeType(page, config.type);

  // Fill text fields
  if (config.fields) {
    for (const [fieldName, value] of Object.entries(config.fields)) {
      await fillTextField(page, fieldName, String(value));
    }
  }

  // Fill select fields
  if (config.selectFields) {
    for (const [fieldName, optionName] of Object.entries(config.selectFields)) {
      await selectFieldOption(page, fieldName, optionName);
    }
  }

  // Fill CodeMirror fields
  if (config.codeMirrorFields) {
    for (const [fieldName, content] of Object.entries(
      config.codeMirrorFields,
    )) {
      await fillCodeMirrorField(page, fieldName, content);
    }
  }

  // Set checkbox fields
  if (config.checkboxFields) {
    for (const [fieldName, checked] of Object.entries(config.checkboxFields)) {
      await setCheckboxField(page, fieldName, checked);
    }
  }

  // Execute and return result
  return await executeNodeAndGetResult(page, options);
}

/**
 * Asserts that a node execution result is successful
 */
export function expectSuccessResult(result: any, expectedData?: any): void {
  expect(result).toHaveProperty("success", true);
  if (expectedData !== undefined) {
    expect(result.data).toMatchObject(expectedData);
  }
}

/**
 * Asserts that a node execution result is an error
 */
export function expectErrorResult(
  result: any,
  errorMessageContains?: string,
): void {
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();

  if (errorMessageContains) {
    const errorMsg = result.error.message || result.error;
    expect(errorMsg).toContain(errorMessageContains);
  }
}

/**
 * Checks debug logs for node execution completion message
 */
export async function expectDebugLog(
  page: Page,
  nodeType: string,
): Promise<void> {
  await expect(page.locator('[data-testid="debug-logs"]')).toContainText(
    `${nodeType} execution complete`,
  );
}
