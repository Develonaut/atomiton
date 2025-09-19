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
  // Use the simplified events API
  const engineEvents = events;

  const setupQueueHandlers = (): void => {
    queue.on("job:started", (data: unknown) => {
      metricsManager.incrementActiveExecutions();
      if (typeof data === "object" && data !== null && "jobData" in data) {
        const jobData = (
          data as { jobData: { executionId: string; blueprintId: string } }
        ).jobData;
        engineEvents.emit("execution:started", {
          executionId: jobData.executionId,
          compositeId: jobData.blueprintId,
        });
      }
    });

    queue.on("job:completed", (data: unknown) => {
      metricsManager.decrementActiveExecutions();
      metricsManager.incrementTotalExecutions();
      if (
        typeof data === "object" &&
        data !== null &&
        "result" in data &&
        "jobId" in data
      ) {
        const typedData = data as {
          jobId: string;
          result: { success?: boolean };
        };
        if (typedData.result?.success) {
          metricsManager.incrementSuccessfulExecutions();
        }
        engineEvents.emit("execution:completed", {
          jobId: typedData.jobId,
          result: typedData.result,
        });
      }
    });

    queue.on("job:failed", (data: unknown) => {
      metricsManager.decrementActiveExecutions();
      metricsManager.incrementFailedExecutions();
      if (
        typeof data === "object" &&
        data !== null &&
        "jobId" in data &&
        "error" in data
      ) {
        const typedData = data as { jobId: string; error: unknown };
        const error =
          typedData.error instanceof Error
            ? typedData.error
            : new Error(String(typedData.error));
        engineEvents.emit("execution:failed", {
          jobId: typedData.jobId,
          error,
        });
      }
    });

    queue.on("webhook:response", (response: unknown) => {
      webhookManager.emitWebhookReceived(response);
    });
  };

  const setupMetricsCollection = (): void => {
    setInterval(() => {
      const queueMetrics = queue.getMetrics();
      const workerMetrics = queue.getWorkerMetrics();

      engineEvents.emit("metrics:update", {
        queue: queueMetrics,
        workers: workerMetrics,
        execution: metricsManager.getMetrics(),
      });
    }, 5000);
  };

  const emitExecutionPaused = (executionId: string): void => {
    engineEvents.emit("execution:paused", { executionId });
  };

  const emitExecutionResumed = (executionId: string): void => {
    engineEvents.emit("execution:resumed", { executionId });
  };

  const emitExecutionCancelled = (executionId: string): void => {
    engineEvents.emit("execution:cancelled", { executionId });
  };

  const emitEngineShuttingDown = (): void => {
    engineEvents.emit("engine:shutting-down", undefined);
  };

  const emitEngineShutdown = (): void => {
    engineEvents.emit("engine:shutdown", undefined);
  };

  return {
    setupQueueHandlers,
    setupMetricsCollection,
    emitExecutionPaused,
    emitExecutionResumed,
    emitExecutionCancelled,
    emitEngineShuttingDown,
    emitEngineShutdown,
    events: engineEvents,
  };
}
