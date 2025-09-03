/**
 * Theme System - Public API
 *
 * Centralized theme system exports
 */

// Import for use in DEFAULT_THEME
import { CoreTheme } from "./theme";

export {
  ThemeColors,
  NodeCategoryColors,
  PortTypeColors,
  CoreTheme,
  DefaultTheme,
  ThemeUtils,
  getNodeCategoryColor,
  getPortTypeColor,
  getContrastColor,
} from "./theme";

export type { Theme } from "./theme";

// Default theme instance
export const DEFAULT_THEME = CoreTheme;
