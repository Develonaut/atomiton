/**
 * Static list of all available nodes
 * This is the source of truth for what nodes exist in the system
 */

export interface NodeDefinition {
  id: string;
  type: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  tags?: string[];
}

// MVP Core Nodes - Essential nodes for product image automation workflow
export const MVP_NODES: NodeDefinition[] = [
  // ============ Data Input (2 nodes) ============
  {
    id: "csv-reader",
    type: "input",
    name: "CSV/Spreadsheet",
    category: "io",
    description: "Read CSV files and spreadsheet data",
    icon: "table-2",
    tags: ["csv", "spreadsheet", "excel", "data", "table", "import"],
  },
  {
    id: "file-system",
    type: "io",
    name: "File System",
    category: "io",
    description: "Read, write files and manage directories",
    icon: "folder-open",
    tags: ["file", "folder", "directory", "read", "write", "create"],
  },

  // ============ External Integration (3 nodes) ============
  {
    id: "http-request",
    type: "io",
    name: "HTTP/API Request",
    category: "io",
    description: "Call APIs (Figma, webhooks, REST)",
    icon: "globe-2",
    tags: ["http", "api", "figma", "webhook", "rest", "post", "get"],
  },
  {
    id: "shell-command",
    type: "processor",
    name: "Shell Command",
    category: "system",
    description: "Execute system commands (Blender, ImageMagick)",
    icon: "terminal",
    tags: ["shell", "command", "blender", "script", "execute", "system"],
  },
  {
    id: "image-composite",
    type: "processor",
    name: "Image Processor",
    category: "media",
    description: "Composite and manipulate images",
    icon: "image-plus",
    tags: ["image", "composite", "overlay", "merge", "process", "render"],
  },

  // ============ Data Processing (2 nodes) ============
  {
    id: "transform",
    type: "processor",
    name: "Transform",
    category: "data",
    description: "Transform data, arrays, JSON, templates",
    icon: "code-2",
    tags: ["json", "transform", "data", "array", "text", "template", "map"],
  },
  {
    id: "code",
    type: "processor",
    name: "JavaScript Code",
    category: "data",
    description: "Custom JavaScript for complex logic",
    icon: "braces",
    tags: ["javascript", "code", "custom", "script", "function"],
  },

  // ============ Control Flow (2 nodes) ============
  {
    id: "loop",
    type: "logic",
    name: "Loop/Iterate",
    category: "logic",
    description: "Process each row/item in data",
    icon: "repeat",
    tags: ["loop", "iterate", "foreach", "batch", "row", "process"],
  },
  {
    id: "parallel",
    type: "logic",
    name: "Parallel",
    category: "logic",
    description: "Run multiple operations simultaneously",
    icon: "workflow",
    tags: ["parallel", "concurrent", "async", "batch", "speed"],
  },
];

// Full comprehensive node list (for future expansion)
export const ALL_NODES: NodeDefinition[] = [
  // ============ Input/Output Nodes ============
  {
    id: "input",
    type: "input",
    name: "Input",
    category: "io",
    description: "Receives data from external sources or user input",
    icon: "arrow-right",
    tags: ["input", "data", "entry", "source"],
  },
  {
    id: "output",
    type: "output",
    name: "Output",
    category: "io",
    description: "Sends data to external destinations or displays results",
    icon: "arrow-left",
    tags: ["output", "data", "result", "destination"],
  },
  {
    id: "file-read",
    type: "input",
    name: "File Reader",
    category: "io",
    description: "Reads content from files on the filesystem",
    icon: "file",
    tags: ["file", "read", "input", "filesystem"],
  },
  {
    id: "file-write",
    type: "output",
    name: "File Writer",
    category: "io",
    description: "Writes content to files on the filesystem",
    icon: "file-plus",
    tags: ["file", "write", "output", "filesystem", "save"],
  },
  {
    id: "http-request",
    type: "io",
    name: "HTTP Request",
    category: "io",
    description: "Makes HTTP requests to APIs or web services",
    icon: "globe",
    tags: ["http", "api", "request", "web", "rest"],
  },
  {
    id: "console-log",
    type: "output",
    name: "Console Log",
    category: "io",
    description: "Outputs data to the console for debugging",
    icon: "terminal",
    tags: ["console", "log", "debug", "print", "output"],
  },

  // ============ Data Processing Nodes ============
  {
    id: "text-transform",
    type: "processor",
    name: "Text Transform",
    category: "data",
    description:
      "Transform text with various operations (uppercase, lowercase, trim, etc.)",
    icon: "text",
    tags: ["text", "string", "transform", "format"],
  },
  {
    id: "json-parse",
    type: "processor",
    name: "JSON Parse",
    category: "data",
    description: "Parse JSON strings into JavaScript objects",
    icon: "code",
    tags: ["json", "parse", "data", "object"],
  },
  {
    id: "json-stringify",
    type: "processor",
    name: "JSON Stringify",
    category: "data",
    description: "Convert JavaScript objects to JSON strings",
    icon: "code",
    tags: ["json", "stringify", "data", "string"],
  },
  {
    id: "array-map",
    type: "processor",
    name: "Array Map",
    category: "data",
    description: "Transform each element in an array",
    icon: "list",
    tags: ["array", "map", "transform", "iterate"],
  },
  {
    id: "array-filter",
    type: "processor",
    name: "Array Filter",
    category: "data",
    description: "Filter array elements based on conditions",
    icon: "filter",
    tags: ["array", "filter", "condition", "select"],
  },
  {
    id: "array-reduce",
    type: "processor",
    name: "Array Reduce",
    category: "data",
    description: "Reduce an array to a single value",
    icon: "compress",
    tags: ["array", "reduce", "aggregate", "sum"],
  },

  // ============ Logic & Control Nodes ============
  {
    id: "if-else",
    type: "logic",
    name: "If/Else",
    category: "logic",
    description: "Conditional branching based on conditions",
    icon: "git-branch",
    tags: ["if", "else", "condition", "branch", "logic"],
  },
  {
    id: "switch",
    type: "logic",
    name: "Switch",
    category: "logic",
    description: "Multi-way branching based on value matching",
    icon: "shuffle",
    tags: ["switch", "case", "branch", "logic", "condition"],
  },
  {
    id: "loop",
    type: "logic",
    name: "Loop",
    category: "logic",
    description: "Iterate over data or repeat operations",
    icon: "repeat",
    tags: ["loop", "iterate", "repeat", "for", "while"],
  },
  {
    id: "delay",
    type: "logic",
    name: "Delay",
    category: "logic",
    description: "Pause execution for a specified duration",
    icon: "clock",
    tags: ["delay", "wait", "pause", "timeout", "sleep"],
  },
  {
    id: "merge",
    type: "logic",
    name: "Merge",
    category: "logic",
    description: "Merge multiple data streams into one",
    icon: "git-merge",
    tags: ["merge", "combine", "join", "union"],
  },
  {
    id: "split",
    type: "logic",
    name: "Split",
    category: "logic",
    description: "Split data into multiple streams",
    icon: "git-pull-request",
    tags: ["split", "fork", "branch", "divide"],
  },

  // ============ Transform Nodes ============
  {
    id: "math",
    type: "transform",
    name: "Math Operation",
    category: "transform",
    description:
      "Perform mathematical operations (add, subtract, multiply, divide)",
    icon: "calculator",
    tags: ["math", "calculate", "arithmetic", "number"],
  },
  {
    id: "template",
    type: "transform",
    name: "Template",
    category: "transform",
    description: "Generate text from templates with variable substitution",
    icon: "file-text",
    tags: ["template", "text", "format", "string", "interpolate"],
  },
  {
    id: "regex",
    type: "transform",
    name: "Regex",
    category: "transform",
    description: "Match, extract, or replace text using regular expressions",
    icon: "search",
    tags: ["regex", "pattern", "match", "extract", "replace"],
  },
  {
    id: "date-time",
    type: "transform",
    name: "Date/Time",
    category: "transform",
    description: "Parse, format, and manipulate dates and times",
    icon: "calendar",
    tags: ["date", "time", "datetime", "format", "parse"],
  },
  {
    id: "encode-decode",
    type: "transform",
    name: "Encode/Decode",
    category: "transform",
    description: "Encode or decode data (Base64, URL, HTML entities)",
    icon: "lock",
    tags: ["encode", "decode", "base64", "url", "html"],
  },

  // ============ Utility Nodes ============
  {
    id: "variable",
    type: "utility",
    name: "Variable",
    category: "utility",
    description: "Store and retrieve values",
    icon: "box",
    tags: ["variable", "store", "value", "memory"],
  },
  {
    id: "constant",
    type: "utility",
    name: "Constant",
    category: "utility",
    description: "Define constant values",
    icon: "anchor",
    tags: ["constant", "value", "static", "fixed"],
  },
  {
    id: "comment",
    type: "utility",
    name: "Comment",
    category: "utility",
    description: "Add notes and documentation to your workflow",
    icon: "message-square",
    tags: ["comment", "note", "documentation", "annotation"],
  },
  {
    id: "debug",
    type: "utility",
    name: "Debug",
    category: "utility",
    description: "Inspect data flow and values for debugging",
    icon: "bug",
    tags: ["debug", "inspect", "log", "trace"],
  },
  {
    id: "error-handler",
    type: "utility",
    name: "Error Handler",
    category: "utility",
    description: "Catch and handle errors in the workflow",
    icon: "alert-triangle",
    tags: ["error", "exception", "catch", "handle", "try"],
  },

  // ============ Integration Nodes ============
  {
    id: "database-query",
    type: "integration",
    name: "Database Query",
    category: "integration",
    description: "Execute database queries (SQL, NoSQL)",
    icon: "database",
    tags: ["database", "sql", "query", "data", "db"],
  },
  {
    id: "webhook",
    type: "integration",
    name: "Webhook",
    category: "integration",
    description: "Receive or send webhook requests",
    icon: "link",
    tags: ["webhook", "http", "api", "trigger", "event"],
  },
  {
    id: "email",
    type: "integration",
    name: "Email",
    category: "integration",
    description: "Send or receive email messages",
    icon: "mail",
    tags: ["email", "mail", "send", "smtp", "message"],
  },
  {
    id: "scheduler",
    type: "integration",
    name: "Scheduler",
    category: "integration",
    description: "Trigger workflows on a schedule (cron)",
    icon: "clock",
    tags: ["schedule", "cron", "timer", "trigger", "periodic"],
  },
];

// Use MVP nodes for now, switch to ALL_NODES when ready for full feature set
export const NODES = MVP_NODES;

export const CATEGORY_NAMES: Record<string, string> = {
  data: "Data Processing",
  transform: "Transformation",
  io: "Input/Output",
  logic: "Logic & Control",
  utility: "Utility",
  integration: "Integration",
  uncategorized: "Other",
};

export const CATEGORY_ORDER = [
  "data",
  "transform",
  "io",
  "logic",
  "utility",
  "integration",
  "uncategorized",
];
