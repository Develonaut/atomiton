import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createBridgeManager,
  type BridgeManager,
} from "#preload/bridge/manager";
import type { AtomitonRPC } from "#preload/types/api";

// Mock electron contextBridge
vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
}));

// Mock window object for non-context-isolated environment
Object.defineProperty(global, "window", {
  value: {},
  writable: true,
});

describe("BridgeManager", () => {
  let bridgeManager: BridgeManager;
  let mockAPI: AtomitonRPC;

  beforeEach(() => {
    bridgeManager = createBridgeManager();
    mockAPI = {
      node: { run: vi.fn() },
      system: { health: vi.fn() },
    };
  });

  it("should expose API without throwing", () => {
    expect(() => {
      bridgeManager.exposeAPI(mockAPI);
    }).not.toThrow();
  });
});
