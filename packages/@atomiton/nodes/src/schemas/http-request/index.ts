/**
 * HTTP Request Schema
 * Runtime validation schema for HTTP request node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * HTTP Request specific schema (without base fields)
 * MVP: Core HTTP request fields only
 */
export const httpRequestSchemaShape = {
  method: v
    .enum(["GET", "POST", "PUT", "DELETE"])
    .default("GET")
    .describe("HTTP method to use"),

  url: v.string().url("Must be a valid URL").describe("Request URL"),

  headers: v
    .record(v.string())
    .default({})
    .describe("Request headers as key-value pairs"),

  body: v.string().optional().describe("Request body content (for POST, PUT)"),

  // POST-MVP: Advanced fields removed for MVP
  // Hardcoded defaults applied in executor:
  // - followRedirects: true
  // - validateSSL: true
  // - timeout: 30000ms
  // - retries: 0 (no retries)
  // - retryDelay: N/A (no retries)
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
