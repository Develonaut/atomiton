/**
 * HTTP Request Configuration
 *
 * Configuration for HTTP/API request operations
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

/**
 * HTTP Request specific configuration schema
 */
const httpRequestSchema = {
  method: z
    .enum(["GET", "POST", "PUT", "DELETE", "PATCH"])
    .default("GET")
    .describe("HTTP method to use"),

  url: z.string().url("Must be a valid URL").describe("Request URL"),

  headers: z.record(z.string()).default({}).describe("Request headers"),

  body: z.string().optional().describe("Request body content"),

  followRedirects: z
    .boolean()
    .default(true)
    .describe("Whether to follow redirects"),

  validateSSL: z
    .boolean()
    .default(true)
    .describe("Whether to validate SSL certificates"),
};

/**
 * HTTP Request Configuration Class
 */
class HttpRequestConfigClass extends NodeConfig<typeof httpRequestSchema> {
  constructor() {
    super(httpRequestSchema, {
      method: "GET" as const,
      url: "https://api.example.com",
      headers: {},
      followRedirects: true,
      validateSSL: true,
    });
  }
}

// Create singleton instance
export const httpRequestConfig = new HttpRequestConfigClass();

// Export for backward compatibility and external use
export const httpRequestConfigSchema = httpRequestConfig.schema;
export const defaultHttpRequestConfig = httpRequestConfig.defaults;
export type HttpRequestConfig = z.infer<typeof httpRequestConfig.schema>;

// Input/Output schemas for external use
export const HttpRequestInputSchema = z.object({
  url: z.string().url().optional(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  params: z.record(z.string()).optional(),
});

export type HttpRequestInput = z.infer<typeof HttpRequestInputSchema>;

export const HttpRequestOutputSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.any(),
  headers: z.record(z.string()),
  success: z.boolean(),
  url: z.string(),
  duration: z.number(),
});

export type HttpRequestOutput = z.infer<typeof HttpRequestOutputSchema>;
