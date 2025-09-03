/**
 * Visualization Adapter Types
 *
 * Core types and interfaces for the visualization adapter system
 */

export interface ThemeVariables {
  [key: string]: string | number;
}

export interface ThemeDefinition {
  name: string;
  variables: ThemeVariables;
  isDark: boolean;
}

export interface AdapterCapabilities {
  supportsCSS: boolean;
  supportsCSSVariables: boolean;
  supportsStyleSheets: boolean;
  supportsInlineStyles: boolean;
  supportsThemeEvents: boolean;
}

export interface VisualizationAdapter {
  readonly name: string;
  readonly capabilities: AdapterCapabilities;

  /**
   * Initialize the adapter
   */
  initialize(): Promise<void>;

  /**
   * Inject theme into the environment
   */
  injectTheme(theme: ThemeDefinition): Promise<void>;

  /**
   * Remove theme from the environment
   */
  removeTheme(themeName?: string): Promise<void>;

  /**
   * Get currently active theme
   */
  getCurrentTheme(): ThemeDefinition | null;

  /**
   * Check if adapter is ready
   */
  isReady(): boolean;

  /**
   * Clean up resources
   */
  dispose(): void;
}

export interface AdapterFactory {
  /**
   * Create an adapter for the current platform
   */
  createAdapter(): VisualizationAdapter;

  /**
   * Check if factory supports the current platform
   */
  supportsCurrentPlatform(): boolean;
}
