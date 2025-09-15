/**
 * Domain: Blueprint CRUD Operations
 *
 * Purpose: Manages creation, reading, updating, and deletion of blueprints
 *
 * Responsibilities:
 * - Create new blueprints (composite nodes) with unique IDs
 * - Load blueprints by ID
 * - Update blueprint properties
 * - Delete blueprints
 * - Clear all blueprints
 */

import { createCompositeNode } from "@atomiton/nodes";
import { selectBlueprintById } from "../selectors";
import type { BaseStore, Blueprint } from "../types";

// TODO: Replace with actual user ID from user store when implemented
const CURRENT_USER_ID = "user_default_123";

export type CrudActions = {
  loadBlueprint: (id: string) => void;
  copyBlueprint: (id: string) => string | null;
  createBlueprint: (blueprintData: Partial<Blueprint>) => string;
  saveBlueprintFromEditor: (id: string | undefined, editorState: any) => string;
  updateBlueprint: (id: string, updates: Partial<Blueprint>) => void;
  removeBlueprint: (id: string) => void;
};

// Helper to create composite node from flow data
const flowDataToCompositeNode = (
  id: string | undefined, // Optional - will be generated if not provided
  flowData: any,
  defaults: { name?: string; description?: string } = {},
) => {
  return createCompositeNode({
    id,
    name: flowData.name || defaults.name || "New Blueprint",
    description: flowData.description || defaults.description || "",
    category: flowData.category || "blueprints",
    nodes: flowData.nodes || [],
    edges: flowData.edges || [],
    variables: flowData.variables,
    settings: flowData.settings,
  });
};

export const createCrudModule = (store: BaseStore): CrudActions => ({
  loadBlueprint: (id: string) => {
    // Check if blueprint exists in store using selector
    const existingBlueprint = selectBlueprintById(id)(store.getState());

    if (!existingBlueprint) {
      // Blueprint not found in store
      store.setState((state) => {
        state.error = `Blueprint with ID ${id} not found`;
      });
      return;
    }

    // Only clear error if there was one
    if (store.getState().error) {
      store.setState((state) => {
        state.error = null;
      });
    }

    // Simple load - no automatic copying
    // Hook or caller can decide whether to copy based on ownership
  },

  copyBlueprint: (id: string) => {
    // Check if blueprint exists in store using selector
    const existingBlueprint = selectBlueprintById(id)(store.getState());

    if (!existingBlueprint) {
      // Blueprint not found in store
      store.setState((state) => {
        state.error = `Blueprint with ID ${id} not found`;
      });
      return null;
    }

    // Create a copy
    const compositeNode = createCompositeNode({
      // ID will be auto-generated
      name: `${existingBlueprint.name} (Copy)`,
      description: existingBlueprint.metadata?.description || "",
      category: existingBlueprint.metadata?.category || "blueprints",
      nodes: existingBlueprint.getChildNodes
        ? existingBlueprint.getChildNodes()
        : [],
      edges: existingBlueprint.getExecutionFlow
        ? existingBlueprint.getExecutionFlow()
        : [],
      variables: (existingBlueprint as any).variables,
      settings: (existingBlueprint as any).settings,
    });

    // Set ownership to current user
    (compositeNode.metadata as any).authorId = CURRENT_USER_ID;

    store.setState((state) => {
      state.blueprints.push(compositeNode as Blueprint);
      state.error = null;
    });

    console.log(`Created copy ${compositeNode.id} from blueprint ${id}`);

    return compositeNode.id;
  },

  createBlueprint: (blueprintData: Partial<Blueprint>) => {
    // Use createCompositeNode to create a proper composite node (it generates ID if needed)
    const nodeData = {
      name: blueprintData.name || "New Blueprint",
      description: blueprintData.metadata?.description || "",
      category: (blueprintData.metadata?.category || "blueprints") as string,
      nodes: blueprintData.getChildNodes ? blueprintData.getChildNodes() : [],
      edges: blueprintData.getExecutionFlow
        ? blueprintData.getExecutionFlow()
        : [],
      variables: (blueprintData as any).variables,
      settings: (blueprintData as any).settings,
    };

    const compositeNode = createCompositeNode(
      blueprintData.id ? { id: blueprintData.id, ...nodeData } : nodeData,
    );

    // Set the authorId to current user
    // TODO: This should be done in createCompositeNode when we have user store
    (compositeNode.metadata as any).authorId = CURRENT_USER_ID;

    // The blueprint IS the composite node
    const blueprint = compositeNode as Blueprint;

    store.setState((state) => {
      state.blueprints.push(blueprint);
      state.error = null;
    });

    return blueprint.id;
  },

  saveBlueprintFromEditor: (id: string | undefined, editorState: any) => {
    // If id is provided, check if we can update existing blueprint
    if (id) {
      const existingBlueprint = selectBlueprintById(id)(store.getState());

      if (existingBlueprint) {
        // Check ownership
        const isOwner =
          (existingBlueprint.metadata as any)?.authorId === CURRENT_USER_ID;

        if (!isOwner) {
          // Create a copy instead of updating
          const copyNode = flowDataToCompositeNode(
            undefined, // Generate new ID
            editorState,
            {
              name: `${existingBlueprint.name} (Copy)`,
              description: existingBlueprint.metadata?.description || "",
            },
          );

          // Set ownership to current user
          (copyNode.metadata as any).authorId = CURRENT_USER_ID;

          store.setState((state) => {
            state.blueprints.push(copyNode as Blueprint);
            state.error = null;
          });

          return copyNode.id;
        }

        // Update existing blueprint (user owns it)
        store.setState((state) => {
          const index = state.blueprints.findIndex((bp) => bp.id === id);
          if (index !== -1) {
            const updatedNode = flowDataToCompositeNode(id, editorState, {
              name: state.blueprints[index].name,
            }) as Blueprint;
            // Preserve the authorId
            (updatedNode.metadata as any).authorId = CURRENT_USER_ID;
            state.blueprints[index] = updatedNode;
            state.error = null;
          }
        });
        return id;
      }
    }

    // Create new blueprint (no existing blueprint or no ID provided)
    const compositeNode = flowDataToCompositeNode(
      undefined, // Let createCompositeNode generate the ID
      editorState,
      { description: "Blueprint created from Editor" },
    );

    // Set the authorId to current user
    (compositeNode.metadata as any).authorId = CURRENT_USER_ID;

    store.setState((state) => {
      state.blueprints.push(compositeNode as Blueprint);
      state.error = null;
    });

    return compositeNode.id;
  },

  updateBlueprint: (id: string, updates: Partial<Blueprint>) => {
    store.setState((state) => {
      const index = state.blueprints.findIndex((bp) => bp.id === id);
      if (index === -1) {
        state.error = `Blueprint with ID ${id} not found`;
        return;
      }

      // Don't allow updating blueprints you don't own
      // TODO: Get actual user ID from user store
      const isOwner =
        (state.blueprints[index].metadata as any)?.authorId === CURRENT_USER_ID;
      if (!isOwner) {
        state.error = `Cannot modify blueprint ${id}. You are not the owner.`;
        return;
      }

      // Create updated blueprint without lastModified (not in interface)
      const updatedBlueprint: Blueprint = {
        ...state.blueprints[index],
        ...updates,
      } as Blueprint;

      // Content updates would be handled differently in a real implementation
      // TODO: Implement proper content update handling when needed

      state.blueprints[index] = updatedBlueprint;
      state.error = null;
    });
  },

  removeBlueprint: (id: string) => {
    store.setState((state) => {
      const index = state.blueprints.findIndex((bp) => bp.id === id);
      if (index === -1) {
        state.error = `Blueprint with ID ${id} not found`;
        return;
      }

      // Don't allow removing blueprints you don't own
      // TODO: Get actual user ID from user store
      const isOwner =
        (state.blueprints[index].metadata as any)?.authorId === CURRENT_USER_ID;
      if (!isOwner) {
        state.error = `Cannot remove blueprint ${id}. You are not the owner.`;
        return;
      }

      // Remove the blueprint
      state.blueprints.splice(index, 1);
      state.error = null;
      console.log(`Removed blueprint ${id}`);
    });
  },
});
