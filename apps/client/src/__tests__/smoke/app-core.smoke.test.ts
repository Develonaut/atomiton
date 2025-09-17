import { describe, it, expect } from "vitest";

describe("App Core Domain Smoke Tests", () => {
  it("main App component can be imported without errors", async () => {
    const appModule = await import("../../App");
    expect(appModule.default).toBeDefined();
  });

  it("critical React dependencies are available", () => {
    expect(() => import("react")).not.toThrow();
    expect(() => import("react-dom/client")).not.toThrow();
  });

  it("HomePage template can be imported without errors", async () => {
    const module = await import("../../templates/HomePage");
    expect(module.default).toBeDefined();
  });

  it("Layout module can be imported without errors", async () => {
    const layoutModule = await import("../../components/Layout");
    expect(layoutModule).toBeDefined();
  });

  it("navigation module can be imported without errors", async () => {
    const navModule = await import(
      "../../components/Layout/Sidebar/navigation"
    );
    expect(navModule).toBeDefined();
  });

  it("core utility modules can be imported without errors", async () => {
    const clipboardModule = await import("../../utils/clipboard");
    expect(clipboardModule).toBeDefined();

    const scrollbarModule = await import("../../utils/scrollbar");
    expect(scrollbarModule).toBeDefined();
  });

  it("core components can be imported without errors", async () => {
    const detailsAdapter = await import("../../components/DetailsPageAdapter");
    expect(detailsAdapter).toBeDefined();
  });

  it("UI package can be imported without errors", async () => {
    const uiModule = await import("@atomiton/ui");
    expect(uiModule).toBeDefined();
  });
});
