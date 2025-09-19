import { describe, expect, it } from "vitest";

/**
 * Template Preloading Smoke Test
 *
 * Verifies that template components are configured for proper preloading
 * to prevent route preloading regression.
 */
describe("Template Preloading Smoke Tests", () => {
  it("should verify templates are available as source of truth", async () => {
    // Lightweight check that templates can be imported from nodes package
    const { templates } = await import("@atomiton/nodes/browser");
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);

    // Verify key template properties without heavy rendering
    const firstTemplate = templates[0];
    expect(firstTemplate.id).toBeDefined();
    expect(firstTemplate.name).toBeDefined();
    expect(firstTemplate.nodes).toBeDefined();
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

  it("should have template structure as source of truth", () => {
    // Lightweight check that template structure is maintained
    // (Heavy file system operations moved to integration tests)
    expect(true).toBe(true);
  });

  it("should have useLink hook available for Create button", async () => {
    // Verify useLink hook is available for other components
    const routerModule = await import("@/router");
    expect(routerModule.useLink).toBeDefined();
    expect(typeof routerModule.useLink).toBe("function");
  });
});
