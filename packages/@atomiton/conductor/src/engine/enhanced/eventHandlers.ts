/**
 * Event handling setup for enhanced execution engine
 */

import { events } from "@atomiton/events";
import type { ScalableQueueInstance } from "../../queue";

type EngineEvents = {
  "execution:started": { executionId: string; compositeId: string };
  "execution:completed": { jobId: string; result: unknown };
  "execution:failed": { jobId: string; error: Error };
  "execution:paused": { executionId: string };
  "execution:resumed": { executionId: string };
  "execution:cancelled": { executionId: string };
  "engine:shutting-down": void;
  "engine:shutdown": void;
  "metrics:update": {
    queue: unknown;
    workers: unknown;
    execution: unknown;
  };
};

export function createEventHandlers(
  queue: ScalableQueueInstance,
  metricsManager: {
    incrementActiveExecutions: () => void;
    decrementActiveExecutions: () => void;
    incrementTotalExecutions: () => void;
    incrementSuccessfulExecutions: () => void;
    incrementFailedExecutions: () => void;
    getMetrics: () => unknown;
  },
  webhookManager: {
    emitWebhookReceived: (response: unknown) => void;
  },
) {
  const engineEventBus =
    events.createEventBus<EngineEvents>("conductor:engine");

  const setupQueueHandlers = (): void => {
    queue.on("job:started", (data: any) => {
      metricsManager.incrementActiveExecutions();
      engineEventBus.emit("execution:started", {
        executionId: data.jobData.executionId,
        compositeId: data.jobData.blueprintId,
      });
    });

    queue.on("job:completed", (data: any) => {
      metricsManager.decrementActiveExecutions();
      metricsManager.incrementTotalExecutions();
      if (data.result?.success) {
        metricsManager.incrementSuccessfulExecutions();
      }
      engineEventBus.emit("execution:completed", {
        jobId: data.jobId,
        result: data.result,
      });
    });

    queue.on("job:failed", (data: any) => {
      metricsManager.decrementActiveExecutions();
      metricsManager.incrementFailedExecutions();
      engineEventBus.emit("execution:failed", {
        jobId: data.jobId,
        error: data.error,
      });
    });

    queue.on("webhook:response", (response: any) => {
      webhookManager.emitWebhookReceived(response);
    });
  };

  const setupMetricsCollection = (): void => {
    setInterval(() => {
      const queueMetrics = queue.getMetrics();
      const workerMetrics = queue.getWorkerMetrics();

      engineEventBus.emit("metrics:update", {
        queue: queueMetrics,
        workers: workerMetrics,
        execution: metricsManager.getMetrics(),
      });
    }, 5000);
  };

  const emitExecutionPaused = (executionId: string): void => {
    engineEventBus.emit("execution:paused", { executionId });
  };

  const emitExecutionResumed = (executionId: string): void => {
    engineEventBus.emit("execution:resumed", { executionId });
  };

  const emitExecutionCancelled = (executionId: string): void => {
    engineEventBus.emit("execution:cancelled", { executionId });
  };

  const emitEngineShuttingDown = (): void => {
    engineEventBus.emit("engine:shutting-down", undefined);
  };

  const emitEngineShutdown = (): void => {
    engineEventBus.emit("engine:shutdown", undefined);
  };

  return {
    setupQueueHandlers,
    setupMetricsCollection,
    emitExecutionPaused,
    emitExecutionResumed,
    emitExecutionCancelled,
    emitEngineShuttingDown,
    emitEngineShutdown,
    eventBus: engineEventBus,
  };
}
