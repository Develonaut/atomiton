import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConductorConfig, ConductorTransport } from "#types";
import { createConductor } from "#exports/browser/index.js";

// Mock dependencies
vi.mock("./node", () => ({
  createNodeAPI: vi.fn(() => ({
    run: vi.fn(),
    validate: vi.fn(),
    cancel: vi.fn(),
  })),
}));

vi.mock("./flow", () => ({
  createFlowAPI: vi.fn(() => ({
    listTemplates: vi.fn(),
    getTemplate: vi.fn(),
    loadFlow: vi.fn(),
    run: vi.fn(),
  })),
}));

vi.mock("./eventsApi", () => ({
  createEventsAPI: vi.fn(() => ({
    onNodeProgress: vi.fn(),
    onNodeComplete: vi.fn(),
    onNodeError: vi.fn(),
    onFlowSaved: vi.fn(),
    onAuthExpired: vi.fn(),
  })),
}));

vi.mock("./storage", () => ({
  createStorageAPI: vi.fn(() => ({
    save: vi.fn(),
    load: vi.fn(),
    list: vi.fn(),
  })),
}));

vi.mock("./auth", () => ({
  createAuthAPI: vi.fn(() => ({
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  })),
}));

vi.mock("./system", () => ({
  createSystemAPI: vi.fn(() => ({
    getVersion: vi.fn(),
    getPlatform: vi.fn(),
  })),
}));

describe.concurrent("Browser Conductor Index", () => {
  let mockTransport: ConductorTransport;
  let mockConfig: ConductorConfig;

  beforeEach(() => {
    mockTransport = {
      execute: vi.fn(),
      health: vi.fn(),
    };
    mockConfig = { transport: mockTransport };
  });

  describe.concurrent("Flow Event Aliases", () => {
    it.concurrent("should expose flow.onProgress alias", () => {
      const conductor = createConductor(mockConfig);

      expect(conductor.flow.onProgress).toBeDefined();
      expect(conductor.flow.onProgress).toBe(conductor.node.onProgress);
    });

    it.concurrent("should expose flow.onComplete alias", () => {
      const conductor = createConductor(mockConfig);

      expect(conductor.flow.onComplete).toBeDefined();
      expect(conductor.flow.onComplete).toBe(conductor.node.onComplete);
    });

    it.concurrent("should expose flow.onError alias", () => {
      const conductor = createConductor(mockConfig);

      expect(conductor.flow.onError).toBeDefined();
      expect(conductor.flow.onError).toBe(conductor.node.onError);
    });

    it.concurrent(
      "should maintain consistent event handlers between node and flow",
      () => {
        const conductor = createConductor(mockConfig);

        // Calling flow event handler should be same as calling node handler
        const mockCallback = vi.fn();

        conductor.flow.onProgress(mockCallback);
        conductor.node.onProgress(mockCallback);

        // Both should reference the same underlying implementation
        expect(conductor.flow.onProgress).toBe(conductor.node.onProgress);
      },
    );
  });

  describe.concurrent("API Namespace Structure", () => {
    it.concurrent("should expose node namespace", () => {
      const conductor = createConductor(mockConfig);

      expect(conductor.node).toBeDefined();
      expect(conductor.node.run).toBeDefined();
      expect(conductor.node.onProgress).toBeDefined();
      expect(conductor.node.onComplete).toBeDefined();
      expect(conductor.node.onError).toBeDefined();
    });

    it.concurrent("should expose flow namespace", () => {
      const conductor = createConductor(mockConfig);

      expect(conductor.flow).toBeDefined();
      expect(conductor.flow.listTemplates).toBeDefined();
      expect(conductor.flow.getTemplate).toBeDefined();
      expect(conductor.flow.run).toBeDefined();
      expect(conductor.flow.onProgress).toBeDefined();
      expect(conductor.flow.onComplete).toBeDefined();
      expect(conductor.flow.onError).toBeDefined();
    });

    it.concurrent("should expose storage namespace with onFlowSaved", () => {
      const conductor = createConductor(mockConfig);

      expect(conductor.storage).toBeDefined();
      expect(conductor.storage.onFlowSaved).toBeDefined();
    });

    it.concurrent("should expose auth namespace with onAuthExpired", () => {
      const conductor = createConductor(mockConfig);

      expect(conductor.auth).toBeDefined();
      expect(conductor.auth.onAuthExpired).toBeDefined();
    });

    it.concurrent("should expose system namespace", () => {
      const conductor = createConductor(mockConfig);

      expect(conductor.system).toBeDefined();
    });
  });

  describe.concurrent("Better Developer Experience", () => {
    it.concurrent("should allow developers to stay in flow namespace", () => {
      const conductor = createConductor(mockConfig);

      // Developer can do everything flow-related without leaving namespace
      expect(conductor.flow.listTemplates).toBeDefined();
      expect(conductor.flow.getTemplate).toBeDefined();
      expect(conductor.flow.run).toBeDefined();
      expect(conductor.flow.onProgress).toBeDefined();
      expect(conductor.flow.onComplete).toBeDefined();
      expect(conductor.flow.onError).toBeDefined();

      // This is the ideal DX: discovery and consistency
    });

    it.concurrent(
      "should allow developers to use node namespace for atomic nodes",
      () => {
        const conductor = createConductor(mockConfig);

        // Developer can use node namespace for atomic nodes
        expect(conductor.node.run).toBeDefined();
        expect(conductor.node.onProgress).toBeDefined();
        expect(conductor.node.onComplete).toBeDefined();
        expect(conductor.node.onError).toBeDefined();

        // Clear semantic distinction: node for atomic, flow for groups
      },
    );
  });

  describe.concurrent("Progressive Disclosure Pattern", () => {
    it.concurrent("should support simple progress bar use case", () => {
      const conductor = createConductor(mockConfig);

      // Simple use: just progress and message
      const mockProgressCallback = vi.fn((event) => {
        // Consumer only uses basic properties
        const { progress, message } = event;
        expect(typeof progress).toBe("number");
        expect(typeof message).toBe("string");
      });

      conductor.node.onProgress(mockProgressCallback);
    });

    it.concurrent(
      "should support advanced graph visualization use case",
      () => {
        const conductor = createConductor(mockConfig);

        // Advanced use: full graph details
        const mockProgressCallback = vi.fn((event) => {
          // Consumer uses detailed graph information
          const { progress, message, nodes, graph } = event;
          expect(progress).toBeDefined();
          expect(message).toBeDefined();
          expect(nodes).toBeDefined();
          expect(graph).toBeDefined();
          expect(graph.executionOrder).toBeDefined();
          expect(graph.criticalPath).toBeDefined();
        });

        conductor.node.onProgress(mockProgressCallback);
      },
    );
  });

  describe.concurrent("No Execution Graph Events on Wrong Layer", () => {
    it.concurrent(
      "should NOT expose onExecutionGraphStateUpdate on node namespace",
      () => {
        const conductor = createConductor(mockConfig);

        // @ts-expect-error - Should not exist
        expect(conductor.node.onExecutionGraphStateUpdate).toBeUndefined();
      },
    );

    it.concurrent(
      "should NOT expose onExecutionGraphStateUpdate on flow namespace",
      () => {
        const conductor = createConductor(mockConfig);

        // @ts-expect-error - Should not exist (consolidated into onProgress)
        expect(conductor.flow.onExecutionGraphStateUpdate).toBeUndefined();
      },
    );

    it.concurrent(
      "should consolidate graph tracking into onProgress event",
      () => {
        const conductor = createConductor(mockConfig);

        // Graph tracking is now part of progress events
        expect(conductor.node.onProgress).toBeDefined();
        expect(conductor.flow.onProgress).toBeDefined();
        expect(conductor.flow.onProgress).toBe(conductor.node.onProgress);

        // No separate graph event needed
      },
    );
  });
});
