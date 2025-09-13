/**
 * HTTP Request Node Tests
 *
 * Tests for HttpRequestNode to validate unified architecture compliance
 * and proper atomic node behavior with input/output ports.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { httpRequest } from "./HttpRequestNode";
import type { NodeExecutionContext } from "../../types";
import { isAtomicNode, isCompositeNode } from "../../base/INode";

describe("HttpRequestNode - Unified Architecture Tests", () => {
  let mockContext: NodeExecutionContext;

  beforeEach(() => {
    mockContext = {
      nodeId: "http-request-1",
      inputs: {
        url: "https://api.example.com/data",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: null,
      },
      config: {
        timeout: 30000,
        followRedirects: true,
      },
      startTime: new Date(),
      limits: { maxExecutionTimeMs: 30000 },
      reportProgress: () => {},
      log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    };
  });

  describe("INode Interface Compliance", () => {
    it("should implement INode interface correctly", () => {
      expect(httpRequest.id).toBe("http-request");
      expect(httpRequest.name).toBe("HTTP Request");
      expect(httpRequest.type).toBe("http-request");

      // Test that required methods exist
      expect(typeof httpRequest.execute).toBe("function");
      expect(typeof httpRequest.validate).toBe("function");
      expect(typeof httpRequest.isComposite).toBe("function");
      expect(typeof httpRequest.dispose).toBe("function");
    });

    it("should implement getter API for ports (not methods)", () => {
      // Critical: These should be getters, not methods
      expect(typeof httpRequest.inputPorts).not.toBe("function");
      expect(typeof httpRequest.outputPorts).not.toBe("function");

      expect(Array.isArray(httpRequest.inputPorts)).toBe(true);
      expect(Array.isArray(httpRequest.outputPorts)).toBe(true);
    });

    it("should implement getter API for metadata (not method)", () => {
      // Critical: This should be a getter, not a method
      expect(typeof httpRequest.metadata).not.toBe("function");
      expect(typeof httpRequest.metadata).toBe("object");

      expect(httpRequest.metadata).toHaveProperty("id");
      expect(httpRequest.metadata).toHaveProperty("name");
      expect(httpRequest.metadata).toHaveProperty("type");
      expect(httpRequest.metadata).toHaveProperty("category");
    });

    it("should be identified as atomic node", () => {
      expect(httpRequest.isComposite()).toBe(false);
      expect(isAtomicNode(httpRequest)).toBe(true);
      expect(isCompositeNode(httpRequest)).toBe(false);
    });

    it("should have proper metadata structure", () => {
      const metadata = httpRequest.metadata;

      expect(metadata.id).toBe("http-request");
      expect(metadata.name).toBe("HTTP Request");
      expect(metadata.type).toBe("http-request");
      expect(metadata.category).toBe("io");
      expect(metadata.description).toBe("Call APIs and webhooks");
      expect(metadata.version).toBe("1.0.0");
      expect(Array.isArray(metadata.tags)).toBe(true);
      expect(metadata.tags).toContain("http");
      expect(metadata.tags).toContain("api");
      expect(metadata.icon).toBe("globe-2");
    });
  });

  describe("Unified Execution Model", () => {
    it("should execute via unified execute() method", async () => {
      const result = await httpRequest.execute(mockContext);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
      expect(result).toHaveProperty("metadata");
      expect(typeof result.success).toBe("boolean");
    });

    it("should return proper NodeExecutionResult structure", async () => {
      const result = await httpRequest.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.outputs).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.executedAt).toBeDefined();
      expect(result.metadata?.nodeId).toBe("http-request");
      expect(result.metadata?.nodeType).toBe("http-request");
    });

    it("should handle conductor execution pattern", async () => {
      // Simulate conductor executing any node via INode interface
      const executeAsINode = async (node: typeof httpRequest) => {
        return await node.execute(mockContext);
      };

      const result = await executeAsINode(httpRequest);
      expect(result.success).toBe(true);
      expect(result.outputs).toBeDefined();
    });
  });

  describe("Input Port Definitions", () => {
    it("should have well-defined input ports", () => {
      const inputPorts = httpRequest.inputPorts;

      expect(inputPorts).toHaveLength(4);

      const urlPort = inputPorts.find((p) => p.id === "url");
      expect(urlPort).toBeDefined();
      expect(urlPort?.name).toBe("URL");
      expect(urlPort?.type).toBe("input");
      expect(urlPort?.dataType).toBe("string");
      expect(urlPort?.required).toBe(false);

      const methodPort = inputPorts.find((p) => p.id === "method");
      expect(methodPort).toBeDefined();
      expect(methodPort?.name).toBe("Method");
      expect(methodPort?.dataType).toBe("string");

      const headersPort = inputPorts.find((p) => p.id === "headers");
      expect(headersPort).toBeDefined();
      expect(headersPort?.name).toBe("Headers");
      expect(headersPort?.dataType).toBe("object");

      const bodyPort = inputPorts.find((p) => p.id === "body");
      expect(bodyPort).toBeDefined();
      expect(bodyPort?.name).toBe("Body");
      expect(bodyPort?.dataType).toBe("string");
    });

    it("should handle input data from context", async () => {
      const contextWithInputs = {
        ...mockContext,
        inputs: {
          url: "https://test.com/api",
          method: "POST",
          headers: { Authorization: "Bearer token" },
          body: JSON.stringify({ test: "data" }),
        },
      };

      const result = await httpRequest.execute(contextWithInputs);
      expect(result.success).toBe(true);
    });
  });

  describe("Output Port Definitions", () => {
    it("should have well-defined output ports", () => {
      const outputPorts = httpRequest.outputPorts;

      expect(outputPorts).toHaveLength(4);

      const dataPort = outputPorts.find((p) => p.id === "data");
      expect(dataPort).toBeDefined();
      expect(dataPort?.name).toBe("Data");
      expect(dataPort?.type).toBe("output");
      expect(dataPort?.dataType).toBe("any");
      expect(dataPort?.required).toBe(false);

      const statusPort = outputPorts.find((p) => p.id === "status");
      expect(statusPort).toBeDefined();
      expect(statusPort?.name).toBe("Status");
      expect(statusPort?.dataType).toBe("number");
      expect(statusPort?.required).toBe(true);

      const headersPort = outputPorts.find((p) => p.id === "headers");
      expect(headersPort).toBeDefined();
      expect(headersPort?.name).toBe("Headers");
      expect(headersPort?.dataType).toBe("object");

      const successPort = outputPorts.find((p) => p.id === "success");
      expect(successPort).toBeDefined();
      expect(successPort?.name).toBe("Success");
      expect(successPort?.dataType).toBe("boolean");
      expect(successPort?.required).toBe(true);
    });

    it("should produce expected output structure", async () => {
      const result = await httpRequest.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.outputs).toBeDefined();

      // The outputs should contain the port data
      const outputs = result.outputs as Record<string, unknown>;
      expect(outputs).toHaveProperty("status");
      expect(outputs).toHaveProperty("success");
      expect(typeof outputs.status).toBe("number");
      expect(typeof outputs.success).toBe("boolean");
    });
  });

  describe("HTTP Functionality", () => {
    it("should handle different HTTP methods", async () => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        const context = {
          ...mockContext,
          inputs: {
            ...mockContext.inputs,
            method,
          },
        };

        const result = await httpRequest.execute(context);
        expect(result.success).toBe(true);
      }
    });

    it("should handle headers properly", async () => {
      const contextWithHeaders = {
        ...mockContext,
        inputs: {
          ...mockContext.inputs,
          headers: {
            Authorization: "Bearer token123",
            "Content-Type": "application/json",
            "X-Custom-Header": "custom-value",
          },
        },
      };

      const result = await httpRequest.execute(contextWithHeaders);
      expect(result.success).toBe(true);
    });

    it("should handle request body", async () => {
      const contextWithBody = {
        ...mockContext,
        inputs: {
          ...mockContext.inputs,
          method: "POST",
          body: JSON.stringify({ key: "value", data: [1, 2, 3] }),
        },
      };

      const result = await httpRequest.execute(contextWithBody);
      expect(result.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle execution errors gracefully", async () => {
      const errorContext = {
        ...mockContext,
        inputs: {
          url: "invalid-url-format",
          method: "INVALID_METHOD",
        },
      };

      const result = await httpRequest.execute(errorContext);

      // Should handle errors appropriately (either success with error status or error result)
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
      expect(result).toHaveProperty("metadata");
    });

    it("should validate node structure", () => {
      const validation = httpRequest.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should handle empty inputs", async () => {
      const emptyContext = {
        ...mockContext,
        inputs: {},
      };

      const result = await httpRequest.execute(emptyContext);

      // Should handle empty inputs (might use config defaults)
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
    });
  });

  describe("Configuration Integration", () => {
    it("should handle configuration from context", async () => {
      const contextWithConfig = {
        ...mockContext,
        config: {
          timeout: 5000,
          followRedirects: false,
          maxRetries: 3,
        },
      };

      const result = await httpRequest.execute(contextWithConfig);
      expect(result.success).toBe(true);
    });

    it("should work without explicit configuration", async () => {
      const contextWithoutConfig = {
        ...mockContext,
        config: undefined,
      };

      const result = await httpRequest.execute(contextWithoutConfig);

      // Should use defaults
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
    });
  });

  describe("Search and Discovery", () => {
    it("should be searchable via metadata", () => {
      const metadata = httpRequest.metadata;

      expect(metadata.matchesSearch("http")).toBe(true);
      expect(metadata.matchesSearch("api")).toBe(true);
      expect(metadata.matchesSearch("request")).toBe(true);
      expect(metadata.matchesSearch("webhook")).toBe(true);
      expect(metadata.matchesSearch("rest")).toBe(true);
      expect(metadata.matchesSearch("nonexistent")).toBe(false);
    });

    it("should provide comprehensive search terms", () => {
      const metadata = httpRequest.metadata;
      const searchTerms = metadata.getSearchTerms();

      expect(searchTerms).toContain("http-request");
      expect(searchTerms).toContain("http request");
      expect(searchTerms).toContain("call apis and webhooks");
      expect(searchTerms).toContain("io");
      expect(searchTerms).toContain("http");
      expect(searchTerms).toContain("api");
    });
  });

  describe("Performance and Scalability", () => {
    it("should execute efficiently", async () => {
      const startTime = performance.now();

      const result = await httpRequest.execute(mockContext);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should complete reasonably quickly
    });

    it("should handle concurrent executions", async () => {
      const contexts = [
        {
          ...mockContext,
          nodeId: "http-1",
          inputs: { url: "https://api1.com" },
        },
        {
          ...mockContext,
          nodeId: "http-2",
          inputs: { url: "https://api2.com" },
        },
        {
          ...mockContext,
          nodeId: "http-3",
          inputs: { url: "https://api3.com" },
        },
      ];

      const results = await Promise.all(
        contexts.map((context) => httpRequest.execute(context)),
      );

      results.forEach((result) => {
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("outputs");
      });
    });

    it("should maintain consistent state", async () => {
      const initialMetadata = httpRequest.metadata;
      const initialInputPorts = httpRequest.inputPorts;
      const initialOutputPorts = httpRequest.outputPorts;

      // Execute multiple times
      await httpRequest.execute(mockContext);
      await httpRequest.execute(mockContext);

      // State should remain consistent
      expect(httpRequest.metadata).toEqual(initialMetadata);
      expect(httpRequest.inputPorts).toEqual(initialInputPorts);
      expect(httpRequest.outputPorts).toEqual(initialOutputPorts);
    });
  });

  describe("Integration with Factory Pattern", () => {
    it("should work with node registration system", () => {
      expect(httpRequest).toBeDefined();
      expect(httpRequest.id).toBe("http-request");
      expect(httpRequest.definition).toBeDefined();
      expect(httpRequest.definition.id).toBe(httpRequest.id);
      expect(httpRequest.definition.type).toBe(httpRequest.type);
    });

    it("should have consistent definition and metadata", () => {
      const definition = httpRequest.definition;
      const metadata = httpRequest.metadata;

      expect(definition.id).toBe(metadata.id);
      expect(definition.name).toBe(metadata.name);
      expect(definition.type).toBe(metadata.type);
      expect(definition.category).toBe(metadata.category);
      expect(definition.inputPorts).toEqual(httpRequest.inputPorts);
      expect(definition.outputPorts).toEqual(httpRequest.outputPorts);
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle null and undefined inputs", async () => {
      const contextWithNulls = {
        ...mockContext,
        inputs: {
          url: null,
          method: undefined,
          headers: null,
          body: undefined,
        },
      };

      const result = await httpRequest.execute(contextWithNulls);

      // Should handle gracefully
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
    });

    it("should handle very large payloads", async () => {
      const largeBody = "x".repeat(10000); // 10KB string

      const contextWithLargeBody = {
        ...mockContext,
        inputs: {
          ...mockContext.inputs,
          method: "POST",
          body: largeBody,
        },
      };

      const result = await httpRequest.execute(contextWithLargeBody);
      expect(result).toHaveProperty("success");
    });

    it("should handle special characters in URLs", async () => {
      const contextWithSpecialChars = {
        ...mockContext,
        inputs: {
          ...mockContext.inputs,
          url: "https://api.example.com/search?q=test&special=chars%20encoded",
        },
      };

      const result = await httpRequest.execute(contextWithSpecialChars);
      expect(result).toHaveProperty("success");
    });
  });
});
