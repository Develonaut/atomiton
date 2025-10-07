/**
 * Parallel Node Smoke Tests
 * Covers different strategies, concurrency levels, and timeout configurations
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export const parallelSmokeTests: SmokeTest[] = [
  // Strategy variations
  {
    name: "allSettled strategy (default)",
    config: {
      strategy: "allSettled",
      concurrency: 5,
    },
  },
  {
    name: "all strategy (fail if any fails)",
    config: {
      strategy: "all",
      concurrency: 5,
    },
  },
  {
    name: "race strategy (first to complete)",
    config: {
      strategy: "race",
      concurrency: 5,
    },
  },

  // Concurrency variations
  {
    name: "minimum concurrency (1)",
    config: {
      strategy: "allSettled",
      concurrency: 1,
    },
  },
  {
    name: "high concurrency",
    config: {
      strategy: "allSettled",
      concurrency: 20,
    },
  },

  // Timeout variations
  {
    name: "with operation timeout",
    config: {
      strategy: "allSettled",
      operationTimeout: 10000,
      concurrency: 5,
    },
  },
  {
    name: "with global timeout",
    config: {
      strategy: "allSettled",
      globalTimeout: 60000,
      concurrency: 5,
    },
  },

  // Flag variations
  {
    name: "with failFast enabled",
    config: {
      strategy: "all",
      failFast: true,
      concurrency: 5,
    },
  },
  {
    name: "without maintainOrder",
    config: {
      strategy: "allSettled",
      maintainOrder: false,
      concurrency: 5,
    },
  },

  // Combined scenarios
  {
    name: "race with failFast",
    config: {
      strategy: "race",
      failFast: true,
      concurrency: 3,
    },
  },
];
