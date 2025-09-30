/**
 * File System Schema
 * Runtime validation schema for file system operations node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * File System specific schema (without base fields)
 * MVP: Core file operations only
 */
export const fileSystemSchemaShape = {
  operation: v
    .enum([
      "read",
      "write",
      "list",
      "exists",
      "create",
      "delete",
      "copy",
      "move",
    ])
    .default("read")
    .describe("File system operation to perform"),

  path: v
    .string()
    .min(1, "Path is required")
    .describe("File or directory path"),

  content: v.string().optional().describe("Content to write to file"),

  recursive: v
    .boolean()
    .default(false)
    .describe("Perform recursive list operations"),
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
