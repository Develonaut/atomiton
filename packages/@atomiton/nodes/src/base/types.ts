/**
 * Concrete type definitions for the node system
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
  | "utility"; // General utilities

export type NodeRuntime = "typescript" | "python" | "rust" | "wasm" | "golang";

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

export type PortDataType =
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

export type PortType =
  | "input"
  | "output"
  | "trigger" // Special port type for event-driven nodes
  | "error"; // Error output port

export type NodeStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "warning"
  | "cancelled"
  | "timeout";

export type NodeExecutionMode =
  | "manual" // User triggered
  | "automatic" // Triggered by input changes
  | "scheduled" // Time-based trigger
  | "webhook"; // External trigger

export type FieldControlType =
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
