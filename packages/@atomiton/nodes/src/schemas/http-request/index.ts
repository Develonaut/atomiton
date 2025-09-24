/**
 * HTTP Request Schema
 * Runtime validation schema for HTTP request node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * HTTP Request specific schema (without base fields)
 */
export const httpRequestSchemaShape = {
  method: v
    .enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
    .default("GET")
    .describe("HTTP method to use"),

  url: v.string().url("Must be a valid URL").describe("Request URL"),

  headers: v
    .record(v.string())
    .default({})
    .describe("Request headers as key-value pairs"),

  body: v
    .string()
    .optional()
    .describe("Request body content (for POST, PUT, PATCH)"),

  followRedirects: v
    .boolean()
    .default(true)
    .describe("Whether to follow HTTP redirects"),

  validateSSL: v
    .boolean()
    .default(true)
    .describe("Whether to validate SSL certificates"),

  timeout: v
    .number()
    .min(1000)
    .max(300000)
    .default(30000)
    .describe("Request timeout in milliseconds"),

  retries: v
    .number()
    .min(0)
    .max(5)
    .default(0)
    .describe("Number of retry attempts on failure"),

  retryDelay: v
    .number()
    .min(100)
    .max(10000)
    .default(1000)
    .describe("Delay between retry attempts in milliseconds"),
};

/**
 * Full HTTP Request schema including base fields
 */
export const httpRequestSchema = baseSchema.extend(httpRequestSchemaShape);

/**
 * Type for HTTP Request parameters
 */
export type HttpRequestParameters = VInfer<typeof httpRequestSchema>;

/**
 * Default export for registry
 */
export default httpRequestSchemaShape;
