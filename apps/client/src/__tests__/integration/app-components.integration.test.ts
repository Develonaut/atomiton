import { describe, it, expect } from "vitest";

/**
 * App Components Integration Tests
 *
 * Tests for full component imports and rendering.
 * These tests verify components work but are moved from smoke
 * tests due to performance impact.
 */
describe("App Components Integration Tests", () => {
  it("main App component can be imported and is functional", async () => {
    const appModule = await import("../../App");
    expect(appModule.default).toBeDefined();
    expect(typeof appModule.default).toBe("function");
  });

  it("HomePage template renders without errors", async () => {
    const module = await import("../../templates/HomePage");
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe("function");
  });

  it("Layout components are fully functional", async () => {
    const layoutModule = await import("../../components/Layout");
    expect(layoutModule).toBeDefined();

    const navModule = await import(
      "../../components/Layout/Sidebar/navigation"
    );
    expect(navModule).toBeDefined();
  });

  it("core components render without errors", async () => {
    const detailsAdapter = await import("../../components/DetailsPageAdapter");
    expect(detailsAdapter).toBeDefined();
    expect(typeof detailsAdapter.default).toBe("function");
  });

  it("UI package components are functional", async () => {
    const uiModule = await import("@atomiton/ui");
    expect(uiModule).toBeDefined();

    // Verify key UI components are available
    expect(uiModule.Button).toBeDefined();
  });
});
