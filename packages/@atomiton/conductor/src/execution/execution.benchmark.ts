/**
 * Benchmark tests for execution performance
 * Run with: pnpm test:benchmark
 */

import { bench, describe } from "vitest";
import { createCompositeRunner } from "./composite/compositeRunner";
import { createExecutionStore } from "../store";
import { createNodeExecutor } from "./nodeExecutor";
import type { CompositeDefinition } from "@atomiton/nodes/executable";

// Only run benchmarks in benchmark mode
if (typeof bench !== "undefined") {
  describe("Execution Performance Benchmarks", () => {
    const executionStore = createExecutionStore();
    const nodeExecutor = createNodeExecutor();
    const compositeRunner = createCompositeRunner(executionStore, nodeExecutor);

    const simpleComposite: CompositeDefinition = {
      id: "perf-test",
      name: "Performance Test",
      description: "Simple composite for benchmarking",
      version: "1.0.0",
      category: "benchmark" as const,
      type: "composite" as const,
      nodes: [
        {
          id: "transform1",
          name: "Transform Node",
          type: "transform",
          category: "data" as const,
          data: {},
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
    };

    bench("composite runner creation", () => {
      createCompositeRunner(executionStore, nodeExecutor);
    });

    bench("simple composite validation", () => {
      compositeRunner.execute(simpleComposite);
    });

    bench("execution store operations", () => {
      const store = createExecutionStore();
      const execId = "test-exec-123";

      store.initializeExecution(execId, "test-composite");
      store.setVariable(execId, "testVar", "testValue");
      // Verify variable was stored
      (store as { variables?: Map<string, Map<string, unknown>> }).variables?.get(execId)?.get("testVar");
      store.updateExecutionState(execId, { status: "running" });
    });
  });
}
