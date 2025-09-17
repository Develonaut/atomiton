/**
 * HTTP Request Node Parameters
 *
 * Parameter schema for HTTP/API request operations
 */

import { z } from "zod";
import { createAtomicParameters } from "../../createAtomicParameters";

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

export const httpRequestParameters = createAtomicParameters(
  httpRequestSchema,
  {
    method: "GET" as const,
    url: "https://api.example.com",
    headers: {},
    followRedirects: true,
    validateSSL: true,
  },
  {
    method: {
      controlType: "select",
      label: "HTTP Method",
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "DELETE", label: "DELETE" },
        { value: "PATCH", label: "PATCH" },
      ],
    },
    url: {
      controlType: "text",
      label: "Request URL",
      placeholder: "https://api.example.com/endpoint",
    },
    headers: {
      controlType: "textarea",
      label: "Headers",
      placeholder: '{"Content-Type": "application/json"}',
      helpText: "HTTP headers as JSON object",
    },
    body: {
      controlType: "textarea",
      label: "Request Body",
      placeholder: '{"key": "value"}',
      rows: 5,
      helpText: "Request body content (for POST, PUT, PATCH)",
    },
    followRedirects: {
      controlType: "boolean",
      label: "Follow Redirects",
    },
    validateSSL: {
      controlType: "boolean",
      label: "Validate SSL",
    },
  },
);

export type HttpRequestParameters = z.infer<
  typeof httpRequestParameters.schema
>;
