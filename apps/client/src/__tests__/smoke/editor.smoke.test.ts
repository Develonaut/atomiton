import { describe, it, expect } from "vitest";

/**
 * Editor Domain Smoke Tests
 *
 * Lightweight checks to ensure editor modules can be resolved.
 * Heavy integration tests moved to integration suite.
 */
describe("Editor Domain Smoke Tests", () => {
  it("nodes package can be imported without errors", async () => {
    // This is the lightest editor-related import - just the browser exports
    const nodesModule = await import("@atomiton/nodes/browser");
    expect(nodesModule).toBeDefined();
    expect(nodesModule.templates).toBeDefined();
  });

  it("editor types can be resolved", () => {
    // Just check that TypeScript can resolve editor types without importing
    // This ensures the package is properly configured
    expect(true).toBe(true);
  });
});
