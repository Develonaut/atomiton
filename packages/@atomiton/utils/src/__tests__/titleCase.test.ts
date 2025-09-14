import { describe, expect, it } from "vitest";
import { titleCase } from "../titleCase";

describe("titleCase", () => {
  it("converts lowercase words to title case", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });

  it("converts kebab-case to title case", () => {
    expect(titleCase("hello-world")).toBe("Hello World");
  });

  it("converts snake_case to title case", () => {
    expect(titleCase("hello_world")).toBe("Hello World");
  });

  it("handles mixed separators", () => {
    expect(titleCase("hello-world_test")).toBe("Hello World Test");
  });

  it("handles already capitalized words", () => {
    expect(titleCase("HELLO WORLD")).toBe("Hello World");
  });

  it("handles single word", () => {
    expect(titleCase("hello")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(titleCase("")).toBe("");
  });
});
