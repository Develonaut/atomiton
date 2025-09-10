/**
 * Domain: Node Operations
 *
 * Purpose: Handles all node and element operations within the flow editor
 *
 * Responsibilities:
 * - Create and add new nodes to the flow
 * - Delete individual nodes and selected elements
 * - Handle drag & drop node placement
 * - Manage connections between nodes
 * - Auto-connect new nodes to create logical flow sequences
 */

import type { Connection, Edge, Node } from "@xyflow/react";
import type { BaseStore } from "../types";

const getDraggedNodeType = (event: React.DragEvent): string | null => {
  return event.dataTransfer?.getData("application/atomiton-node") || null;
};

export interface NodeActions {
  addNode: (nodeType: string, position?: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  deleteSelectedNodes: () => void;
  handleConnect: (connection: Connection) => void;
  handleDrop: (event: React.DragEvent, reactFlowBounds: DOMRect | null) => void;
}

export const createNodeModule = (
  store: BaseStore,
  debouncedUpdateFlowSnapshot: () => void,
): NodeActions => {
  const actions: NodeActions = {
    addNode: (nodeType: string, position?: { x: number; y: number }) => {
      const instance = store.getState().flowInstance;
      if (!instance) return;

      const nodes = instance.getNodes();
      const nodeId = `node-${Date.now()}`;

      let nodePosition = position;
      if (!nodePosition) {
        if (nodes.length > 0) {
          const rightmostNode = nodes.reduce((prev, current) =>
            prev.position.x > current.position.x ? prev : current,
          );
          nodePosition = {
            x: rightmostNode.position.x + 200,
            y: rightmostNode.position.y,
          };
        } else {
          nodePosition = { x: 100, y: 100 };
        }
      }

      const newNode: Node = {
        id: nodeId,
        type: nodeType,
        position: nodePosition,
        data: {},
        selected: true,
      };

      // Deselect all other nodes
      const updatedNodes = [
        ...nodes.map((node) => ({ ...node, selected: false })),
        newNode,
      ];
      instance.setNodes(updatedNodes);

      // Auto-connect to previous node if exists
      let updatedEdges = instance.getEdges();
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        const edge: Edge = {
          id: `edge-${lastNode.id}-${nodeId}`,
          source: lastNode.id,
          target: nodeId,
          type: "default",
        };
        updatedEdges = [...updatedEdges, edge];
        instance.setEdges(updatedEdges);
      }

      // Update snapshot immediately for UI consistency
      store.setState((state) => ({
        ...state,
        selectedNodeId: nodeId,
        flowSnapshot: {
          nodes: updatedNodes,
          edges: updatedEdges,
          viewport: state.flowSnapshot.viewport,
        },
      }));

      // Focus on the new node
      setTimeout(() => {
        instance.fitView({
          nodes: [{ id: nodeId }],
          duration: 200,
          padding: 0.2,
        });
      }, 50);

      debouncedUpdateFlowSnapshot();
    },

    deleteNode: (id: string) => {
      const instance = store.getState().flowInstance;
      if (!instance) return;

      const nodes = instance.getNodes().filter((node) => node.id !== id);
      const edges = instance
        .getEdges()
        .filter((edge) => edge.source !== id && edge.target !== id);

      instance.setNodes(nodes);
      instance.setEdges(edges);

      // Update snapshot immediately for UI consistency
      store.setState((state) => ({
        ...state,
        flowSnapshot: {
          nodes,
          edges,
          viewport: state.flowSnapshot.viewport,
        },
      }));

      debouncedUpdateFlowSnapshot();
    },

    deleteSelectedNodes: () => {
      const instance = store.getState().flowInstance;
      if (!instance) return;

      const nodes = instance.getNodes().filter((node) => !node.selected);
      const edges = instance.getEdges().filter((edge) => !edge.selected);

      instance.setNodes(nodes);
      instance.setEdges(edges);

      // Update snapshot immediately for UI consistency
      store.setState((state) => ({
        ...state,
        flowSnapshot: {
          nodes,
          edges,
          viewport: state.flowSnapshot.viewport,
        },
      }));

      debouncedUpdateFlowSnapshot();
    },

    handleConnect: (connection: Connection) => {
      const instance = store.getState().flowInstance;
      if (!instance) return;

      const newEdge: Edge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
      };

      const edges = instance.getEdges();
      const updatedEdges = [...edges, newEdge];
      instance.setEdges(updatedEdges);

      // Update snapshot immediately for UI consistency
      store.setState((state) => ({
        ...state,
        flowSnapshot: {
          nodes: state.flowSnapshot.nodes,
          edges: updatedEdges,
          viewport: state.flowSnapshot.viewport,
        },
      }));

      debouncedUpdateFlowSnapshot();
    },

    handleDrop: (event: React.DragEvent, reactFlowBounds: DOMRect | null) => {
      const instance = store.getState().flowInstance;
      if (!instance || !reactFlowBounds) {
        return;
      }

      const nodeType = getDraggedNodeType(event);
      if (!nodeType) {
        return;
      }

      const position = instance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      actions.addNode(nodeType, position);
    },
  };

  return actions;
};
