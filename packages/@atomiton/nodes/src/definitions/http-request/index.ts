/**
 * HTTP Request Node Definition
 * Browser-safe configuration for HTTP request node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { httpRequestFields } from "#definitions/http-request/fields";
import { httpRequestInputPorts, httpRequestOutputPorts } from "#definitions/http-request/ports";
import { httpRequestDefaults, httpRequestSchema } from "#definitions/http-request/schema";

/**
 * HTTP Request node definition (browser-safe)
 */
export const httpRequestDefinition: NodeDefinition = createNodeDefinition({
  metadata: createNodeMetadata({
    id         : "http-request",
    name       : "HTTP Request",
    type       : "http-request",
    version    : "1.0.0",
    author     : "Atomiton Core Team",
    description: "Make HTTP requests (GET, POST, PUT, DELETE, etc.)",
    category   : "io",
    icon       : "globe-2",
    keywords   : [
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
    tags        : ["http", "api", "network", "rest", "web"],
    experimental: false,
    deprecated  : false,
  }),
  parameters: createNodeParameters(
    httpRequestSchema,
    httpRequestDefaults,
    httpRequestFields
  ),
  inputPorts : httpRequestInputPorts,
  outputPorts: httpRequestOutputPorts,
});

export default httpRequestDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullHttpRequestSchema = v.object({
  ...httpRequestSchema,
  enabled    : v.boolean().default(true),
  timeout    : v.number().positive().default(30000),
  retries    : v.number().int().min(0).default(1),
  label      : v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type HttpRequestParameters = VInfer<typeof fullHttpRequestSchema>;