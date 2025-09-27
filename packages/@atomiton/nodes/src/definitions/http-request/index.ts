/**
 * HTTP Request Node Definition
 * Browser-safe configuration for HTTP request node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { httpRequestFields } from "#definitions/http-request/fields";
import {
  httpRequestInputPorts,
  httpRequestOutputPorts,
} from "#definitions/http-request/ports";

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

/**
 * HTTP Request node definition (browser-safe)
 */
export const httpRequestDefinition: NodeDefinition = createNodeDefinition({
  type: "http-request",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "http-request",
    name: "HTTP Request",
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
  parameters: createNodeParameters(httpRequestDefaults, httpRequestFields),
  inputPorts: httpRequestInputPorts,
  outputPorts: httpRequestOutputPorts,
});

export default httpRequestDefinition;
