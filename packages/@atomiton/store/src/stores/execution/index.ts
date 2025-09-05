/**
 * Execution Store - Functional state management for job execution
 */

import { createStore, createActions } from "../../base";
import type { Store } from "../../base";
import type { ExecutionState, Job } from "./types";

export * from "./types";

// Initial state
const initialState: ExecutionState = {
  jobs: new Map(),
  activeJobIds: new Set(),
  completedJobIds: [],
  queuedJobIds: [],
  globalPause: false,
  maxConcurrentJobs: 3,
  retryConfig: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },
  stats: {
    totalExecuted: 0,
    totalSucceeded: 0,
    totalFailed: 0,
    averageDuration: 0,
  },
};

// Actions
const actions = {
  addJob: (
    state: ExecutionState,
    job: Omit<Job, "id" | "createdAt">,
  ): string => {
    const id = `job-${Date.now()}`;
    const newJob: Job = {
      ...job,
      id,
      createdAt: new Date(),
      logs: [],
    };
    state.jobs.set(id, newJob);
    state.queuedJobIds.push(id);
    return id;
  },
};

// Store type
export type ExecutionStore = Store<ExecutionState> & {
  actions: ReturnType<typeof createActions<ExecutionState, typeof actions>>;
};

// Create store
export function createExecutionStore(): ExecutionStore {
  const store = createStore<ExecutionState>({ initialState });

  return {
    ...store,
    actions: createActions(store, actions),
  };
}
