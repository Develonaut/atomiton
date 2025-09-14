/**
 * Worker management for scalable queue system
 */

import { generateWorkerId } from "@atomiton/utils";
import type { WorkerInfo, JobData, QueueInstance } from "./types";

export function createWorkerManager(baseQueue: QueueInstance) {
  const workers = new Map<string, WorkerInfo>();

  const initializeWorkers = (count: number): void => {
    for (let i = 0; i < count; i++) {
      const workerId = generateWorkerId(i);
      workers.set(workerId, {
        id: workerId,
        status: "idle",
        currentJob: null,
        processedCount: 0,
        errorCount: 0,
        startTime: Date.now(),
      });
    }
  };

  const getAvailableWorker = (): WorkerInfo | undefined => {
    for (const worker of workers.values()) {
      if (worker.status === "idle") {
        return worker;
      }
    }
    return undefined;
  };

  const distributeJob = async (jobData: JobData): Promise<string> => {
    const availableWorker = getAvailableWorker();
    if (!availableWorker) {
      return baseQueue.add(jobData);
    }

    availableWorker.status = "busy";
    availableWorker.currentJob = jobData.executionId;

    try {
      const jobId = await baseQueue.add(jobData);
      availableWorker.processedCount++;
      return jobId;
    } catch (error) {
      availableWorker.errorCount++;
      throw error;
    } finally {
      availableWorker.status = "idle";
      availableWorker.currentJob = null;
    }
  };

  const getWorkerMetrics = (): WorkerInfo[] => {
    return Array.from(workers.values());
  };

  return {
    initializeWorkers,
    getAvailableWorker,
    distributeJob,
    getWorkerMetrics,
  };
}
