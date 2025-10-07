/**
 * Group Node Smoke Tests
 * Covers sequential and parallel execution modes with various configurations
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export const groupSmokeTests: SmokeTest[] = [
  {
    name: "empty group",
    config: {
      nodes: [],
    },
  },
  {
    name: "sequential mode (default)",
    config: {
      parallel: false,
      timeout: 30000,
      retries: 1,
    },
  },
  {
    name: "parallel mode",
    config: {
      parallel: true,
      timeout: 30000,
    },
  },
  {
    name: "with custom timeout",
    config: {
      timeout: 60000,
      retries: 2,
    },
  },
  {
    name: "with maximum retries",
    config: {
      timeout: 30000,
      retries: 5,
    },
  },
  {
    name: "minimal config",
    config: {},
  },
];
