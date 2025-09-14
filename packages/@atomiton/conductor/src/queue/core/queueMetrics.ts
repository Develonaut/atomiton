/**
 * Queue metrics calculation functions
 */

import type { JobResponse, QueueMetrics } from "./types";
import type PQueue from "p-queue";

export function createMetricsCalculator(
  activeJobs: Map<string, unknown>,
  jobResults: Map<string, JobResponse>,
  jobQueue: PQueue,
  getRateLimitRemaining: () => number | undefined,
) {
  const getMetrics = (): QueueMetrics => {
    const completedJobs = Array.from(jobResults.values()).filter(
      (r) => r.success,
    ).length;
    const failedJobs = Array.from(jobResults.values()).filter(
      (r) => !r.success,
    ).length;

    return {
      activeJobs: activeJobs.size,
      pendingJobs: jobQueue.pending,
      completedJobs,
      failedJobs,
      queueSize: jobQueue.size,
      rateLimitRemaining: getRateLimitRemaining(),
    };
  };

  return {
    getMetrics,
  };
}
