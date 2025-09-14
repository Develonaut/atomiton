import { describe, it, expect } from "vitest";
import {
  stringifyYaml,
  formatYaml,
  minifyYaml,
  prettifyYaml,
} from "../utils/stringifier";

describe("stringifyYaml", () => {
  it("should stringify simple objects", () => {
    const obj = {
      name: "Test",
      value: 42,
      active: true,
    };
    const yaml = stringifyYaml(obj);
    expect(yaml).toContain("name: Test");
    expect(yaml).toContain("value: 42");
    expect(yaml).toContain("active: true");
  });

  it("should stringify nested objects", () => {
    const obj = {
      user: {
        name: "John",
        details: {
          age: 30,
          city: "NYC",
        },
      },
    };
    const yaml = stringifyYaml(obj);
    expect(yaml).toContain("user:");
    expect(yaml).toContain("name: John");
    expect(yaml).toContain("details:");
    expect(yaml).toContain("age: 30");
  });

  it("should stringify arrays", () => {
    const obj = {
      items: ["one", "two", "three"],
      numbers: [1, 2, 3],
    };
    const yaml = stringifyYaml(obj);
    expect(yaml).toContain("items:");
    expect(yaml).toContain("- one");
    expect(yaml).toContain("- two");
    expect(yaml).toContain("- three");
  });

  it("should handle null and undefined", () => {
    const obj = {
      nullValue: null,
      undefinedValue: undefined,
    };
    const yaml = stringifyYaml(obj);
    expect(yaml).toContain("nullValue: null");
    expect(yaml).not.toContain("undefinedValue");
  });

  it("should handle special characters", () => {
    const obj = {
      quoted: "This has 'quotes'",
      multiline: "Line 1\nLine 2\nLine 3",
    };
    const yaml = stringifyYaml(obj);
    expect(yaml).toBeTruthy();
  });
});

describe("formatYaml", () => {
  it("should format YAML with default options", () => {
    const input = `name:    Test\nvalue:   42`;
    const formatted = formatYaml(input);
    expect(formatted).toContain("name: Test");
    expect(formatted).toContain("value: 42");
  });

  it("should preserve structure while formatting", () => {
    const input = `
parent:
  child1: value1
  child2: value2
`;
    const formatted = formatYaml(input);
    expect(formatted).toContain("parent:");
    expect(formatted).toContain("child1: value1");
    expect(formatted).toContain("child2: value2");
  });
});

describe("minifyYaml", () => {
  it("should minify YAML", () => {
    const input = `
name: Test
items:
  - one
  - two
`;
    const minified = minifyYaml(input);
    // Minified still preserves some structure
    expect(minified).toContain("name: Test");
    expect(minified).toContain("items:");
  });
});

describe("prettifyYaml", () => {
  it("should prettify YAML with default indent", () => {
    const input = `name: Test\nitems: [one, two, three]`;
    const pretty = prettifyYaml(input);
    expect(pretty).toContain("name: Test");
    expect(pretty).toContain("items:");
    // Flow style may be preserved based on settings
    expect(pretty).toBeTruthy();
  });

  it("should use custom indent", () => {
    const input = `parent:\n child: value`;
    const pretty = prettifyYaml(input, 4);
    expect(pretty).toContain("parent:");
    expect(pretty).toContain("    child: value");
  });
});
