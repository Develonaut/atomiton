import { describe, expect, it } from "vitest";
import { kebabCase } from "../kebabCase";

describe("kebabCase", () => {
  it("should convert camelCase to kebab-case", () => {
    expect(kebabCase("camelCase")).toBe("camel-case");
    expect(kebabCase("myVariableName")).toBe("my-variable-name");
  });

  it("should convert PascalCase to kebab-case", () => {
    expect(kebabCase("PascalCase")).toBe("pascal-case");
    expect(kebabCase("MyClassName")).toBe("my-class-name");
  });

  it("should convert snake_case to kebab-case", () => {
    expect(kebabCase("snake_case")).toBe("snake-case");
    expect(kebabCase("my_variable_name")).toBe("my-variable-name");
  });

  it("should convert space-separated words to kebab-case", () => {
    expect(kebabCase("Title Case")).toBe("title-case");
    expect(kebabCase("My Variable Name")).toBe("my-variable-name");
  });

  it("should handle mixed separators", () => {
    expect(kebabCase("mixed_Case-String Test")).toBe("mixed-case-string-test");
  });

  it("should handle numbers correctly", () => {
    expect(kebabCase("version2Updates")).toBe("version2-updates");
    expect(kebabCase("html5Parser")).toBe("html5-parser");
  });

  it("should handle empty strings", () => {
    expect(kebabCase("")).toBe("");
  });

  it("should handle single words", () => {
    expect(kebabCase("hello")).toBe("hello");
    expect(kebabCase("Hello")).toBe("hello");
  });

  it("should handle already kebab-case strings", () => {
    expect(kebabCase("already-kebab-case")).toBe("already-kebab-case");
  });

  it("should remove leading and trailing hyphens", () => {
    expect(kebabCase("-leadingHyphen")).toBe("leading-hyphen");
    expect(kebabCase("trailingHyphen-")).toBe("trailing-hyphen");
    expect(kebabCase("-bothSides-")).toBe("both-sides");
  });

  it("should collapse multiple separators", () => {
    expect(kebabCase("multiple___underscores")).toBe("multiple-underscores");
    expect(kebabCase("multiple   spaces")).toBe("multiple-spaces");
    expect(kebabCase("multiple---hyphens")).toBe("multiple-hyphens");
  });

  it("should handle acronyms", () => {
    expect(kebabCase("XMLHttpRequest")).toBe("xmlhttp-request");
    expect(kebabCase("APIResponse")).toBe("apiresponse");
  });

  it("should handle special characters", () => {
    expect(kebabCase("hello@world")).toBe("hello@world");
    expect(kebabCase("test.file.name")).toBe("test.file.name");
  });
});
