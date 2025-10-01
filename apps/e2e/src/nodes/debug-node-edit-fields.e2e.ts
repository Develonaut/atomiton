/**
 * E2E Tests for Edit Fields Node Execution
 *
 * Tests the edit-fields node with Handlebars templating,
 * field creation, data transformation, and keepOnlySet functionality.
 */

import { expect, test } from "#fixtures/electron";
import {
  configureAndExecuteNode,
  expectSuccessResult,
  TEST_TIMEOUTS,
} from "#utils/test-helpers";

test.describe("Edit Fields Node Execution", () => {
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

  test("creates new fields with static values", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: {
          values: '{"name": "John Doe", "age": 30, "active": true}',
        },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data).toEqual({
      name: "John Doe",
      age: 30,
      active: true,
    });
  });

  test("uses template interpolation to transform data", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: {
          values: '{"message": "Hello World", "timestamp": "{{$now}}"}',
        },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data.message).toBe("Hello World");
    // Verify timestamp is ISO format
    expect(result.data.data.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test("merges fields with keepOnlySet=false (default)", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: {
          values: '{"newField": "new value", "anotherField": 42}',
        },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data.newField).toBe("new value");
    expect(result.data.data.anotherField).toBe(42);
  });

  test("keeps only specified fields with keepOnlySet=true", async ({
    electronPage,
  }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: {
          values: '{"outputField1": "value1", "outputField2": "value2"}',
        },
        checkboxFields: { keepOnlySet: true },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data).toEqual({
      outputField1: "value1",
      outputField2: "value2",
    });
    // No other fields should be present
    expect(Object.keys(result.data.data)).toHaveLength(2);
  });

  test("handles mixed data types in values", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: {
          values: `{
  "stringField": "text value",
  "numberField": 123,
  "booleanField": true,
  "arrayField": [1, 2, 3],
  "objectField": {"nested": "value"}
}`,
        },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data.stringField).toBe("text value");
    expect(result.data.data.numberField).toBe(123);
    expect(result.data.data.booleanField).toBe(true);
    expect(result.data.data.arrayField).toEqual([1, 2, 3]);
    expect(result.data.data.objectField).toEqual({ nested: "value" });
  });

  test("creates user profile with $now timestamp", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: {
          values: `{
  "username": "alice_wonder",
  "email": "alice@wonder.land",
  "role": "developer",
  "active": true,
  "createdAt": "{{$now}}"
}`,
        },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data.username).toBe("alice_wonder");
    expect(result.data.data.email).toBe("alice@wonder.land");
    expect(result.data.data.role).toBe("developer");
    expect(result.data.data.active).toBe(true);
    expect(result.data.data.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  test("handles empty values object", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: { values: "{}" },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data).toEqual({});
  });

  test("handles null and undefined values", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: {
          values: `{
  "field1": "value",
  "field2": null,
  "field3": 0,
  "field4": false
}`,
        },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data.field1).toBe("value");
    expect(result.data.data.field2).toBe(null);
    expect(result.data.data.field3).toBe(0);
    expect(result.data.data.field4).toBe(false);
  });

  test("creates complex nested structures", async ({ electronPage }) => {
    const result = await configureAndExecuteNode(
      electronPage,
      {
        type: "edit-fields",
        codeMirrorFields: {
          values: `{
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
}`,
        },
      },
      { timeout: TEST_TIMEOUTS.FAST_OPERATION },
    );

    expectSuccessResult(result);
    expect(result.data.data.user.profile.name).toBe("Alice");
    expect(result.data.data.user.profile.age).toBe(30);
    expect(result.data.data.user.settings.theme).toBe("dark");
    expect(result.data.data.user.settings.notifications).toBe(true);
    expect(result.data.data.metadata.version).toBe("1.0");
    expect(result.data.data.metadata.tags).toEqual(["important", "verified"]);
  });
});
