import type { VParseResult, VType } from "@atomiton/validation";

export type NodeEdgeType = "bezier" | "straight" | "step" | "smoothstep";

export type NodeEdge = {
  /** Unique id of an edge */
  id: string;

  /** Type of edge defined in `edgeTypes` */
  type?: NodeEdgeType;

  /** Id of source node */
  source: string;

  /** Id of target node */
  target: string;

  /** Id of source handle (only needed if multiple handles per node) */
  sourceHandle?: string | null;

  /** Id of target handle (only needed if multiple handles per node) */
  targetHandle?: string | null;

  /** Visual and behavior properties */
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  selected?: boolean;

  /** Z-index for layering */
  zIndex?: number;

  /** Accessibility */
  ariaLabel?: string;

  /** Arbitrary data passed to an edge */
  data?: Record<string, unknown>;
};

// ============================================================================
// NODE METADATA TYPES
// ============================================================================

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
  | "composite"; // Composite nodes

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
 * Node implementation variants
 */
export type NodeMetadataVariant =
  | "code"
  | "csv-reader"
  | "file-system"
  | "http-request"
  | "image-composite"
  | "loop"
  | "parallel"
  | "shell-command"
  | "transform"
  | "workflow"
  | "pipeline"
  | "orchestrator"
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
 * Comprehensive metadata for node discovery, display, and documentation
 */
export type NodeMetadata = {
  // Core identification
  id: string;
  name: string;
  variant: NodeMetadataVariant;
  version: string;

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

// ============================================================================
// NODE PARAMETER TYPES
// ============================================================================

/**
 * UI control types for node parameter fields
 */
export type NodeFieldControlType =
  // Text inputs
  | "text" // Single-line text
  | "textarea" // Multi-line text
  | "password" // Password input
  | "email" // Email input
  | "url" // URL input

  // Numeric inputs
  | "number" // Number input
  | "range" // Range slider

  // Selection inputs
  | "boolean" // Checkbox/toggle
  | "select" // Dropdown selection

  // Date/Time inputs
  | "date" // Date picker
  | "datetime" // Date and time picker

  // Specialized inputs
  | "file" // File picker
  | "color" // Color picker

  // Code/Data inputs
  | "json" // JSON editor
  | "code" // Code editor with syntax highlighting
  | "markdown" // Markdown editor
  | "rich-text"; // Rich text editor

/**
 * Configuration for a single form field
 */
export type NodeFieldConfig = {
  // Core properties
  controlType: NodeFieldControlType;
  label: string;

  // Help & hints
  placeholder?: string;
  helpText?: string;

  // Validation
  required?: boolean;

  // Numeric constraints
  min?: number;
  max?: number;
  step?: number;

  // Text area configuration
  rows?: number;

  // Select options
  options?: Array<{
    value: string;
    label: string;
  }>;
};

/**
 * Collection of field configurations
 */
export type NodeFieldsConfig = Record<string, NodeFieldConfig>;

/**
 * Node parameters structure with validation and defaults
 */
export type NodeParameters<T = Record<string, unknown>> = {
  /** The Zod schema for parameter validation */
  schema: VType<T>;

  /** Default parameter values */
  defaults: T;

  /** UI field configurations for form rendering */
  fields: NodeFieldsConfig;

  /** Parse and validate a parameters object */
  parse(params: unknown): T;

  /** Safely parse a parameters object */
  safeParse(params: unknown): VParseResult<T>;

  /** Check if a parameters object is valid */
  isValid(params: unknown): boolean;

  /** Merge partial parameters with defaults */
  withDefaults(partialParams?: Partial<T>): T;
};

// ============================================================================
// NODE PORT TYPES
// ============================================================================

/**
 * Node port types
 */
export type NodePortType =
  | "input"
  | "output"
  | "trigger" // Special port type for event-driven nodes
  | "error"; // Error output port

/**
 * Data types for node ports
 */
export type NodePortDataType =
  // Primitive types
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "regex"

  // Composite types
  | "object"
  | "array"
  | "any"
  | "function"

  // Binary types
  | "buffer"
  | "stream"
  | "binary"

  // Document types
  | "json"
  | "xml"
  | "html"
  | "markdown"
  | "csv";

/**
 * Port definition for nodes
 */
export type NodePort = {
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

// ============================================================================
// NODE DEFINITION TYPES
// ============================================================================

export type NodePosition = {
  x: number;
  y: number;
};

export type NodeType = "atomic" | "composite";

/**
 * Universal Node Definition
 *
 * Static, serializable structure defining a node's configuration.
 * Both atomic and composite nodes share this interface.
 */
export type NodeDefinition = {
  /** Unique identifier for this node */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Node type - atomic (leaf) or composite (has children) */
  readonly type: NodeType;

  /** Position of the node in the editor */
  position: NodePosition;

  /** Metadata about this node */
  metadata: NodeMetadata;

  /** Parameters schema, defaults, and field definitions */
  parameters: NodeParameters;

  /** Input port definitions */
  inputPorts: NodePort[];

  /** Output port definitions */
  outputPorts: NodePort[];

  /** Child nodes (only for composite nodes) */
  children?: NodeDefinition[];

  /** Edges connecting child nodes (only for composite nodes) */
  edges?: NodeEdge[];
};
