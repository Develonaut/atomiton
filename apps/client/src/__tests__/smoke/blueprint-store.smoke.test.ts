import { describe, it, expect } from "vitest";

describe("Blueprint Store Domain Smoke Tests", () => {
  it("blueprint store can be imported without errors", async () => {
    const blueprintStore = await import("../../stores/blueprintStore");
    expect(blueprintStore).toBeDefined();
  });

  it("store package can be imported without errors", async () => {
    const storeModule = await import("@atomiton/store");
    expect(storeModule).toBeDefined();
  });

  it("hooks module can be imported without errors", async () => {
    const hooksModule = await import("../../hooks");
    expect(hooksModule).toBeDefined();
  });
});
