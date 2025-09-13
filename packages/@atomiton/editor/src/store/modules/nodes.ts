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

import type { Connection, Edge } from "@xyflow/react";
import type { BaseStore } from "../types";
import {
  focusOnNode,
  updateFlowInstance,
  updateStoreState,
} from "./node-effects";
import { prepareNodeAddition, type NodeCreationOptions } from "./node-utils";

const getDraggedNodeType = (event: React.DragEvent): string | null => {
  return event.dataTransfer?.getData("application/atomiton-node") || null;
};

export type NodeActions = {
  addNode: (nodeType: string, position?: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  deleteSelectedNodes: () => void;
  handleConnect: (connection: Connection) => void;
  handleDrop: (event: React.DragEvent, reactFlowBounds: DOMRect | null) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
};

export const createNodeModule = (
  store: BaseStore,
  debouncedUpdateFlowSnapshot: () => void,
): NodeActions => {
  const actions: NodeActions = {
    addNode: (nodeType: string, position?: { x: number; y: number }) => {
      const instance = store.getState().flowInstance;
      if (!instance) return;

      const existingNodes = instance.getNodes();
      const existingEdges = instance.getEdges();

      const options: NodeCreationOptions = { nodeType, position };
      const { newNode, updatedNodes, updatedEdges } = prepareNodeAddition(
        options,
        existingNodes,
        existingEdges,
      );

      updateFlowInstance(instance, updatedNodes, updatedEdges);
      updateStoreState(store.setState, updatedNodes, updatedEdges, newNode.id);
      focusOnNode(instance, newNode.id);
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

      store.setState((state) => {
        state.flowSnapshot.nodes = nodes;
        state.flowSnapshot.edges = edges;
      });

      debouncedUpdateFlowSnapshot();
    },

    deleteSelectedNodes: () => {
      const instance = store.getState().flowInstance;
      if (!instance) return;

      const nodes = instance.getNodes().filter((node) => !node.selected);
      const edges = instance.getEdges().filter((edge) => !edge.selected);

      instance.setNodes(nodes);
      instance.setEdges(edges);

      store.setState((state) => {
        state.flowSnapshot.nodes = nodes;
        state.flowSnapshot.edges = edges;
      });

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

      store.setState((state) => {
        state.flowSnapshot.edges = updatedEdges;
      });

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

    updateNodeData: (id: string, data: Record<string, unknown>) => {
      const instance = store.getState().flowInstance;
      if (!instance) return;

      const nodes = instance.getNodes().map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      });

      instance.setNodes(nodes);

      store.setState((state) => {
        state.flowSnapshot.nodes = nodes;
      });

      debouncedUpdateFlowSnapshot();
    },
  };

  return actions;
};
