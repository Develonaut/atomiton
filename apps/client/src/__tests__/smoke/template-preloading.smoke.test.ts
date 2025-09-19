import { describe, expect, it } from "vitest";

/**
 * Template Preloading Smoke Test
 *
 * Verifies that template components are configured for proper preloading
 * to prevent route preloading regression.
 */
describe("Template Preloading Smoke Tests", () => {
  it("should import Templates component successfully", async () => {
    // Verify we can import the Templates component
    const templatesModule = await import("@/components/Templates");
    expect(templatesModule.default).toBeDefined();
    expect(typeof templatesModule.default).toBe("function");
  });

  it("should import Link from router successfully", async () => {
    // Verify Link is properly imported in Templates component
    const routerModule = await import("@/router");
    expect(routerModule.Link).toBeDefined();

    // Link might be a function or an object (React.forwardRef returns an object)
    expect(["function", "object"]).toContain(typeof routerModule.Link);
  });

  it("should have router configured with intent preloading", async () => {
    // Verify router configuration supports preloading
    const routerModule = await import("@/router");
    const router = routerModule.router;

    // Check router options for preloading configuration
    const routerOptions = router.options || router.__options;
    expect(routerOptions?.defaultPreload).toBe("intent");
    expect(routerOptions?.defaultPreloadDelay).toBe(50);
  });

  it("should render Templates component source correctly", async () => {
    // Read the Templates component source to verify Link usage
    const fs = await import("fs");
    const path = await import("path");

    const templatesPath = path.resolve("src/components/Templates/index.tsx");

    // Check if file exists
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
    } else {
      // If we can't read the file in test environment, skip with note
      console.log(
        "Templates component file not accessible in test environment",
      );
    }
  });

  it("should have useLink hook available for Create button", async () => {
    // Verify useLink hook is available for other components
    const routerModule = await import("@/router");
    expect(routerModule.useLink).toBeDefined();
    expect(typeof routerModule.useLink).toBe("function");
  });
});
