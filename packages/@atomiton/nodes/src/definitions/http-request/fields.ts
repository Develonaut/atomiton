/**
 * HTTP Request Field Configuration
 * UI field configurations for HTTP request parameters
 * MVP: Core HTTP request fields only
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for HTTP request parameters
 */
export const httpRequestFields: NodeFieldsConfig = {
  method: {
    controlType: "select",
    label: "Method",
    helpText: "HTTP method to use for the request",
    options: [
      { value: "GET", label: "GET" },
      { value: "POST", label: "POST" },
      { value: "PUT", label: "PUT" },
      { value: "DELETE", label: "DELETE" },
    ],
  },
  url: {
    controlType: "text",
    label: "URL",
    placeholder: "https://api.example.com/endpoint",
    helpText: "The URL to send the request to",
  },
  headers: {
    controlType: "textarea",
    label: "Headers (optional)",
    placeholder:
      '{"Content-Type": "application/json", "Authorization": "Bearer token"}',
    helpText: "HTTP headers as JSON object",
    rows: 3,
  },
  body: {
    controlType: "textarea",
    label: "Body (optional)",
    placeholder: '{"key": "value"}',
    helpText: "Request body content for POST/PUT methods",
    rows: 5,
  },
  // POST-MVP: Removed field configs for advanced features
  // (followRedirects, validateSSL, timeout, retries, retryDelay)
};
