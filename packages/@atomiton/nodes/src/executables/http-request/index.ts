/**
 * HTTP Request Node Executable
 * Node.js implementation with HTTP request logic
 * MVP: Core HTTP functionality with hardcoded defaults
 */

import { createExecutable } from "#core/utils/executable";
import type { HttpRequestParameters } from "#schemas/http-request";
import {
  addAuthenticationHeaders,
  executeRequestWithRetries,
  extractResponseHeaders,
  parseResponse,
  prepareRequestBody,
} from "#executables/http-request/operations";
import {
  buildUrlWithParams,
  validateUrl,
} from "#executables/http-request/utils";

// MVP: Hardcoded defaults for advanced features
const MVP_DEFAULTS = {
  followRedirects: true,
  validateSSL: true,
  timeout: 30000, // 30 seconds
  retries: 0, // No retries for MVP
  retryDelay: 0, // N/A (no retries)
};

// Types for HTTP request
export type HttpRequestInput = {
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE"; // MVP: Reduced method set
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
export const httpRequestExecutable = createExecutable<HttpRequestParameters>(
  "http-request",
  async ({ getInput, config, context, getDuration }) => {
    // Get parameters using enhanced helper
    const url = getInput<string>("url");
    const method = getInput<string>("method") || "GET";
    const inputHeaders = getInput<Record<string, string>>("headers") || {};
    const body = getInput<string | Record<string, unknown> | Buffer>("body");
    const params = getInput<Record<string, string>>("params");
    const auth = getInput<{
      type?: "basic" | "bearer";
      username?: string;
      password?: string;
      token?: string;
    }>("auth");

    if (!url) {
      throw new Error("URL is required for HTTP requests");
    }

    // Validate URL
    const validUrl = validateUrl(url);

    context.log.info(`Making ${method} request to ${validUrl.hostname}`, {
      method,
      path: validUrl.pathname,
      hasBody: !!body,
    });

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
    const { body: requestBody, headers: finalHeaders } = prepareRequestBody(
      body,
      method,
      headers,
    );

    // Prepare request options (MVP: Use hardcoded defaults)
    const requestOptions: RequestInit = {
      method,
      headers: finalHeaders,
      signal: AbortSignal.timeout(MVP_DEFAULTS.timeout),
      redirect: MVP_DEFAULTS.followRedirects ? "follow" : "manual",
    };

    // Add body if present
    if (requestBody) {
      requestOptions.body = requestBody;
    }

    context.log.debug("Sending HTTP request", {
      url: finalUrl,
      method,
      hasBody: !!requestBody,
      headerCount: Object.keys(finalHeaders).length,
    });

    // Make the request with retries
    const response = await executeRequestWithRetries(
      finalUrl,
      requestOptions,
      config,
      context,
    );

    const duration = getDuration();

    // Parse response data
    const data = await parseResponse(response);

    // Extract response headers
    const responseHeaders = extractResponseHeaders(response);

    const output: HttpRequestOutput = {
      result: data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      success: response.ok,
      duration,
      url: finalUrl,
      ok: response.ok,
    };

    context.log.info(
      `HTTP request completed: ${response.status} ${response.statusText}`,
      {
        status: response.status,
        ok: response.ok,
        duration,
        contentType: response.headers.get("content-type"),
      },
    );

    return output;
  },
);

export default httpRequestExecutable;
