/**
 * Execution Store - State management for job execution
 * Manages active jobs, progress tracking, and execution results
 */

import { storeClient } from "../clients/StoreClient";
import type { ZustandStore, StateUpdater } from "../clients/StoreClient";

export type JobStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface JobProgress {
  current: number;
  total: number;
  percentage: number;
  message?: string;
  estimatedTimeRemaining?: number; // ms
}

export interface JobResult {
  success: boolean;
  data?: unknown;
  error?: Error;
  logs: string[];
  metrics?: {
    startTime: Date;
    endTime: Date;
    duration: number; // ms
    nodesExecuted: number;
    memoryUsed?: number; // bytes
  };
}

export interface Job {
  id: string;
  blueprintId: string;
  blueprintName: string;
  status: JobStatus;
  priority: number;
  progress: JobProgress;
  result?: JobResult;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  nodeStates: Map<
    string,
    {
      status: "pending" | "running" | "completed" | "failed" | "skipped";
      startTime?: Date;
      endTime?: Date;
      output?: unknown;
      error?: string;
    }
  >;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  tags: string[];
}

export interface ExecutionState {
  // Active jobs indexed by ID
  jobs: Map<string, Job>;

  // Queue of pending job IDs
  queue: string[];

  // Currently executing job IDs
  activeJobs: string[];

  // Execution settings
  maxConcurrentJobs: number;
  autoRetryFailures: boolean;
  retryLimit: number;

  // Statistics (not persisted)
  totalJobsRun: number;
  totalJobsSucceeded: number;
  totalJobsFailed: number;
  averageExecutionTime: number; // ms

  // UI state
  selectedJobId: string | null;
  showCompletedJobs: boolean;
  jobFilter: "all" | "active" | "completed" | "failed";
}

// Initial state
const initialExecutionState: ExecutionState = {
  jobs: new Map(),
  queue: [],
  activeJobs: [],
  maxConcurrentJobs: 3,
  autoRetryFailures: false,
  retryLimit: 3,
  totalJobsRun: 0,
  totalJobsSucceeded: 0,
  totalJobsFailed: 0,
  averageExecutionTime: 0,
  selectedJobId: null,
  showCompletedJobs: true,
  jobFilter: "all",
};

/**
 * Execution Store wrapper class
 */
export class ExecutionStore {
  private zustandStore: ZustandStore<ExecutionState>;
  public actions: ExecutionActions;

  constructor(zustandStore: ZustandStore<ExecutionState>) {
    this.zustandStore = zustandStore;
    this.actions = new ExecutionActions(this);
  }

  /**
   * Get current state
   */
  getState(): ExecutionState {
    return this.zustandStore.getState();
  }

  /**
   * Update state
   */
  setState(updater: StateUpdater<ExecutionState>): void {
    this.zustandStore.setState(updater);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: ExecutionState) => void): () => void {
    return this.zustandStore.subscribe(callback);
  }
}

/**
 * Create the execution store
 */
export function createExecutionStore(): ExecutionStore {
  const zustandStore = storeClient.createZustandStore<ExecutionState>({
    initialState: initialExecutionState,
    persist: false, // Don't persist execution state
  });

  return new ExecutionStore(zustandStore);
}

/**
 * Execution store actions
 */
export class ExecutionActions {
  private store: ExecutionStore;

  constructor(store: ExecutionStore) {
    this.store = store;
  }

  /**
   * Add a new job
   */
  addJob(job: Omit<Job, "id">): string {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullJob: Job = {
      ...job,
      id,
      progress: job.progress || { current: 0, total: 100, percentage: 0 },
      nodeStates: job.nodeStates || new Map(),
    };

    this.store.setState((state) => {
      const newJobs = new Map(state.jobs);
      newJobs.set(id, fullJob);

      const newQueue =
        job.status === "queued" ? [...state.queue, id] : state.queue;

      return {
        ...state,
        jobs: newJobs,
        queue: newQueue,
      };
    });

    return id;
  }

  /**
   * Update job status
   */
  updateJobStatus(jobId: string, status: JobStatus): void {
    this.store.setState((state) => {
      const job = state.jobs.get(jobId);
      if (!job) return state;

      const newJobs = new Map(state.jobs);
      const updatedJob = { ...job, status };

      // Update timestamps
      if (status === "running" && !updatedJob.startedAt) {
        updatedJob.startedAt = new Date();
      } else if (["completed", "failed", "cancelled"].includes(status)) {
        updatedJob.completedAt = new Date();
      }

      newJobs.set(jobId, updatedJob);

      // Update queue and active jobs
      let newQueue = state.queue;
      let newActiveJobs = state.activeJobs;

      if (status === "running") {
        newQueue = state.queue.filter((id) => id !== jobId);
        if (!newActiveJobs.includes(jobId)) {
          newActiveJobs = [...newActiveJobs, jobId];
        }
      } else if (["completed", "failed", "cancelled"].includes(status)) {
        newActiveJobs = state.activeJobs.filter((id) => id !== jobId);
      }

      // Update statistics
      let stats = {};
      if (status === "completed") {
        const duration =
          updatedJob.completedAt!.getTime() - updatedJob.startedAt!.getTime();
        stats = {
          totalJobsRun: state.totalJobsRun + 1,
          totalJobsSucceeded: state.totalJobsSucceeded + 1,
          averageExecutionTime:
            (state.averageExecutionTime * state.totalJobsRun + duration) /
            (state.totalJobsRun + 1),
        };
      } else if (status === "failed") {
        stats = {
          totalJobsRun: state.totalJobsRun + 1,
          totalJobsFailed: state.totalJobsFailed + 1,
        };
      }

      return {
        ...state,
        jobs: newJobs,
        queue: newQueue,
        activeJobs: newActiveJobs,
        ...stats,
      };
    });
  }

  /**
   * Update job progress
   */
  updateJobProgress(jobId: string, progress: Partial<JobProgress>): void {
    this.store.setState((state) => {
      const job = state.jobs.get(jobId);
      if (!job) return state;

      const newJobs = new Map(state.jobs);
      newJobs.set(jobId, {
        ...job,
        progress: {
          ...job.progress,
          ...progress,
          percentage: progress.total
            ? (progress.current! / progress.total) * 100
            : job.progress.percentage,
        },
      });

      return {
        ...state,
        jobs: newJobs,
      };
    });
  }

  /**
   * Update node state within a job
   */
  updateNodeState(
    jobId: string,
    nodeId: string,
    nodeState: Partial<
      Job["nodeStates"] extends Map<string, infer V> ? V : never
    >,
  ): void {
    this.store.setState((state) => {
      const job = state.jobs.get(jobId);
      if (!job) return state;

      const newNodeStates = new Map(job.nodeStates);
      const currentNodeState = newNodeStates.get(nodeId) || {
        status: "pending",
      };

      newNodeStates.set(nodeId, {
        ...currentNodeState,
        ...nodeState,
      });

      const newJobs = new Map(state.jobs);
      newJobs.set(jobId, {
        ...job,
        nodeStates: newNodeStates,
      });

      return {
        ...state,
        jobs: newJobs,
      };
    });
  }

  /**
   * Set job result
   */
  setJobResult(jobId: string, result: JobResult): void {
    this.store.setState((state) => {
      const job = state.jobs.get(jobId);
      if (!job) return state;

      const newJobs = new Map(state.jobs);
      newJobs.set(jobId, {
        ...job,
        result,
        status: result.success ? "completed" : "failed",
        completedAt: new Date(),
      });

      return {
        ...state,
        jobs: newJobs,
      };
    });
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): void {
    this.updateJobStatus(jobId, "cancelled");
  }

  /**
   * Pause a job
   */
  pauseJob(jobId: string): void {
    this.updateJobStatus(jobId, "paused");
  }

  /**
   * Resume a job
   */
  resumeJob(jobId: string): void {
    this.updateJobStatus(jobId, "queued");
  }

  /**
   * Remove a job
   */
  removeJob(jobId: string): void {
    this.store.setState((state) => {
      const newJobs = new Map(state.jobs);
      newJobs.delete(jobId);

      return {
        ...state,
        jobs: newJobs,
        queue: state.queue.filter((id) => id !== jobId),
        activeJobs: state.activeJobs.filter((id) => id !== jobId),
        selectedJobId:
          state.selectedJobId === jobId ? null : state.selectedJobId,
      };
    });
  }

  /**
   * Clear completed jobs
   */
  clearCompletedJobs(): void {
    this.store.setState((state) => {
      const newJobs = new Map<string, Job>();

      state.jobs.forEach((job, id) => {
        if (!["completed", "failed", "cancelled"].includes(job.status)) {
          newJobs.set(id, job);
        }
      });

      return {
        ...state,
        jobs: newJobs,
      };
    });
  }

  /**
   * Update execution settings
   */
  updateSettings(
    settings: Partial<
      Pick<
        ExecutionState,
        "maxConcurrentJobs" | "autoRetryFailures" | "retryLimit"
      >
    >,
  ): void {
    this.store.setState((state) => ({
      ...state,
      ...settings,
    }));
  }

  /**
   * Select a job
   */
  selectJob(jobId: string | null): void {
    this.store.setState((state) => ({
      ...state,
      selectedJobId: jobId,
    }));
  }

  /**
   * Set job filter
   */
  setJobFilter(filter: ExecutionState["jobFilter"]): void {
    this.store.setState((state) => ({
      ...state,
      jobFilter: filter,
    }));
  }
}

/**
 * Execution store selectors
 */
export class ExecutionSelectors {
  /**
   * Get all jobs as array
   */
  static getAllJobs(state: ExecutionState): Job[] {
    return Array.from(state.jobs.values());
  }

  /**
   * Get filtered jobs
   */
  static getFilteredJobs(state: ExecutionState): Job[] {
    const jobs = Array.from(state.jobs.values());

    switch (state.jobFilter) {
      case "active":
        return jobs.filter((j) =>
          ["queued", "running", "paused"].includes(j.status),
        );
      case "completed":
        return jobs.filter((j) => j.status === "completed");
      case "failed":
        return jobs.filter((j) => j.status === "failed");
      default:
        return jobs;
    }
  }

  /**
   * Get selected job
   */
  static getSelectedJob(state: ExecutionState): Job | null {
    return state.selectedJobId
      ? state.jobs.get(state.selectedJobId) || null
      : null;
  }

  /**
   * Get job by ID
   */
  static getJob(state: ExecutionState, jobId: string): Job | null {
    return state.jobs.get(jobId) || null;
  }

  /**
   * Get next job in queue
   */
  static getNextQueuedJob(state: ExecutionState): Job | null {
    if (state.queue.length === 0) return null;
    return state.jobs.get(state.queue[0]) || null;
  }

  /**
   * Check if can start new job
   */
  static canStartNewJob(state: ExecutionState): boolean {
    return state.activeJobs.length < state.maxConcurrentJobs;
  }

  /**
   * Get execution statistics
   */
  static getStatistics(state: ExecutionState): {
    totalJobs: number;
    activeJobs: number;
    queuedJobs: number;
    successRate: number;
    averageExecutionTime: number;
  } {
    const totalJobs = state.jobs.size;
    const activeJobs = state.activeJobs.length;
    const queuedJobs = state.queue.length;
    const successRate =
      state.totalJobsRun > 0
        ? (state.totalJobsSucceeded / state.totalJobsRun) * 100
        : 0;

    return {
      totalJobs,
      activeJobs,
      queuedJobs,
      successRate,
      averageExecutionTime: state.averageExecutionTime,
    };
  }
}
