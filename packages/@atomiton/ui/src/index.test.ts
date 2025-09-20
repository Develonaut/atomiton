import { describe, it, expect } from "vitest";

describe("UI Package API Smoke Tests", () => {
  it("should export Button component", async () => {
    const { Button } = await import("./index");
    expect(Button).toBeDefined();
    // React components can be functions or objects (forwardRef components)
    expect(["function", "object"].includes(typeof Button)).toBe(true);
  });

  it("should export Card component", async () => {
    const { Card } = await import("./index");
    expect(Card).toBeDefined();
    expect(["function", "object"].includes(typeof Card)).toBe(true);
  });

  it("should export Input component", async () => {
    const { Input } = await import("./index");
    expect(Input).toBeDefined();
    // Input is a forwardRef component, which is an object
    expect(["function", "object"].includes(typeof Input)).toBe(true);
  });

  it("should export Box component", async () => {
    const { Box } = await import("./index");
    expect(Box).toBeDefined();
    // Box is a forwardRef component, which is an object
    expect(["function", "object"].includes(typeof Box)).toBe(true);
  });
});
