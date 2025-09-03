/**
 * UI Store Tests
 * Testing UI state management including themes, notifications, modals, and preferences
 * Following Brian's testing strategy for pure functions and clean state management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { createUIStore, UIActions, UISelectors } from "../../store/uiStore";
import type { Theme, UIStore } from "../../store/uiStore";
import { UIMockFactory } from "../helpers/store-mocks";
import { StoreTestFactory, TestPatterns } from "../helpers/store-test-utils";

describe("UI Store", () => {
  let store: UIStore;
  let storeFactory: StoreTestFactory;

  beforeEach(async () => {
    storeFactory = new StoreTestFactory();
    await storeFactory.initializeStoreClient();
    store = createUIStore();
    UIMockFactory.resetCounter();
  });

  afterEach(async () => {
    await storeFactory.cleanup();
  });

  describe("Store Creation and Initialization", () => {
    it("should create store with correct initial state", () => {
      const initialState = store.getState();

      expect(initialState).toMatchObject({
        preferences: expect.objectContaining({
          theme: expect.any(String),
          colorScheme: expect.any(String),
          layoutMode: expect.any(String),
        }),
        activeModal: null,
        modalStack: [],
        notifications: [],
        panelStates: expect.any(Map),
        globalLoading: false,
        loadingMessage: null,
      });
    });

    it("should have actions instance", () => {
      expect(store.actions).toBeInstanceOf(UIActions);
    });
  });

  describe("Theme Management", () => {
    it("should set theme mode", () => {
      store.actions.setTheme("light");

      const state = store.getState();
      expect(state.preferences.theme).toBe("light");
    });

    it("should toggle sidebar", () => {
      const initialCollapsed = store.getState().preferences.sidebarCollapsed;

      store.actions.toggleSidebar();

      const afterToggle = store.getState().preferences.sidebarCollapsed;
      expect(afterToggle).not.toBe(initialCollapsed);

      store.actions.toggleSidebar();

      const afterSecondToggle = store.getState().preferences.sidebarCollapsed;
      expect(afterSecondToggle).toBe(initialCollapsed);
    });

    it("should set color scheme", () => {
      store.actions.setColorScheme("monokai");

      const state = store.getState();
      expect(state.preferences.colorScheme).toBe("monokai");
    });

    it("should update theme preference", () => {
      store.actions.setTheme("auto");

      const state = store.getState();
      expect(state.preferences.theme).toBe("auto");
    });
  });

  describe("Preferences Management", () => {
    it("should update preferences", () => {
      const newPreferences = {
        autoSave: false,
        autoSaveInterval: 60000,
        showLineNumbers: false,
        wordWrap: false,
        fontSize: 16,
        fontFamily: "Consolas",
      };

      store.actions.updatePreferences(newPreferences);

      const state = store.getState();
      expect(state.preferences).toMatchObject(newPreferences);
    });

    it("should update individual preference", () => {
      store.actions.updatePreferences({ fontSize: 18 });

      const state = store.getState();
      expect(state.preferences.fontSize).toBe(18);
      // Other preferences should remain unchanged
      expect(state.preferences.autoSave).toBeDefined();
    });
  });

  describe("Panel Management", () => {
    it("should update panel state", () => {
      store.actions.updatePanelState("test-panel", {
        visible: true,
        position: { x: 100, y: 200 },
        size: { width: 300, height: 400 },
      });

      const state = store.getState();
      const panelState = state.panelStates.get("test-panel");
      expect(panelState).toMatchObject({
        visible: true,
        position: { x: 100, y: 200 },
        size: { width: 300, height: 400 },
      });
    });

    it("should update panel visibility", () => {
      store.actions.updatePanelState("test-panel", { visible: true });

      let state = store.getState();
      expect(state.panelStates.get("test-panel")?.visible).toBe(true);

      store.actions.updatePanelState("test-panel", { visible: false });

      state = store.getState();
      expect(state.panelStates.get("test-panel")?.visible).toBe(false);
    });
  });

  describe("Notification Management", () => {
    it("should show notification", () => {
      const notificationId = store.actions.showNotification({
        type: "success",
        title: "Test Success",
        message: "Operation completed",
        duration: 5000,
      });

      const state = store.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]).toMatchObject({
        id: notificationId,
        type: "success",
        title: "Test Success",
        message: "Operation completed",
        duration: 5000,
      });
      expect(state.notifications[0].timestamp).toBeInstanceOf(Date);
    });

    it("should generate unique notification IDs", () => {
      const id1 = store.actions.showNotification({
        type: "info",
        title: "First",
      });

      const id2 = store.actions.showNotification({
        type: "info",
        title: "Second",
      });

      expect(id1).not.toBe(id2);

      const state = store.getState();
      expect(state.notifications).toHaveLength(2);
    });

    it("should dismiss notification", () => {
      const notificationId = store.actions.showNotification({
        type: "info",
        title: "To be dismissed",
      });

      let state = store.getState();
      expect(state.notifications).toHaveLength(1);

      store.actions.removeNotification(notificationId);

      state = store.getState();
      expect(state.notifications).toHaveLength(0);
    });

    it("should ignore dismissing non-existent notification", () => {
      store.actions.showNotification({
        type: "info",
        title: "Existing",
      });

      const initialState = store.getState();

      store.actions.removeNotification("non-existent-id");

      const finalState = store.getState();
      expect(finalState.notifications).toEqual(initialState.notifications);
    });

    it("should clear all notifications", () => {
      // Add multiple notifications
      store.actions.showNotification({ type: "info", title: "Info 1" });
      store.actions.showNotification({ type: "warning", title: "Warning 1" });
      store.actions.showNotification({ type: "error", title: "Error 1" });

      let state = store.getState();
      expect(state.notifications).toHaveLength(3);

      store.actions.clearNotifications();

      state = store.getState();
      expect(state.notifications).toHaveLength(0);
    });

    it("should handle notification auto-dismiss with timer", async () => {
      vi.useFakeTimers();

      store.actions.showNotification({
        type: "info",
        title: "Auto dismiss",
        duration: 1000,
      });

      let state = store.getState();
      expect(state.notifications).toHaveLength(1);

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // Wait for next tick
      await vi.runAllTimersAsync();

      state = store.getState();
      expect(state.notifications).toHaveLength(0);

      vi.useRealTimers();
    });
  });

  describe("Modal Management", () => {
    it("should show modal", () => {
      const modal = {
        type: "confirmation",
        title: "Confirm Delete",
        props: {
          message: "Are you sure you want to delete this item?",
        },
      };

      const modalId = store.actions.showModal(modal);

      const state = store.getState();
      expect(state.modalStack).toHaveLength(1);
      expect(state.activeModal).toMatchObject({
        id: modalId,
        ...modal,
      });
    });

    it("should dismiss modal", () => {
      const modalId = store.actions.showModal({
        type: "info",
        title: "Info Modal",
        props: { message: "Some information" },
      });

      let state = store.getState();
      expect(state.modalStack).toHaveLength(1);

      store.actions.closeModal(modalId);

      state = store.getState();
      expect(state.modalStack).toHaveLength(0);
    });

    it("should handle multiple modals (stack)", () => {
      const modal1Id = store.actions.showModal({
        type: "info",
        title: "First Modal",
        props: { message: "First" },
      });

      const modal2Id = store.actions.showModal({
        type: "confirmation",
        title: "Second Modal",
        props: { message: "Second" },
      });

      const state = store.getState();
      expect(state.modalStack).toHaveLength(2);
      expect(state.modalStack[0].id).toBe(modal1Id);
      expect(state.modalStack[1].id).toBe(modal2Id);
    });

    it("should dismiss latest modal", () => {
      const modal1Id = store.actions.showModal({
        type: "info",
        title: "First Modal",
        props: { message: "First" },
      });

      store.actions.showModal({
        type: "info",
        title: "Second Modal",
        props: { message: "Second" },
      });

      store.actions.closeModal();

      const state = store.getState();
      expect(state.modalStack).toHaveLength(1);
      expect(state.modalStack[0].id).toBe(modal1Id);
    });
  });

  describe("Loading State Management", () => {
    it("should set global loading state", () => {
      store.actions.setGlobalLoading(true, "Loading data...");

      let state = store.getState();
      expect(state.globalLoading).toBe(true);
      expect(state.loadingMessage).toBe("Loading data...");

      store.actions.setGlobalLoading(false);

      state = store.getState();
      expect(state.globalLoading).toBe(false);
      expect(state.loadingMessage).toBeNull();
    });

    it("should handle loading message", () => {
      store.actions.setGlobalLoading(true, "Saving blueprint...");

      const state = store.getState();
      expect(state.globalLoading).toBe(true);
      expect(state.loadingMessage).toBe("Saving blueprint...");
    });
  });

  describe("UI Selectors", () => {
    describe("getVisibleNotifications", () => {
      it("should return limited notifications", () => {
        // Add 10 notifications
        for (let i = 0; i < 10; i++) {
          store.actions.showNotification({ type: "info", title: `Info ${i}` });
        }

        const state = store.getState();
        const visibleNotifications = UISelectors.getVisibleNotifications(
          state,
          5,
        );

        expect(visibleNotifications).toHaveLength(5);
        // Should return the latest 5
        expect(visibleNotifications[0].title).toBe("Info 5");
        expect(visibleNotifications[4].title).toBe("Info 9");
      });
    });

    describe("hasOpenModal", () => {
      it("should return true when modal is open", () => {
        store.actions.showModal({
          type: "info",
          title: "Test Modal",
        });

        const state = store.getState();
        const hasModal = UISelectors.hasOpenModal(state);

        expect(hasModal).toBe(true);
      });

      it("should return false when no modals", () => {
        const state = store.getState();
        const hasModal = UISelectors.hasOpenModal(state);

        expect(hasModal).toBe(false);
      });
    });

    describe("isOperationLoading", () => {
      it("should return true for loading operation", () => {
        store.actions.setOperationLoading("test-operation", true);

        const state = store.getState();
        const isLoading = UISelectors.isOperationLoading(
          state,
          "test-operation",
        );

        expect(isLoading).toBe(true);
      });

      it("should return false for non-loading operation", () => {
        const state = store.getState();
        const isLoading = UISelectors.isOperationLoading(
          state,
          "non-existent-operation",
        );

        expect(isLoading).toBe(false);
      });
    });

    describe("isPanelVisible", () => {
      it("should return panel visibility", () => {
        store.actions.updatePanelState("test-panel", { visible: false });

        const state = store.getState();
        const isVisible = UISelectors.isPanelVisible(state, "test-panel");

        expect(isVisible).toBe(false);
      });

      it("should return true for unknown panels by default", () => {
        const state = store.getState();
        const isVisible = UISelectors.isPanelVisible(state, "unknown-panel");

        expect(isVisible).toBe(true);
      });
    });
  });

  describe("Store Persistence", () => {
    it("should persist theme and preferences", async () => {
      const newTheme: Theme = "light";

      const customPreferences = {
        autoSave: false,
        autoSaveInterval: 60000,
        showLineNumbers: false,
        wordWrap: false,
        fontSize: 18,
        fontFamily: "Consolas",
      };

      store.actions.setTheme(newTheme);
      store.actions.updatePreferences(customPreferences);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create new store to test hydration
      const newStore = createUIStore();
      const hydratedState = newStore.getState();

      expect(hydratedState.preferences.theme).toEqual(newTheme);
      expect(hydratedState.preferences).toMatchObject(customPreferences);
    });

    it("should not persist temporary UI state", async () => {
      store.actions.showNotification({
        type: "info",
        title: "Should not persist",
      });
      store.actions.showModal({ type: "info", title: "Should not persist" });
      store.actions.setGlobalLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const newStore = createUIStore();
      const hydratedState = newStore.getState();

      expect(hydratedState.notifications).toEqual([]);
      expect(hydratedState.modalStack).toEqual([]);
      expect(hydratedState.activeModal).toBeNull();
      expect(hydratedState.globalLoading).toBe(false);
    });
  });

  describe("Subscription Behavior", () => {
    TestPatterns.testSubscriptions(store, (store: UIStore) => {
      store.actions.setTheme("light");
    });

    it("should notify on all UI state changes", () => {
      const mockCallback = vi.fn();
      const unsubscribe = store.subscribe(mockCallback);

      store.actions.setTheme("light");
      expect(mockCallback).toHaveBeenCalledTimes(1);

      store.actions.showNotification({ type: "info", title: "Test" });
      expect(mockCallback).toHaveBeenCalledTimes(2);

      store.actions.toggleSidebar();
      expect(mockCallback).toHaveBeenCalledTimes(3);

      store.actions.setGlobalLoading(true);
      expect(mockCallback).toHaveBeenCalledTimes(4);

      unsubscribe();
    });
  });

  describe("Immutability and Pure Functions", () => {
    it("should maintain state immutability", () => {
      const state1 = store.getState();

      store.actions.setTheme("light");

      const state2 = store.getState();

      // States should be different objects
      expect(state1).not.toBe(state2);
      expect(state1.preferences).not.toBe(state2.preferences);

      // Original state should be unchanged
      expect(state1.preferences.theme).not.toBe("light");
      expect(state2.preferences.theme).toBe("light");
    });

    it("should ensure Map immutability for panel states", () => {
      const state1 = store.getState();
      const panelStates1 = state1.panelStates;

      store.actions.updatePanelState("test-panel", { visible: true });

      const state2 = store.getState();
      const panelStates2 = state2.panelStates;

      // Maps should be different objects
      expect(panelStates1).not.toBe(panelStates2);

      // Original map should be unchanged
      expect(panelStates1.has("test-panel")).toBe(false);
      expect(panelStates2.has("test-panel")).toBe(true);
    });

    it("should ensure selectors are pure functions", () => {
      store.actions.showNotification({ type: "info", title: "Test 1" });
      store.actions.showNotification({ type: "error", title: "Test 2" });

      const state = store.getState();

      // Multiple calls should return same results
      const result1 = UISelectors.getVisibleNotifications(state);
      const result2 = UISelectors.getVisibleNotifications(state);
      const result3 = UISelectors.getVisibleNotifications(state, 3);
      const result4 = UISelectors.getVisibleNotifications(state, 3);

      expect(result1).toEqual(result2);
      expect(result3).toEqual(result4);

      // Original state should not be modified
      expect(state.notifications).toHaveLength(2);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle invalid theme mode gracefully", () => {
      // Try to set invalid mode (should not crash)
      store.actions.setTheme("invalid-mode" as any);

      const newState = store.getState();
      // Implementation should handle this appropriately
      expect(newState.preferences.theme).toBeDefined();
    });

    it("should handle notification with no duration", () => {
      const notificationId = store.actions.showNotification({
        type: "info",
        title: "No duration",
        // No duration specified
      });

      const state = store.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].id).toBe(notificationId);
    });

    it("should handle empty modal content", () => {
      const modalId = store.actions.showModal({
        type: "info",
        title: "Empty Content",
        props: {},
      });

      const state = store.getState();
      expect(state.modalStack).toHaveLength(1);
      expect(state.modalStack[0].id).toBe(modalId);
    });

    it("should handle rapid state updates efficiently", () => {
      const startTime = Date.now();

      // Perform many rapid updates
      for (let i = 0; i < 100; i++) {
        store.actions.updatePanelState(`panel-${i}`, { visible: true });
      }

      const endTime = Date.now();
      const state = store.getState();

      expect(state.panelStates.size).toBe(100);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});
