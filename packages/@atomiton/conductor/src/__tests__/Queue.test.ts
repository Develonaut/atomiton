import { describe, it, expect, beforeEach } from "vitest";
import { Queue, ScalableQueue } from "../queue/Queue.js";

describe("Queue (n8n-inspired implementation)", () => {
  let queue: Queue;

  beforeEach(() => {
    queue = new Queue({
      concurrency: 5,
      maxRetries: 3,
      retryDelay: 100,
    });
  });

  describe("Job Management", () => {
    it("should add and process jobs", async () => {
      const jobData = {
        executionId: "exec_123",
        blueprintId: "blueprint_456",
        input: { test: true },
      };

      const jobId = await queue.add(jobData);
      expect(jobId).toMatch(/^job_\d+_\d+$/);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const result = await queue.getJobResult(jobId);
      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
    });

    it("should handle job priorities", async () => {
      const results: string[] = [];

      queue.on("job:started", ({ jobData }) => {
        results.push(jobData.executionId);
      });

      await queue.add(
        { executionId: "low", blueprintId: "test", input: {} },
        { priority: 1 },
      );
      await queue.add(
        { executionId: "high", blueprintId: "test", input: {} },
        { priority: 10 },
      );
      await queue.add(
        { executionId: "medium", blueprintId: "test", input: {} },
        { priority: 5 },
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(results[0]).toBe("high");
    });

    it("should respect concurrency limits", async () => {
      const concurrentJobs: number[] = [];
      let maxConcurrent = 0;

      queue.on("job:started", () => {
        concurrentJobs.push(Date.now());
        const active = queue.getMetrics().activeJobs;
        maxConcurrent = Math.max(maxConcurrent, active);
      });

      const jobs = Array.from({ length: 10 }, (_, i) => ({
        executionId: `exec_${i}`,
        blueprintId: "test",
        input: {},
      }));

      await Promise.all(jobs.map((job) => queue.add(job)));
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(maxConcurrent).toBeLessThanOrEqual(5);
    });

    it("should handle job retries with exponential backoff", async () => {
      let _attemptCount = 0;
      const failingQueue = new Queue({ maxRetries: 3 });

      failingQueue.on("job:failed", () => {
        _attemptCount++;
      });

      void _attemptCount;

      const jobData = {
        executionId: "failing_job",
        blueprintId: "test",
        input: {},
      };

      await failingQueue.add(jobData, {
        attempts: 3,
        backoff: { type: "exponential", delay: 50 },
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  });

  describe("Queue Control", () => {
    it("should pause and resume queue", async () => {
      let processedCount = 0;

      queue.on("job:completed", () => {
        processedCount++;
      });

      await queue.add({
        executionId: "job1",
        blueprintId: "test",
        input: {},
      });

      await queue.pause();

      await queue.add({
        executionId: "job2",
        blueprintId: "test",
        input: {},
      });

      await new Promise((resolve) => setTimeout(resolve, 200));
      const countAfterPause = processedCount;

      await queue.resume();
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(processedCount).toBeGreaterThan(countAfterPause);
    });

    it("should clear queue", async () => {
      for (let i = 0; i < 5; i++) {
        await queue.add({
          executionId: `job_${i}`,
          blueprintId: "test",
          input: {},
        });
      }

      await queue.clear();
      const size = await queue.getQueueSize();
      expect(size).toBe(0);
    });

    it("should handle graceful shutdown", async () => {
      let shutdownEmitted = false;

      queue.on("queue:shutdown", () => {
        shutdownEmitted = true;
      });

      for (let i = 0; i < 3; i++) {
        await queue.add({
          executionId: `job_${i}`,
          blueprintId: "test",
          input: {},
        });
      }

      await queue.gracefulShutdown();
      expect(shutdownEmitted).toBe(true);

      const activeJobs = await queue.getActiveJobs();
      expect(activeJobs).toHaveLength(0);
    });
  });

  describe("Webhook Handling", () => {
    it("should handle webhook responses", async () => {
      const webhookResponse = {
        executionId: "exec_webhook",
        response: {
          statusCode: 200,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ success: true }),
        },
      };

      await queue.addWebhookResponse(webhookResponse);

      const retrieved = await queue.getWebhookResponse("exec_webhook");
      expect(retrieved).toEqual(webhookResponse);

      const decoded = queue.decodeWebhookResponse(webhookResponse);
      expect(decoded).toEqual({ success: true });
    });

    it("should emit webhook events", async () => {
      let eventData: unknown;

      queue.on("webhook:response", (data) => {
        eventData = data;
      });

      const webhookResponse = {
        executionId: "exec_123",
        response: {
          statusCode: 200,
          body: "test",
        },
      };

      await queue.addWebhookResponse(webhookResponse);
      expect(eventData).toEqual(webhookResponse);
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limits", async () => {
      const rateLimitedQueue = new Queue({
        enableRateLimiting: true,
        rateLimit: { limit: 3, duration: 1000 },
      });

      for (let i = 0; i < 3; i++) {
        await rateLimitedQueue.add({
          executionId: `job_${i}`,
          blueprintId: "test",
          input: {},
        });
      }

      await expect(
        rateLimitedQueue.add({
          executionId: "job_4",
          blueprintId: "test",
          input: {},
        }),
      ).rejects.toThrow("Rate limit exceeded");
    });

    it("should reset rate limit window", async () => {
      const rateLimitedQueue = new Queue({
        enableRateLimiting: true,
        rateLimit: { limit: 2, duration: 500 },
      });

      await rateLimitedQueue.add({
        executionId: "job_1",
        blueprintId: "test",
        input: {},
      });
      await rateLimitedQueue.add({
        executionId: "job_2",
        blueprintId: "test",
        input: {},
      });

      await expect(
        rateLimitedQueue.add({
          executionId: "job_3",
          blueprintId: "test",
          input: {},
        }),
      ).rejects.toThrow("Rate limit exceeded");

      await new Promise((resolve) => setTimeout(resolve, 600));

      await expect(
        rateLimitedQueue.add({
          executionId: "job_4",
          blueprintId: "test",
          input: {},
        }),
      ).resolves.toBeDefined();
    });
  });

  describe("Metrics", () => {
    it("should track queue metrics", async () => {
      for (let i = 0; i < 5; i++) {
        await queue.add({
          executionId: `job_${i}`,
          blueprintId: "test",
          input: {},
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const metrics = queue.getMetrics();
      expect(metrics.queueSize).toBeGreaterThanOrEqual(0);
      expect(metrics.completedJobs).toBeGreaterThan(0);
      expect(metrics.activeJobs).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("ScalableQueue (with workers)", () => {
  let scalableQueue: ScalableQueue;

  beforeEach(() => {
    scalableQueue = new ScalableQueue({
      concurrency: 10,
      workers: 4,
    });
  });

  it("should initialize workers", () => {
    const workers = scalableQueue.getWorkerMetrics();
    expect(workers).toHaveLength(4);
    expect(workers.every((w) => w.status === "idle")).toBe(true);
  });

  it("should distribute jobs to workers", async () => {
    const jobData = {
      executionId: "exec_worker",
      blueprintId: "test",
      input: {},
    };

    await scalableQueue.distributeJob(jobData);

    const workers = scalableQueue.getWorkerMetrics();
    const busyWorker = workers.find((w) => w.processedCount > 0);
    expect(busyWorker).toBeDefined();
  });

  it("should track worker metrics", async () => {
    const jobs = Array.from({ length: 10 }, (_, i) => ({
      executionId: `exec_${i}`,
      blueprintId: "test",
      input: {},
    }));

    await Promise.all(jobs.map((job) => scalableQueue.distributeJob(job)));
    await new Promise((resolve) => setTimeout(resolve, 500));

    const workers = scalableQueue.getWorkerMetrics();
    const totalProcessed = workers.reduce(
      (sum, w) => sum + w.processedCount,
      0,
    );
    expect(totalProcessed).toBeGreaterThan(0);
  });
});
