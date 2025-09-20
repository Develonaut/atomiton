import { describe, expect, it, vi } from "vitest";
import { delay } from "./delay";

describe("delay", () => {
  it("should resolve after specified milliseconds", async () => {
    const start = Date.now();
    await delay(10);
    const end = Date.now();
    const elapsed = end - start;

    expect(elapsed).toBeGreaterThanOrEqual(8);
    expect(elapsed).toBeLessThan(50);
  });

  it("should work with zero delay", async () => {
    const start = Date.now();
    await delay(0);
    const end = Date.now();
    const elapsed = end - start;

    expect(elapsed).toBeLessThan(10);
  });

  it("should return a promise", () => {
    const result = delay(1);
    expect(result).toBeInstanceOf(Promise);
  });

  it("should use setTimeout internally", () => {
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");
    delay(100);

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
    setTimeoutSpy.mockRestore();
  });
});
