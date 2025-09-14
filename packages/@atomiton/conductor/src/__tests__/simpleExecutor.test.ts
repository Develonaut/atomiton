import { describe, it, expect } from "vitest";
import { SimpleExecutor, createSimpleNode } from "../simple/simpleExecutor";

describe("SimpleExecutor - Karen approved minimal approach", () => {
  it("should execute a single node blueprint", async () => {
    const executor = new SimpleExecutor();

    const addOneNode = createSimpleNode("add-one", "math", async (input) => {
      return (input as number) + 1;
    });

    const blueprint = {
      id: "simple-add",
      nodes: [addOneNode],
    };

    const result = await executor.executeBlueprint(blueprint, 5);

    expect(result.success).toBe(true);
    expect(result.outputs).toBe(6);
    expect(result.error).toBeUndefined();
  });

  it("should execute multiple nodes sequentially", async () => {
    const executor = new SimpleExecutor();

    const doubleNode = createSimpleNode("double", "math", async (input) => {
      return (input as number) * 2;
    });

    const addTenNode = createSimpleNode("add-ten", "math", async (input) => {
      return (input as number) + 10;
    });

    const blueprint = {
      id: "multi-node",
      nodes: [doubleNode, addTenNode],
    };

    // Start with 5 -> double -> 10 -> add 10 -> 20
    const result = await executor.executeBlueprint(blueprint, 5);

    expect(result.success).toBe(true);
    expect(result.outputs).toBe(20);
  });

  it("should handle node errors gracefully", async () => {
    const executor = new SimpleExecutor();

    const failingNode = createSimpleNode("fail", "error", async () => {
      throw new Error("Node failed intentionally");
    });

    const blueprint = {
      id: "failing-blueprint",
      nodes: [failingNode],
    };

    const result = await executor.executeBlueprint(blueprint, "test");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Node failed intentionally");
    expect(result.outputs).toBeUndefined();
  });

  it("should process string data through nodes", async () => {
    const executor = new SimpleExecutor();

    const upperCaseNode = createSimpleNode(
      "uppercase",
      "text",
      async (input) => {
        return (input as string).toUpperCase();
      },
    );

    const addExclamationNode = createSimpleNode(
      "exclaim",
      "text",
      async (input) => {
        return (input as string) + "!";
      },
    );

    const blueprint = {
      id: "text-processing",
      nodes: [upperCaseNode, addExclamationNode],
    };

    const result = await executor.executeBlueprint(blueprint, "hello world");

    expect(result.success).toBe(true);
    expect(result.outputs).toBe("HELLO WORLD!");
  });

  it("should work with complex objects", async () => {
    const executor = new SimpleExecutor();

    const addFieldNode = createSimpleNode(
      "add-field",
      "transform",
      async (input) => {
        return {
          ...(input as object),
          processed: true,
          timestamp: new Date().toISOString(),
        };
      },
    );

    const blueprint = {
      id: "object-processing",
      nodes: [addFieldNode],
    };

    const inputData = { name: "test", value: 42 };
    const result = await executor.executeBlueprint(blueprint, inputData);

    expect(result.success).toBe(true);
    expect(result.outputs).toMatchObject({
      name: "test",
      value: 42,
      processed: true,
    });
    expect(
      (result.outputs as unknown as { timestamp: unknown }).timestamp,
    ).toBeDefined();
  });

  it("should handle async node operations", async () => {
    const executor = new SimpleExecutor();

    const delayNode = createSimpleNode("delay", "utility", async (input) => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));
      return `Delayed: ${input}`;
    });

    const blueprint = {
      id: "async-test",
      nodes: [delayNode],
    };

    const result = await executor.executeBlueprint(blueprint, "test input");

    expect(result.success).toBe(true);
    expect(result.outputs).toBe("Delayed: test input");
  });

  it("should execute HTTP-like workflow pattern", async () => {
    const executor = new SimpleExecutor();

    // Simulate n8n/Zapier style HTTP -> JSON -> Process pattern
    const httpNode = createSimpleNode("http", "request", async (input) => {
      return {
        status: 200,
        data: `{"message": "Hello", "input": "${input}"}`,
      };
    });

    const jsonParseNode = createSimpleNode("json", "parser", async (input) => {
      const httpResponse = input as { status: number; data: string };
      return JSON.parse(httpResponse.data);
    });

    const processNode = createSimpleNode(
      "process",
      "transform",
      async (input) => {
        const json = input as { message: string; input: string };
        return {
          result: `${json.message} from ${json.input}`,
          processed_at: new Date().toISOString(),
        };
      },
    );

    const blueprint = {
      id: "http-workflow",
      nodes: [httpNode, jsonParseNode, processNode],
    };

    const result = await executor.executeBlueprint(blueprint, "webhook");

    expect(result.success).toBe(true);
    expect((result.outputs as unknown as { result: string }).result).toBe(
      "Hello from webhook",
    );
    expect(
      (result.outputs as unknown as { processed_at: unknown }).processed_at,
    ).toBeDefined();
  });

  it("should demonstrate n8n competitive performance pattern", async () => {
    const executor = new SimpleExecutor();

    // Create nodes that simulate real-world processing times
    const nodes = [
      createSimpleNode("fetch", "http", async (input) => {
        await new Promise((r) => setTimeout(r, 5)); // Simulate 5ms network
        return { data: `fetched-${input}` };
      }),

      createSimpleNode("validate", "logic", async (input) => {
        await new Promise((r) => setTimeout(r, 2)); // Simulate 2ms validation
        return { ...(input as object), valid: true };
      }),

      createSimpleNode("transform", "data", async (input) => {
        await new Promise((r) => setTimeout(r, 3)); // Simulate 3ms transform
        return { result: `transformed-${JSON.stringify(input)}` };
      }),
    ];

    const blueprint = {
      id: "performance-test",
      nodes,
    };

    const startTime = Date.now();
    const result = await executor.executeBlueprint(blueprint, "test");
    const endTime = Date.now();

    expect(result.success).toBe(true);
    expect(endTime - startTime).toBeLessThan(50); // Should complete in <50ms
    expect((result.outputs as unknown as { result: string }).result).toContain(
      "transformed",
    );
  });
});
