import { describe, expect, it } from "vitest";
import { capitalize } from "#changeCase/capitalize";

describe("capitalize", () => {
  it("should capitalize the first letter of a lowercase string", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("should only capitalize the first letter, leaving the rest unchanged", () => {
    expect(capitalize("hello world")).toBe("Hello world");
  });

  it("should handle already capitalized strings", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("should handle mixed case strings", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });

  it("should handle empty strings", () => {
    expect(capitalize("")).toBe("");
  });

  it("should handle single character strings", () => {
    expect(capitalize("a")).toBe("A");
    expect(capitalize("A")).toBe("A");
  });

  it("should handle strings with numbers", () => {
    expect(capitalize("123test")).toBe("123test");
  });

  it("should handle strings starting with spaces", () => {
    expect(capitalize(" hello")).toBe(" hello");
  });

  it("should handle strings with special characters", () => {
    expect(capitalize("!hello")).toBe("!hello");
    expect(capitalize("@test")).toBe("@test");
  });

  it("should preserve TypeScript type information", () => {
    const result = capitalize("hello" as const);
    // Type test - this should compile without issues
    const typed: "Hello" = result;
    expect(typed).toBe("Hello");
  });
});
