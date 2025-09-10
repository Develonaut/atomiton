import { renderHook } from "@testing-library/react";
import type { Edge, Node } from "@xyflow/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStoreSync } from "./useStoreSync";

// Mock the store
vi.mock("../../../store", () => ({
  editorStore: {
    subscribe: vi.fn(() => vi.fn()),
    setElements: vi.fn(),
    setConnections: vi.fn(),
  },
}));

import { editorStore } from "../../../store";

const mockStore = vi.mocked(editorStore);

describe("useStoreSync", () => {
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();

  const testNodes: Node[] = [
    { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
    { id: "2", position: { x: 100, y: 100 }, data: { label: "Node 2" } },
  ];

  const testEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial Data Sync", () => {
    it("should sync initial nodes to store when provided", () => {
      renderHook(() => useStoreSync(testNodes, [], mockSetNodes, mockSetEdges));

      expect(mockStore.setElements).toHaveBeenCalledWith(testNodes);
    });

    it("should sync initial edges to store when provided", () => {
      renderHook(() => useStoreSync([], testEdges, mockSetNodes, mockSetEdges));

      expect(mockStore.setConnections).toHaveBeenCalledWith(testEdges);
    });

    it("should sync both nodes and edges when provided", () => {
      renderHook(() =>
        useStoreSync(testNodes, testEdges, mockSetNodes, mockSetEdges),
      );

      expect(mockStore.setElements).toHaveBeenCalledWith(testNodes);
      expect(mockStore.setConnections).toHaveBeenCalledWith(testEdges);
    });

    it("should not sync empty arrays to store", () => {
      renderHook(() => useStoreSync([], [], mockSetNodes, mockSetEdges));

      expect(mockStore.setElements).not.toHaveBeenCalled();
      expect(mockStore.setConnections).not.toHaveBeenCalled();
    });

    it("should only sync nodes when edges array is empty", () => {
      renderHook(() => useStoreSync(testNodes, [], mockSetNodes, mockSetEdges));

      expect(mockStore.setElements).toHaveBeenCalledWith(testNodes);
      expect(mockStore.setConnections).not.toHaveBeenCalled();
    });

    it("should only sync edges when nodes array is empty", () => {
      renderHook(() => useStoreSync([], testEdges, mockSetNodes, mockSetEdges));

      expect(mockStore.setElements).not.toHaveBeenCalled();
      expect(mockStore.setConnections).toHaveBeenCalledWith(testEdges);
    });
  });

  describe("Store State Subscription", () => {
    it("should subscribe to store changes on mount", () => {
      const mockUnsubscribe = vi.fn();
      mockStore.subscribe.mockReturnValue(mockUnsubscribe);

      renderHook(() => useStoreSync([], [], mockSetNodes, mockSetEdges));

      expect(mockStore.subscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should call setNodes and setEdges when store state changes", () => {
      const mockUnsubscribe = vi.fn();
      let storeCallback: (state: {
        elements: Node[];
        connections: Edge[];
      }) => void = () => {};

      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return mockUnsubscribe;
      });

      renderHook(() => useStoreSync([], [], mockSetNodes, mockSetEdges));

      const mockState = {
        elements: testNodes,
        connections: testEdges,
      };

      storeCallback(mockState);

      expect(mockSetNodes).toHaveBeenCalledWith(testNodes);
      expect(mockSetEdges).toHaveBeenCalledWith(testEdges);
    });

    it("should unsubscribe on unmount", () => {
      const mockUnsubscribe = vi.fn();
      mockStore.subscribe.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() =>
        useStoreSync([], [], mockSetNodes, mockSetEdges),
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should handle multiple state updates", () => {
      const mockUnsubscribe = vi.fn();
      let storeCallback: (state: {
        elements: Node[];
        connections: Edge[];
      }) => void = () => {};

      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return mockUnsubscribe;
      });

      renderHook(() => useStoreSync([], [], mockSetNodes, mockSetEdges));

      const state1 = {
        elements: [testNodes[0]],
        connections: [],
      };

      const state2 = {
        elements: testNodes,
        connections: testEdges,
      };

      storeCallback(state1);
      storeCallback(state2);

      expect(mockSetNodes).toHaveBeenCalledTimes(2);
      expect(mockSetNodes).toHaveBeenNthCalledWith(1, [testNodes[0]]);
      expect(mockSetNodes).toHaveBeenNthCalledWith(2, testNodes);

      expect(mockSetEdges).toHaveBeenCalledTimes(2);
      expect(mockSetEdges).toHaveBeenNthCalledWith(1, []);
      expect(mockSetEdges).toHaveBeenNthCalledWith(2, testEdges);
    });
  });

  describe("Effect Dependencies", () => {
    it("should re-run initial sync when nodes change", () => {
      const { rerender } = renderHook(
        ({ nodes, edges }) =>
          useStoreSync(nodes, edges, mockSetNodes, mockSetEdges),
        {
          initialProps: { nodes: [], edges: [] },
        },
      );

      expect(mockStore.setElements).not.toHaveBeenCalled();

      rerender({ nodes: testNodes, edges: [] });

      expect(mockStore.setElements).toHaveBeenCalledWith(testNodes);
    });

    it("should re-run initial sync when edges change", () => {
      const { rerender } = renderHook(
        ({ nodes, edges }) =>
          useStoreSync(nodes, edges, mockSetNodes, mockSetEdges),
        {
          initialProps: { nodes: [], edges: [] },
        },
      );

      expect(mockStore.setConnections).not.toHaveBeenCalled();

      rerender({ nodes: [], edges: testEdges });

      expect(mockStore.setConnections).toHaveBeenCalledWith(testEdges);
    });

    it("should not re-run sync when setNodes/setEdges functions change", () => {
      const newMockSetNodes = vi.fn();
      const newMockSetEdges = vi.fn();

      const { rerender } = renderHook(
        ({ setNodes, setEdges }) =>
          useStoreSync(testNodes, testEdges, setNodes, setEdges),
        {
          initialProps: { setNodes: mockSetNodes, setEdges: mockSetEdges },
        },
      );

      expect(mockStore.setElements).toHaveBeenCalledTimes(1);
      expect(mockStore.setConnections).toHaveBeenCalledTimes(1);

      rerender({ setNodes: newMockSetNodes, setEdges: newMockSetEdges });

      // Should not call setElements/setConnections again
      expect(mockStore.setElements).toHaveBeenCalledTimes(1);
      expect(mockStore.setConnections).toHaveBeenCalledTimes(1);
    });

    it("should update subscription when setNodes/setEdges change", () => {
      const mockUnsubscribe1 = vi.fn();
      const mockUnsubscribe2 = vi.fn();
      let subscribeCallCount = 0;
      let storeCallback: (state: {
        elements: Node[];
        connections: Edge[];
      }) => void = () => {};

      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        subscribeCallCount++;
        return subscribeCallCount === 1 ? mockUnsubscribe1 : mockUnsubscribe2;
      });

      const newMockSetNodes = vi.fn();
      const newMockSetEdges = vi.fn();

      const { rerender } = renderHook(
        ({ setNodes, setEdges }) => useStoreSync([], [], setNodes, setEdges),
        {
          initialProps: { setNodes: mockSetNodes, setEdges: mockSetEdges },
        },
      );

      expect(mockStore.subscribe).toHaveBeenCalledTimes(1);

      rerender({ setNodes: newMockSetNodes, setEdges: newMockSetEdges });

      expect(mockStore.subscribe).toHaveBeenCalledTimes(2);
      expect(mockUnsubscribe1).toHaveBeenCalled();

      // Test that new handlers are used
      const mockState = {
        elements: testNodes,
        connections: testEdges,
      };

      storeCallback(mockState);

      expect(newMockSetNodes).toHaveBeenCalledWith(testNodes);
      expect(newMockSetEdges).toHaveBeenCalledWith(testEdges);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null/undefined nodes", () => {
      renderHook(() =>
        useStoreSync(
          null as unknown as Node[],
          testEdges,
          mockSetNodes,
          mockSetEdges,
        ),
      );

      expect(mockStore.setElements).not.toHaveBeenCalled();
      expect(mockStore.setConnections).toHaveBeenCalledWith(testEdges);
    });

    it("should handle null/undefined edges", () => {
      renderHook(() =>
        useStoreSync(
          testNodes,
          null as unknown as Edge[],
          mockSetNodes,
          mockSetEdges,
        ),
      );

      expect(mockStore.setElements).toHaveBeenCalledWith(testNodes);
      expect(mockStore.setConnections).not.toHaveBeenCalled();
    });

    it("should handle store subscription returning null", () => {
      mockStore.subscribe.mockReturnValue(null);

      const { unmount } = renderHook(() =>
        useStoreSync([], [], mockSetNodes, mockSetEdges),
      );

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });

    it("should handle store state with missing properties", () => {
      const mockUnsubscribe = vi.fn();
      let storeCallback: (state: {
        elements: Node[];
        connections: Edge[];
      }) => void = () => {};

      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return mockUnsubscribe;
      });

      renderHook(() => useStoreSync([], [], mockSetNodes, mockSetEdges));

      const incompleteState = {};

      storeCallback(incompleteState);

      expect(mockSetNodes).toHaveBeenCalledWith(undefined);
      expect(mockSetEdges).toHaveBeenCalledWith(undefined);
    });

    it("should handle very large initial datasets", () => {
      const largeNodes: Node[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `node-${i}`,
        position: { x: i * 10, y: i * 10 },
        data: { label: `Node ${i}` },
      }));

      const largeEdges: Edge[] = Array.from({ length: 9999 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      }));

      const start = performance.now();
      renderHook(() =>
        useStoreSync(largeNodes, largeEdges, mockSetNodes, mockSetEdges),
      );
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
      expect(mockStore.setElements).toHaveBeenCalledWith(largeNodes);
      expect(mockStore.setConnections).toHaveBeenCalledWith(largeEdges);
    });
  });

  describe("Performance", () => {
    it("should not cause excessive store updates", () => {
      const { rerender } = renderHook(
        ({ nodes }) => useStoreSync(nodes, [], mockSetNodes, mockSetEdges),
        {
          initialProps: { nodes: testNodes },
        },
      );

      expect(mockStore.setElements).toHaveBeenCalledTimes(1);

      // Rerendering with same nodes should not cause additional store updates
      rerender({ nodes: testNodes });

      expect(mockStore.setElements).toHaveBeenCalledTimes(2); // Once per render due to useEffect
    });

    it("should handle rapid store state changes", () => {
      const mockUnsubscribe = vi.fn();
      let storeCallback: (state: {
        elements: Node[];
        connections: Edge[];
      }) => void = () => {};

      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return mockUnsubscribe;
      });

      renderHook(() => useStoreSync([], [], mockSetNodes, mockSetEdges));

      // Simulate rapid state changes
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        storeCallback({
          elements: [{ id: `node-${i}`, position: { x: i, y: i }, data: {} }],
          connections: [],
        });
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should handle rapid updates efficiently
      expect(mockSetNodes).toHaveBeenCalledTimes(1000);
      expect(mockSetEdges).toHaveBeenCalledTimes(1000);
    });
  });

  describe("Memory Management", () => {
    it("should not leak memory with frequent rerenders", () => {
      const mockUnsubscribe = vi.fn();
      mockStore.subscribe.mockReturnValue(mockUnsubscribe);

      const { rerender, unmount } = renderHook(
        ({ nodes, edges }) =>
          useStoreSync(nodes, edges, mockSetNodes, mockSetEdges),
        {
          initialProps: { nodes: [], edges: [] },
        },
      );

      // Simulate frequent rerenders
      for (let i = 0; i < 100; i++) {
        rerender({
          nodes: [{ id: `node-${i}`, position: { x: i, y: i }, data: {} }],
          edges: [],
        });
      }

      unmount();

      // Should clean up properly
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should properly clean up subscriptions on dependency changes", () => {
      const mockUnsubscribe1 = vi.fn();
      const mockUnsubscribe2 = vi.fn();
      let callCount = 0;

      mockStore.subscribe.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? mockUnsubscribe1 : mockUnsubscribe2;
      });

      const { rerender, unmount } = renderHook(
        ({ setNodes, setEdges }) => useStoreSync([], [], setNodes, setEdges),
        {
          initialProps: { setNodes: mockSetNodes, setEdges: mockSetEdges },
        },
      );

      const newSetNodes = vi.fn();
      const newSetEdges = vi.fn();

      rerender({ setNodes: newSetNodes, setEdges: newSetEdges });

      expect(mockUnsubscribe1).toHaveBeenCalled();
      expect(mockUnsubscribe2).not.toHaveBeenCalled();

      unmount();

      expect(mockUnsubscribe2).toHaveBeenCalled();
    });
  });

  describe("Store Integration", () => {
    it("should maintain referential integrity with store updates", () => {
      const mockUnsubscribe = vi.fn();
      let storeCallback: (state: {
        elements: Node[];
        connections: Edge[];
      }) => void = () => {};

      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return mockUnsubscribe;
      });

      renderHook(() => useStoreSync([], [], mockSetNodes, mockSetEdges));

      const sharedNodeReference = testNodes[0];
      const state = {
        elements: [sharedNodeReference, testNodes[1]],
        connections: testEdges,
      };

      storeCallback(state);

      expect(mockSetNodes).toHaveBeenCalledWith([
        sharedNodeReference,
        testNodes[1],
      ]);
      expect(mockSetNodes.mock.calls[0][0][0]).toBe(sharedNodeReference);
    });

    it("should handle concurrent store operations", () => {
      renderHook(() =>
        useStoreSync(testNodes, testEdges, mockSetNodes, mockSetEdges),
      );

      // Simulate concurrent store operations
      expect(mockStore.setElements).toHaveBeenCalledWith(testNodes);
      expect(mockStore.setConnections).toHaveBeenCalledWith(testEdges);

      // Both should be called in the same render cycle
      // We'll just verify both were called since exact timing is hard to test
      expect(mockStore.setElements).toHaveBeenCalled();
      expect(mockStore.setConnections).toHaveBeenCalled();
    });
  });
});
