/**
 * UI Store - Functional state management for UI
 */

import { createStore, createActions, createSelectors } from "../../base";
import type { Store } from "../../base";
import type { UIState, Theme, Notification } from "./types";

export * from "./types";

// Initial state
const initialState: UIState = {
  preferences: {
    theme: "auto",
    colorScheme: "default",
    layoutMode: "comfortable",
    sidebarWidth: 240,
    sidebarCollapsed: false,
    showMinimap: true,
    showGrid: true,
    snapToGrid: false,
    gridSize: 20,
    autoSave: true,
    autoSaveInterval: 5,
    fontSize: 14,
    fontFamily: "Inter",
    animations: true,
    soundEffects: false,
  },
  activeModal: null,
  modalStack: [],
  notifications: [],
  panelStates: new Map(),
  globalLoading: false,
  globalError: null,
};

// Actions
const actions = {
  setTheme: (state: UIState, theme: Theme) => {
    state.preferences.theme = theme;
  },

  showNotification: (
    state: UIState,
    notification: Omit<Notification, "id" | "timestamp">,
  ): string => {
    const id = `notification-${Date.now()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
    };
    state.notifications.push(newNotification);
    return id;
  },

  dismissNotification: (state: UIState, id: string) => {
    const index = state.notifications.findIndex((n) => n.id === id);
    if (index >= 0) {
      state.notifications.splice(index, 1);
    }
  },
};

// Selectors
const selectors = {
  getTheme: (state: UIState) => state.preferences.theme,
  getNotifications: (state: UIState) => state.notifications,
};

// Store type
export type UIStore = Store<UIState> & {
  actions: ReturnType<typeof createActions<UIState, typeof actions>>;
  selectors: ReturnType<typeof createSelectors<UIState, typeof selectors>>;
};

// Create store
export function createUIStore(): UIStore {
  const store = createStore<UIState>({
    initialState,
    persist: {
      key: "ui-preferences",
      partialize: (state) => ({ preferences: state.preferences }),
    },
  });

  return {
    ...store,
    actions: createActions(store, actions),
    selectors: createSelectors(store, selectors),
  };
}
