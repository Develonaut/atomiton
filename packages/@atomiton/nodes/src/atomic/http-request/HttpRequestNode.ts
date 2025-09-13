/**
 * HTTP Request Node
 *
 * Node for making HTTP/API requests
 */

import { Node } from "../../base/Node.js";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types.js";
import { HttpRequestLogic } from "./HttpRequestNodeLogic.js";

/**
 * HTTP Request Node Class
 */
class HttpRequestNode extends Node {
  readonly id = "http-request";
  readonly name = "HTTP Request";
  readonly type = "http-request";

  private logic = new HttpRequestLogic();

  /**
   * Execute the HTTP request node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing HTTP Request node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the HTTP request logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "HTTP Request execution completed", { result });
      return result;
    } catch (error) {
      this.log(context, "error", "HTTP Request execution failed", { error });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Atomic nodes are never composite
   */
  isComposite(): false {
    return false;
  }

  /**
   * Input ports for this node
   */
  get inputPorts(): NodePortDefinition[] {
    return [
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
    ];
  }

  /**
   * Output ports for this node
   */
  get outputPorts(): NodePortDefinition[] {
    return [
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
    ];
  }

  /**
   * Get metadata for this node
   */
  get metadata() {
    return {
      ...super.metadata,
      category: "io",
      description: "Call APIs and webhooks",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["http", "api", "figma", "webhook", "rest", "post", "get"],
      icon: "globe-2",
    };
  }
}

export const httpRequest = new HttpRequestNode();
