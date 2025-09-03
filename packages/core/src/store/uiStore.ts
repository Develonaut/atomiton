/**
 * UI Store - State management for UI preferences and settings
 * Manages theme, layout, modals, and notifications
 */

import { storeClient } from "../clients/StoreClient";
import type { ZustandStore, StateUpdater } from "../clients/StoreClient";

export type Theme = "light" | "dark" | "auto";
export type ColorScheme = "default" | "dracula" | "monokai" | "solarized";
export type LayoutMode = "compact" | "comfortable" | "spacious";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  duration?: number; // ms, 0 for persistent
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface Modal {
  id: string;
  type: string;
  title: string;
  props?: Record<string, unknown>;
  onClose?: () => void;
}

export interface UIPreferences {
  theme: Theme;
  colorScheme: ColorScheme;
  layoutMode: LayoutMode;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  showMinimap: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  fontSize: number;
  fontFamily: string;
  animations: boolean;
  soundEffects: boolean;
}

export interface PanelState {
  visible: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  minimized?: boolean;
}

export interface UIState {
  // Persistent preferences
  preferences: UIPreferences;

  // Temporary UI state
  activeModal: Modal | null;
  modalStack: Modal[];
  notifications: Notification[];

  // Panel states
  panelStates: Map<
    string,
    {
      visible: boolean;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      minimized?: boolean;
    }
  >;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
}

// Default preferences
const defaultPreferences: UIPreferences = {
  theme: "dark",
  colorScheme: "dracula",
  layoutMode: "comfortable",
  sidebarWidth: 250,
  sidebarCollapsed: false,
  showMinimap: true,
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
  autoSave: true,
  autoSaveInterval: 5,
  fontSize: 14,
  fontFamily: "JetBrains Mono",
  animations: true,
  soundEffects: false,
};

// Initial state
const initialUIState: UIState = {
  preferences: defaultPreferences,
  activeModal: null,
  modalStack: [],
  notifications: [],
  panelStates: new Map(),
  globalLoading: false,
  loadingMessage: null,
};

/**
 * Create the UI store
 */
export function createUIStore(): UIStore {
  const zustandStore = storeClient.createZustandStore<UIState>({
    initialState: initialUIState,
    persist: true,
    persistKey: "ui-preferences",
    persistDebounce: 500,

    // Only persist preferences and panel states
    persistFilter: (state: UIState): Partial<UIState> => ({
      preferences: state.preferences,
      panelStates: new Map(Array.from(state.panelStates.entries())),
    }),

    // Restore persisted data
    hydrateTransform: (persisted) => ({
      ...initialUIState,
      preferences: {
        ...defaultPreferences,
        ...(persisted as { preferences?: Partial<UIPreferences> }).preferences,
      },
      panelStates: new Map(
        (persisted as { panelStates?: Array<[string, PanelState]> })
          ?.panelStates || [],
      ),
    }),
  });

  return new UIStore(zustandStore);
}

/**
 * UI Store wrapper class
 */
export class UIStore {
  private zustandStore: ZustandStore<UIState>;
  public actions: UIActions;

  constructor(zustandStore: ZustandStore<UIState>) {
    this.zustandStore = zustandStore;
    this.actions = new UIActions(this);
  }

  /**
   * Get current state
   */
  getState(): UIState {
    return this.zustandStore.getState();
  }

  /**
   * Update state
   */
  setState(updater: StateUpdater<UIState>): void {
    this.zustandStore.setState(updater);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: UIState) => void): () => void {
    return this.zustandStore.subscribe(callback);
  }
}

/**
 * UI store actions
 */
export class UIActions {
  private store: UIStore;

  constructor(store: UIStore) {
    this.store = store;
  }

  /**
   * Update UI preferences
   */
  updatePreferences(updates: Partial<UIPreferences>): void {
    this.store.setState((state) => ({
      ...state,
      preferences: {
        ...state.preferences,
        ...updates,
      },
    }));
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    this.updatePreferences({ theme });
  }

  /**
   * Set color scheme
   */
  setColorScheme(colorScheme: ColorScheme): void {
    this.updatePreferences({ colorScheme });
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar(): void {
    this.store.setState((state) => ({
      ...state,
      preferences: {
        ...state.preferences,
        sidebarCollapsed: !state.preferences.sidebarCollapsed,
      },
    }));
  }

  /**
   * Show modal
   */
  showModal(modal: Omit<Modal, "id">): string {
    const id = `modal-${Date.now()}`;
    const fullModal: Modal = { ...modal, id };

    this.store.setState((state) => ({
      ...state,
      activeModal: fullModal,
      modalStack: [...state.modalStack, fullModal],
    }));

    return id;
  }

  /**
   * Close modal
   */
  closeModal(id?: string): void {
    this.store.setState((state) => {
      const modalStack = id
        ? state.modalStack.filter((m) => m.id !== id)
        : state.modalStack.slice(0, -1);

      return {
        ...state,
        activeModal: modalStack[modalStack.length - 1] || null,
        modalStack,
      };
    });
  }

  /**
   * Show notification
   */
  showNotification(
    notification: Omit<Notification, "id" | "timestamp">,
  ): string {
    const id = `notification-${Date.now()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
    };

    this.store.setState((state) => ({
      ...state,
      notifications: [...state.notifications, fullNotification],
    }));

    // Auto-remove after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }

    return id;
  }

  /**
   * Remove notification
   */
  removeNotification(id: string): void {
    this.store.setState((state) => ({
      ...state,
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.store.setState((state) => ({
      ...state,
      notifications: [],
    }));
  }

  /**
   * Update panel state
   */
  updatePanelState(
    panelId: string,
    updates: Partial<
      UIState["panelStates"] extends Map<string, infer V> ? V : never
    >,
  ): void {
    this.store.setState((state) => {
      const newPanelStates = new Map(state.panelStates);
      const currentState = newPanelStates.get(panelId) || { visible: true };

      newPanelStates.set(panelId, {
        ...currentState,
        ...updates,
      });

      return {
        ...state,
        panelStates: newPanelStates,
      };
    });
  }

  /**
   * Set global loading state
   */
  setGlobalLoading(loading: boolean, message?: string): void {
    this.store.setState((state) => ({
      ...state,
      globalLoading: loading,
      loadingMessage: message || null,
    }));
  }

  /**
   * Reset preferences to defaults
   */
  resetPreferences(): void {
    this.store.setState((state) => ({
      ...state,
      preferences: defaultPreferences,
    }));
  }
}

/**
 * UI store selectors
 */
export class UISelectors {
  /**
   * Get current theme (resolved)
   */
  static getResolvedTheme(state: UIState): "light" | "dark" {
    if (state.preferences.theme === "auto") {
      // Check system preference
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return "dark"; // Default to dark
    }
    return state.preferences.theme;
  }

  /**
   * Get visible notifications
   */
  static getVisibleNotifications(state: UIState, limit = 5): Notification[] {
    return state.notifications.slice(-limit);
  }

  /**
   * Get panel visibility
   */
  static isPanelVisible(state: UIState, panelId: string): boolean {
    return state.panelStates.get(panelId)?.visible ?? true;
  }

  /**
   * Check if any modal is open
   */
  static hasOpenModal(state: UIState): boolean {
    return state.activeModal !== null;
  }

  /**
   * Get CSS variables for current theme
   */
  static getThemeVariables(state: UIState): Record<string, string> {
    const theme = UISelectors.getResolvedTheme(state);
    // Using colorScheme from preferences for theme variables

    // Import these from @atomiton/theme when needed
    // For now, using the Dracula theme colors as default
    // This would return theme-specific CSS variables
    // Implementation depends on your theme system
    return {
      "--background":
        theme === "dark"
          ? "var(--color-background)"
          : "var(--color-foreground)",
      "--foreground":
        theme === "dark"
          ? "var(--color-foreground)"
          : "var(--color-background)",
      // ... more variables
    };
  }
}
