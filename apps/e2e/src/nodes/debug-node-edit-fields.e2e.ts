/**
 * E2E Tests for Edit Fields Node Execution
 *
 * Tests the edit-fields node with Handlebars templating,
 * field creation, data transformation, and keepOnlySet functionality.
 */

import { expect, test } from "#fixtures/electron";

test.describe.configure({ mode: "serial" });

test.describe("Edit Fields Node Execution", () => {
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

  test("creates new fields with static values", async ({
    sharedElectronPage,
  }) => {
    // Select edit-fields node
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure values field with JSON (CodeMirror editor)
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill('{"name": "John Doe", "age": 30, "active": true}');

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data).toEqual({
      name: "John Doe",
      age: 30,
      active: true,
    });
  });

  test("uses Handlebars templates to transform data", async ({
    sharedElectronPage,
  }) => {
    // Re-select node type
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure values with Handlebars templates
    // Note: In real usage, templates would reference input data
    // For this test, we'll create output fields with the $now helper
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill(
      '{"message": "Hello World", "timestamp": "{{$now}}"}',
    );

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data.message).toBe("Hello World");
    // Verify timestamp is ISO format
    expect(data.data.data.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test("merges fields with keepOnlySet=false (default)", async ({
    sharedElectronPage,
  }) => {
    // Re-select node type
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure values - new fields to add
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill('{"newField": "new value", "anotherField": 42}');

    // Keep keepOnlySet unchecked (default false)
    // This means existing fields should be preserved

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data.newField).toBe("new value");
    expect(data.data.data.anotherField).toBe(42);
  });

  test("keeps only specified fields with keepOnlySet=true", async ({
    sharedElectronPage,
  }) => {
    // Re-select node type
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure values
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill(
      '{"outputField1": "value1", "outputField2": "value2"}',
    );

    // Enable keepOnlySet
    await sharedElectronPage
      .locator('[data-testid="field-keepOnlySet"]')
      .check();

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data).toEqual({
      outputField1: "value1",
      outputField2: "value2",
    });
    // No other fields should be present
    expect(Object.keys(data.data.data)).toHaveLength(2);
  });

  test("handles mixed data types in values", async ({ sharedElectronPage }) => {
    // Re-select node type
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure values with mixed types
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill(`{
  "stringField": "text value",
  "numberField": 123,
  "booleanField": true,
  "arrayField": [1, 2, 3],
  "objectField": {"nested": "value"}
}`);

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data.stringField).toBe("text value");
    expect(data.data.data.numberField).toBe(123);
    expect(data.data.data.booleanField).toBe(true);
    expect(data.data.data.arrayField).toEqual([1, 2, 3]);
    expect(data.data.data.objectField).toEqual({ nested: "value" });
  });

  test("creates user profile with $now timestamp", async ({
    sharedElectronPage,
  }) => {
    // Re-select node type
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure values for a user profile
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill(`{
  "username": "alice_wonder",
  "email": "alice@wonder.land",
  "role": "developer",
  "active": true,
  "createdAt": "{{$now}}"
}`);

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data.username).toBe("alice_wonder");
    expect(data.data.data.email).toBe("alice@wonder.land");
    expect(data.data.data.role).toBe("developer");
    expect(data.data.data.active).toBe(true);
    expect(data.data.data.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test("handles empty values object", async ({ sharedElectronPage }) => {
    // Re-select node type
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure with empty values
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill("{}");

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result - should succeed with empty output
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data).toEqual({});
  });

  test("handles null and undefined values", async ({ sharedElectronPage }) => {
    // Re-select node type
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure with null values (undefined not valid in JSON)
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill(`{
  "field1": "value",
  "field2": null,
  "field3": 0,
  "field4": false
}`);

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data.field1).toBe("value");
    expect(data.data.data.field2).toBe(null);
    expect(data.data.data.field3).toBe(0);
    expect(data.data.data.field4).toBe(false);
  });

  test("creates complex nested structures", async ({ sharedElectronPage }) => {
    // Re-select node type
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "edit-fields" })
      .click();

    // Configure with nested structure
    const valuesEditor = sharedElectronPage
      .locator('[data-testid="field-values"]')
      .locator(".cm-content");
    await valuesEditor.click();
    await valuesEditor.fill(`{
  "user": {
    "profile": {
      "name": "Alice",
      "age": 30
    },
    "settings": {
      "theme": "dark",
      "notifications": true
    }
  },
  "metadata": {
    "version": "1.0",
    "tags": ["important", "verified"]
  }
}`);

    // Execute
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    // Verify result
    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 2000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.data.user.profile.name).toBe("Alice");
    expect(data.data.data.user.profile.age).toBe(30);
    expect(data.data.data.user.settings.theme).toBe("dark");
    expect(data.data.data.user.settings.notifications).toBe(true);
    expect(data.data.data.metadata.version).toBe("1.0");
    expect(data.data.data.metadata.tags).toEqual(["important", "verified"]);
  });
});
