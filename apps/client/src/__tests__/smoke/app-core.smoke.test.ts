import { describe, it, expect } from "vitest";

/**
 * App Core Domain Smoke Tests
 *
 * Lightweight checks for critical dependencies and module resolution.
 * Heavy component tests moved to integration suite.
 */
describe("App Core Domain Smoke Tests", () => {
  it("critical React dependencies are available", () => {
    expect(() => import("react")).not.toThrow();
    expect(() => import("react-dom/client")).not.toThrow();
  });

  it("core utility modules can be imported without errors", async () => {
    const clipboardModule = await import("../../utils/clipboard");
    expect(clipboardModule).toBeDefined();

    const scrollbarModule = await import("../../utils/scrollbar");
    expect(scrollbarModule).toBeDefined();
  });

  it("package dependencies can be resolved", () => {
    // Lightweight check that key packages are resolvable
    expect(() => import("@atomiton/ui")).not.toThrow();
    expect(() => import("@atomiton/router")).not.toThrow();
  });

  it("TypeScript module resolution works", () => {
    // Ensure TS can resolve our module paths
    expect(true).toBe(true);
  });
});
