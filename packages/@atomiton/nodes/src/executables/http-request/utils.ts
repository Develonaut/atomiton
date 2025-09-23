/**
 * HTTP Request Utilities
 * Helper functions for HTTP requests
 */

/**
 * Build URL with query parameters
 */
export function buildUrlWithParams(
  baseUrl: string,
  params?: Record<string, string>
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
 * Validate URL string
 */
export function validateUrl(url: string): URL {
  try {
    return new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Parse error message for better reporting
 */
export function parseErrorMessage(error: unknown, timeout: number): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return `Request timeout after ${timeout}ms`;
    } else if (error.message.includes("fetch")) {
      return `Network error: ${error.message}`;
    } else {
      return error.message;
    }
  }
  return "HTTP request failed";
}