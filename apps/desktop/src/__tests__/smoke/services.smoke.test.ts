import { describe, expect, it, vi } from "vitest";
import { initializeServices } from "../../main/services";
import { initializeConductor } from "../../main/services/conductor";
import { initializeStorage } from "../../main/services/storage";

// Mock Electron and dependencies for smoke test
vi.mock("@atomiton/storage/desktop", () => ({
  createFileSystemEngine: vi.fn(() => ({ save: vi.fn(), load: vi.fn() })),
  createStorage: vi.fn(
    (config) => config?.engine || { save: vi.fn(), load: vi.fn() },
  ),
}));

vi.mock("@atomiton/conductor/desktop", () => ({
  createConductor: vi.fn(() => ({ execute: vi.fn() })),
}));

describe("Desktop Services Smoke Test", () => {
  it("Should initialize services without errors", () => {
    // This should not throw
    expect(() => initializeServices()).not.toThrow();
  });

  it("Should export required service functions", () => {
    expect(initializeServices).toBeDefined();
    expect(initializeStorage).toBeDefined();
    expect(initializeConductor).toBeDefined();
  });
});
