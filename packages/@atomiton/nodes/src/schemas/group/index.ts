/**
 * Group Schema
 * Runtime validation schema for group node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Group specific schema (without base fields)
 */
export const groupSchemaShape = {
  timeout: v
    .number()
    .min(1000)
    .max(300000)
    .default(30000)
    .describe("Maximum execution time in milliseconds"),

  retries: v
    .number()
    .min(0)
    .max(10)
    .default(1)
    .describe("Number of retry attempts on failure"),

  parallel: v
    .boolean()
    .default(false)
    .describe("Execute child nodes in parallel when possible"),
};

/**
 * Full Group schema including base fields
 */
export const groupSchema = baseSchema.extend(groupSchemaShape);

/**
 * Type for Group parameters
 */
export type GroupParameters = VInfer<typeof groupSchema>;

/**
 * Default export for registry
 */
export default groupSchemaShape;
