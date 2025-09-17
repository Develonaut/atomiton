/**
 * Node Data Types
 *
 * Public types for node data structures, categories, and UI configuration.
 * These types are used for storage, serialization, and editing.
 */

/**
 * Node type classification
 * Extensible for future node types beyond atomic and composite
 */
export type NodeType = "atomic" | "composite" | string;

/**
 * Source of a node definition
 */
export type NodeSource =
  | "system"
  | "user"
  | "community"
  | "organization"
  | "marketplace";

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
  | "composite"; // Composite/blueprint nodes

/**
 * Runtime environments for nodes
 */
export type NodeRuntime = "typescript" | "python" | "rust" | "wasm" | "golang";

/**
 * Icon identifiers for UI display
 */
export type NodeIcon =
  | "file"
  | "database"
  | "cloud"
  | "code-2"
  | "wand-2"
  | "zap"
  | "cpu"
  | "image"
  | "mail"
  | "message-square"
  | "globe-2"
  | "table-2"
  | "terminal"
  | "git-branch"
  | "layers"
  | "activity"
  | "bar-chart"
  | "lock"
  | "unlock"
  | "shield"
  | "user"
  | "users"
  | "settings"
  | "filter"
  | "search"
  | "plus"
  | "minus"
  | "check"
  | "x"
  | "alert-triangle"
  | "info"
  | "help-circle";

/**
 * Data types for node ports
 */
export type NodePortDataType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "any"
  | "buffer"
  | "stream"
  | "date"
  | "regex"
  | "json"
  | "xml"
  | "html"
  | "markdown"
  | "csv"
  | "binary";

/**
 * Node port types
 */
export type NodePortType =
  | "input"
  | "output"
  | "trigger" // Special port type for event-driven nodes
  | "error"; // Error output port

/**
 * UI control types for node parameter fields
 */
export type NodeFieldControlType =
  | "text" // Text input
  | "number" // Number input
  | "boolean" // Checkbox/toggle
  | "select" // Dropdown selection
  | "textarea" // Multi-line text
  | "file" // File picker
  | "password" // Password input
  | "email" // Email input
  | "url" // URL input
  | "date" // Date picker
  | "datetime" // Date and time picker
  | "color" // Color picker
  | "range" // Range slider
  | "json" // JSON editor
  | "code" // Code editor with syntax highlighting
  | "markdown" // Markdown editor
  | "rich-text"; // Rich text editor

// Re-export execution types for convenience
export type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodeExecutionStatus,
  NodeExecutionMode,
  NodeInputs,
  NodeOutputs,
  NodeParameters,
  NodeConfig,
  PortData,
  ExecutionMetadata,
  ExecutionResultMetadata,
} from "./exports/executable/execution-types";

/**
 * Port definition for nodes
 */
export type NodePortDefinition = {
  /** Port identifier */
  id: string;

  /** Display name */
  name: string;

  /** Port direction */
  type: NodePortType;

  /** Expected data type */
  dataType: NodePortDataType;

  /** Whether this port is required */
  required?: boolean;

  /** Whether this port accepts multiple connections */
  multiple?: boolean;

  /** Description of what this port does */
  description?: string;

  /** Default value for this port */
  defaultValue?: unknown;
};

/**
 * Node data structure for storage and editing
 *
 * This is the main type consumers work with.
 * It represents a node's data, not its runtime instance.
 */
export type Node = {
  /** Unique node identifier */
  id: string;

  /** Display name for the node */
  name: string;

  /** Node description */
  description?: string;

  /** Node category for organization */
  category: string;

  /** Node type (atomic/composite/custom) */
  type: NodeType;

  /** Version of this node */
  version?: string;

  /** Node metadata */
  metadata?: {
    /** The specific variant of this node (e.g., "csv-reader", "http-request") */
    variant?: string;
    /** Creation timestamp */
    created?: string;
    /** Last modified timestamp */
    modified?: string;
    /** Author of this node */
    author?: string;
    /** Source of this node (system/user/community) */
    source?: NodeSource;
    /** Tags for categorization */
    tags?: string[];
    /** Icon for UI display */
    icon?: NodeIcon;
    /** Documentation URL */
    documentationUrl?: string;
    /** Whether this node is experimental */
    experimental?: boolean;
    /** Whether this node is deprecated */
    deprecated?: boolean;
    /** Custom metadata */
    [key: string]: unknown;
  };

  /** For atomic nodes: port definitions */
  inputPorts?: NodePortDefinition[];
  outputPorts?: NodePortDefinition[];
  parameters?: Record<string, unknown>;

  /** Node data for parameters */
  data?: Record<string, unknown>;

  /** For composite nodes: child nodes and edges */
  nodes?: Node[];
  edges?: NodeEdge[];
  variables?: Record<string, unknown>;

  /** Settings for execution and UI */
  settings?: {
    runtime?: {
      timeout?: number;
      retries?: number;
      parallel?: boolean;
    };
    ui?: {
      color?: string;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    };
  };
};

/**
 * Position in visual editor
 */
export type NodePosition = {
  x: number;
  y: number;
};

/**
 * Variable definition for parameterization
 */
export type NodeVariable = {
  type: string;
  defaultValue?: unknown;
  description?: string;
};

/**
 * Edge definition for connecting nodes
 * Compatible with React Flow edge format
 */
export type NodeEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  selectable?: boolean;
};
