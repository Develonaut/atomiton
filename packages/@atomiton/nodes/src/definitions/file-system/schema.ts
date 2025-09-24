/**
 * File System Schema
 * Parameter validation schema for file system operations node
 */

import v from "@atomiton/validation";

/**
 * File system parameter schema
 */
export const fileSystemSchema = {
  operation: v
    .enum([
      "read",
      "write",
      "create",
      "list",
      "delete",
      "copy",
      "move",
      "exists",
    ])
    .default("read")
    .describe("File system operation to perform"),

  path: v
    .string()
    .min(1, "Path is required")
    .describe("File or directory path"),

  content: v.string().optional().describe("Content to write to file"),

  encoding: v
    .enum(["utf8", "base64", "binary", "ascii", "hex"])
    .default("utf8")
    .describe("File encoding for read/write operations"),

  createDirectories: v
    .boolean()
    .default(false)
    .describe("Create parent directories if they don't exist"),

  overwrite: v.boolean().default(false).describe("Overwrite existing files"),

  recursive: v
    .boolean()
    .default(false)
    .describe("Perform recursive operations on directories"),

  targetPath: v
    .string()
    .optional()
    .describe("Target path for copy/move operations"),

  fileFilter: v
    .string()
    .optional()
    .describe("Regular expression to filter files in list operation"),

  fullPaths: v
    .boolean()
    .default(false)
    .describe("Return full paths in list operation"),
};

/**
 * Default values for file system parameters
 */
export const fileSystemDefaults = {
  operation: "read" as const,
  path: "",
  encoding: "utf8" as const,
  createDirectories: false,
  overwrite: false,
  recursive: false,
  fullPaths: false,
};
