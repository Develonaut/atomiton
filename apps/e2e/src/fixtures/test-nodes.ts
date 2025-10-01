/**
 * Test node definitions for E2E testing
 * These fixtures provide valid node configurations for different node types
 */

export const testNodes = {
  /**
   * File System node - write operation
   * Tests: file writing with directory creation
   */
  fileSystemWrite: {
    type: "file-system",
    operation: "write",
    path: ".tmp/e2e-test-file.txt",
    content: "E2E test content from dynamic form",
    encoding: "utf8",
    createDirectories: true,
    overwrite: true,
  },

  /**
   * File System node - read operation
   * Tests: file reading
   */
  fileSystemRead: {
    type: "file-system",
    operation: "read",
    path: ".tmp/e2e-test-file.txt",
    encoding: "utf8",
  },

  /**
   * Transform node
   * Tests: code execution with simple transformation
   */
  transform: {
    type: "transform",
    operation: "map",
    transformFunction:
      "item => ({ ...item, result: 'Transform executed successfully', timestamp: Date.now() })",
  },

  /**
   * HTTP Request node
   * Tests: HTTP endpoint configuration (GET request to JSONPlaceholder API)
   */
  httpRequest: {
    type: "http-request",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    headers: JSON.stringify({ "Content-Type": "application/json" }),
  },

  /**
   * Shell Command node
   * Tests: shell command execution
   */
  shellCommand: {
    type: "shell-command",
    command: "echo 'E2E test shell command'",
    workingDirectory: "./",
  },

  /**
   * Loop node
   * Tests: iteration configuration
   */
  loop: {
    type: "loop",
    iterableExpression: "[1, 2, 3]",
  },

  /**
   * CSV Reader node
   * Tests: CSV parsing configuration
   */
  csvReader: {
    type: "csv-reader",
    filePath: ".tmp/test.csv",
    delimiter: ",",
    encoding: "utf8",
  },

  /**
   * Edit Fields node
   * Tests: field transformation mappings
   */
  editFields: {
    type: "edit-fields",
    mappings: JSON.stringify({
      newField: "value",
      transformedField: "item.originalField",
    }),
  },

  /**
   * Image Composite node
   * Tests: image layer configuration
   */
  imageComposite: {
    type: "image-composite",
    layers: JSON.stringify([
      {
        type: "image",
        path: "./input.png",
        x: 0,
        y: 0,
      },
    ]),
  },
};

/**
 * Expected field counts for each node type
 * Used to validate that the correct number of fields are rendered
 */
export const expectedFieldCounts: Record<string, number> = {
  "file-system": 7, // operation, path, content, encoding, createDirectories, overwrite, fileFilter
  transform: 9, // operation, transformFunction, filterCondition, sortKey, sortDirection, groupBy, reduceFunction, reduceInitial, flattenDepth
  "http-request": 4, // method, url, body, headers
  "shell-command": 2, // command, workingDirectory
  loop: 1, // iterableExpression
  "csv-reader": 3, // filePath, delimiter, encoding
  "edit-fields": 1, // mappings
  "image-composite": 1, // layers
  group: 0, // groups have no direct fields (they contain child nodes)
  parallel: 0, // parallel nodes have no direct fields
};

/**
 * Node types that should be tested in the E2E suite
 */
export const nodeTypesToTest = [
  "file-system",
  "transform",
  "http-request",
  "shell-command",
] as const;

export type TestNodeType = (typeof nodeTypesToTest)[number];
