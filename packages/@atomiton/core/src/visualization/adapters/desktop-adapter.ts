/**
 * Desktop Visualization Adapter
 *
 * Desktop/Electron-specific implementation of the visualization adapter
 */

import { ThemeInjector } from "./theme-injector";
import type {
  VisualizationAdapter,
  AdapterCapabilities,
  ThemeDefinition,
} from "./types";

// Type declaration for Electron window context
interface ElectronWindow extends Window {
  electron?: {
    ipcRenderer?: {
      send: (channel: string, ...args: unknown[]) => void;
    };
  };
}

export class DesktopAdapter implements VisualizationAdapter {
  readonly name = "desktop";
  readonly capabilities: AdapterCapabilities = {
    supportsCSS: true,
    supportsCSSVariables: true,
    supportsStyleSheets: true,
    supportsInlineStyles: true,
    supportsThemeEvents: true,
  };

  private isInitialized = false;
  private themeInjector = ThemeInjector.getInstance();
  private currentTheme: ThemeDefinition | null = null;

  async initialize(): Promise<void> {
    // In Electron/desktop environment, we might have additional setup
    // For now, we'll use the same approach as browser but with potential
    // desktop-specific enhancements

    this.isInitialized = true;
  }

  async injectTheme(theme: ThemeDefinition): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Adapter not initialized");
    }

    await this.themeInjector.injectTheme(theme);
    this.currentTheme = theme;

    // In desktop/Electron, we might also send theme to main process
    if (typeof window !== "undefined" && (window as ElectronWindow).electron) {
      try {
        const electronWindow = window as ElectronWindow;
        if (electronWindow.electron?.ipcRenderer) {
          electronWindow.electron.ipcRenderer.send("theme-change", theme);
        }
      } catch (error) {
        console.warn("Failed to notify main process of theme change:", error);
      }
    }

    // Dispatch theme change event
    if (typeof document !== "undefined") {
      document.dispatchEvent(
        new CustomEvent("theme-change", {
          detail: { theme, adapter: this.name },
        }),
      );
    }
  }

  async removeTheme(themeName?: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Adapter not initialized");
    }

    if (themeName) {
      await this.themeInjector.removeTheme(themeName);
      if (this.currentTheme?.name === themeName) {
        this.currentTheme = null;
      }
    } else if (this.currentTheme) {
      await this.themeInjector.removeTheme(this.currentTheme.name);
      this.currentTheme = null;
    }
  }

  getCurrentTheme(): ThemeDefinition | null {
    return this.currentTheme;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  dispose(): void {
    if (this.currentTheme) {
      this.themeInjector.removeTheme(this.currentTheme.name);
    }
    this.currentTheme = null;
    this.isInitialized = false;
  }
}
