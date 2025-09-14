import { NodeLogic } from "../../base/NodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type {
  HttpRequestConfig,
  HttpRequestInput,
  HttpRequestOutput,
} from "./HttpRequestNodeConfig";
import { httpRequestConfig } from "./HttpRequestNodeConfig";

export class HttpRequestLogic extends NodeLogic<HttpRequestConfig> {
  getConfigSchema() {
    return httpRequestConfig.schema;
  }

  async execute(
    context: NodeExecutionContext,
    config: HttpRequestConfig,
  ): Promise<NodeExecutionResult> {
    // Store context for metadata creation
    this.context = context;

    const startTime = Date.now();
    const input = context.inputs as HttpRequestInput;

    try {
      const url = input.url || config.url;
      const method = input.method || config.method;
      const headers = { ...config.headers, ...input.headers };
      const body = input.body || config.body;

      if (!url) {
        throw new Error("URL is required for HTTP requests");
      }

      this.log(context, "info", `Making ${method} request to ${url}`);

      // Build URL with query parameters
      const finalUrl = this.buildUrlWithParams(url, input.params);

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: AbortSignal.timeout(config.timeout),
      };

      // Add body for methods that support it
      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        requestOptions.body = body;
      }

      // Make the request
      const response = await fetch(finalUrl, requestOptions);
      const duration = Date.now() - startTime;

      // Parse response data
      let data: unknown;
      const contentType = response.headers.get("content-type");

      try {
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (parseError) {
        this.log(
          context,
          "warn",
          `Could not parse response body: ${parseError}`,
        );
        data = null;
      }

      // Extract response headers
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

      this.log(
        context,
        "info",
        `Request completed in ${duration}ms with status ${response.status}`,
      );
      return this.createSuccessResult(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(context, "error", "HTTP request failed", {
        error: String(error),
      });

      return this.createSuccessResult({
        status: 0,
        statusText: "Error",
        data: null,
        headers: {},
        success: false,
        url: input.url || config.url || "",
        duration,
      });
    }
  }

  private buildUrlWithParams(
    baseUrl: string,
    params?: Record<string, string>,
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }
}
