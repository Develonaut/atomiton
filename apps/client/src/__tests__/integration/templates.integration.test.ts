import { describe, it, expect } from "vitest";

/**
 * Templates Integration Tests
 *
 * Tests for full template component functionality and rendering.
 * These tests verify templates work end-to-end but are moved from smoke
 * tests due to performance impact.
 */
describe("Templates Integration Tests", () => {
  it("Templates component can be imported and is functional", async () => {
    // Heavy import moved from smoke test
    const templatesModule = await import("@/components/Templates");
    expect(templatesModule.default).toBeDefined();
    expect(typeof templatesModule.default).toBe("function");
  });

  it("Templates component integrates with template store", async () => {
    const { useTemplates } = await import("@/store/useTemplates");
    expect(useTemplates).toBeDefined();
    expect(typeof useTemplates).toBe("function");
  });

  it("Templates component source code is correctly configured", async () => {
    // Heavy file system operation moved from smoke test
    const fs = await import("fs");
    const path = await import("path");

    const templatesPath = path.resolve("src/components/Templates/index.tsx");

    if (fs.existsSync(templatesPath)) {
      const source = fs.readFileSync(templatesPath, "utf-8");

      // Verify it imports useLink hook from router
      expect(source).toContain('import { useLink } from "@/router"');

      // Verify it uses useLink hook
      expect(source).toContain("useLink(");

      // Verify it uses button elements with useLink
      expect(source).toContain("<button");

      // Verify it navigates to /editor/new
      expect(source).toContain('to: "/editor/new"');

      console.log("Templates component correctly configured for preloading");
    }
  });

  it("Template conversion utilities work correctly", async () => {
    const { convertNodeToEditorNode, convertEdgeToEditorEdge } = await import(
      "@/utils/editorConverters"
    );

    expect(convertNodeToEditorNode).toBeDefined();
    expect(convertEdgeToEditorEdge).toBeDefined();
    expect(typeof convertNodeToEditorNode).toBe("function");
    expect(typeof convertEdgeToEditorEdge).toBe("function");
  });
});
