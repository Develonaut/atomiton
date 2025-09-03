/**
 * Theme Injection System
 *
 * Core theme injection utilities that work across different platforms
 */

import type { ThemeDefinition } from "./types";

/**
 * Convert theme variables to CSS custom properties
 */
export function themeToCSSVariables(theme: ThemeDefinition): string {
  const cssVars = Object.entries(theme.variables)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join("\n");

  return `:root {\n${cssVars}\n}`;
}

/**
 * Convert theme variables to CSS-in-JS object
 */
export function themeToCSSObject(
  theme: ThemeDefinition,
): Record<string, string | number> {
  const cssObject: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(theme.variables)) {
    cssObject[`--${key}`] = value;
  }

  return cssObject;
}

/**
 * Create a theme stylesheet element
 */
export function createThemeStylesheet(
  theme: ThemeDefinition,
): HTMLStyleElement {
  const styleEl = document.createElement("style");
  styleEl.id = `theme-${theme.name}`;
  styleEl.setAttribute("data-theme", theme.name);
  styleEl.textContent = themeToCSSVariables(theme);
  return styleEl;
}

/**
 * Inject theme variables into document head
 */
export function injectThemeIntoHead(theme: ThemeDefinition): HTMLStyleElement {
  const existing = document.getElementById(`theme-${theme.name}`);
  if (existing) {
    existing.remove();
  }

  const styleEl = createThemeStylesheet(theme);
  document.head.appendChild(styleEl);
  return styleEl;
}

/**
 * Remove theme from document head
 */
export function removeThemeFromHead(themeName: string): boolean {
  const existing = document.getElementById(`theme-${themeName}`);
  if (existing) {
    existing.remove();
    return true;
  }
  return false;
}

/**
 * Get all active theme stylesheets
 */
export function getActiveThemes(): string[] {
  const themeElements = document.querySelectorAll("style[data-theme]");
  return Array.from(themeElements).map((el) => el.getAttribute("data-theme")!);
}

/**
 * Theme injection utilities for different environments
 */
export class ThemeInjector {
  private static instance: ThemeInjector;
  private activeThemes = new Map<string, ThemeDefinition>();

  static getInstance(): ThemeInjector {
    if (!ThemeInjector.instance) {
      ThemeInjector.instance = new ThemeInjector();
    }
    return ThemeInjector.instance;
  }

  async injectTheme(theme: ThemeDefinition): Promise<void> {
    if (typeof document !== "undefined") {
      injectThemeIntoHead(theme);
      this.activeThemes.set(theme.name, theme);
    }
  }

  async removeTheme(themeName: string): Promise<void> {
    if (typeof document !== "undefined") {
      removeThemeFromHead(themeName);
      this.activeThemes.delete(themeName);
    }
  }

  getCurrentThemes(): ThemeDefinition[] {
    return Array.from(this.activeThemes.values());
  }

  getTheme(name: string): ThemeDefinition | undefined {
    return this.activeThemes.get(name);
  }

  clearAllThemes(): void {
    if (typeof document !== "undefined") {
      for (const themeName of this.activeThemes.keys()) {
        removeThemeFromHead(themeName);
      }
    }
    this.activeThemes.clear();
  }
}
