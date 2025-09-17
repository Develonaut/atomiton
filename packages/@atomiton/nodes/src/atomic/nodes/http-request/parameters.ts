/**
 * HTTP Request Node Parameters
 *
 * Parameter schema for HTTP/API request operations
 */

import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { createAtomicParameters } from "../../createAtomicParameters";

const httpRequestSchema = {
  method: v
    .enum(["GET", "POST", "PUT", "DELETE", "PATCH"])
    .default("GET")
    .describe("HTTP method to use"),

  url: v.string().url("Must be a valid URL").describe("Request URL"),

  headers: v.record(v.string()).default({}).describe("Request headers"),

  body: v.string().optional().describe("Request body content"),

  followRedirects: v
    .boolean()
    .default(true)
    .describe("Whether to follow redirects"),

  validateSSL: v
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

export type HttpRequestParameters = VInfer<typeof httpRequestParameters.schema>;
