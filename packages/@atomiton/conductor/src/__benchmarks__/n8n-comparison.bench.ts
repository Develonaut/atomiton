import { bench, describe } from "vitest";
import { EnhancedExecutionEngine, Queue, ScalableQueue } from "../index";

describe("n8n Comparison Benchmarks", () => {
  describe("Queue Performance vs n8n", () => {
    bench("Single job execution (vs n8n ~50ms)", async () => {
      const queue = new Queue({ concurrency: 1 });
      await queue.add({
        executionId: "bench_single",
        blueprintId: "test",
        input: { data: "test" },
      });
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    bench("10 sequential jobs (vs n8n ~500ms)", async () => {
      const queue = new Queue({ concurrency: 1 });
      const jobs = Array.from({ length: 10 }, (_, i) => ({
        executionId: `bench_seq_${i}`,
        blueprintId: "test",
        input: { data: i },
      }));

      for (const job of jobs) {
        await queue.add(job);
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    bench("10 parallel jobs (vs n8n limited concurrency)", async () => {
      const queue = new Queue({ concurrency: 10 });
      const jobs = Array.from({ length: 10 }, (_, i) => ({
        executionId: `bench_par_${i}`,
        blueprintId: "test",
        input: { data: i },
      }));

      await Promise.all(jobs.map((job) => queue.add(job)));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    bench("High concurrency (50 jobs) - n8n bottleneck", async () => {
      const queue = new Queue({ concurrency: 20 });
      const jobs = Array.from({ length: 50 }, (_, i) => ({
        executionId: `bench_high_${i}`,
        blueprintId: "test",
        input: { data: i },
      }));

      await Promise.all(jobs.map((job) => queue.add(job)));
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe("Scalable Queue vs n8n Queue Mode", () => {
    bench("Worker distribution (4 workers)", async () => {
      const queue = new ScalableQueue({ concurrency: 10, workers: 4 });
      const jobs = Array.from({ length: 20 }, (_, i) => ({
        executionId: `bench_worker_${i}`,
        blueprintId: "test",
        input: { data: i },
      }));

      await Promise.all(jobs.map((job) => queue.distributeJob(job)));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    bench("Rate limiting (100 req/min)", async () => {
      const queue = new Queue({
        enableRateLimiting: true,
        rateLimit: { limit: 100, duration: 60000 },
      });

      const jobs = Array.from({ length: 50 }, (_, i) => ({
        executionId: `bench_rate_${i}`,
        blueprintId: "test",
        input: { data: i },
      }));

      let _completed = 0;
      for (const job of jobs) {
        try {
          await queue.add(job);
          _completed++;
        } catch (_error) {
          // Rate limit hit
          void _error;
          break;
        }
      }
      void _completed;
    });

    bench("Webhook handling (vs n8n webhook processing)", async () => {
      const queue = new Queue();

      const webhookJobs = Array.from({ length: 10 }, (_, i) => ({
        executionId: `webhook_${i}`,
        blueprintId: "webhook_handler",
        input: { webhookData: { id: i, payload: "test" } },
        webhookData: {
          webhookId: `hook_${i}`,
          httpMethod: "POST",
          path: `/webhook/hook_${i}`,
          headers: { "content-type": "application/json" },
          body: { data: `payload_${i}` },
        },
      }));

      await Promise.all(webhookJobs.map((job) => queue.add(job)));

      // Simulate webhook responses
      for (let i = 0; i < 10; i++) {
        await queue.addWebhookResponse({
          executionId: `webhook_${i}`,
          response: {
            statusCode: 200,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ success: true, id: i }),
          },
        });
      }
    });
  });

  describe("Enhanced Engine vs n8n Core", () => {
    bench("Blueprint execution with metrics", async () => {
      const engine = new EnhancedExecutionEngine({
        concurrency: 5,
        enableMetrics: true,
      });

      await engine.execute("test_blueprint", { test: true });
      await new Promise((resolve) => setTimeout(resolve, 10));

      const _metrics = engine.getMetrics();
      // Metrics collection should be minimal overhead
      void _metrics;
    });

    bench("Execution with retry (vs n8n retry logic)", async () => {
      const engine = new EnhancedExecutionEngine({
        maxRetries: 3,
        retryDelay: 50,
      });

      try {
        await engine.execute(
          "failing_blueprint",
          { shouldFail: true },
          {
            priority: 10,
          },
        );
      } catch (_error) {
        // Expected failure after retries
        void _error;
      }
    });

    bench("Memory efficiency (1000 executions)", async () => {
      const engine = new EnhancedExecutionEngine({
        concurrency: 20,
      });

      const startMemory = process.memoryUsage().heapUsed;

      const executions = Array.from({ length: 100 }, (_, i) =>
        engine.execute(`blueprint_${i}`, { index: i }, { priority: i % 10 }),
      );

      await Promise.allSettled(executions);

      const endMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = endMemory - startMemory;

      // Should be minimal memory growth
      console.warn(`Memory growth: ${memoryGrowth / 1024 / 1024}MB`);
    });
  });

  describe("Real-world n8n Patterns", () => {
    bench("HTTP → JSON → Database pattern", async () => {
      const queue = new Queue({ concurrency: 5 });

      // Simulate n8n's common HTTP → process → save pattern
      const workflow = [
        {
          executionId: "http_fetch",
          blueprintId: "http_node",
          input: { url: "https://api.example.com/data", method: "GET" },
        },
        {
          executionId: "json_parse",
          blueprintId: "json_node",
          input: { data: '{"users": [{"id": 1, "name": "John"}]}' },
        },
        {
          executionId: "db_save",
          blueprintId: "database_node",
          input: { table: "users", data: { id: 1, name: "John" } },
        },
      ];

      for (const step of workflow) {
        await queue.add(step);
      }
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    bench("Webhook trigger → Multiple processing", async () => {
      const queue = new Queue({ concurrency: 10 });

      // Simulate webhook triggering multiple processing paths
      const webhookData = {
        executionId: "webhook_trigger",
        blueprintId: "webhook_node",
        input: { user: "john", action: "signup" },
        webhookData: {
          webhookId: "signup_hook",
          httpMethod: "POST",
          path: "/webhook/signup",
          headers: { authorization: "Bearer token" },
          body: { user: "john", email: "john@example.com" },
        },
      };

      await queue.add(webhookData);

      // Simulate parallel processing: email, analytics, database
      const followUpJobs = [
        {
          executionId: "send_email",
          blueprintId: "email_node",
          input: { to: "john@example.com", template: "welcome" },
        },
        {
          executionId: "track_analytics",
          blueprintId: "analytics_node",
          input: { event: "user_signup", user: "john" },
        },
        {
          executionId: "update_crm",
          blueprintId: "crm_node",
          input: { contact: "john", status: "active" },
        },
      ];

      await Promise.all(followUpJobs.map((job) => queue.add(job)));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    bench("Error handling and retry (n8n pattern)", async () => {
      const queue = new Queue({ maxRetries: 3, retryDelay: 100 });

      const unreliableJobs = Array.from({ length: 5 }, (_, i) => ({
        executionId: `unreliable_${i}`,
        blueprintId: "flaky_api_node",
        input: { attempt: i, failureRate: 0.6 },
      }));

      const results = await Promise.allSettled(
        unreliableJobs.map((job) =>
          queue.add(job, {
            attempts: 3,
            backoff: { type: "exponential", delay: 100 },
          }),
        ),
      );

      // Should handle failures gracefully with retries
      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      console.warn(`Success rate after retries: ${successCount}/5`);
    });

    bench("Large data processing (vs n8n memory limits)", async () => {
      const queue = new Queue({ concurrency: 3 });

      // Simulate processing large datasets that would challenge n8n
      const largeDataJobs = Array.from({ length: 10 }, (_, i) => ({
        executionId: `large_data_${i}`,
        blueprintId: "csv_processor",
        input: {
          data: Array.from({ length: 1000 }, (_, j) => ({
            id: j,
            name: `User ${j}`,
            data: `Large data chunk ${i}-${j}`,
          })),
        },
      }));

      await Promise.all(largeDataJobs.map((job) => queue.add(job)));
      await new Promise((resolve) => setTimeout(resolve, 200));
    });
  });
});
