/**
 * HTTP Request Node
 *
 * Node for making HTTP/API requests
 */

import { Node, NodeMetadata } from "../../base";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import {
  httpRequestConfig,
  type HttpRequestConfig,
} from "./HttpRequestNodeConfig";
import { HttpRequestLogic } from "./HttpRequestNodeLogic";

/**
 * HTTP Request Node Class
 */
class HttpRequestNode extends Node<HttpRequestConfig> {
  readonly metadata = new NodeMetadata({
    id: "http-request",
    name: "HTTP Request",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Call APIs and webhooks",
    category: "io",
    type: "http-request",
    keywords: ["http", "api", "figma", "webhook", "rest", "post", "get"],
    icon: "globe-2",
    experimental: false,
    deprecated: false,
  });

  readonly config = httpRequestConfig;

  readonly logic = new HttpRequestLogic();

  readonly definition: NodeDefinition = {
    id: "http-request",
    name: "HTTP Request",
    description: "Call APIs and webhooks",
    category: "io",
    type: "http-request",
    version: "1.0.0",

    inputPorts: [
      {
        id: "url",
        name: "URL",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Request URL",
      },
      {
        id: "method",
        name: "Method",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "HTTP method",
      },
      {
        id: "headers",
        name: "Headers",
        type: "input",
        dataType: "object",
        required: false,
        multiple: false,
        description: "Request headers",
      },
      {
        id: "body",
        name: "Body",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Request body",
      },
    ] as NodePortDefinition[],

    outputPorts: [
      {
        id: "data",
        name: "Data",
        type: "output",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Response data",
      },
      {
        id: "status",
        name: "Status",
        type: "output",
        dataType: "number",
        required: true,
        multiple: false,
        description: "HTTP status code",
      },
      {
        id: "headers",
        name: "Headers",
        type: "output",
        dataType: "object",
        required: false,
        multiple: false,
        description: "Response headers",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Request success status",
      },
    ] as NodePortDefinition[],

    configSchema: httpRequestConfig.getShape() as unknown as Record<
      string,
      unknown
    >,
    defaultConfig: httpRequestConfig.defaults,

    metadata: {
      executionSettings: {
        timeout: 30000,
        retries: 1,
        sandbox: false,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["http", "api", "figma", "webhook", "rest", "post", "get"],
      icon: "globe-2",
    },

    execute: async (context) => {
      return httpRequest.execute(context);
    },
  };
}

export const httpRequest = new HttpRequestNode();
export default httpRequest;
export type { HttpRequestConfig } from "./HttpRequestNodeConfig";
export { HttpRequestLogic } from "./HttpRequestNodeLogic";
