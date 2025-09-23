/**
 * HTTP Request Node Definition
 * Browser-safe configuration for HTTP request node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";

// Parameter schema using validation library
const httpRequestSchema = {
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
 * HTTP Request node definition (browser-safe)
 */
export const httpRequestDefinition: NodeDefinition = createNodeDefinition({
  type: "atomic",
  metadata: createNodeMetadata({
    id: "http-request",
    name: "HTTP Request",
    variant: "http-request",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Make HTTP requests (GET, POST, PUT, DELETE, etc.)",
    category: "io",
    icon: "globe-2",
    keywords: [
      "http",
      "request",
      "api",
      "rest",
      "get",
      "post",
      "put",
      "delete",
      "fetch",
      "ajax",
      "web",
      "network",
    ],
    tags: ["http", "api", "network", "rest", "web"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
    httpRequestSchema,
    {
      method: "GET" as const,
      url: "https://api.example.com",
      headers: {},
      followRedirects: true,
      validateSSL: true,
      timeout: 30000,
      retries: 0,
      retryDelay: 1000,
    },
    {
      method: {
        controlType: "select",
        label: "HTTP Method",
        helpText: "HTTP method to use for the request",
        options: [
          { value: "GET", label: "GET - Retrieve data" },
          { value: "POST", label: "POST - Create data" },
          { value: "PUT", label: "PUT - Update data" },
          { value: "DELETE", label: "DELETE - Remove data" },
          { value: "PATCH", label: "PATCH - Partial update" },
          { value: "HEAD", label: "HEAD - Headers only" },
          { value: "OPTIONS", label: "OPTIONS - Check capabilities" },
        ],
      },
      url: {
        controlType: "text",
        label: "Request URL",
        placeholder: "https://api.example.com/endpoint",
        helpText: "The URL to send the request to",
      },
      headers: {
        controlType: "textarea",
        label: "Headers",
        placeholder:
          '{"Content-Type": "application/json", "Authorization": "Bearer token"}',
        helpText: "HTTP headers as JSON object",
        rows: 3,
      },
      body: {
        controlType: "textarea",
        label: "Request Body",
        placeholder: '{"key": "value"}',
        helpText: "Request body content (for POST, PUT, PATCH methods)",
        rows: 5,
      },
      followRedirects: {
        controlType: "boolean",
        label: "Follow Redirects",
        helpText: "Automatically follow HTTP redirects",
      },
      validateSSL: {
        controlType: "boolean",
        label: "Validate SSL",
        helpText: "Validate SSL certificates (recommended)",
      },
      timeout: {
        controlType: "number",
        label: "Timeout (ms)",
        helpText: "Request timeout in milliseconds",
        min: 1000,
        max: 300000,
        step: 1000,
      },
      retries: {
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        min: 0,
        max: 5,
      },
      retryDelay: {
        controlType: "number",
        label: "Retry Delay (ms)",
        helpText: "Delay between retry attempts",
        min: 100,
        max: 10000,
        step: 100,
      },
    }
  ),
  inputPorts: [
    createNodePort("input", {
      id: "url",
      name: "URL",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Request URL (overrides parameter)",
    }),
    createNodePort("input", {
      id: "method",
      name: "Method",
      dataType: "string",
      required: false,
      multiple: false,
      description: "HTTP method (overrides parameter)",
    }),
    createNodePort("input", {
      id: "headers",
      name: "Headers",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Request headers (merges with parameters)",
    }),
    createNodePort("input", {
      id: "body",
      name: "Body",
      dataType: "json",
      required: false,
      multiple: false,
      description: "Request body (overrides parameter)",
    }),
    createNodePort("input", {
      id: "params",
      name: "Query Parameters",
      dataType: "object",
      required: false,
      multiple: false,
      description: "URL query parameters",
    }),
    createNodePort("input", {
      id: "auth",
      name: "Authentication",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Authentication configuration",
    }),
  ],
  outputPorts: [
    createNodePort("output", {
      id: "result",
      name: "Result",
      dataType: "json",
      required: true,
      multiple: false,
      description: "Response data",
    }),
    createNodePort("output", {
      id: "data",
      name: "Data",
      dataType: "json",
      required: false,
      multiple: false,
      description: "Response data (alias for result)",
    }),
    createNodePort("output", {
      id: "status",
      name: "Status",
      dataType: "number",
      required: false,
      multiple: false,
      description: "HTTP status code",
    }),
    createNodePort("output", {
      id: "statusText",
      name: "Status Text",
      dataType: "string",
      required: false,
      multiple: false,
      description: "HTTP status text",
    }),
    createNodePort("output", {
      id: "headers",
      name: "Response Headers",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Response headers",
    }),
    createNodePort("output", {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Request success status",
    }),
    createNodePort("output", {
      id: "duration",
      name: "Duration",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Request duration in milliseconds",
    }),
    createNodePort("output", {
      id: "url",
      name: "Final URL",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Final URL after redirects",
    }),
  ],
});

export default httpRequestDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullHttpRequestSchema = v.object({
  ...httpRequestSchema,
  enabled: v.boolean().default(true),
  timeout: v.number().positive().default(30000),
  retries: v.number().int().min(0).default(1),
  label: v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type HttpRequestParameters = VInfer<typeof fullHttpRequestSchema>;
