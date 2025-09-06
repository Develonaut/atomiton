/**
 * Blueprint Store Tests
 * Core business logic testing with focus on pure functions and state mutations
 * Following Brian's testing strategy for "exceptionally testable" design
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  createBlueprintStore,
  BlueprintActions,
  BlueprintSelectors,
} from "../../store/blueprintStore";
import type {
  Blueprint,
  BlueprintState,
  BlueprintStore,
} from "../../store/blueprintStore";
import { BlueprintMockFactory } from "../helpers/store-mocks";
import { StoreTestFactory, TestPatterns } from "../helpers/store-test-utils";

describe("Blueprint Store", () => {
  let store: BlueprintStore;
  let storeFactory: StoreTestFactory;

  beforeEach(async () => {
    storeFactory = new StoreTestFactory();
    await storeFactory.initializeStoreClient();
    store = createBlueprintStore();
    BlueprintMockFactory.resetCounter(); // Ensure predictable test data
  });

  afterEach(async () => {
    await storeFactory.cleanup();
  });

  describe("Store Creation and Initialization", () => {
    it("should create store with correct initial state", () => {
      const initialState = store.getState();

      expect(initialState).toEqual({
        blueprints: expect.any(Map),
        selectedBlueprintId: null,
        searchQuery: "",
        filterTags: [],
        sortBy: "modified",
        sortDirection: "desc",
        isLoading: false,
        error: null,
      });

      expect(initialState.blueprints.size).toBe(0);
    });

    it("should have actions instance", () => {
      expect(store.actions).toBeInstanceOf(BlueprintActions);
    });

    it("should support subscriptions", () => {
      const mockCallback = vi.fn();
      const unsubscribe = store.subscribe(mockCallback);

      store.actions.setSearchQuery("test");

      expect(mockCallback).toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe("Blueprint CRUD Operations", () => {
    let testBlueprint: Blueprint;

    beforeEach(() => {
      testBlueprint = BlueprintMockFactory.createBlueprint({
        id: "test-blueprint-1",
        name: "Test Blueprint",
        tags: ["test", "automation"],
      });
    });

    TestPatterns.testStoreCRUD(
      store as any, // Cast to bypass type constraints for generic pattern
      {
        add: (blueprint: Blueprint) => store.actions.addBlueprint(blueprint),
        update: (id: string, updates: Partial<Blueprint>) =>
          store.actions.updateBlueprint(id, updates),
        delete: (id: string) => store.actions.deleteBlueprint(id),
      },
      BlueprintSelectors,
      {
        itemToAdd: testBlueprint,
        itemId: "test-blueprint-1",
        updates: {
          name: "Updated Blueprint",
          description: "Updated description",
        },
        getItems: (state: BlueprintState) =>
          Array.from(state.blueprints.values()),
        getItemById: (state: BlueprintState, id: string) =>
          state.blueprints.get(id) || null,
      },
    );

    describe("Add Blueprint", () => {
      it("should add blueprint to empty store", () => {
        store.actions.addBlueprint(testBlueprint);

        const state = store.getState();
        expect(state.blueprints.size).toBe(1);
        expect(state.blueprints.get(testBlueprint.id)).toEqual(testBlueprint);
      });

      it("should add multiple blueprints", () => {
        const blueprints = BlueprintMockFactory.createMultipleBlueprints(3);

        blueprints.forEach((bp) => store.actions.addBlueprint(bp));

        const state = store.getState();
        expect(state.blueprints.size).toBe(3);
        blueprints.forEach((bp) => {
          expect(state.blueprints.get(bp.id)).toEqual(bp);
        });
      });

      it("should replace existing blueprint with same ID", () => {
        store.actions.addBlueprint(testBlueprint);

        const updatedBlueprint = {
          ...testBlueprint,
          name: "Replaced Blueprint",
          version: "2.0.0",
        };

        store.actions.addBlueprint(updatedBlueprint);

        const state = store.getState();
        expect(state.blueprints.size).toBe(1);
        expect(state.blueprints.get(testBlueprint.id)).toEqual(
          updatedBlueprint,
        );
      });
    });

    describe("Update Blueprint", () => {
      beforeEach(() => {
        store.actions.addBlueprint(testBlueprint);
      });

      it("should update existing blueprint", () => {
        const updates = {
          name: "Updated Name",
          description: "Updated description",
          tags: ["updated", "test"],
        };

        store.actions.updateBlueprint(testBlueprint.id, updates);

        const state = store.getState();
        const updatedBlueprint = state.blueprints.get(testBlueprint.id)!;

        expect(updatedBlueprint.name).toBe(updates.name);
        expect(updatedBlueprint.description).toBe(updates.description);
        expect(updatedBlueprint.tags).toEqual(updates.tags);
        expect(updatedBlueprint.modified.getTime()).toBeGreaterThan(
          testBlueprint.modified.getTime(),
        );
      });

      it("should not modify other properties when updating", () => {
        const originalCreated = testBlueprint.created;
        const originalAuthor = testBlueprint.author;

        store.actions.updateBlueprint(testBlueprint.id, { name: "New Name" });

        const state = store.getState();
        const updated = state.blueprints.get(testBlueprint.id)!;

        expect(updated.created).toEqual(originalCreated);
        expect(updated.author).toBe(originalAuthor);
        expect(updated.version).toBe(testBlueprint.version);
      });

      it("should ignore updates to non-existent blueprint", () => {
        const initialState = store.getState();

        store.actions.updateBlueprint("non-existent", {
          name: "Should not work",
        });

        const finalState = store.getState();
        expect(finalState).toEqual(initialState);
      });

      it("should handle partial updates correctly", () => {
        store.actions.updateBlueprint(testBlueprint.id, {
          name: "Only Name Changed",
        });

        const state = store.getState();
        const updated = state.blueprints.get(testBlueprint.id)!;

        expect(updated.name).toBe("Only Name Changed");
        expect(updated.description).toBe(testBlueprint.description); // Unchanged
        expect(updated.tags).toEqual(testBlueprint.tags); // Unchanged
      });
    });

    describe("Delete Blueprint", () => {
      beforeEach(() => {
        store.actions.addBlueprint(testBlueprint);
      });

      it("should remove blueprint from store", () => {
        store.actions.deleteBlueprint(testBlueprint.id);

        const state = store.getState();
        expect(state.blueprints.size).toBe(0);
        expect(state.blueprints.has(testBlueprint.id)).toBe(false);
      });

      it("should clear selected blueprint if deleted", () => {
        store.actions.selectBlueprint(testBlueprint.id);
        expect(store.getState().selectedBlueprintId).toBe(testBlueprint.id);

        store.actions.deleteBlueprint(testBlueprint.id);

        const state = store.getState();
        expect(state.selectedBlueprintId).toBeNull();
      });

      it("should not clear selected blueprint if different blueprint deleted", () => {
        const otherBlueprint = BlueprintMockFactory.createBlueprint({
          id: "other-blueprint",
        });
        store.actions.addBlueprint(otherBlueprint);
        store.actions.selectBlueprint(testBlueprint.id);

        store.actions.deleteBlueprint(otherBlueprint.id);

        const state = store.getState();
        expect(state.selectedBlueprintId).toBe(testBlueprint.id);
      });

      it("should ignore deletion of non-existent blueprint", () => {
        const initialState = store.getState();

        store.actions.deleteBlueprint("non-existent");

        const finalState = store.getState();
        expect(finalState).toEqual(initialState);
      });
    });

    describe("Clear All", () => {
      it("should reset to initial state", () => {
        // Add some data
        store.actions.addBlueprint(testBlueprint);
        store.actions.selectBlueprint(testBlueprint.id);
        store.actions.setSearchQuery("test query");
        store.actions.setFilterTags(["tag1", "tag2"]);

        store.actions.clearAll();

        const state = store.getState();
        expect(state.blueprints.size).toBe(0);
        expect(state.selectedBlueprintId).toBeNull();
        expect(state.searchQuery).toBe("");
        expect(state.filterTags).toEqual([]);
      });
    });
  });

  describe("Selection Management", () => {
    let blueprint1: Blueprint;
    let blueprint2: Blueprint;

    beforeEach(() => {
      blueprint1 = BlueprintMockFactory.createBlueprint({ id: "bp1" });
      blueprint2 = BlueprintMockFactory.createBlueprint({ id: "bp2" });
      store.actions.addBlueprint(blueprint1);
      store.actions.addBlueprint(blueprint2);
    });

    it("should select blueprint by ID", () => {
      store.actions.selectBlueprint(blueprint1.id);

      const state = store.getState();
      expect(state.selectedBlueprintId).toBe(blueprint1.id);
    });

    it("should clear selection", () => {
      store.actions.selectBlueprint(blueprint1.id);
      store.actions.selectBlueprint(null);

      const state = store.getState();
      expect(state.selectedBlueprintId).toBeNull();
    });

    it("should change selection", () => {
      store.actions.selectBlueprint(blueprint1.id);
      store.actions.selectBlueprint(blueprint2.id);

      const state = store.getState();
      expect(state.selectedBlueprintId).toBe(blueprint2.id);
    });

    it("should allow selecting non-existent blueprint ID", () => {
      // This is valid behavior - UI might select before blueprint is loaded
      store.actions.selectBlueprint("non-existent-id");

      const state = store.getState();
      expect(state.selectedBlueprintId).toBe("non-existent-id");
    });
  });

  describe("Search and Filter", () => {
    beforeEach(() => {
      const blueprints = [
        BlueprintMockFactory.createBlueprint({
          id: "bp1",
          name: "CSV Data Processor",
          description: "Processes CSV files",
          author: "John Doe",
          tags: ["csv", "data", "processing"],
        }),
        BlueprintMockFactory.createBlueprint({
          id: "bp2",
          name: "API Integration Flow",
          description: "Integrates with REST APIs",
          author: "Jane Smith",
          tags: ["api", "rest", "integration"],
        }),
        BlueprintMockFactory.createBlueprint({
          id: "bp3",
          name: "Data Validation Pipeline",
          description: "Validates incoming data",
          author: "John Doe",
          tags: ["data", "validation", "quality"],
        }),
      ];

      blueprints.forEach((bp) => store.actions.addBlueprint(bp));
    });

    describe("Search Query", () => {
      it("should set search query", () => {
        store.actions.setSearchQuery("data processing");

        const state = store.getState();
        expect(state.searchQuery).toBe("data processing");
      });

      it("should clear search query", () => {
        store.actions.setSearchQuery("test");
        store.actions.setSearchQuery("");

        const state = store.getState();
        expect(state.searchQuery).toBe("");
      });
    });

    describe("Filter Tags", () => {
      it("should set filter tags", () => {
        store.actions.setFilterTags(["data", "processing"]);

        const state = store.getState();
        expect(state.filterTags).toEqual(["data", "processing"]);
      });

      it("should clear filter tags", () => {
        store.actions.setFilterTags(["tag1", "tag2"]);
        store.actions.setFilterTags([]);

        const state = store.getState();
        expect(state.filterTags).toEqual([]);
      });
    });

    describe("Sort Settings", () => {
      it("should set sort by name ascending", () => {
        store.actions.setSortSettings("name", "asc");

        const state = store.getState();
        expect(state.sortBy).toBe("name");
        expect(state.sortDirection).toBe("asc");
      });

      it("should set sort by created descending", () => {
        store.actions.setSortSettings("created", "desc");

        const state = store.getState();
        expect(state.sortBy).toBe("created");
        expect(state.sortDirection).toBe("desc");
      });
    });
  });

  describe("UI State Management", () => {
    it("should set loading state", () => {
      store.actions.setLoading(true);

      let state = store.getState();
      expect(state.isLoading).toBe(true);

      store.actions.setLoading(false);

      state = store.getState();
      expect(state.isLoading).toBe(false);
    });

    it("should set error state", () => {
      const errorMessage = "Failed to load blueprints";
      store.actions.setError(errorMessage);

      let state = store.getState();
      expect(state.error).toBe(errorMessage);

      store.actions.setError(null);

      state = store.getState();
      expect(state.error).toBeNull();
    });

    it("should maintain error state independently of other operations", () => {
      store.actions.setError("Test error");
      store.actions.setSearchQuery("test");

      const state = store.getState();
      expect(state.error).toBe("Test error");
      expect(state.searchQuery).toBe("test");
    });
  });

  describe("Blueprint Selectors", () => {
    let testState: BlueprintState;
    let blueprints: Blueprint[];

    beforeEach(() => {
      blueprints = [
        BlueprintMockFactory.createBlueprint({
          id: "bp1",
          name: "Alpha Blueprint",
          author: "Alice",
          created: new Date("2024-01-01"),
          modified: new Date("2024-01-03"),
          tags: ["alpha", "test"],
        }),
        BlueprintMockFactory.createBlueprint({
          id: "bp2",
          name: "Beta Blueprint",
          author: "Bob",
          created: new Date("2024-01-02"),
          modified: new Date("2024-01-02"),
          tags: ["beta", "prod"],
        }),
        BlueprintMockFactory.createBlueprint({
          id: "bp3",
          name: "Gamma Blueprint",
          author: "Alice",
          created: new Date("2024-01-03"),
          modified: new Date("2024-01-01"),
          tags: ["gamma", "test", "alpha"],
        }),
      ];

      const blueprintMap = new Map<string, Blueprint>();
      blueprints.forEach((bp) => blueprintMap.set(bp.id, bp));

      testState = {
        blueprints: blueprintMap,
        selectedBlueprintId: "bp1",
        searchQuery: "",
        filterTags: [],
        sortBy: "name",
        sortDirection: "asc",
        isLoading: false,
        error: null,
      };
    });

    describe("getAllBlueprints", () => {
      it("should return all blueprints as array", () => {
        const result = BlueprintSelectors.getAllBlueprints(testState);

        expect(result).toHaveLength(3);
        expect(result).toEqual(expect.arrayContaining(blueprints));
      });

      it("should return empty array for empty state", () => {
        const emptyState: BlueprintState = {
          ...testState,
          blueprints: new Map(),
        };

        const result = BlueprintSelectors.getAllBlueprints(emptyState);
        expect(result).toEqual([]);
      });
    });

    describe("getSelectedBlueprint", () => {
      it("should return selected blueprint", () => {
        const result = BlueprintSelectors.getSelectedBlueprint(testState);

        expect(result).toEqual(blueprints[0]); // bp1
      });

      it("should return null when no selection", () => {
        const noSelectionState = {
          ...testState,
          selectedBlueprintId: null,
        };

        const result =
          BlueprintSelectors.getSelectedBlueprint(noSelectionState);
        expect(result).toBeNull();
      });

      it("should return null for invalid selection", () => {
        const invalidSelectionState = {
          ...testState,
          selectedBlueprintId: "non-existent",
        };

        const result = BlueprintSelectors.getSelectedBlueprint(
          invalidSelectionState,
        );
        expect(result).toBeNull();
      });
    });

    describe("getFilteredBlueprints", () => {
      it("should return all blueprints when no filters", () => {
        const result = BlueprintSelectors.getFilteredBlueprints(testState);

        expect(result).toHaveLength(3);
        // Should be sorted by name ascending
        expect(result[0].name).toBe("Alpha Blueprint");
        expect(result[1].name).toBe("Beta Blueprint");
        expect(result[2].name).toBe("Gamma Blueprint");
      });

      it("should filter by search query - name", () => {
        const searchState = {
          ...testState,
          searchQuery: "alpha",
        };

        const result = BlueprintSelectors.getFilteredBlueprints(searchState);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Alpha Blueprint");
      });

      it("should filter by search query - description", () => {
        // Assuming blueprints have descriptions
        blueprints[0].description = "Processes data efficiently";
        const blueprintMap = new Map<string, Blueprint>();
        blueprints.forEach((bp) => blueprintMap.set(bp.id, bp));

        const searchState = {
          ...testState,
          blueprints: blueprintMap,
          searchQuery: "efficiently",
        };

        const result = BlueprintSelectors.getFilteredBlueprints(searchState);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Alpha Blueprint");
      });

      it("should filter by search query - author", () => {
        const searchState = {
          ...testState,
          searchQuery: "alice",
        };

        const result = BlueprintSelectors.getFilteredBlueprints(searchState);

        expect(result).toHaveLength(2);
        expect(result.map((bp) => bp.author)).toEqual(["Alice", "Alice"]);
      });

      it("should filter by tags", () => {
        const tagFilterState = {
          ...testState,
          filterTags: ["test"],
        };

        const result = BlueprintSelectors.getFilteredBlueprints(tagFilterState);

        expect(result).toHaveLength(2);
        expect(result.every((bp) => bp.tags.includes("test"))).toBe(true);
      });

      it("should filter by multiple tags (AND logic)", () => {
        const multiTagFilterState = {
          ...testState,
          filterTags: ["test", "alpha"],
        };

        const result =
          BlueprintSelectors.getFilteredBlueprints(multiTagFilterState);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Gamma Blueprint");
      });

      it("should combine search and tag filters", () => {
        const combinedFilterState = {
          ...testState,
          searchQuery: "alice",
          filterTags: ["test"],
        };

        const result =
          BlueprintSelectors.getFilteredBlueprints(combinedFilterState);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Gamma Blueprint");
      });

      it("should sort by created date ascending", () => {
        const sortState = {
          ...testState,
          sortBy: "created" as const,
          sortDirection: "asc" as const,
        };

        const result = BlueprintSelectors.getFilteredBlueprints(sortState);

        expect(result[0].created).toEqual(new Date("2024-01-01"));
        expect(result[1].created).toEqual(new Date("2024-01-02"));
        expect(result[2].created).toEqual(new Date("2024-01-03"));
      });

      it("should sort by modified date descending", () => {
        const sortState = {
          ...testState,
          sortBy: "modified" as const,
          sortDirection: "desc" as const,
        };

        const result = BlueprintSelectors.getFilteredBlueprints(sortState);

        // bp1 modified: 2024-01-03, bp2 modified: 2024-01-02, bp3 modified: 2024-01-01
        expect(result[0].id).toBe("bp1");
        expect(result[1].id).toBe("bp2");
        expect(result[2].id).toBe("bp3");
      });

      it("should sort by author name", () => {
        const sortState = {
          ...testState,
          sortBy: "author" as const,
          sortDirection: "asc" as const,
        };

        const result = BlueprintSelectors.getFilteredBlueprints(sortState);

        // Alice, Alice, Bob
        expect(result[0].author).toBe("Alice");
        expect(result[1].author).toBe("Alice");
        expect(result[2].author).toBe("Bob");
      });
    });

    describe("getAllTags", () => {
      it("should return all unique tags sorted", () => {
        const result = BlueprintSelectors.getAllTags(testState);

        expect(result).toEqual(["alpha", "beta", "gamma", "prod", "test"]);
      });

      it("should handle empty blueprints", () => {
        const emptyState = {
          ...testState,
          blueprints: new Map(),
        };

        const result = BlueprintSelectors.getAllTags(emptyState);
        expect(result).toEqual([]);
      });

      it("should deduplicate tags", () => {
        // alpha and test appear in multiple blueprints
        const result = BlueprintSelectors.getAllTags(testState);

        expect(result.filter((tag) => tag === "alpha")).toHaveLength(1);
        expect(result.filter((tag) => tag === "test")).toHaveLength(1);
      });
    });
  });

  describe("Store Persistence", () => {
    it("should persist blueprint data", async () => {
      const testBlueprint = BlueprintMockFactory.createBlueprint();
      store.actions.addBlueprint(testBlueprint);
      store.actions.selectBlueprint(testBlueprint.id);

      // Wait for persistence
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create new store to test hydration
      const newStore = createBlueprintStore();
      const hydratedState = newStore.getState();

      expect(hydratedState.blueprints.size).toBe(1);
      expect(hydratedState.blueprints.get(testBlueprint.id)).toMatchObject({
        id: testBlueprint.id,
        name: testBlueprint.name,
        description: testBlueprint.description,
      });
      expect(hydratedState.selectedBlueprintId).toBe(testBlueprint.id);
    });

    it("should not persist UI state", async () => {
      const testBlueprint = BlueprintMockFactory.createBlueprint();
      store.actions.addBlueprint(testBlueprint);
      store.actions.setSearchQuery("should not persist");
      store.actions.setLoading(true);
      store.actions.setError("should not persist");

      await new Promise((resolve) => setTimeout(resolve, 100));

      const newStore = createBlueprintStore();
      const hydratedState = newStore.getState();

      // Should persist blueprint data and selection
      expect(hydratedState.blueprints.size).toBe(1);

      // Should NOT persist UI state
      expect(hydratedState.searchQuery).toBe("");
      expect(hydratedState.isLoading).toBe(false);
      expect(hydratedState.error).toBeNull();
    });
  });

  describe("Subscription Behavior", () => {
    TestPatterns.testSubscriptions(store, (store: BlueprintStore) => {
      const testBlueprint = BlueprintMockFactory.createBlueprint();
      store.actions.addBlueprint(testBlueprint);
    });

    it("should notify on blueprint changes", () => {
      const mockCallback = vi.fn();
      const unsubscribe = store.subscribe(mockCallback);

      const testBlueprint = BlueprintMockFactory.createBlueprint();

      store.actions.addBlueprint(testBlueprint);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      store.actions.updateBlueprint(testBlueprint.id, { name: "Updated" });
      expect(mockCallback).toHaveBeenCalledTimes(2);

      store.actions.deleteBlueprint(testBlueprint.id);
      expect(mockCallback).toHaveBeenCalledTimes(3);

      unsubscribe();
    });

    it("should notify on search and filter changes", () => {
      const mockCallback = vi.fn();
      const unsubscribe = store.subscribe(mockCallback);

      store.actions.setSearchQuery("test");
      expect(mockCallback).toHaveBeenCalledTimes(1);

      store.actions.setFilterTags(["tag1"]);
      expect(mockCallback).toHaveBeenCalledTimes(2);

      store.actions.setSortSettings("name", "asc");
      expect(mockCallback).toHaveBeenCalledTimes(3);

      unsubscribe();
    });
  });

  describe("Immutability and Pure Functions", () => {
    it("should maintain state immutability", () => {
      const testBlueprint = BlueprintMockFactory.createBlueprint();
      store.actions.addBlueprint(testBlueprint);

      const state1 = store.getState();
      const blueprints1 = state1.blueprints;

      store.actions.updateBlueprint(testBlueprint.id, { name: "Updated" });

      const state2 = store.getState();
      const blueprints2 = state2.blueprints;

      // State objects should be different
      expect(state1).not.toBe(state2);
      expect(blueprints1).not.toBe(blueprints2);

      // Original state should be unchanged
      expect(state1.blueprints.get(testBlueprint.id)!.name).toBe(
        testBlueprint.name,
      );
      expect(state2.blueprints.get(testBlueprint.id)!.name).toBe("Updated");
    });

    it("should ensure selectors are pure functions", () => {
      const testState = BlueprintMockFactory.createBlueprintState();

      // Multiple calls with same state should return same result
      const result1 = BlueprintSelectors.getAllBlueprints(testState);
      const result2 = BlueprintSelectors.getAllBlueprints(testState);
      const result3 = BlueprintSelectors.getFilteredBlueprints(testState);
      const result4 = BlueprintSelectors.getFilteredBlueprints(testState);

      expect(result1).toEqual(result2);
      expect(result3).toEqual(result4);

      // Original state should not be modified
      expect(testState).toEqual(BlueprintMockFactory.createBlueprintState());
    });
  });
});
