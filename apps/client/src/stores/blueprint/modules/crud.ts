/**
 * Domain: Blueprint CRUD Operations
 *
 * Purpose: Manages creation, reading, updating, and deletion of user blueprints
 *
 * Responsibilities:
 * - Create new blueprints with generated IDs
 * - Update existing blueprint properties
 * - Delete blueprints from store
 * - Find blueprints by ID (includes templates)
 * - Generate unique blueprint IDs
 */

import { generateNodeId } from "@atomiton/utils";
import { createNode } from "@atomiton/nodes/browser";
import type { Blueprint, BlueprintState } from "../types";

export type CrudActions = {
  create: (blueprint: Partial<Blueprint>) => string;
  update: (id: string, updates: Partial<Blueprint>) => void;
  remove: (id: string) => void;
  findById: (id: string) => Blueprint | undefined;
};

export function createCrudModule(store: {
  getState: () => BlueprintState;
  setState: (updater: (state: BlueprintState) => void) => void;
}): CrudActions {
  return {
    create: (blueprint: Partial<Blueprint>) => {
      const id = blueprint.id || generateNodeId();
      const now = new Date().toISOString();

      // Use createNode to ensure proper structure
      const baseNode = createNode({
        id,
        name: blueprint.name || "Untitled Blueprint",
        type: "composite",
        metadata: {
          name: blueprint.name || "Untitled Blueprint",
          description: blueprint.description || "A new blueprint",
          category: blueprint.category || "user",
          version: blueprint.version || "1.0.0",
          author: "User",
          source: "user",
          created: now,
          modified: now,
          ...blueprint.metadata,
        },
        nodes: blueprint.nodes || [],
        edges: blueprint.edges || [],
        variables: blueprint.variables || {},
        settings: blueprint.settings || {
          runtime: {
            timeout: 30000,
            parallel: false,
          },
          ui: {
            color: "#6366f1",
          },
        },
      });

      const newBlueprint: Blueprint = {
        ...baseNode,
        createdAt: now,
        updatedAt: now,
      };

      store.setState((state) => {
        state.blueprints.push(newBlueprint);
        state.error = null;
      });

      return id;
    },

    update: (id: string, updates: Partial<Blueprint>) => {
      store.setState((state) => {
        const index = state.blueprints.findIndex((bp) => bp.id === id);
        if (index === -1) {
          state.error = `Blueprint ${id} not found`;
          return;
        }

        state.blueprints[index] = {
          ...state.blueprints[index],
          ...updates,
          id, // Ensure ID can't be changed
          updatedAt: new Date().toISOString(),
        };
        state.error = null;
      });
    },

    remove: (id: string) => {
      store.setState((state) => {
        const index = state.blueprints.findIndex((bp) => bp.id === id);
        if (index === -1) {
          state.error = `Blueprint ${id} not found`;
          return;
        }

        state.blueprints.splice(index, 1);
        state.error = null;
      });
    },

    findById: (id: string) => {
      const state = store.getState();
      // Search both templates and blueprints
      return [...state.templates, ...state.blueprints].find(
        (bp) => bp.id === id,
      );
    },
  };
}
