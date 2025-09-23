/**
 * HTTP Request Node Executable
 * Node.js implementation with HTTP request logic
 */

import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult
} from '../../core/types/executable';
import { createNodeExecutable } from '../../core/factories/createNodeExecutable';
import type { HttpRequestParameters } from '../../definitions/http-request';

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
 * Build URL with query parameters
 */
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

/**
 * Parse response based on content type
 */
async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    } else if (
      contentType.includes("text/") ||
      contentType.includes("application/xml") ||
      contentType.includes("application/xhtml")
    ) {
      return await response.text();
    } else {
      // For binary data, get as ArrayBuffer and convert to base64
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString("base64");
    }
  } catch {
    // If parsing fails, fall back to text
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

/**
 * Execute HTTP request with retries
 */
async function executeRequestWithRetries(
  url: string,
  options: RequestInit,
  config: HttpRequestParameters,
  context: NodeExecutionContext
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      context.log?.debug?.(`HTTP request attempt ${attempt + 1}`, {
        url,
        method: options.method,
      });

      const response = await fetch(url, options);
      return response;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.retries) {
        context.log?.warn?.(`HTTP request failed, retrying (attempt ${attempt + 1}/${config.retries})`, {
          error: lastError.message,
          retryDelay: config.retryDelay,
        });

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      }
    }
  }

  throw lastError!;
}

/**
 * HTTP Request node executable
 */
export const httpRequestExecutable: NodeExecutable<HttpRequestParameters> = createNodeExecutable({
  async execute(
    context: NodeExecutionContext,
    config: HttpRequestParameters,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const inputs = context.inputs as HttpRequestInput;

    try {
      // Get parameters from inputs or config
      const url = inputs?.url || config.url;
      const method = inputs?.method || config.method;
      const inputHeaders = inputs?.headers || {};
      const body = inputs?.body || config.body;
      const params = inputs?.params;
      const auth = inputs?.auth;

      if (!url) {
        throw new Error("URL is required for HTTP requests");
      }

      // Validate URL
      let validUrl: URL;
      try {
        validUrl = new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }

      context.log?.info?.(`Making ${method} request to ${validUrl.hostname}`, {
        method,
        path: validUrl.pathname,
        hasBody: !!body,
      });

      // Build final URL with query parameters
      const finalUrl = buildUrlWithParams(url, params);

      // Prepare headers
      const headers: Record<string, string> = {
        ...config.headers,
        ...inputHeaders,
      };

      // Handle authentication
      if (auth) {
        if (auth.type === "basic" && auth.username && auth.password) {
          const credentials = Buffer.from(
            `${auth.username}:${auth.password}`,
          ).toString("base64");
          headers["Authorization"] = `Basic ${credentials}`;
        } else if (auth.type === "bearer" && auth.token) {
          headers["Authorization"] = `Bearer ${auth.token}`;
        }
      }

      // Prepare request body
      let requestBody: string | Buffer | undefined;
      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        if (typeof body === "object" && !(body instanceof Buffer)) {
          requestBody = JSON.stringify(body);
          if (!headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
          }
        } else {
          requestBody = body as string | Buffer;
        }
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(config.timeout),
        redirect: config.followRedirects ? "follow" : "manual",
      };

      // Add body if present
      if (requestBody) {
        requestOptions.body = requestBody;
      }

      context.log?.debug?.("Sending HTTP request", {
        url: finalUrl,
        method,
        hasBody: !!requestBody,
        headerCount: Object.keys(headers).length,
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
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const output: HttpRequestOutput = {
        result: data,
        data: data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        success: response.ok,
        duration,
        url: finalUrl,
        ok: response.ok,
      };

      context.log?.info?.(
        `HTTP request completed: ${response.status} ${response.statusText}`,
        {
          status: response.status,
          ok: response.ok,
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
      let errorMessage = "HTTP request failed";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = `Request timeout after ${config.timeout}ms`;
        } else if (error.message.includes("fetch")) {
          errorMessage = `Network error: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      }

      context.log?.error?.('HTTP request failed', {
        error: errorMessage,
        duration,
        config: {
          method: config.method,
          url: config.url,
          timeout: config.timeout,
          retries: config.retries,
        },
      });

      return {
        success: false,
        error: errorMessage,
        outputs: {
          result: null,
          data: null,
          status: 0,
          statusText: '',
          headers: {},
          success: false,
          duration,
          url: '',
          ok: false,
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