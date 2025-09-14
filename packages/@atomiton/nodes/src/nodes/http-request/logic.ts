/**
 * HTTP Request Node Logic
 *
 * Business logic for HTTP/API request operations
 */

import { createNodeLogic } from "../../base/createNodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type { HttpRequestParameters } from "./parameters";

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

export const httpRequestLogic = createNodeLogic<HttpRequestParameters>({
  async execute(
    context: NodeExecutionContext,
    config: HttpRequestParameters,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const inputs = context.inputs as HttpRequestInput;

    try {
      const url = inputs?.url || config.url;
      const method = inputs?.method || config.method;
      const headers = {
        ...config.headers,
        ...(inputs?.headers || {}),
      };
      const body = inputs?.body || config.body;
      const params = inputs?.params;

      if (!url) {
        return {
          success: false,
          outputs: undefined,
          error: "URL is required for HTTP requests",
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: "http-request",
            nodeType: "http-request",
          },
        };
      }

      // Build URL with query parameters
      const finalUrl = buildUrlWithParams(url, params);

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      };

      // Add body for methods that support it
      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        requestOptions.body = body;
      }

      // Make the request
      const response = await fetch(finalUrl, requestOptions);
      const duration = Date.now() - startTime;

      // Get response data
      let data: unknown;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Extract headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const result: HttpRequestOutput = {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
        success: response.ok,
        url: finalUrl,
        duration,
      };

      return {
        success: response.ok,
        outputs: result,
        error: response.ok
          ? undefined
          : `HTTP ${response.status}: ${response.statusText}`,
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: "http-request",
          nodeType: "http-request",
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        outputs: undefined,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: "http-request",
          nodeType: "http-request",
          duration,
        },
      };
    }
  },

  getValidatedParams(context: NodeExecutionContext): HttpRequestParameters {
    return context.parameters as HttpRequestParameters;
  },
});

function buildUrlWithParams(
  baseUrl: string,
  params?: Record<string, string>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}
