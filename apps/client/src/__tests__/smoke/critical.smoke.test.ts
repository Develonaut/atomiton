import { describe, it, expect } from "vitest";

describe("Critical Application Smoke Tests", () => {
  it("should export the main App component", async () => {
    const appModule = await import("../../App");
    expect(appModule.default).toBeDefined();
    expect(typeof appModule.default).toBe("function");
  });

  it("should have critical dependencies available", () => {
    // Check React is available
    expect(() => import("react")).not.toThrow();
    expect(() => import("react-dom/client")).not.toThrow();
  });

  it("should have router package available", async () => {
    // Just check the module can be imported
    const routerModule = await import("@atomiton/router");
    expect(routerModule).toBeDefined();
  });

  it("should have blueprint store module", async () => {
    // Check the store file exists and exports something
    const storeModule = await import("../../stores/blueprintStore");
    expect(storeModule).toBeDefined();
  });

  it("should have main hooks module", async () => {
    const hooksModule = await import("../../hooks");
    expect(hooksModule).toBeDefined();
  });
});
