/**
 * Node Metadata Types
 * Categories, icons, and metadata for node discovery and display
 */

/**
 * Node categories for organization and UI grouping
 */
export type NodeCategory =
  | "io" // Input/Output - file reading, HTTP, etc
  | "data" // Data Processing - transform, filter, etc
  | "logic" // Logic & Control - conditionals, loops, etc
  | "media" // Media Processing - images, video, audio
  | "system" // System Operations - shell commands, env vars
  | "ai" // AI & ML operations
  | "database" // Database operations
  | "analytics" // Analytics & monitoring
  | "communication" // Email, notifications, messaging
  | "utility" // General utilities
  | "user" // User-created nodes
  | "group"; // Group nodes

/**
 * Runtime environments for nodes
 */
export type NodeRuntime = "typescript" | "python" | "rust" | "wasm" | "golang";

/**
 * Icon identifiers for UI display
 */
export type NodeIcon =
  // File & Data
  | "file"
  | "folder"
  | "database"
  | "table-2"

  // Network & Communication
  | "cloud"
  | "globe-2"
  | "mail"
  | "message-square"

  // Code & System
  | "code-2"
  | "terminal"
  | "cpu"
  | "git-branch"

  // Processing & Actions
  | "wand-2"
  | "zap"
  | "filter"
  | "search"
  | "transform"
  | "repeat"
  | "pencil"

  // Media
  | "image"

  // Structure
  | "layers"

  // Analytics
  | "activity"
  | "bar-chart"

  // Security
  | "lock"
  | "unlock"
  | "shield"

  // Users
  | "user"
  | "users"

  // UI Controls
  | "settings"
  | "plus"
  | "minus"
  | "check"
  | "x"

  // Status & Info
  | "alert-triangle"
  | "info"
  | "help-circle";

/**
 * Node implementation types
 */
export type NodeMetadataType =
  | "code"
  | "csv-reader"
  | "file-system"
  | "http-request"
  | "image"
  | "loop"
  | "parallel"
  | "shell-command"
  | "transform"
  | "group"
  | "template"
  | "test";

/**
 * Source/authority of the node
 */
export type NodeMetadataSource =
  | "system"
  | "user"
  | "community"
  | "organization"
  | "marketplace";

/**
 * Node Metadata Interface
 *
 * Metadata for nodes (without type and version which are at top level)
 */
export type NodeMetadata = {
  // Core identification
  id: string;
  name: string;

  // Attribution
  author: string;
  authorId?: string;
  source?: NodeMetadataSource;

  // Categorization & Discovery
  description: string;
  category: NodeCategory;
  icon: NodeIcon;
  keywords?: string[];
  tags?: string[];

  // Runtime information
  runtime?: {
    language: NodeRuntime;
  };

  // Status flags
  experimental?: boolean;
  deprecated?: boolean;

  // Documentation
  documentationUrl?: string;
  examples?: Array<{
    name: string;
    description: string;
    config: Record<string, unknown>;
  }>;
};
