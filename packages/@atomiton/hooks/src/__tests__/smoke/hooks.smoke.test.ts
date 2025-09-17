import { describe, expect, it } from "vitest";
import * as hooks from "../../index";

describe("Hooks Package API Smoke Tests", () => {
  it("should export useDidMount hook", async () => {
    expect(hooks.useDidMount).toBeDefined();
    expect(typeof hooks.useDidMount).toBe("function");
  });

  it("should export useEventCallback hook", async () => {
    expect(hooks.useEventCallback).toBeDefined();
    expect(typeof hooks.useEventCallback).toBe("function");
  });

  it("should export useHover hook", async () => {
    expect(hooks.useHover).toBeDefined();
    expect(typeof hooks.useHover).toBe("function");
  });

  it("should export core hooks", async () => {
    const hooksModule = await import("../../index");
    expect(Object.keys(hooksModule).length).toBeGreaterThan(0);
  });
});
