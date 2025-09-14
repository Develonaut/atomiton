/**
 * Scalable queue factory with worker management
 */

import type { QueueOptions, ScalableQueueInstance, RedisConfig } from "./types";
import { createQueue } from "./queueFactory";
import { createWorkerManager } from "./workerManagement";

export function createScalableQueue(
  options: QueueOptions & {
    redis?: RedisConfig;
    workers?: number;
  } = {},
): ScalableQueueInstance {
  const baseQueue = createQueue(options);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _redisConfig = options.redis; // Future Redis integration

  const workerManager = createWorkerManager(baseQueue);

  if (options.workers) {
    workerManager.initializeWorkers(options.workers);
  }

  return {
    ...baseQueue,
    distributeJob: workerManager.distributeJob,
    getWorkerMetrics: workerManager.getWorkerMetrics,
  };
}
