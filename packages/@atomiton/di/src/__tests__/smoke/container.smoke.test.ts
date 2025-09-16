import { describe, it, expect } from "vitest";

describe("DI Package API Smoke Tests", () => {
  it("should export Container class", async () => {
    const { Container } = await import("../../index");
    expect(Container).toBeDefined();
    expect(typeof Container).toBe("function");
  });

  it("should export Injectable decorator", async () => {
    const { Injectable } = await import("../../index");
    expect(Injectable).toBeDefined();
    expect(typeof Injectable).toBe("function");
  });

  it("should be able to create container instance", async () => {
    const { Container } = await import("../../index");
    const container = new Container();
    expect(container).toBeDefined();
    expect(container.get).toBeDefined();
    expect(container.bind).toBeDefined();
  });

  it("should export core DI functionality", async () => {
    const diModule = await import("../../index");
    expect(Object.keys(diModule).length).toBeGreaterThan(0);
  });
});
