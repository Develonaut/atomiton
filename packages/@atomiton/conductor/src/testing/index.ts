/**
 * Testing utilities for conductor
 * Provides comprehensive testing infrastructure
 */

// Test fixtures
export {
  TestFixtureBuilder,
  TestContextBuilder,
  TestFlows,
  TestContexts,
} from "#testing/fixtures";

// Dependency injection
export {
  type Logger,
  type ConductorDependencies,
  ConductorFactory,
  ConductorWithDependencies,
  createTestConductor,
} from "#testing/injection";

// Mock implementations
export {
  MockTransport,
  MockLogger,
  MockProgressReporter,
  MockDebugController,
  MockExecutionGraphStore,
  MockEventEmitter,
  MockFactory,
  createSpy,
} from "#testing/mocks";

// Performance utilities
export { PerformanceTestUtils } from "#testing/performance.bench";

// Import for internal use
import { MockFactory } from "#testing/mocks";
import { createTestConductor } from "#testing/injection";

/**
 * Quick setup function for tests
 */
export function setupTestEnvironment() {
  const mocks = MockFactory.createAllMocks();
  const conductor = createTestConductor(mocks);

  return {
    conductor,
    mocks,
    // Helper to reset all mocks
    reset: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.values(mocks).forEach((mock: any) => {
        if (mock.clear) mock.clear();
        if (mock.reset) mock.reset();
        if (mock.clearHistory) mock.clearHistory();
      });
    },
  };
}

/**
 * Test assertion helpers
 */
export const TestAssertions = {
  /**
   * Assert that a node was executed
   */
  assertNodeExecuted(executedNodes: string[], nodeId: string) {
    if (!executedNodes.includes(nodeId)) {
      throw new Error(`Expected node ${nodeId} to be executed, but it was not`);
    }
  },

  /**
   * Assert that execution succeeded
   */
  assertExecutionSuccess(result: { success: boolean; error?: Error }) {
    if (!result.success) {
      throw new Error(
        `Expected execution to succeed, but it failed: ${result.error?.message}`,
      );
    }
  },

  /**
   * Assert that execution failed
   */
  assertExecutionFailed(result: { success: boolean; error?: Error }) {
    if (result.success) {
      throw new Error("Expected execution to fail, but it succeeded");
    }
  },

  /**
   * Assert progress reached a certain value
   */
  assertProgressReached(
    progressUpdates: Array<{ progress: number }>,
    target: number,
  ) {
    const reached = progressUpdates.some((update) => update.progress >= target);
    if (!reached) {
      const max = Math.max(...progressUpdates.map((u) => u.progress));
      throw new Error(
        `Expected progress to reach ${target}, but max was ${max}`,
      );
    }
  },

  /**
   * Assert that an error contains specific text
   */
  assertErrorContains(error: Error | undefined, text: string) {
    if (!error) {
      throw new Error(
        `Expected an error containing "${text}", but no error was thrown`,
      );
    }
    if (!error.message.includes(text)) {
      throw new Error(
        `Expected error to contain "${text}", but got: "${error.message}"`,
      );
    }
  },
};
