/**
 * Job processing functions for queue system
 */

import { delay } from "@atomiton/utils";
import type { ExecutionResult } from "../../interfaces/IExecutionEngine";
import type { JobData, JobResponse, JobOptions } from "./types";

/**
 * Processes a job - currently mock implementation
 */
export async function processJob(
  jobData: JobData,
  _options: JobOptions,
): Promise<JobResponse> {
  await delay(100);

  const mockResult: ExecutionResult = {
    executionId: jobData.executionId,
    compositeId: jobData.compositeId,
    status: "completed",
    startTime: new Date(Date.now() - 100),
    endTime: new Date(),
    outputs: {
      result: `Processed ${jobData.compositeId}`,
    },
    metrics: {
      executionTimeMs: 100,
      memoryUsedMB: 1,
      nodesExecuted: 1,
    },
  };

  return {
    success: true,
    result: mockResult,
  };
}

/**
 * Calculates retry delay based on backoff strategy
 */
export function calculateRetryDelay(
  options: JobOptions,
  attemptsLeft: number,
  defaultRetryDelay: number,
): number {
  if (options.backoff?.type === "exponential") {
    return (
      options.backoff.delay * Math.pow(2, options.attempts! - attemptsLeft)
    );
  }
  return options.backoff?.delay ?? defaultRetryDelay;
}
