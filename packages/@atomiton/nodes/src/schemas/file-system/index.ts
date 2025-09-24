/**
 * File System Schema
 * Runtime validation schema for file system operations node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * File System specific schema (without base fields)
 */
export const fileSystemSchemaShape = {
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
 * Full File System schema including base fields
 */
export const fileSystemSchema = baseSchema.extend(fileSystemSchemaShape);

/**
 * Type for File System parameters
 */
export type FileSystemParameters = VInfer<typeof fileSystemSchema>;

/**
 * Default export for registry
 */
export default fileSystemSchemaShape;
