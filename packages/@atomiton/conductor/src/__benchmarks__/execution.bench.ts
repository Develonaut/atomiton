/**
 * Benchmark tests for execution performance
 * Run with: pnpm test:benchmark
 */

import { bench, describe } from "vitest";
import { createCompositeRunner } from "../execution/composite/compositeRunner";
import { createExecutionStore } from "../store";
import { createNodeExecutor } from "../execution/nodeExecutor";
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
      nodes: [
        {
          id: "transform1",
          type: "transform",
          data: {},
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      inputs: {},
      outputs: {},
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
      store.getVariable(execId, "testVar");
      store.updateExecutionState(execId, { status: "running" });
    });
  });
}
