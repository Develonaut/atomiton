import { beforeEach, describe, expect, it, vi } from "vitest";
import { connectionActionFunctions } from "./connections";
import { pushHistory } from "../history";
import type { EditorState, Connection } from "../types";

vi.mock("../history", () => ({
  pushHistory: vi.fn(),
}));

describe("Connection Actions", () => {
  let initialState: EditorState;

  beforeEach(() => {
    vi.clearAllMocks();

    initialState = {
      elements: [],
      connections: [],
      selectedElementId: null,
      isLoading: false,
      isDirty: false,
      isAnimationSettings: false,
      flowInstance: null,
      zoom: 100,
      history: {
        past: [],
        future: [],
      },
    };
  });

  describe("addConnection", () => {
    it("should add connection to state and mark as dirty", () => {
      const connection: Connection = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };

      const state = { ...initialState };
      connectionActionFunctions.addConnection(state, connection);

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.connections).toEqual([connection]);
      expect(state.isDirty).toBe(true);
    });

    it("should add multiple connections", () => {
      const connection1: Connection = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };
      const connection2: Connection = {
        id: "edge-2",
        source: "node-2",
        target: "node-3",
      };

      const state = { ...initialState };
      connectionActionFunctions.addConnection(state, connection1);
      connectionActionFunctions.addConnection(state, connection2);

      expect(state.connections).toEqual([connection1, connection2]);
      expect(pushHistory).toHaveBeenCalledTimes(2);
    });

    it("should handle complex connection data", () => {
      const complexConnection: Connection = {
        id: "edge-complex",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output-1",
        targetHandle: "input-1",
        type: "custom",
        animated: true,
        data: { label: "Complex Edge" },
      };

      const state = { ...initialState };
      connectionActionFunctions.addConnection(state, complexConnection);

      expect(state.connections[0]).toEqual(complexConnection);
      expect(state.connections[0].data?.label).toBe("Complex Edge");
    });
  });

  describe("deleteConnection", () => {
    it("should remove connection by id", () => {
      const connection1: Connection = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };
      const connection2: Connection = {
        id: "edge-2",
        source: "node-2",
        target: "node-3",
      };

      const state = {
        ...initialState,
        connections: [connection1, connection2],
      };

      connectionActionFunctions.deleteConnection(state, "edge-1");

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.connections).toEqual([connection2]);
      expect(state.isDirty).toBe(true);
    });

    it("should handle deleting non-existent connection gracefully", () => {
      const connection: Connection = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };

      const state = {
        ...initialState,
        connections: [connection],
      };

      connectionActionFunctions.deleteConnection(state, "non-existent");

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.connections).toEqual([connection]);
      expect(state.isDirty).toBe(true);
    });

    it("should handle empty connections array", () => {
      const state = { ...initialState };

      connectionActionFunctions.deleteConnection(state, "edge-1");

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.connections).toEqual([]);
      expect(state.isDirty).toBe(true);
    });
  });

  describe("setConnections", () => {
    it("should replace all connections when different", () => {
      const oldConnections: Connection[] = [
        { id: "edge-1", source: "node-1", target: "node-2" },
      ];
      const newConnections: Connection[] = [
        { id: "edge-2", source: "node-2", target: "node-3" },
        { id: "edge-3", source: "node-3", target: "node-4" },
      ];

      const state = { ...initialState, connections: oldConnections };

      connectionActionFunctions.setConnections(state, newConnections);

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.connections).toEqual(newConnections);
      expect(state.isDirty).toBe(true);
    });

    it("should not push history when connections are identical", () => {
      const connections: Connection[] = [
        { id: "edge-1", source: "node-1", target: "node-2" },
      ];

      const state = { ...initialState, connections: [...connections] };

      connectionActionFunctions.setConnections(state, connections);

      expect(pushHistory).not.toHaveBeenCalled();
      expect(state.connections).toEqual(connections);
      expect(state.isDirty).toBe(true);
    });

    it("should handle empty array replacement", () => {
      const oldConnections: Connection[] = [
        { id: "edge-1", source: "node-1", target: "node-2" },
      ];

      const state = { ...initialState, connections: oldConnections };

      connectionActionFunctions.setConnections(state, []);

      expect(pushHistory).toHaveBeenCalledWith(state);
      expect(state.connections).toEqual([]);
      expect(state.isDirty).toBe(true);
    });

    it("should maintain state immutability", () => {
      const connection: Connection = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };

      const state = { ...initialState };
      const originalState = JSON.parse(JSON.stringify(state));

      connectionActionFunctions.setConnections(state, [connection]);

      expect(originalState.connections).toEqual([]);
      expect(originalState.isDirty).toBe(false);
      expect(state.connections).toEqual([connection]);
      expect(state.isDirty).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle connections with all optional properties", () => {
      const fullConnection: Connection = {
        id: "edge-full",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output",
        targetHandle: "input",
        type: "smoothstep",
        animated: true,
        hidden: false,
        deletable: true,
        focusable: true,
        className: "custom-edge",
        style: { stroke: "red" },
        markerEnd: { type: "arrowclosed" },
        markerStart: { type: "arrow" },
        interactionWidth: 20,
        data: {
          label: "Full Connection",
          metadata: { created: Date.now() },
        },
      };

      const state = { ...initialState };
      connectionActionFunctions.addConnection(state, fullConnection);

      expect(state.connections[0]).toEqual(fullConnection);
      expect(
        (state.connections[0].data as any)?.metadata.created,
      ).toBeDefined();
    });

    it("should handle rapid sequential operations", () => {
      const connections = Array.from({ length: 5 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      }));

      const state = { ...initialState };

      connections.forEach((connection) => {
        connectionActionFunctions.addConnection(state, connection);
      });

      expect(state.connections).toHaveLength(5);
      expect(pushHistory).toHaveBeenCalledTimes(5);
      expect(state.isDirty).toBe(true);

      connections.forEach((connection) => {
        connectionActionFunctions.deleteConnection(state, connection.id);
      });

      expect(state.connections).toHaveLength(0);
      expect(pushHistory).toHaveBeenCalledTimes(10);
    });
  });
});
