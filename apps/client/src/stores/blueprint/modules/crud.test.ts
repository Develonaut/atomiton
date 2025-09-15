/**
 * Blueprint CRUD Operations Tests
 *
 * Tests for blueprint creation, loading, updating, and deletion operations
 * Covers edge cases like ownership scenarios and error handling
 */

import { createCompositeNode } from "@atomiton/nodes";
import { store as storeAPI } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Blueprint, BlueprintState } from "../types";
import { createCrudModule } from "./crud";

// Mock the nodes API
vi.mock("@atomiton/nodes", () => ({
  createCompositeNode: vi.fn(),
  nodes: {
    /* mock nodes API if needed */
  },
}));

const mockCreateCompositeNode = vi.mocked(createCompositeNode);

describe("Blueprint CRUD Operations", () => {
  let testStore: any;
  let crudModule: any;
  let initialState: BlueprintState;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create initial state
    initialState = {
      blueprints: [],
      isLoading: false,
      isDirty: false,
      error: null,
    };

    // Create a test store
    testStore = storeAPI.createStore({
      name: "TestBlueprintStore",
      initialState,
    });

    // Create CRUD module
    crudModule = createCrudModule(testStore);
  });

  describe("loadBlueprint", () => {
    it("should set error when blueprint not found", () => {
      const blueprintId = "non-existent-id";

      crudModule.loadBlueprint(blueprintId);

      const state = testStore.getState();
      expect(state.error).toBe(`Blueprint with ID ${blueprintId} not found`);
    });

    it("should clear error when blueprint is found and user is owner", () => {
      // Create a mock blueprint owned by current user
      const mockBlueprint = {
        id: "test-id",
        name: "Test Blueprint",
        metadata: { authorId: "user_default_123" },
        getChildNodes: () => [],
        getExecutionFlow: () => [],
      } as Blueprint;

      // Add blueprint to store
      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(mockBlueprint);
      });

      crudModule.loadBlueprint("test-id");

      const state = testStore.getState();
      expect(state.error).toBeNull();
    });

    it("should create a copy when user is not owner", () => {
      // Mock createCompositeNode to return a new blueprint
      const mockCopiedBlueprint = {
        id: "new-copy-id",
        name: "Test Blueprint (Copy)",
        metadata: { authorId: "user_default_123" },
        getChildNodes: () => [],
        getExecutionFlow: () => [],
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(mockCopiedBlueprint);

      // Create a mock blueprint owned by different user
      const originalBlueprint = {
        id: "original-id",
        name: "Test Blueprint",
        metadata: { authorId: "different-user" },
        getChildNodes: () => [{ id: "node1" }],
        getExecutionFlow: () => [{ id: "edge1" }],
        variables: { var1: "value1" },
        settings: { setting1: true },
      } as Blueprint;

      // Add blueprint to store
      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(originalBlueprint);
      });

      crudModule.loadBlueprint("original-id");

      // Verify createCompositeNode was called with correct data
      expect(mockCreateCompositeNode).toHaveBeenCalledWith({
        name: "Test Blueprint (Copy)",
        description: "",
        category: "blueprints",
        nodes: [{ id: "node1" }],
        edges: [{ id: "edge1" }],
        variables: { var1: "value1" },
        settings: { setting1: true },
      });

      // Verify the copy was added to store
      const state = testStore.getState();
      expect(state.blueprints).toHaveLength(2);
      expect(state.blueprints[1]).toBe(mockCopiedBlueprint);
    });

    it("should handle blueprint with missing methods gracefully", () => {
      // Create a mock blueprint without getChildNodes/getExecutionFlow methods
      const mockBlueprint = {
        id: "test-id",
        name: "Test Blueprint",
        metadata: { authorId: "different-user" },
      } as Blueprint;

      const mockCopiedBlueprint = {
        id: "new-copy-id",
        name: "Test Blueprint (Copy)",
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(mockCopiedBlueprint);

      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(mockBlueprint);
      });

      crudModule.loadBlueprint("test-id");

      expect(mockCreateCompositeNode).toHaveBeenCalledWith({
        name: "Test Blueprint (Copy)",
        description: "",
        category: "blueprints",
        nodes: [],
        edges: [],
        variables: undefined,
        settings: undefined,
      });
    });
  });

  describe("createBlueprint", () => {
    it("should create a new blueprint with auto-generated ID", () => {
      const mockBlueprint = {
        id: "auto-generated-id",
        name: "New Blueprint",
        metadata: { authorId: "user_default_123" },
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(mockBlueprint);

      const blueprintData = {
        name: "Custom Blueprint Name",
        metadata: { description: "Custom description" },
      };

      const result = crudModule.createBlueprint(blueprintData);

      expect(result).toBe("auto-generated-id");
      expect(mockCreateCompositeNode).toHaveBeenCalledWith({
        name: "Custom Blueprint Name",
        description: "Custom description",
        category: "blueprints",
        nodes: [],
        edges: [],
        variables: undefined,
        settings: undefined,
      });

      const state = testStore.getState();
      expect(state.blueprints).toHaveLength(1);
      expect(state.blueprints[0]).toBe(mockBlueprint);
      expect(state.isDirty).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should create blueprint with specific ID", () => {
      const mockBlueprint = {
        id: "specific-id",
        name: "New Blueprint",
        metadata: { authorId: "user_default_123" },
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(mockBlueprint);

      const blueprintData = {
        id: "specific-id",
        name: "Custom Blueprint",
      };

      const result = crudModule.createBlueprint(blueprintData);

      expect(result).toBe("specific-id");
      expect(mockCreateCompositeNode).toHaveBeenCalledWith({
        id: "specific-id",
        name: "Custom Blueprint",
        description: "",
        category: "blueprints",
        nodes: [],
        edges: [],
        variables: undefined,
        settings: undefined,
      });
    });

    it("should handle blueprint data with child nodes and edges", () => {
      const mockNodes = [{ id: "node1", type: "input" }];
      const mockEdges = [{ id: "edge1", source: "node1", target: "node2" }];

      const mockBlueprint = {
        id: "test-id",
        name: "Test Blueprint",
        getChildNodes: () => mockNodes,
        getExecutionFlow: () => mockEdges,
        metadata: { authorId: "user_default_123" },
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(mockBlueprint);

      const blueprintData = {
        name: "Complex Blueprint",
        getChildNodes: () => mockNodes,
        getExecutionFlow: () => mockEdges,
        variables: { var1: "value1" },
        settings: { setting1: true },
      } as Partial<Blueprint>;

      const result = crudModule.createBlueprint(blueprintData);

      expect(mockCreateCompositeNode).toHaveBeenCalledWith({
        name: "Complex Blueprint",
        description: "",
        category: "blueprints",
        nodes: mockNodes,
        edges: mockEdges,
        variables: { var1: "value1" },
        settings: { setting1: true },
      });
    });

    it("should set default name if none provided", () => {
      const mockBlueprint = {
        id: "test-id",
        name: "New Blueprint",
        metadata: { authorId: "user_default_123" },
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(mockBlueprint);

      const result = crudModule.createBlueprint({});

      expect(mockCreateCompositeNode).toHaveBeenCalledWith({
        name: "New Blueprint",
        description: "",
        category: "blueprints",
        nodes: [],
        edges: [],
        variables: undefined,
        settings: undefined,
      });
    });
  });

  describe("saveBlueprint", () => {
    describe("updating existing blueprint", () => {
      it("should update existing blueprint when user is owner", () => {
        const existingBlueprint = {
          id: "existing-id",
          name: "Original Name",
          metadata: { authorId: "user_default_123" },
        } as Blueprint;

        testStore.setState((state: BlueprintState) => {
          state.blueprints.push(existingBlueprint);
        });

        const updatedBlueprint = {
          id: "existing-id",
          name: "Original Name",
          metadata: { authorId: "user_default_123" },
        } as Blueprint;

        mockCreateCompositeNode.mockReturnValue(updatedBlueprint);

        const flowData = {
          name: "Updated Name",
          nodes: [{ id: "node1" }],
          edges: [{ id: "edge1" }],
          variables: { var1: "updated" },
        };

        const result = crudModule.saveBlueprint("existing-id", flowData);

        expect(result).toBe("existing-id");
        expect(mockCreateCompositeNode).toHaveBeenCalledWith({
          id: "existing-id",
          name: "Updated Name",
          description: "",
          category: "blueprints",
          nodes: [{ id: "node1" }],
          edges: [{ id: "edge1" }],
          variables: { var1: "updated" },
          settings: undefined,
        });

        const state = testStore.getState();
        expect(state.blueprints[0]).toBe(updatedBlueprint);
        expect(state.isDirty).toBe(true);
        expect(state.error).toBeNull();
      });

      it("should not update blueprint when user is not owner", () => {
        const existingBlueprint = {
          id: "existing-id",
          name: "Original Name",
          metadata: { authorId: "different-user" },
        } as Blueprint;

        testStore.setState((state: BlueprintState) => {
          state.blueprints.push(existingBlueprint);
        });

        const flowData = {
          name: "Updated Name",
          nodes: [{ id: "node1" }],
        };

        const result = crudModule.saveBlueprint("existing-id", flowData);

        expect(result).toBe("existing-id");
        expect(mockCreateCompositeNode).not.toHaveBeenCalled();

        // Blueprint should remain unchanged
        const state = testStore.getState();
        expect(state.blueprints[0]).toBe(existingBlueprint);
      });

      it("should preserve original name when updating", () => {
        const existingBlueprint = {
          id: "existing-id",
          name: "Original Name",
          metadata: { authorId: "user_default_123" },
        } as Blueprint;

        testStore.setState((state: BlueprintState) => {
          state.blueprints.push(existingBlueprint);
        });

        const updatedBlueprint = {
          id: "existing-id",
          name: "Original Name",
          metadata: { authorId: "user_default_123" },
        } as Blueprint;

        mockCreateCompositeNode.mockReturnValue(updatedBlueprint);

        const flowData = {
          nodes: [{ id: "node1" }],
          edges: [{ id: "edge1" }],
        };

        crudModule.saveBlueprint("existing-id", flowData);

        expect(mockCreateCompositeNode).toHaveBeenCalledWith({
          id: "existing-id",
          name: "Original Name",
          description: "",
          category: "blueprints",
          nodes: [{ id: "node1" }],
          edges: [{ id: "edge1" }],
          variables: undefined,
          settings: undefined,
        });
      });
    });

    describe("creating new blueprint", () => {
      it("should create new blueprint when no ID provided", () => {
        const newBlueprint = {
          id: "new-generated-id",
          name: "New Blueprint",
          metadata: { authorId: "user_default_123" },
        } as Blueprint;

        mockCreateCompositeNode.mockReturnValue(newBlueprint);

        const flowData = {
          name: "New Blueprint",
          nodes: [{ id: "node1" }],
          edges: [{ id: "edge1" }],
          variables: { var1: "value1" },
          settings: { setting1: true },
        };

        const result = crudModule.saveBlueprint(undefined, flowData);

        expect(result).toBe("new-generated-id");
        expect(mockCreateCompositeNode).toHaveBeenCalledWith({
          id: undefined,
          name: "New Blueprint",
          description: "Blueprint created from Editor",
          category: "blueprints",
          nodes: [{ id: "node1" }],
          edges: [{ id: "edge1" }],
          variables: { var1: "value1" },
          settings: { setting1: true },
        });

        const state = testStore.getState();
        expect(state.blueprints).toHaveLength(1);
        expect(state.blueprints[0]).toBe(newBlueprint);
        expect(state.isDirty).toBe(false);
        expect(state.error).toBeNull();
      });

      it("should set default description when creating new blueprint", () => {
        const newBlueprint = {
          id: "new-id",
          name: "New Blueprint",
          metadata: { authorId: "user_default_123" },
        } as Blueprint;

        mockCreateCompositeNode.mockReturnValue(newBlueprint);

        const flowData = { name: "Test Blueprint" };

        crudModule.saveBlueprint(undefined, flowData);

        expect(mockCreateCompositeNode).toHaveBeenCalledWith({
          id: undefined,
          name: "Test Blueprint",
          description: "Blueprint created from Editor",
          category: "blueprints",
          nodes: [],
          edges: [],
          variables: undefined,
          settings: undefined,
        });
      });
    });
  });

  describe("updateBlueprint", () => {
    it("should update blueprint when user is owner", () => {
      const existingBlueprint = {
        id: "test-id",
        name: "Original Name",
        metadata: {
          authorId: "user_default_123",
          description: "Original description",
        },
      } as Blueprint;

      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(existingBlueprint);
      });

      const updates = {
        name: "Updated Name",
        metadata: { description: "Updated description" },
      };

      crudModule.updateBlueprint("test-id", updates);

      const state = testStore.getState();
      expect(state.blueprints[0].name).toBe("Updated Name");
      expect(state.isDirty).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should not update blueprint when user is not owner", () => {
      const existingBlueprint = {
        id: "test-id",
        name: "Original Name",
        metadata: { authorId: "different-user" },
      } as Blueprint;

      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(existingBlueprint);
      });

      const updates = { name: "Updated Name" };

      crudModule.updateBlueprint("test-id", updates);

      const state = testStore.getState();
      expect(state.blueprints[0].name).toBe("Original Name");
      expect(state.error).toBe(
        "Cannot modify blueprint test-id. You are not the owner.",
      );
    });

    it("should set error when blueprint not found", () => {
      const updates = { name: "Updated Name" };

      crudModule.updateBlueprint("non-existent-id", updates);

      const state = testStore.getState();
      expect(state.error).toBe("Blueprint with ID non-existent-id not found");
    });

    it("should handle partial updates correctly", () => {
      const existingBlueprint = {
        id: "test-id",
        name: "Original Name",
        metadata: {
          authorId: "user_default_123",
          description: "Original description",
          category: "original-category",
        },
      } as Blueprint;

      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(existingBlueprint);
      });

      const updates = {
        name: "Updated Name",
      };

      crudModule.updateBlueprint("test-id", updates);

      const state = testStore.getState();
      const updatedBlueprint = state.blueprints[0];

      expect(updatedBlueprint.name).toBe("Updated Name");
      expect(updatedBlueprint.metadata?.description).toBe(
        "Original description",
      );
      expect(updatedBlueprint.metadata?.category).toBe("original-category");
      expect(state.isDirty).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should handle createCompositeNode throwing an error", () => {
      mockCreateCompositeNode.mockImplementation(() => {
        throw new Error("Failed to create composite node");
      });

      expect(() => {
        crudModule.createBlueprint({ name: "Test" });
      }).toThrow("Failed to create composite node");
    });

    it("should handle missing blueprint methods gracefully in save operations", () => {
      const existingBlueprint = {
        id: "test-id",
        name: "Test Blueprint",
        metadata: { authorId: "user_default_123" },
        // Missing getChildNodes and getExecutionFlow methods
      } as Blueprint;

      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(existingBlueprint);
      });

      const updatedBlueprint = {
        id: "test-id",
        name: "Test Blueprint",
        metadata: { authorId: "user_default_123" },
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(updatedBlueprint);

      const flowData = {
        nodes: [{ id: "node1" }],
        edges: [{ id: "edge1" }],
      };

      const result = crudModule.saveBlueprint("test-id", flowData);

      expect(result).toBe("test-id");
      expect(mockCreateCompositeNode).toHaveBeenCalled();
    });
  });

  describe("ownership validation", () => {
    it("should correctly identify owner with matching authorId", () => {
      const ownedBlueprint = {
        id: "owned-id",
        name: "Owned Blueprint",
        metadata: { authorId: "user_default_123" },
      } as Blueprint;

      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(ownedBlueprint);
      });

      crudModule.loadBlueprint("owned-id");

      const state = testStore.getState();
      expect(state.error).toBeNull();
      expect(state.blueprints).toHaveLength(1); // No copy created
    });

    it("should correctly identify non-owner with different authorId", () => {
      const nonOwnedBlueprint = {
        id: "non-owned-id",
        name: "Non-owned Blueprint",
        metadata: { authorId: "different-user-456" },
        getChildNodes: () => [],
        getExecutionFlow: () => [],
      } as Blueprint;

      const copiedBlueprint = {
        id: "copied-id",
        name: "Non-owned Blueprint (Copy)",
        metadata: { authorId: "user_default_123" },
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(copiedBlueprint);

      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(nonOwnedBlueprint);
      });

      crudModule.loadBlueprint("non-owned-id");

      const state = testStore.getState();
      expect(state.blueprints).toHaveLength(2); // Copy was created
      expect(state.blueprints[1]).toBe(copiedBlueprint);
    });

    it("should handle missing authorId as non-owner", () => {
      const noAuthorBlueprint = {
        id: "no-author-id",
        name: "No Author Blueprint",
        metadata: {}, // No authorId
        getChildNodes: () => [],
        getExecutionFlow: () => [],
      } as Blueprint;

      const copiedBlueprint = {
        id: "copied-id",
        name: "No Author Blueprint (Copy)",
        metadata: { authorId: "user_default_123" },
      } as Blueprint;

      mockCreateCompositeNode.mockReturnValue(copiedBlueprint);

      testStore.setState((state: BlueprintState) => {
        state.blueprints.push(noAuthorBlueprint);
      });

      crudModule.loadBlueprint("no-author-id");

      const state = testStore.getState();
      expect(state.blueprints).toHaveLength(2); // Copy was created
    });
  });
});
