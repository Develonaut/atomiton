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
    super(
      httpRequestSchema,
      {
        method: "GET" as const,
        url: "https://api.example.com",
        headers: {},
        followRedirects: true,
        validateSSL: true,
      },
      {
        fields: {
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
            controlType: "url",
            label: "Request URL",
            placeholder: "https://api.example.com/endpoint",
          },
          headers: {
            controlType: "json",
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
        layout: {
          groups: {
            request: { label: "Request Settings", order: 1 },
            security: { label: "Security Settings", order: 2 },
          },
        },
      },
    );
  }
}

export const httpRequestConfig = new HttpRequestConfigClass();

export type HttpRequestConfig = z.infer<typeof httpRequestConfig.schema>;

// Types for logic file usage
export type HttpRequestInput = {
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: string;
  params?: Record<string, string>;
};

export type HttpRequestOutput = {
  status: number;
  statusText: string;
  data: unknown;
  headers: Record<string, string>;
  success: boolean;
  url: string;
  duration: number;
};
