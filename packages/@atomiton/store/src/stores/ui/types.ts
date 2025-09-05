/**
 * UI Store Types
 */

export type Theme = "light" | "dark" | "auto";
export type ColorScheme = "default" | "dracula" | "monokai" | "solarized";
export type LayoutMode = "compact" | "comfortable" | "spacious";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  duration?: number;
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
  autoSaveInterval: number;
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
  preferences: UIPreferences;
  activeModal: Modal | null;
  modalStack: Modal[];
  notifications: Notification[];
  panelStates: Map<string, PanelState>;
  globalLoading: boolean;
  globalError: string | null;
}
