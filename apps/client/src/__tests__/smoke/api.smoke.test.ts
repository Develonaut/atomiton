import { describe, it, expect } from "vitest";

describe("API Surface Smoke Tests", () => {
  it("should export HomePage component", async () => {
    const module = await import("../../templates/HomePage");
    expect(module.default).toBeDefined();
  });

  it("should have Layout module", async () => {
    const layoutModule = await import("../../components/Layout");
    expect(layoutModule).toBeDefined();
  });

  it("should have navigation module", async () => {
    const navModule = await import(
      "../../components/Layout/Sidebar/navigation"
    );
    expect(navModule).toBeDefined();
  });

  it("should have utility modules", async () => {
    const clipboardModule = await import("../../utils/clipboard");
    expect(clipboardModule).toBeDefined();

    const scrollbarModule = await import("../../utils/scrollbar");
    expect(scrollbarModule).toBeDefined();
  });

  it("should have components directory", async () => {
    const detailsAdapter = await import("../../components/DetailsPageAdapter");
    expect(detailsAdapter).toBeDefined();
  });
});
