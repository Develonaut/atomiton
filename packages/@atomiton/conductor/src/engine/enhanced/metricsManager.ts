/**
 * Metrics management for enhanced execution engine
 */

import type { EnhancedExecutionMetrics } from "./types";
import type { ScalableQueueInstance } from "../../queue";

export function createMetricsManager(queue: ScalableQueueInstance) {
  const metrics: EnhancedExecutionMetrics = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    peakMemoryUsage: 0,
    activeExecutions: 0,
  };

  const updateAverageExecutionTime = (newTime: number): void => {
    const totalTime =
      metrics.averageExecutionTime * (metrics.successfulExecutions - 1);
    metrics.averageExecutionTime =
      (totalTime + newTime) / metrics.successfulExecutions;
  };

  const incrementTotalExecutions = (): void => {
    metrics.totalExecutions++;
  };

  const incrementSuccessfulExecutions = (): void => {
    metrics.successfulExecutions++;
  };

  const incrementFailedExecutions = (): void => {
    metrics.failedExecutions++;
  };

  const incrementActiveExecutions = (): void => {
    metrics.activeExecutions++;
  };

  const decrementActiveExecutions = (): void => {
    metrics.activeExecutions--;
  };

  const getMetrics = (): EnhancedExecutionMetrics => {
    return {
      ...metrics,
      queueMetrics: queue.getMetrics(),
      workerMetrics: queue.getWorkerMetrics(),
    };
  };

  return {
    updateAverageExecutionTime,
    incrementTotalExecutions,
    incrementSuccessfulExecutions,
    incrementFailedExecutions,
    incrementActiveExecutions,
    decrementActiveExecutions,
    getMetrics,
  };
}
