import { describe, it, expect } from "vitest";
import { createAtomitonRPC } from "#preload/api/factory";

describe("createAtomitonRPC", () => {
  it("should create API with node and system modules", () => {
    const api = createAtomitonRPC();

    expect(api).toHaveProperty("node");
    expect(api).toHaveProperty("system");
    expect(typeof api.node.run).toBe("function");
    expect(typeof api.system.health).toBe("function");
  });
});
