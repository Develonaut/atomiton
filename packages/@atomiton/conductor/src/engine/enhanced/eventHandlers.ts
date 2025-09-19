/**
 * Event handling setup for enhanced execution engine
 */

import { events } from "@atomiton/events/desktop";
import type { ScalableQueueInstance } from "../../queue";

type EventHandlersReturn = {
  setupQueueHandlers: () => void;
  setupMetricsCollection: () => void;
  emitExecutionPaused: (executionId: string) => void;
  emitExecutionResumed: (executionId: string) => void;
  emitExecutionCancelled: (executionId: string) => void;
  emitEngineShuttingDown: () => void;
  emitEngineShutdown: () => void;
  eventBus: typeof events;
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
): EventHandlersReturn {
  const setupQueueHandlers = (): void => {
    events.on("job:started", (data: unknown) => {
      metricsManager.incrementActiveExecutions();
      if (typeof data === "object" && data !== null && "jobData" in data) {
        const jobData = (
          data as { jobData: { executionId: string; blueprintId: string } }
        ).jobData;
        events.emit("execution:started", {
          executionId: jobData.executionId,
          compositeId: jobData.blueprintId,
        });
      }
    });

    events.on("job:completed", (data: unknown) => {
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
        events.emit("execution:completed", {
          jobId: typedData.jobId,
          result: typedData.result,
        });
      }
    });

    events.on("job:failed", (data: unknown) => {
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
        events.emit("execution:failed", {
          jobId: typedData.jobId,
          error,
        });
      }
    });

    events.on("webhook:response", (response: unknown) => {
      webhookManager.emitWebhookReceived(response);
    });
  };

  const setupMetricsCollection = (): void => {
    setInterval(() => {
      const queueMetrics = queue.getMetrics();
      const workerMetrics = queue.getWorkerMetrics();

      events.emit("metrics:update", {
        queue: queueMetrics,
        workers: workerMetrics,
        execution: metricsManager.getMetrics(),
      });
    }, 5000);
  };

  const emitExecutionPaused = (executionId: string): void => {
    events.emit("execution:paused", { executionId });
  };

  const emitExecutionResumed = (executionId: string): void => {
    events.emit("execution:resumed", { executionId });
  };

  const emitExecutionCancelled = (executionId: string): void => {
    events.emit("execution:cancelled", { executionId });
  };

  const emitEngineShuttingDown = (): void => {
    events.emit("engine:shutting-down", undefined);
  };

  const emitEngineShutdown = (): void => {
    events.emit("engine:shutdown", undefined);
  };

  return {
    setupQueueHandlers,
    setupMetricsCollection,
    emitExecutionPaused,
    emitExecutionResumed,
    emitExecutionCancelled,
    emitEngineShuttingDown,
    emitEngineShutdown,
    eventBus: events,
  };
}
