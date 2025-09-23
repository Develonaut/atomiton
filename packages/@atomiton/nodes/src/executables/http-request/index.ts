/**
 * HTTP Request Node Executable
 * Node.js implementation with HTTP request logic
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { HttpRequestParameters } from "#definitions/http-request";
import {
  addAuthenticationHeaders,
  executeRequestWithRetries,
  extractResponseHeaders,
  parseResponse,
  prepareRequestBody,
} from "#executables/http-request/operations";
import { buildUrlWithParams, parseErrorMessage, validateUrl } from "#executables/http-request/utils";

// Types for HTTP request
export type HttpRequestInput = {
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  headers?: Record<string, string>;
  body?: string | Record<string, unknown> | Buffer;
  params?: Record<string, string>;
  auth?: {
    type?: "basic" | "bearer";
    username?: string;
    password?: string;
    token?: string;
  };
};

export type HttpRequestOutput = {
  result: unknown;
  data: unknown;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  success: boolean;
  duration: number;
  url: string;
  ok: boolean;
};

/**
 * HTTP Request node executable
 */
export const httpRequestExecutable: NodeExecutable<HttpRequestParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: HttpRequestParameters
    ): Promise<NodeExecutionResult> {
      const startTime = Date.now();
      const inputs = context.inputs as HttpRequestInput;

      try {
        // Get parameters from inputs or config
        const url = (inputs?.url || config.url) as string;
        const method = (inputs?.method || config.method) as string;
        const inputHeaders = inputs?.headers || {};
        const body = inputs?.body || config.body;
        const params = inputs?.params;
        const auth = inputs?.auth;

        if (!url) {
          throw new Error("URL is required for HTTP requests");
        }

        // Validate URL
        const validUrl = validateUrl(url);

        context.log?.info?.(
          `Making ${method} request to ${validUrl.hostname}`,
          {
            method,
            path   : validUrl.pathname,
            hasBody: !!body,
          }
        );

        // Build final URL with query parameters
        const finalUrl = buildUrlWithParams(url, params);

        // Prepare headers
        let headers: Record<string, string> = {
          ...((config.headers as Record<string, string>) || {}),
          ...inputHeaders,
        };

        // Handle authentication
        headers = addAuthenticationHeaders(headers, auth);

        // Prepare request body
        const { body: requestBody, headers: finalHeaders } =
          prepareRequestBody(body, method, headers);

        // Prepare request options
        const requestOptions: RequestInit = {
          method,
          headers : finalHeaders,
          signal  : AbortSignal.timeout(config.timeout as number),
          redirect: (config.followRedirects as boolean) ? "follow" : "manual",
        };

        // Add body if present
        if (requestBody) {
          requestOptions.body = requestBody;
        }

        context.log?.debug?.("Sending HTTP request", {
          url        : finalUrl,
          method,
          hasBody    : !!requestBody,
          headerCount: Object.keys(finalHeaders).length,
        });

        // Make the request with retries
        const response = await executeRequestWithRetries(
          finalUrl,
          requestOptions,
          config,
          context
        );

        const duration = Date.now() - startTime;

        // Parse response data
        const data = await parseResponse(response);

        // Extract response headers
        const responseHeaders = extractResponseHeaders(response);

        const output: HttpRequestOutput = {
          result    : data,
          data,
          status    : response.status,
          statusText: response.statusText,
          headers   : responseHeaders,
          success   : response.ok,
          duration,
          url       : finalUrl,
          ok        : response.ok,
        };

        context.log?.info?.(
          `HTTP request completed: ${response.status} ${response.statusText}`,
          {
            status     : response.status,
            ok         : response.ok,
            duration,
            contentType: response.headers.get("content-type"),
          }
        );

        return {
          success: true,
          outputs: output,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = parseErrorMessage(error, config.timeout as number);

        context.log?.error?.("HTTP request failed", {
          error : errorMessage,
          duration,
          config: {
            method : config.method,
            url    : config.url,
            timeout: config.timeout,
            retries: config.retries,
          },
        });

        return {
          success: false,
          error  : errorMessage,
          outputs: {
            result    : null,
            data      : null,
            status    : 0,
            statusText: "",
            headers   : {},
            success   : false,
            duration,
            url       : "",
            ok        : false,
          },
        };
      }
    },

    validateConfig(config: unknown): HttpRequestParameters {
      // In a real implementation, this would validate using the schema
      // For now, just cast it
      return config as HttpRequestParameters;
    },
  });

export default httpRequestExecutable;