/**
 * Node System Constants
 * Shared constants for the node system
 */

/**
 * Order of node categories for display
 */
export const NODE_CATEGORIES_ORDER = [
  "io",
  "data",
  "logic",
  "media",
  "system",
  "ai",
  "database",
  "analytics",
  "communication",
  "utility",
  "user",
  "templates",
];

/**
 * Display names for node categories
 */
export const NODE_CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  io: "Input/Output",
  data: "Data Processing",
  logic: "Logic & Control",
  media: "Media Processing",
  system: "System Operations",
  ai: "AI & Machine Learning",
  database: "Database",
  analytics: "Analytics & Monitoring",
  communication: "Communication",
  utility: "Utilities",
  user: "User Created",
  templates: "Templates",
};

/**
 * Default node execution limits
 */
export const DEFAULT_EXECUTION_LIMITS = {
  maxExecutionTimeMs: 300000, // 5 minutes
  maxMemoryMB: 512,
  maxRetries: 3,
  retryDelayMs: 1000,
};

/**
 * Node port limits
 */
export const NODE_PORT_LIMITS = {
  maxInputPorts: 20,
  maxOutputPorts: 20,
  maxConnections: 100,
};
