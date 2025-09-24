/**
 * HTTP Request Schema
 * Parameter validation schema for HTTP request node
 */

import v from "@atomiton/validation";

/**
 * HTTP Request parameter schema
 */
export const httpRequestSchema = {
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
 * Default values for HTTP request parameters
 */
export const httpRequestDefaults = {
  method: "GET" as const,
  url: "https://api.example.com",
  headers: {},
  followRedirects: true,
  validateSSL: true,
  timeout: 30000,
  retries: 0,
  retryDelay: 1000,
};
