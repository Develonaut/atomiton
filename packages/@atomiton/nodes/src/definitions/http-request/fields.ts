/**
 * HTTP Request Field Configuration
 * UI field configurations for HTTP request parameters
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for HTTP request parameters
 */
export const httpRequestFields: NodeFieldsConfig = {
  method: {
    controlType: "select",
    label      : "HTTP Method",
    helpText   : "HTTP method to use for the request",
    options    : [
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
    label      : "Request URL",
    placeholder: "https://api.example.com/endpoint",
    helpText   : "The URL to send the request to",
  },
  headers: {
    controlType: "textarea",
    label      : "Headers",
    placeholder:
      '{"Content-Type": "application/json", "Authorization": "Bearer token"}',
    helpText: "HTTP headers as JSON object",
    rows    : 3,
  },
  body: {
    controlType: "textarea",
    label      : "Request Body",
    placeholder: '{"key": "value"}',
    helpText   : "Request body content (for POST, PUT, PATCH methods)",
    rows       : 5,
  },
  followRedirects: {
    controlType: "boolean",
    label      : "Follow Redirects",
    helpText   : "Automatically follow HTTP redirects",
  },
  validateSSL: {
    controlType: "boolean",
    label      : "Validate SSL",
    helpText   : "Validate SSL certificates for HTTPS requests",
  },
  timeout: {
    controlType: "number",
    label      : "Timeout (ms)",
    helpText   : "Request timeout in milliseconds",
    min        : 1000,
    max        : 300000,
    step       : 1000,
  },
  retries: {
    controlType: "number",
    label      : "Retries",
    helpText   : "Number of retry attempts on failure",
    min        : 0,
    max        : 5,
  },
  retryDelay: {
    controlType: "number",
    label      : "Retry Delay (ms)",
    helpText   : "Delay between retry attempts in milliseconds",
    min        : 100,
    max        : 10000,
    step       : 100,
  },
};