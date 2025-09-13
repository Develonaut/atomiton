export const BRAINWAVE_THEME = "brainwave-2.0";

export const COLORS = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  bgLight: "var(--color-bg-light)",
  purple: "var(--color-purple)",
  pink: "var(--color-pink)",
  cyan: "var(--color-cyan)",
  green: "var(--color-green)",
  yellow: "var(--color-yellow)",
  orange: "var(--color-orange)",
  red: "var(--color-red)",
  selection: "var(--color-selection)",
  comment: "var(--color-comment)",
  current: "var(--color-current)",
} as const;

export const CATEGORY_COLORS = {
  data: "var(--color-category-data)",
  processing: "var(--color-category-processing)",
  io: "var(--color-category-io)",
  control: "var(--color-category-control)",
} as const;

export const STATUS_COLORS = {
  idle: "var(--color-status-idle)",
  running: "var(--color-status-running)",
  success: "var(--color-status-success)",
  error: "var(--color-status-error)",
  warning: "var(--color-status-warning)",
} as const;

export const themeConfig = {
  name: BRAINWAVE_THEME,
  version: "2.0.0",
  css: "./index.css",
  variables: "./variables.css",
} as const;
