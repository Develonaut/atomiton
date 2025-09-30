import type { NodeFieldsConfig } from "@atomiton/nodes/definitions";

/**
 * Manual field configuration overrides for specific node types
 * Use this to customize field rendering when auto-generated configs aren't sufficient
 */
export const FIELD_CONFIG_OVERRIDES: Record<
  string,
  Partial<NodeFieldsConfig>
> = {
  "file-system": {
    operation: {
      controlType: "select",
      label: "Operation",
      options: [
        { value: "read", label: "Read" },
        { value: "write", label: "Write" },
        { value: "create", label: "Create" },
        { value: "delete", label: "Delete" },
        { value: "list", label: "List" },
        { value: "copy", label: "Copy" },
        { value: "move", label: "Move" },
        { value: "exists", label: "Exists" },
      ],
      required: true,
      helpText: "File system operation to perform",
    },
    path: {
      controlType: "text",
      label: "Path",
      helpText: "Absolute or relative file/directory path",
      placeholder: "./output/file.txt",
    },
    content: {
      controlType: "textarea",
      label: "Content",
      rows: 10,
      helpText: "File content to write (for write/create operations)",
    },
    encoding: {
      controlType: "select",
      label: "Encoding",
      options: [
        { value: "utf8", label: "UTF-8" },
        { value: "base64", label: "Base64" },
        { value: "binary", label: "Binary" },
        { value: "ascii", label: "ASCII" },
        { value: "hex", label: "Hexadecimal" },
      ],
      helpText: "File encoding for read/write operations",
    },
    createDirectories: {
      controlType: "boolean",
      label: "Create Directories",
      helpText: "Create parent directories if they don't exist",
    },
    overwrite: {
      controlType: "boolean",
      label: "Overwrite",
      helpText: "Overwrite existing files",
    },
    recursive: {
      controlType: "boolean",
      label: "Recursive",
      helpText: "Perform recursive operations on directories",
    },
    fullPaths: {
      controlType: "boolean",
      label: "Full Paths",
      helpText: "Return full paths in list operation",
    },
    fileFilter: {
      controlType: "text",
      label: "File Filter",
      helpText: "Regular expression to filter files (for list operation)",
      placeholder: "\\.txt$",
    },
  },

  "shell-command": {
    command: {
      controlType: "textarea",
      label: "Command",
      rows: 3,
      helpText: "Shell command to execute",
      placeholder: "npm run build",
    },
    workingDirectory: {
      controlType: "text",
      label: "Working Directory",
      helpText: "Directory to execute command in",
      placeholder: "./",
    },
  },

  transform: {
    operation: {
      controlType: "select",
      label: "Operation",
      options: [
        { value: "map", label: "Map" },
        { value: "filter", label: "Filter" },
        { value: "reduce", label: "Reduce" },
        { value: "sort", label: "Sort" },
        { value: "group", label: "Group" },
        { value: "flatten", label: "Flatten" },
        { value: "unique", label: "Unique" },
        { value: "reverse", label: "Reverse" },
      ],
      helpText: "Type of transformation operation",
    },
    transformFunction: {
      controlType: "code",
      label: "Transform Function",
      rows: 10,
      helpText: "JavaScript function to transform data",
      placeholder: "(item) => ({ ...item, processed: true })",
    },
    transformCode: {
      controlType: "code",
      label: "Transform Code",
      rows: 10,
      helpText: "JavaScript code for transformation",
    },
  },

  code: {
    code: {
      controlType: "code",
      label: "Code",
      rows: 15,
      helpText: "JavaScript code to execute",
    },
  },

  loop: {
    iterableExpression: {
      controlType: "code",
      label: "Iterable Expression",
      rows: 3,
      helpText: "Expression that evaluates to an iterable",
      placeholder: "[1, 2, 3, 4, 5]",
    },
  },

  "http-request": {
    url: {
      controlType: "url",
      label: "URL",
      helpText: "HTTP endpoint URL",
      placeholder: "https://api.example.com/data",
    },
    body: {
      controlType: "json",
      label: "Request Body",
      rows: 8,
      helpText: "JSON request body",
    },
    headers: {
      controlType: "json",
      label: "Headers",
      rows: 6,
      helpText: "HTTP headers as JSON object",
      placeholder: '{"Content-Type": "application/json"}',
    },
  },

  "csv-reader": {
    delimiter: {
      controlType: "text",
      label: "Delimiter",
      helpText: "Column delimiter character",
      placeholder: ",",
    },
    encoding: {
      controlType: "select",
      label: "Encoding",
      options: [
        { value: "utf8", label: "UTF-8" },
        { value: "ascii", label: "ASCII" },
        { value: "latin1", label: "Latin-1" },
      ],
    },
  },

  "edit-fields": {
    mappings: {
      controlType: "json",
      label: "Field Mappings",
      rows: 10,
      helpText: "Field transformation mappings",
    },
  },

  "image-composite": {
    layers: {
      controlType: "json",
      label: "Layers",
      rows: 12,
      helpText: "Image layers configuration",
    },
  },
};
