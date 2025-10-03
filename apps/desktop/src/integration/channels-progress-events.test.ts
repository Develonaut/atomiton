import type { ExecutionGraphState } from "@atomiton/conductor/desktop";
import {
  createSimpleTwoNodeGraph,
  createComplexParallelGraph,
  createAtomicNodeGraph,
  createMockGraphState,
  createMockNode,
} from "@atomiton/conductor/test-utils/factories";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@atomiton/conductor/desktop", () => ({
  createConductor: vi.fn(() => ({
    node: {
      run: vi.fn(),
      store: {
        subscribe: vi.fn(),
        getState: vi.fn(),
      },
    },
  })),
}));

vi.mock("@atomiton/logger/desktop", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock("@atomiton/rpc/main/channels", () => ({
  createNodeChannelServer: vi.fn(() => ({
    broadcast: vi.fn(),
  })),
  createFlowChannelServer: vi.fn(() => ({})),
  createLoggerChannelServer: vi.fn(() => ({})),
  createStorageChannelServer: vi.fn(() => ({})),
  createSystemChannelServer: vi.fn(() => ({})),
}));

// Type helpers for mocks
const createMockConductor = () => ({
  node: {
    run: vi.fn(),
    store: {
      subscribe: vi.fn(),
      getState: vi.fn(),
    },
  },
});

const createMockNodeChannel = () => ({
  broadcast: vi.fn(),
});

describe("Channels - Unified Progress Event Broadcasting", () => {
  let mockConductor: ReturnType<typeof createMockConductor>;
  let mockNodeChannel: ReturnType<typeof createMockNodeChannel>;
  let subscribeCallback: (state: ExecutionGraphState) => void;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the actual module implementations
    const { createConductor } = await import("@atomiton/conductor/desktop");
    const { createNodeChannelServer } = await import(
      "@atomiton/rpc/main/channels"
    );

    // Setup mock conductor
    mockConductor = createMockConductor();
    mockConductor.node.store.subscribe = vi.fn((callback) => {
      subscribeCallback = callback;
      return vi.fn(); // unsubscribe function
    });

    // Setup mock node channel
    mockNodeChannel = createMockNodeChannel();

    vi.mocked(createConductor).mockReturnValue(mockConductor);
    vi.mocked(createNodeChannelServer).mockReturnValue(mockNodeChannel);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Progress Event Broadcasting", () => {
    it("should subscribe to conductor execution graph store", async () => {
      // Import and initialize channels
      const { createChannelManager } = await import(
        "../main/services/channels"
      );
      createChannelManager();

      expect(mockConductor.node.store.subscribe).toHaveBeenCalledTimes(1);
      expect(mockConductor.node.store.subscribe).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it("should calculate progress from completed nodes", async () => {
      const { createChannelManager } = await import(
        "../main/services/channels"
      );
      createChannelManager();

      // Use factory for cleaner test data
      const mockState = createSimpleTwoNodeGraph();

      // Trigger the subscription callback
      subscribeCallback(mockState);

      // Verify progress event was broadcast
      expect(mockNodeChannel.broadcast).toHaveBeenCalledWith(
        "progress",
        expect.objectContaining({
          progress: 50, // 1 of 2 nodes completed = 50%
          message: expect.stringContaining("Executing"),
          nodes: expect.arrayContaining([
            expect.objectContaining({
              id: "node-1",
              state: "completed",
            }),
            expect.objectContaining({
              id: "node-2",
              state: "executing",
            }),
          ]),
          graph: expect.objectContaining({
            executionOrder: [["node-1"], ["node-2"]],
            criticalPath: ["node-1", "node-2"],
            totalWeight: 200,
            maxParallelism: 1,
          }),
        }),
      );
    });

    it("should generate appropriate status messages", async () => {
      const { createChannelManager } = await import(
        "../main/services/channels"
      );
      createChannelManager();

      // Test "executing" message
      const executingState = createMockGraphState({
        nodes: new Map([
          [
            "node-1",
            createMockNode({
              id: "node-1",
              name: "Downloading Files",
              state: "executing",
              startTime: Date.now(),
            }),
          ],
        ]),
        executionOrder: [["node-1"]],
        criticalPath: ["node-1"],
        totalWeight: 100,
        isExecuting: true,
      });

      subscribeCallback(executingState);

      expect(mockNodeChannel.broadcast).toHaveBeenCalledWith(
        "progress",
        expect.objectContaining({
          message: "Executing: Downloading Files",
        }),
      );

      // Test "all nodes completed" message
      const completedState = createMockGraphState({
        nodes: new Map([
          [
            "node-1",
            createMockNode({
              id: "node-1",
              name: "Node 1",
              state: "completed",
              startTime: Date.now() - 1000,
              endTime: Date.now(),
            }),
          ],
        ]),
        executionOrder: [["node-1"]],
        criticalPath: ["node-1"],
        totalWeight: 100,
        isExecuting: false,
        endTime: Date.now(),
      });

      subscribeCallback(completedState);

      expect(mockNodeChannel.broadcast).toHaveBeenCalledWith(
        "progress",
        expect.objectContaining({
          message: "All nodes completed",
          progress: 100,
        }),
      );
    });

    it("should include full graph structure in progress events", async () => {
      const { createChannelManager } = await import(
        "../main/services/channels"
      );
      createChannelManager();

      // Use factory for complex graph
      const mockState = createMockGraphState({
        nodes: new Map([
          [
            "n1",
            createMockNode({
              id: "n1",
              name: "Node 1",
              dependents: ["n3"],
              state: "completed",
              startTime: Date.now() - 1000,
              endTime: Date.now(),
            }),
          ],
          [
            "n2",
            createMockNode({
              id: "n2",
              name: "Node 2",
              dependents: ["n3"],
              state: "completed",
              startTime: Date.now() - 1000,
              endTime: Date.now(),
            }),
          ],
          [
            "n3",
            createMockNode({
              id: "n3",
              name: "Node 3",
              dependencies: ["n1", "n2"],
              level: 1,
              state: "executing",
              startTime: Date.now(),
            }),
          ],
        ]),
        edges: [
          { from: "n1", to: "n3" },
          { from: "n2", to: "n3" },
        ],
        executionOrder: [["n1", "n2"], ["n3"]],
        criticalPath: ["n1", "n3"],
        totalWeight: 300,
        maxParallelism: 2,
        isExecuting: true,
      });

      subscribeCallback(mockState);

      expect(mockNodeChannel.broadcast).toHaveBeenCalledWith(
        "progress",
        expect.objectContaining({
          graph: {
            executionOrder: [["n1", "n2"], ["n3"]],
            criticalPath: ["n1", "n3"],
            totalWeight: 300,
            maxParallelism: 2,
            edges: [
              { from: "n1", to: "n3" },
              { from: "n2", to: "n3" },
            ],
          },
        }),
      );
    });

    it("should serialize Map to array for IPC transport", async () => {
      const { createChannelManager } = await import(
        "../main/services/channels"
      );
      createChannelManager();

      const mockState: ExecutionGraphState = {
        nodes: new Map([
          [
            "node-1",
            {
              id: "node-1",
              name: "Node 1",
              type: "test",
              weight: 100,
              dependencies: [],
              dependents: [],
              level: 0,
              state: "pending",
            },
          ],
        ]),
        edges: [],
        executionOrder: [["node-1"]],
        criticalPath: ["node-1"],
        totalWeight: 100,
        maxParallelism: 1,
        isExecuting: true,
        startTime: Date.now(),
        endTime: null,
      };

      subscribeCallback(mockState);

      // Verify nodes are sent as array, not Map
      expect(mockNodeChannel.broadcast).toHaveBeenCalledWith(
        "progress",
        expect.objectContaining({
          nodes: expect.arrayContaining([
            expect.objectContaining({
              id: "node-1",
              name: "Node 1",
            }),
          ]),
        }),
      );

      // Verify it's an actual array
      const broadcastCall = mockNodeChannel.broadcast.mock.calls[0];
      expect(Array.isArray(broadcastCall[1].nodes)).toBe(true);
    });
  });

  describe("Unified API Benefits", () => {
    it("should work for atomic nodes with trivial graph", async () => {
      const { createChannelManager } = await import(
        "../main/services/channels"
      );
      createChannelManager();

      // Use factory for atomic node
      const atomicState = createAtomicNodeGraph();

      subscribeCallback(atomicState);

      // Verify same event structure works for atomic nodes
      expect(mockNodeChannel.broadcast).toHaveBeenCalledWith(
        "progress",
        expect.objectContaining({
          progress: 0, // Not completed yet
          message: "Executing: Atomic Operation",
          nodes: expect.arrayContaining([
            expect.objectContaining({
              id: "atomic-1",
              state: "executing",
            }),
          ]),
          graph: expect.objectContaining({
            executionOrder: [["atomic-1"]],
            criticalPath: ["atomic-1"],
            totalWeight: 100,
            maxParallelism: 1,
            edges: [],
          }),
        }),
      );
    });

    it("should work for group nodes with complex graph", async () => {
      const { createChannelManager } = await import(
        "../main/services/channels"
      );
      createChannelManager();

      // Use factory for complex parallel graph
      const groupState = createComplexParallelGraph();

      subscribeCallback(groupState);

      // Verify same event structure works for complex graphs
      expect(mockNodeChannel.broadcast).toHaveBeenCalledWith(
        "progress",
        expect.objectContaining({
          progress: 50, // 2 of 4 completed
          message: "Executing: Node 3",
          nodes: expect.arrayContaining([
            expect.objectContaining({ id: "n1", state: "completed" }),
            expect.objectContaining({ id: "n2", state: "completed" }),
            expect.objectContaining({ id: "n3", state: "executing" }),
            expect.objectContaining({ id: "n4", state: "pending" }),
          ]),
          graph: expect.objectContaining({
            executionOrder: [["n1"], ["n2", "n3"], ["n4"]],
            criticalPath: ["n1", "n2", "n4"],
            maxParallelism: 2,
            totalWeight: 400,
            edges: expect.arrayContaining([
              { from: "n1", to: "n2" },
              { from: "n1", to: "n3" },
              { from: "n2", to: "n4" },
              { from: "n3", to: "n4" },
            ]),
          }),
        }),
      );
    });
  });
});
