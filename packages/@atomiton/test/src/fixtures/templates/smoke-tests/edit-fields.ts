/**
 * Edit Fields Node Smoke Tests
 * Covers field creation, template interpolation, and data transformation
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export const editFieldsSmokeTests: SmokeTest[] = [
  {
    name: "static values",
    config: {
      values: JSON.stringify({
        name: "John Doe",
        age: 30,
        active: true,
      }),
    },
  },
  {
    name: "with template interpolation ($now)",
    config: {
      values: JSON.stringify({
        message: "Hello World",
        timestamp: "{{$now}}",
      }),
    },
  },
  {
    name: "mixed data types",
    config: {
      values: JSON.stringify({
        string: "text",
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: "value" },
      }),
    },
  },
  {
    name: "keepOnlySet enabled",
    config: {
      values: JSON.stringify({
        field1: "value1",
        field2: "value2",
      }),
      keepOnlySet: true,
    },
  },
  {
    name: "user profile with timestamp",
    config: {
      values: JSON.stringify({
        username: "alice_wonder",
        email: "alice@example.com",
        role: "developer",
        createdAt: "{{$now}}",
      }),
    },
  },
  {
    name: "complex nested structure",
    config: {
      values: JSON.stringify({
        user: {
          profile: { name: "Alice", age: 30 },
          settings: { theme: "dark", notifications: true },
        },
        metadata: {
          version: "1.0",
          tags: ["important", "verified"],
        },
      }),
    },
  },
  {
    name: "empty values",
    config: {
      values: JSON.stringify({}),
    },
  },
  {
    name: "null and falsy values",
    config: {
      values: JSON.stringify({
        field1: "value",
        field2: null,
        field3: 0,
        field4: false,
      }),
    },
  },
];
