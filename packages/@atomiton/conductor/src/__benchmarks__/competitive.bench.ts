/**
 * Competitive Benchmarks - Simulating n8n, Zapier, Make.com workflow patterns
 */

import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";
import { bench, describe } from "vitest";
import { ExecutionEngine } from "../engine/ExecutionEngine";
import type { Blueprint } from "../execution/BlueprintRunner";

// Realistic node implementations mimicking popular automation platforms
function createRealisticNode(
  type: string,
  config: {
    latency?: number;
    processingTime?: number;
    dataSize?: "small" | "medium" | "large";
    errorRate?: number;
  } = {},
): INode {
  const {
    latency = 50, // Network latency simulation
    processingTime = 10, // Processing time
    dataSize = "small",
    errorRate = 0, // 0-1 probability of failure
  } = config;

  return {
    metadata: {
      id: type,
      name: type,
      description: `Realistic ${type} node`,
      version: "1.0.0",
      category: "automation",
      type,
      experimental: false,
      deprecated: false,
    },
    config: {
      getConfig: () => ({}),
      setConfig: () => {},
      validate: () => ({ valid: true, errors: [] }),
      getSchema: () => ({}),
    },
    logic: { execute: async () => ({ success: true, outputs: {} }) },
    definition: {
      id: type,
      name: type,
      category: "automation",
      type,
    },
    execute: async (
      _context: NodeExecutionContext,
    ): Promise<NodeExecutionResult> => {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, latency));

      // Simulate processing time
      const startProcessing = Date.now();
      while (Date.now() - startProcessing < processingTime) {
        // Busy wait to simulate processing
        Math.sqrt(Math.random());
      }

      // Simulate failure
      if (Math.random() < errorRate) {
        return {
          success: false,
          error: `${type} node failed randomly`,
        };
      }

      // Generate realistic output data
      let outputData: unknown;
      switch (dataSize) {
        case "small":
          outputData = {
            id: Math.random(),
            timestamp: new Date().toISOString(),
          };
          break;
        case "medium":
          outputData = Array.from({ length: 100 }, (_, i) => ({
            id: i,
            value: Math.random(),
            processed: true,
          }));
          break;
        case "large":
          outputData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            data: Array.from({ length: 50 }, () => Math.random()),
            metadata: { processed: new Date().toISOString() },
          }));
          break;
      }

      return {
        success: true,
        outputs: {
          data: outputData,
          statusCode: 200,
          headers: { "content-type": "application/json" },
        },
        metadata: {
          latency,
          processingTime,
          dataSize,
        },
      };
    },
    getId: () => type,
    getName: () => type,
    getVersion: () => "1.0.0",
    isExperimental: () => false,
    isDeprecated: () => false,
    validate: () => ({ valid: true, errors: [] }),
  };
}

describe("Zapier-style Workflow Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: true,
      maxConcurrentExecutions: 10,
    });

    // Register Zapier-style nodes
    executionEngine.registerNode(
      "webhook",
      createRealisticNode("webhook", { latency: 20, processingTime: 5 }),
    );
    executionEngine.registerNode(
      "gmail",
      createRealisticNode("gmail", { latency: 150, processingTime: 30 }),
    );
    executionEngine.registerNode(
      "slack",
      createRealisticNode("slack", { latency: 100, processingTime: 15 }),
    );
    executionEngine.registerNode(
      "google-sheets",
      createRealisticNode("google-sheets", {
        latency: 200,
        processingTime: 50,
      }),
    );
    executionEngine.registerNode(
      "filter",
      createRealisticNode("filter", { latency: 5, processingTime: 10 }),
    );
    executionEngine.registerNode(
      "formatter",
      createRealisticNode("formatter", { latency: 5, processingTime: 15 }),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("Zapier: Webhook → Filter → Gmail (basic automation)", async () => {
    const blueprint: Blueprint = {
      id: "webhook-filter-email",
      name: "Webhook to Email",
      nodes: [
        {
          id: "webhook-1",
          type: "webhook",
          config: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "filter-1",
          type: "filter",
          config: {},
          position: { x: 200, y: 0 },
        },
        {
          id: "gmail-1",
          type: "gmail",
          config: {},
          position: { x: 400, y: 0 },
        },
      ],
      connections: [
        {
          id: "webhook-filter",
          sourceNodeId: "webhook-1",
          sourcePort: "data",
          targetNodeId: "filter-1",
          targetPort: "input",
        },
        {
          id: "filter-gmail",
          sourceNodeId: "filter-1",
          sourcePort: "data",
          targetNodeId: "gmail-1",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Zapier: Multi-app integration (5 steps)", async () => {
    const blueprint: Blueprint = {
      id: "multi-app-integration",
      name: "Multi-app Integration",
      nodes: [
        {
          id: "webhook-1",
          type: "webhook",
          config: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "filter-1",
          type: "filter",
          config: {},
          position: { x: 200, y: 0 },
        },
        {
          id: "formatter-1",
          type: "formatter",
          config: {},
          position: { x: 400, y: 0 },
        },
        {
          id: "sheets-1",
          type: "google-sheets",
          config: {},
          position: { x: 600, y: 0 },
        },
        {
          id: "slack-1",
          type: "slack",
          config: {},
          position: { x: 800, y: 0 },
        },
      ],
      connections: [
        {
          id: "c1",
          sourceNodeId: "webhook-1",
          sourcePort: "data",
          targetNodeId: "filter-1",
          targetPort: "input",
        },
        {
          id: "c2",
          sourceNodeId: "filter-1",
          sourcePort: "data",
          targetNodeId: "formatter-1",
          targetPort: "input",
        },
        {
          id: "c3",
          sourceNodeId: "formatter-1",
          sourcePort: "data",
          targetNodeId: "sheets-1",
          targetPort: "input",
        },
        {
          id: "c4",
          sourceNodeId: "sheets-1",
          sourcePort: "data",
          targetNodeId: "slack-1",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Zapier: Parallel notification pattern", async () => {
    const blueprint: Blueprint = {
      id: "parallel-notifications",
      name: "Parallel Notifications",
      nodes: [
        {
          id: "webhook-1",
          type: "webhook",
          config: {},
          position: { x: 0, y: 100 },
        },
        {
          id: "gmail-1",
          type: "gmail",
          config: {},
          position: { x: 300, y: 0 },
        },
        {
          id: "slack-1",
          type: "slack",
          config: {},
          position: { x: 300, y: 100 },
        },
        {
          id: "sheets-1",
          type: "google-sheets",
          config: {},
          position: { x: 300, y: 200 },
        },
      ],
      connections: [
        {
          id: "webhook-gmail",
          sourceNodeId: "webhook-1",
          sourcePort: "data",
          targetNodeId: "gmail-1",
          targetPort: "input",
        },
        {
          id: "webhook-slack",
          sourceNodeId: "webhook-1",
          sourcePort: "data",
          targetNodeId: "slack-1",
          targetPort: "input",
        },
        {
          id: "webhook-sheets",
          sourceNodeId: "webhook-1",
          sourcePort: "data",
          targetNodeId: "sheets-1",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("n8n-style Workflow Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: true,
      maxConcurrentExecutions: 8,
    });

    // Register n8n-style nodes with more realistic latencies
    executionEngine.registerNode(
      "http-request",
      createRealisticNode("http-request", { latency: 80, processingTime: 20 }),
    );
    executionEngine.registerNode(
      "json-parser",
      createRealisticNode("json-parser", { latency: 5, processingTime: 10 }),
    );
    executionEngine.registerNode(
      "set-node",
      createRealisticNode("set-node", { latency: 2, processingTime: 5 }),
    );
    executionEngine.registerNode(
      "if-node",
      createRealisticNode("if-node", { latency: 3, processingTime: 8 }),
    );
    executionEngine.registerNode(
      "postgres",
      createRealisticNode("postgres", { latency: 40, processingTime: 25 }),
    );
    executionEngine.registerNode(
      "redis",
      createRealisticNode("redis", { latency: 15, processingTime: 8 }),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("n8n: HTTP → JSON → Database pipeline", async () => {
    const blueprint: Blueprint = {
      id: "http-json-db",
      name: "HTTP JSON DB Pipeline",
      nodes: [
        {
          id: "http-1",
          type: "http-request",
          config: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "json-1",
          type: "json-parser",
          config: {},
          position: { x: 200, y: 0 },
        },
        {
          id: "db-1",
          type: "postgres",
          config: {},
          position: { x: 400, y: 0 },
        },
      ],
      connections: [
        {
          id: "http-json",
          sourceNodeId: "http-1",
          sourcePort: "data",
          targetNodeId: "json-1",
          targetPort: "input",
        },
        {
          id: "json-db",
          sourceNodeId: "json-1",
          sourcePort: "data",
          targetNodeId: "db-1",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("n8n: Complex data processing workflow", async () => {
    const blueprint: Blueprint = {
      id: "complex-data-processing",
      name: "Complex Data Processing",
      nodes: [
        {
          id: "http-1",
          type: "http-request",
          config: {},
          position: { x: 0, y: 100 },
        },
        {
          id: "json-1",
          type: "json-parser",
          config: {},
          position: { x: 200, y: 100 },
        },
        {
          id: "set-1",
          type: "set-node",
          config: {},
          position: { x: 400, y: 50 },
        },
        {
          id: "if-1",
          type: "if-node",
          config: {},
          position: { x: 400, y: 150 },
        },
        {
          id: "postgres-1",
          type: "postgres",
          config: {},
          position: { x: 600, y: 50 },
        },
        {
          id: "redis-1",
          type: "redis",
          config: {},
          position: { x: 600, y: 150 },
        },
      ],
      connections: [
        {
          id: "http-json",
          sourceNodeId: "http-1",
          sourcePort: "data",
          targetNodeId: "json-1",
          targetPort: "input",
        },
        {
          id: "json-set",
          sourceNodeId: "json-1",
          sourcePort: "data",
          targetNodeId: "set-1",
          targetPort: "input",
        },
        {
          id: "json-if",
          sourceNodeId: "json-1",
          sourcePort: "data",
          targetNodeId: "if-1",
          targetPort: "input",
        },
        {
          id: "set-postgres",
          sourceNodeId: "set-1",
          sourcePort: "data",
          targetNodeId: "postgres-1",
          targetPort: "input",
        },
        {
          id: "if-redis",
          sourceNodeId: "if-1",
          sourcePort: "data",
          targetNodeId: "redis-1",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("n8n: Data aggregation from multiple APIs", async () => {
    const blueprint: Blueprint = {
      id: "multi-api-aggregation",
      name: "Multi-API Data Aggregation",
      nodes: [
        {
          id: "api-1",
          type: "http-request",
          config: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "api-2",
          type: "http-request",
          config: {},
          position: { x: 0, y: 100 },
        },
        {
          id: "api-3",
          type: "http-request",
          config: {},
          position: { x: 0, y: 200 },
        },
        {
          id: "json-1",
          type: "json-parser",
          config: {},
          position: { x: 200, y: 0 },
        },
        {
          id: "json-2",
          type: "json-parser",
          config: {},
          position: { x: 200, y: 100 },
        },
        {
          id: "json-3",
          type: "json-parser",
          config: {},
          position: { x: 200, y: 200 },
        },
        {
          id: "aggregator",
          type: "set-node",
          config: {},
          position: { x: 400, y: 100 },
        },
        {
          id: "storage",
          type: "postgres",
          config: {},
          position: { x: 600, y: 100 },
        },
      ],
      connections: [
        {
          id: "api1-json1",
          sourceNodeId: "api-1",
          sourcePort: "data",
          targetNodeId: "json-1",
          targetPort: "input",
        },
        {
          id: "api2-json2",
          sourceNodeId: "api-2",
          sourcePort: "data",
          targetNodeId: "json-2",
          targetPort: "input",
        },
        {
          id: "api3-json3",
          sourceNodeId: "api-3",
          sourcePort: "data",
          targetNodeId: "json-3",
          targetPort: "input",
        },
        {
          id: "json1-agg",
          sourceNodeId: "json-1",
          sourcePort: "data",
          targetNodeId: "aggregator",
          targetPort: "input1",
        },
        {
          id: "json2-agg",
          sourceNodeId: "json-2",
          sourcePort: "data",
          targetNodeId: "aggregator",
          targetPort: "input2",
        },
        {
          id: "json3-agg",
          sourceNodeId: "json-3",
          sourcePort: "data",
          targetNodeId: "aggregator",
          targetPort: "input3",
        },
        {
          id: "agg-storage",
          sourceNodeId: "aggregator",
          sourcePort: "data",
          targetNodeId: "storage",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("Make.com-style Scenario Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: true,
      maxConcurrentExecutions: 12,
    });

    // Register Make.com-style modules
    executionEngine.registerNode(
      "trigger",
      createRealisticNode("trigger", { latency: 30, processingTime: 10 }),
    );
    executionEngine.registerNode(
      "router",
      createRealisticNode("router", { latency: 5, processingTime: 12 }),
    );
    executionEngine.registerNode(
      "iterator",
      createRealisticNode("iterator", { latency: 8, processingTime: 15 }),
    );
    executionEngine.registerNode(
      "aggregator-make",
      createRealisticNode("aggregator-make", {
        latency: 10,
        processingTime: 20,
      }),
    );
    executionEngine.registerNode(
      "api-call",
      createRealisticNode("api-call", { latency: 120, processingTime: 35 }),
    );
    executionEngine.registerNode(
      "data-store",
      createRealisticNode("data-store", { latency: 60, processingTime: 25 }),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("Make: Trigger → Router → Multiple APIs", async () => {
    const blueprint: Blueprint = {
      id: "make-trigger-router",
      name: "Make Trigger Router Pattern",
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          config: {},
          position: { x: 0, y: 100 },
        },
        {
          id: "router-1",
          type: "router",
          config: {},
          position: { x: 200, y: 100 },
        },
        {
          id: "api-1",
          type: "api-call",
          config: {},
          position: { x: 400, y: 0 },
        },
        {
          id: "api-2",
          type: "api-call",
          config: {},
          position: { x: 400, y: 100 },
        },
        {
          id: "api-3",
          type: "api-call",
          config: {},
          position: { x: 400, y: 200 },
        },
        {
          id: "store-1",
          type: "data-store",
          config: {},
          position: { x: 600, y: 100 },
        },
      ],
      connections: [
        {
          id: "trigger-router",
          sourceNodeId: "trigger-1",
          sourcePort: "data",
          targetNodeId: "router-1",
          targetPort: "input",
        },
        {
          id: "router-api1",
          sourceNodeId: "router-1",
          sourcePort: "route1",
          targetNodeId: "api-1",
          targetPort: "input",
        },
        {
          id: "router-api2",
          sourceNodeId: "router-1",
          sourcePort: "route2",
          targetNodeId: "api-2",
          targetPort: "input",
        },
        {
          id: "router-api3",
          sourceNodeId: "router-1",
          sourcePort: "route3",
          targetNodeId: "api-3",
          targetPort: "input",
        },
        {
          id: "api1-store",
          sourceNodeId: "api-1",
          sourcePort: "data",
          targetNodeId: "store-1",
          targetPort: "input1",
        },
        {
          id: "api2-store",
          sourceNodeId: "api-2",
          sourcePort: "data",
          targetNodeId: "store-1",
          targetPort: "input2",
        },
        {
          id: "api3-store",
          sourceNodeId: "api-3",
          sourcePort: "data",
          targetNodeId: "store-1",
          targetPort: "input3",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Make: Iterator → Aggregator pattern", async () => {
    const blueprint: Blueprint = {
      id: "make-iterator-aggregator",
      name: "Make Iterator Aggregator",
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          config: {},
          position: { x: 0, y: 100 },
        },
        {
          id: "iterator-1",
          type: "iterator",
          config: {},
          position: { x: 200, y: 100 },
        },
        {
          id: "api-1",
          type: "api-call",
          config: {},
          position: { x: 400, y: 100 },
        },
        {
          id: "aggregator-1",
          type: "aggregator-make",
          config: {},
          position: { x: 600, y: 100 },
        },
        {
          id: "store-1",
          type: "data-store",
          config: {},
          position: { x: 800, y: 100 },
        },
      ],
      connections: [
        {
          id: "trigger-iterator",
          sourceNodeId: "trigger-1",
          sourcePort: "data",
          targetNodeId: "iterator-1",
          targetPort: "input",
        },
        {
          id: "iterator-api",
          sourceNodeId: "iterator-1",
          sourcePort: "item",
          targetNodeId: "api-1",
          targetPort: "input",
        },
        {
          id: "api-aggregator",
          sourceNodeId: "api-1",
          sourcePort: "data",
          targetNodeId: "aggregator-1",
          targetPort: "input",
        },
        {
          id: "aggregator-store",
          sourceNodeId: "aggregator-1",
          sourcePort: "result",
          targetNodeId: "store-1",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("Enterprise Workflow Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: true,
      maxConcurrentExecutions: 16,
    });

    // Register enterprise-grade nodes with realistic performance characteristics
    executionEngine.registerNode(
      "salesforce",
      createRealisticNode("salesforce", {
        latency: 200,
        processingTime: 80,
        dataSize: "large",
      }),
    );
    executionEngine.registerNode(
      "sap",
      createRealisticNode("sap", {
        latency: 300,
        processingTime: 120,
        dataSize: "large",
      }),
    );
    executionEngine.registerNode(
      "oracle-db",
      createRealisticNode("oracle-db", {
        latency: 100,
        processingTime: 60,
        dataSize: "medium",
      }),
    );
    executionEngine.registerNode(
      "kafka",
      createRealisticNode("kafka", {
        latency: 25,
        processingTime: 15,
        dataSize: "medium",
      }),
    );
    executionEngine.registerNode(
      "etl",
      createRealisticNode("etl", {
        latency: 50,
        processingTime: 200,
        dataSize: "large",
      }),
    );
    executionEngine.registerNode(
      "data-validation",
      createRealisticNode("data-validation", {
        latency: 10,
        processingTime: 40,
        dataSize: "medium",
      }),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("Enterprise: Salesforce → ETL → Oracle pipeline", async () => {
    const blueprint: Blueprint = {
      id: "enterprise-etl",
      name: "Enterprise ETL Pipeline",
      nodes: [
        {
          id: "sf-extract",
          type: "salesforce",
          config: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "validate",
          type: "data-validation",
          config: {},
          position: { x: 200, y: 0 },
        },
        {
          id: "transform",
          type: "etl",
          config: {},
          position: { x: 400, y: 0 },
        },
        {
          id: "oracle-load",
          type: "oracle-db",
          config: {},
          position: { x: 600, y: 0 },
        },
        {
          id: "kafka-notify",
          type: "kafka",
          config: {},
          position: { x: 800, y: 0 },
        },
      ],
      connections: [
        {
          id: "sf-validate",
          sourceNodeId: "sf-extract",
          sourcePort: "data",
          targetNodeId: "validate",
          targetPort: "input",
        },
        {
          id: "validate-etl",
          sourceNodeId: "validate",
          sourcePort: "data",
          targetNodeId: "transform",
          targetPort: "input",
        },
        {
          id: "etl-oracle",
          sourceNodeId: "transform",
          sourcePort: "data",
          targetNodeId: "oracle-load",
          targetPort: "input",
        },
        {
          id: "oracle-kafka",
          sourceNodeId: "oracle-load",
          sourcePort: "data",
          targetNodeId: "kafka-notify",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Enterprise: Multi-system data sync", async () => {
    const blueprint: Blueprint = {
      id: "multi-system-sync",
      name: "Multi-system Data Synchronization",
      nodes: [
        {
          id: "sf-source",
          type: "salesforce",
          config: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "sap-source",
          type: "sap",
          config: {},
          position: { x: 0, y: 200 },
        },
        {
          id: "validate-sf",
          type: "data-validation",
          config: {},
          position: { x: 300, y: 0 },
        },
        {
          id: "validate-sap",
          type: "data-validation",
          config: {},
          position: { x: 300, y: 200 },
        },
        {
          id: "etl-merge",
          type: "etl",
          config: {},
          position: { x: 600, y: 100 },
        },
        {
          id: "oracle-store",
          type: "oracle-db",
          config: {},
          position: { x: 900, y: 100 },
        },
      ],
      connections: [
        {
          id: "sf-validate",
          sourceNodeId: "sf-source",
          sourcePort: "data",
          targetNodeId: "validate-sf",
          targetPort: "input",
        },
        {
          id: "sap-validate",
          sourceNodeId: "sap-source",
          sourcePort: "data",
          targetNodeId: "validate-sap",
          targetPort: "input",
        },
        {
          id: "sf-merge",
          sourceNodeId: "validate-sf",
          sourcePort: "data",
          targetNodeId: "etl-merge",
          targetPort: "salesforce",
        },
        {
          id: "sap-merge",
          sourceNodeId: "validate-sap",
          sourcePort: "data",
          targetNodeId: "etl-merge",
          targetPort: "sap",
        },
        {
          id: "merge-store",
          sourceNodeId: "etl-merge",
          sourcePort: "data",
          targetNodeId: "oracle-store",
          targetPort: "input",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("High-Volume Processing Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: true,
      maxConcurrentExecutions: 20,
    });

    // High-volume processing nodes
    executionEngine.registerNode(
      "batch-processor",
      createRealisticNode("batch-processor", {
        latency: 20,
        processingTime: 100,
        dataSize: "large",
      }),
    );
    executionEngine.registerNode(
      "stream-processor",
      createRealisticNode("stream-processor", {
        latency: 5,
        processingTime: 25,
        dataSize: "medium",
      }),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("High-volume: 10 parallel batch processors", async () => {
    const nodes = Array.from({ length: 10 }, (_, i) => ({
      id: `batch-${i}`,
      type: "batch-processor",
      config: {},
      position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 200 },
    }));

    const blueprint: Blueprint = {
      id: "parallel-batch",
      name: "Parallel Batch Processing",
      nodes,
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("High-volume: Stream processing pipeline", async () => {
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      id: `stream-${i}`,
      type: "stream-processor",
      config: {},
      position: { x: i * 150, y: 0 },
    }));

    const connections = Array.from({ length: 7 }, (_, i) => ({
      id: `stream-conn-${i}`,
      sourceNodeId: `stream-${i}`,
      sourcePort: "data",
      targetNodeId: `stream-${i + 1}`,
      targetPort: "input",
    }));

    const blueprint: Blueprint = {
      id: "stream-pipeline",
      name: "Stream Processing Pipeline",
      nodes,
      connections,
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("Error Resilience Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: true,
      maxConcurrentExecutions: 8,
    });

    // Unreliable nodes for testing error handling
    executionEngine.registerNode(
      "unreliable",
      createRealisticNode("unreliable", {
        latency: 50,
        processingTime: 20,
        errorRate: 0.2, // 20% failure rate
      }),
    );
    executionEngine.registerNode(
      "reliable",
      createRealisticNode("reliable", {
        latency: 30,
        processingTime: 15,
        errorRate: 0.01, // 1% failure rate
      }),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("Error handling: Mixed reliable/unreliable nodes", async () => {
    const blueprint: Blueprint = {
      id: "error-resilience",
      name: "Error Resilience Test",
      nodes: [
        {
          id: "reliable-1",
          type: "reliable",
          config: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "unreliable-1",
          type: "unreliable",
          config: {},
          position: { x: 200, y: 0 },
        },
        {
          id: "reliable-2",
          type: "reliable",
          config: {},
          position: { x: 400, y: 0 },
        },
        {
          id: "unreliable-2",
          type: "unreliable",
          config: {},
          position: { x: 600, y: 0 },
        },
      ],
      connections: [
        {
          id: "r1-u1",
          sourceNodeId: "reliable-1",
          sourcePort: "data",
          targetNodeId: "unreliable-1",
          targetPort: "input",
        },
        {
          id: "u1-r2",
          sourceNodeId: "unreliable-1",
          sourcePort: "data",
          targetNodeId: "reliable-2",
          targetPort: "input",
        },
        {
          id: "r2-u2",
          sourceNodeId: "reliable-2",
          sourcePort: "data",
          targetNodeId: "unreliable-2",
          targetPort: "input",
        },
      ],
    };

    try {
      await executionEngine.executeBlueprint(blueprint);
    } catch (_error) {
      // Expected - some executions will fail due to unreliable nodes
      void _error;
    }
  });
});
