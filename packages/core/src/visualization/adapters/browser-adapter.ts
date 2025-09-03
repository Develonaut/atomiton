/**
 * Browser Visualization Adapter
 *
 * Browser-specific implementation of the visualization adapter
 */

import { ThemeInjector } from "./theme-injector";
import type {
  VisualizationAdapter,
  AdapterCapabilities,
  ThemeDefinition,
} from "./types";

export class BrowserAdapter implements VisualizationAdapter {
  readonly name = "browser";
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
    if (typeof document === "undefined") {
      throw new Error(
        "BrowserAdapter requires a browser environment with document",
      );
    }

    this.isInitialized = true;
  }

  async injectTheme(theme: ThemeDefinition): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Adapter not initialized");
    }

    await this.themeInjector.injectTheme(theme);
    this.currentTheme = theme;

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
    return this.isInitialized && typeof document !== "undefined";
  }

  dispose(): void {
    if (this.currentTheme) {
      this.themeInjector.removeTheme(this.currentTheme.name);
    }
    this.currentTheme = null;
    this.isInitialized = false;
  }
}
