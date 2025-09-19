import { describe, it, expect, vi } from "vitest";
import { initializeServices } from "../../main/services";
import { initializeStorage } from "../../main/services/storage";
import { initializeConductor } from "../../main/services/conductor";

// Mock Electron and dependencies for smoke test
vi.mock("@atomiton/storage", () => ({
  createFileSystemStorage: vi.fn(() => ({ save: vi.fn(), load: vi.fn() })),
}));

vi.mock("@atomiton/conductor", () => ({
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
