/**
 * HTTP Request Operations
 * Core HTTP request functionality
 */

import type { NodeExecutionContext } from "#core/types/executable";
import type { HttpRequestParameters } from "#definitions/http-request";

/**
 * Parse response based on content type
 */
export async function parseResponse(response: Response): Promise<unknown> {
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
export async function executeRequestWithRetries(
  url: string,
  options: RequestInit,
  config: HttpRequestParameters,
  context: NodeExecutionContext,
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= (config.retries as number); attempt++) {
    try {
      context.log?.debug?.(`HTTP request attempt ${attempt + 1}`, {
        url,
        method: options.method,
      });

      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < (config.retries as number)) {
        context.log?.warn?.(
          `HTTP request failed, retrying (attempt ${attempt + 1}/${config.retries as number})`,
          {
            error: lastError.message,
            retryDelay: config.retryDelay,
          },
        );

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, config.retryDelay as number),
        );
      }
    }
  }

  throw lastError!;
}

/**
 * Build request body and set appropriate headers
 */
export function prepareRequestBody(
  body: unknown,
  method: string,
  headers: Record<string, string>,
): { body: string | undefined; headers: Record<string, string> } {
  let requestBody: string | undefined;

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    if (typeof body === "object" && !(body instanceof Buffer)) {
      requestBody = JSON.stringify(body);
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    } else if (body instanceof Buffer) {
      requestBody = body.toString();
    } else {
      requestBody = body as string;
    }
  }

  return { body: requestBody, headers };
}

/**
 * Handle authentication headers
 */
export function addAuthenticationHeaders(
  headers: Record<string, string>,
  auth?: {
    type?: "basic" | "bearer";
    username?: string;
    password?: string;
    token?: string;
  },
): Record<string, string> {
  if (!auth) return headers;

  if (auth.type === "basic" && auth.username && auth.password) {
    const credentials = Buffer.from(
      `${auth.username}:${auth.password}`,
    ).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  } else if (auth.type === "bearer" && auth.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  return headers;
}

/**
 * Extract headers from Response object
 */
export function extractResponseHeaders(
  response: Response,
): Record<string, string> {
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });
  return responseHeaders;
}
