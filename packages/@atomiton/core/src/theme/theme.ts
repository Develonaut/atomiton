/**
 * Core Package Theme System
 *
 * This file now consumes from the centralized @atomiton/theme package
 * instead of defining its own color palette.
 *
 * ARCHITECTURAL PRINCIPLE: Single source of truth maintained in @atomiton/theme
 * - Prevents color duplication across packages
 * - Enables theme switching
 * - Provides type-safe color access
 */

import { COLORS, STATUS_COLORS, CATEGORY_COLORS } from "@atomiton/ui";

/**
 * Theme Colors - Re-exported from centralized theme
 */
export const ThemeColors = {
  // Background colors
  background: COLORS.background,
  currentLine: COLORS.selection,
  foreground: COLORS.foreground,
  comment: COLORS.comment,

  // Accent colors
  cyan: COLORS.cyan,
  green: COLORS.green,
  orange: COLORS.orange,
  pink: COLORS.pink,
  purple: COLORS.purple,
  red: COLORS.red,
  yellow: COLORS.yellow,

  // Additional shades for UI components
  backgroundDark: COLORS.bgDarker,
  backgroundLight: COLORS.bgLight,
  selection: COLORS.selection + "75", // Add alpha

  // Semantic colors mapped from centralized status colors
  primary: UI_COLORS.primary,
  secondary: UI_COLORS.secondary,
  success: STATUS_COLORS.success,
  warning: STATUS_COLORS.warning,
  error: STATUS_COLORS.error,
  info: COLORS.cyan,
} as const;

/**
 * Node category colors using centralized theme
 * Provides consistent color mapping for different node types
 */
export const NodeCategoryColors = {
  // Use centralized category colors where available
  data: CATEGORY_COLORS.data,
  input: CATEGORY_COLORS["data-input"],
  output: CATEGORY_COLORS.output,

  // Processing types
  transform: CATEGORY_COLORS.transformation,
  filter: CATEGORY_COLORS.processing,
  utility: CATEGORY_COLORS.utility,
  processing: CATEGORY_COLORS.processing,

  // External integrations
  api: CATEGORY_COLORS.api,
  file: CATEGORY_COLORS.filesystem,
  database: ThemeColors.comment, // Keep this one as is since no direct mapping

  // Control flow
  control: CATEGORY_COLORS.control,
  logic: ThemeColors.backgroundLight,

  // Default fallback
  default: ThemeColors.primary,
} as const;

/**
 * Port type colors based on data types
 */
export const PortTypeColors = {
  string: ThemeColors.green,
  number: ThemeColors.cyan,
  boolean: ThemeColors.yellow,
  object: ThemeColors.purple,
  array: ThemeColors.pink,
  file: ThemeColors.orange,
  directory: ThemeColors.comment,
  image: ThemeColors.red,
  any: ThemeColors.foreground,
  null: ThemeColors.currentLine,
  undefined: ThemeColors.backgroundLight,
} as const;

/**
 * Theme interface for type safety
 */
export interface Theme {
  name: string;
  colors: {
    // Base colors
    background: string;
    foreground: string;
    primary: string;
    secondary: string;

    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // UI elements
    border: string;
    hover: string;
    active: string;
    disabled: string;

    // Node colors
    nodeBackground: string;
    nodeSelected: string;
    nodeBorder: string;

    // Connection colors
    connectionDefault: string;
    connectionSelected: string;
    connectionInvalid: string;
  };

  // Typography
  fonts: {
    primary: string;
    mono: string;
  };

  // Spacing and sizing
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  // Border radius
  radius: {
    sm: number;
    md: number;
    lg: number;
  };

  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Core theme implementation
 */
export const CoreTheme: Theme = {
  name: "core",
  colors: {
    // Base colors
    background: ThemeColors.background,
    foreground: ThemeColors.foreground,
    primary: ThemeColors.primary,
    secondary: ThemeColors.secondary,

    // Semantic colors
    success: ThemeColors.success,
    warning: ThemeColors.warning,
    error: ThemeColors.error,
    info: ThemeColors.info,

    // UI elements
    border: ThemeColors.currentLine,
    hover: ThemeColors.selection,
    active: ThemeColors.backgroundLight,
    disabled: ThemeColors.comment,

    // Node colors
    nodeBackground: ThemeColors.backgroundLight,
    nodeSelected: ThemeColors.primary,
    nodeBorder: ThemeColors.currentLine,

    // Connection colors
    connectionDefault: ThemeColors.comment,
    connectionSelected: ThemeColors.primary,
    connectionInvalid: ThemeColors.error,
  },

  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'JetBrains Mono, "Fira Code", "SF Mono", Consolas, monospace',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 16,
  },

  shadows: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    md: "0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)",
    lg: "0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)",
  },
};

/**
 * Get color for node category
 */
export function getNodeCategoryColor(category: string): string {
  return (
    NodeCategoryColors[category as keyof typeof NodeCategoryColors] ||
    NodeCategoryColors.default
  );
}

/**
 * Get color for port type
 */
export function getPortTypeColor(dataType: string): string {
  return (
    PortTypeColors[dataType as keyof typeof PortTypeColors] ||
    PortTypeColors.any
  );
}

/**
 * Get contrasting text color for a background
 */
export function getContrastColor(backgroundColor: string): string {
  // Simple contrast calculation - could be enhanced with proper color theory
  const isLight =
    backgroundColor.includes("f8f8f2") || backgroundColor.includes("ffffff");
  return isLight ? ThemeColors.background : ThemeColors.foreground;
}

/**
 * Theme utility functions
 */
export const ThemeUtils = {
  /**
   * Get theme-aware colors based on current theme
   */
  getColors: (theme: Theme) => theme.colors,

  /**
   * Get CSS custom properties for theme
   */
  getCSSVariables: (theme: Theme): Record<string, string> => {
    const cssVars: Record<string, string> = {};

    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      cssVars[`--color-${key}`] = value;
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      cssVars[`--spacing-${key}`] = `${value}px`;
    });

    // Border radius
    Object.entries(theme.radius).forEach(([key, value]) => {
      cssVars[`--radius-${key}`] = `${value}px`;
    });

    // Fonts
    Object.entries(theme.fonts).forEach(([key, value]) => {
      cssVars[`--font-${key}`] = value;
    });

    return cssVars;
  },

  /**
   * Apply theme to DOM as CSS custom properties
   */
  applyThemeToDOM: (theme: Theme): void => {
    const root = document.documentElement;
    const cssVars = ThemeUtils.getCSSVariables(theme);

    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  },
} as const;

// Export commonly used items
export { CoreTheme as DefaultTheme };
export default CoreTheme;
