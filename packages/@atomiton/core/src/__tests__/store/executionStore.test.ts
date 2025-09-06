/**
 * Execution Store Tests
 * Testing job execution state management with focus on state transitions and async operations
 * Following Brian's testing strategy for complex state management patterns
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  createExecutionStore,
  ExecutionActions,
  ExecutionSelectors,
} from "../../store/executionStore";
import type {
  ExecutionState,
  Job,
  JobStatus,
  ExecutionStore,
} from "../../store/executionStore";
import { ExecutionFactoryWithReset as ExecutionMockFactory } from "../helpers/store-mocks";
import { StoreTestFactory, TestPatterns } from "../helpers/store-test-utils";

describe("Execution Store", () => {
  let store: ExecutionStore;
  let storeFactory: StoreTestFactory;

  beforeEach(async () => {
    storeFactory = new StoreTestFactory();
    await storeFactory.initializeStoreClient();
    store = createExecutionStore();
    ExecutionMockFactory.resetCounter();
  });

  afterEach(async () => {
    await storeFactory.cleanup();
  });

  describe("Store Creation and Initialization", () => {
    it("should create store with correct initial state", () => {
      const initialState = store.getState();

      expect(initialState).toEqual({
        jobs: expect.any(Map),
        selectedJobId: null,
        queue: [],
        isExecuting: false,
        executionHistory: [],
        filterStatus: null,
        sortBy: "created",
        sortDirection: "desc",
      });

      expect(initialState.jobs.size).toBe(0);
    });

    it("should have actions instance", () => {
      expect(store.actions).toBeInstanceOf(ExecutionActions);
    });
  });

  describe("Job Management", () => {
    let testJob: Omit<Job, "id" | "created" | "modified">;

    beforeEach(() => {
      testJob = {
        blueprintId: "test-blueprint-1",
        blueprintName: "Test Blueprint",
        status: "queued",
        priority: 1,
        started: null,
        completed: null,
        progress: {
          current: 0,
          total: 100,
          percentage: 0,
          message: "Initializing...",
        },
        inputs: {
          csvFile: "/path/to/test.csv",
          outputFormat: "json",
        },
        outputs: {},
        error: null,
        tags: ["test", "automation"],
        metadata: {},
        nodeStates: new Map(),
      };
    });

    describe("Add Job", () => {
      it("should add job to queue", () => {
        const jobId = store.actions.addJob(testJob);

        const state = store.getState();
        expect(state.jobs.size).toBe(1);
        expect(state.queue).toContain(jobId);

        const addedJob = state.jobs.get(jobId)!;
        expect(addedJob.id).toBe(jobId);
        expect(addedJob.status).toBe("queued");
        expect(addedJob.created).toBeInstanceOf(Date);
        expect(addedJob.modified).toBeInstanceOf(Date);
      });

      it("should generate unique job IDs", () => {
        const jobId1 = store.actions.addJob(testJob);
        const jobId2 = store.actions.addJob(testJob);

        expect(jobId1).not.toBe(jobId2);

        const state = store.getState();
        expect(state.jobs.size).toBe(2);
        expect(state.queue).toEqual([jobId1, jobId2]);
      });

      it("should add job with custom priority ordering", () => {
        const lowPriorityJob = { ...testJob, priority: 1 };
        const highPriorityJob = { ...testJob, priority: 3 };
        const mediumPriorityJob = { ...testJob, priority: 2 };

        const lowId = store.actions.addJob(lowPriorityJob);
        const highId = store.actions.addJob(highPriorityJob);
        const mediumId = store.actions.addJob(mediumPriorityJob);

        const state = store.getState();
        // Queue should maintain insertion order initially
        // Priority ordering happens during execution scheduling
        expect(state.queue).toEqual([lowId, highId, mediumId]);
      });
    });

    describe("Update Job", () => {
      let jobId: string;

      beforeEach(() => {
        jobId = store.actions.addJob(testJob);
      });

      it("should update job status", () => {
        store.actions.updateJobStatus(jobId, "running");

        const state = store.getState();
        const job = state.jobs.get(jobId)!;

        expect(job.status).toBe("running");
        expect(job.modified.getTime()).toBeGreaterThan(job.created.getTime());
      });

      it("should update job progress", () => {
        const progress = ExecutionMockFactory.createJobProgress(
          50,
          "Processing data...",
        );

        store.actions.updateJobProgress(jobId, progress);

        const state = store.getState();
        const job = state.jobs.get(jobId)!;

        expect(job.progress).toEqual(progress);
        expect(job.modified.getTime()).toBeGreaterThan(job.created.getTime());
      });

      it("should set job outputs", () => {
        const outputs = {
          processedData: { records: 100, errors: 0 },
          outputFile: "/path/to/output.json",
        };

        store.actions.setJobOutputs(jobId, outputs);

        const state = store.getState();
        const job = state.jobs.get(jobId)!;

        expect(job.outputs).toEqual(outputs);
      });

      it("should set job error", () => {
        const errorMessage = "Node execution timeout";

        store.actions.setJobError(jobId, errorMessage);

        const state = store.getState();
        const job = state.jobs.get(jobId)!;

        expect(job.error).toBe(errorMessage);
        expect(job.status).toBe("failed");
      });

      it("should ignore updates to non-existent job", () => {
        const initialState = store.getState();

        store.actions.updateJobStatus("non-existent", "running");
        store.actions.updateJobProgress("non-existent", {
          current: 50,
          total: 100,
          percentage: 50,
        });

        const finalState = store.getState();
        expect(finalState).toEqual(initialState);
      });
    });

    describe("Remove Job", () => {
      let jobId: string;

      beforeEach(() => {
        jobId = store.actions.addJob(testJob);
      });

      it("should remove job from store and queue", () => {
        store.actions.removeJob(jobId);

        const state = store.getState();
        expect(state.jobs.size).toBe(0);
        expect(state.queue).not.toContain(jobId);
      });

      it("should clear selected job if removed", () => {
        store.actions.selectJob(jobId);
        expect(store.getState().selectedJobId).toBe(jobId);

        store.actions.removeJob(jobId);

        const state = store.getState();
        expect(state.selectedJobId).toBeNull();
      });

      it("should remove job from execution history", () => {
        // Complete job to add to history
        store.actions.updateJobStatus(jobId, "completed");
        store.actions.addToHistory(jobId);

        let state = store.getState();
        expect(state.executionHistory).toContain(jobId);

        store.actions.removeJob(jobId);

        state = store.getState();
        expect(state.executionHistory).not.toContain(jobId);
      });
    });

    describe("Job Status Transitions", () => {
      let jobId: string;

      beforeEach(() => {
        jobId = store.actions.addJob(testJob);
      });

      it("should handle queued -> running transition", () => {
        store.actions.startJobExecution(jobId);

        const state = store.getState();
        const job = state.jobs.get(jobId)!;

        expect(job.status).toBe("running");
        expect(job.started).toBeInstanceOf(Date);
        expect(state.isExecuting).toBe(true);
        expect(state.queue).not.toContain(jobId);
      });

      it("should handle running -> completed transition", () => {
        store.actions.startJobExecution(jobId);
        store.actions.completeJobExecution(jobId, {
          result: "success",
          outputCount: 100,
        });

        const state = store.getState();
        const job = state.jobs.get(jobId)!;

        expect(job.status).toBe("completed");
        expect(job.completed).toBeInstanceOf(Date);
        expect(state.executionHistory).toContain(jobId);
      });

      it("should handle running -> failed transition", () => {
        store.actions.startJobExecution(jobId);
        store.actions.failJobExecution(jobId, "Execution timeout");

        const state = store.getState();
        const job = state.jobs.get(jobId)!;

        expect(job.status).toBe("failed");
        expect(job.error).toBe("Execution timeout");
        expect(job.completed).toBeInstanceOf(Date);
        expect(state.executionHistory).toContain(jobId);
      });

      it("should handle pause/resume transitions", () => {
        store.actions.startJobExecution(jobId);
        store.actions.pauseJobExecution(jobId);

        let state = store.getState();
        let job = state.jobs.get(jobId)!;
        expect(job.status).toBe("paused");

        store.actions.resumeJobExecution(jobId);

        state = store.getState();
        job = state.jobs.get(jobId)!;
        expect(job.status).toBe("running");
      });

      it("should handle cancel transition", () => {
        store.actions.startJobExecution(jobId);
        store.actions.cancelJobExecution(jobId);

        const state = store.getState();
        const job = state.jobs.get(jobId)!;

        expect(job.status).toBe("cancelled");
        expect(job.completed).toBeInstanceOf(Date);
        expect(state.isExecuting).toBe(false);
      });
    });
  });

  describe("Queue Management", () => {
    it("should maintain job queue order", () => {
      const job1Id = store.actions.addJob({
        ...ExecutionMockFactory.createJob(),
        priority: 1,
      });
      const job3Id = store.actions.addJob({
        ...ExecutionMockFactory.createJob(),
        priority: 3,
      });

      const state = store.getState();
      expect(state.queue).toEqual([job1Id, job3Id]);
    });

    it("should remove job from queue when started", () => {
      const jobId = store.actions.addJob(ExecutionMockFactory.createJob());

      let state = store.getState();
      expect(state.queue).toContain(jobId);

      store.actions.startJobExecution(jobId);

      state = store.getState();
      expect(state.queue).not.toContain(jobId);
    });

    it("should get next job in queue", () => {
      const job1Id = store.actions.addJob(ExecutionMockFactory.createJob());
      store.actions.addJob(ExecutionMockFactory.createJob()); // Add second job to queue

      const state = store.getState();
      const nextJob = ExecutionSelectors.getNextQueuedJob(state);

      expect(nextJob?.id).toBe(job1Id);
    });

    it("should handle empty queue", () => {
      const state = store.getState();
      const nextJob = ExecutionSelectors.getNextQueuedJob(state);

      expect(nextJob).toBeNull();
    });

    it("should clear entire queue", () => {
      store.actions.addJob(ExecutionMockFactory.createJob());
      store.actions.addJob(ExecutionMockFactory.createJob());
      store.actions.addJob(ExecutionMockFactory.createJob());

      let state = store.getState();
      expect(state.queue).toHaveLength(3);

      store.actions.clearQueue();

      state = store.getState();
      expect(state.queue).toHaveLength(0);
    });
  });

  describe("Execution State Management", () => {
    it("should track execution state correctly", () => {
      expect(store.getState().isExecuting).toBe(false);

      const jobId = store.actions.addJob(ExecutionMockFactory.createJob());
      store.actions.startJobExecution(jobId);

      expect(store.getState().isExecuting).toBe(true);

      store.actions.completeJobExecution(jobId, { result: "success" });

      expect(store.getState().isExecuting).toBe(false);
    });

    it("should handle multiple concurrent executions", () => {
      const job1Id = store.actions.addJob(ExecutionMockFactory.createJob());
      const job2Id = store.actions.addJob(ExecutionMockFactory.createJob());

      store.actions.startJobExecution(job1Id);
      store.actions.startJobExecution(job2Id);

      const state = store.getState();
      expect(state.isExecuting).toBe(true);

      // Complete first job
      store.actions.completeJobExecution(job1Id, { result: "success" });
      expect(store.getState().isExecuting).toBe(true); // Still executing second job

      // Complete second job
      store.actions.completeJobExecution(job2Id, { result: "success" });
      expect(store.getState().isExecuting).toBe(false); // No more running jobs
    });
  });

  describe("History Management", () => {
    it("should add completed jobs to history", () => {
      const jobId = store.actions.addJob(ExecutionMockFactory.createJob());
      store.actions.completeJobExecution(jobId, { result: "success" });

      const state = store.getState();
      expect(state.executionHistory).toContain(jobId);
    });

    it("should maintain history order (most recent first)", () => {
      const job1Id = store.actions.addJob(ExecutionMockFactory.createJob());
      const job2Id = store.actions.addJob(ExecutionMockFactory.createJob());
      const job3Id = store.actions.addJob(ExecutionMockFactory.createJob());

      store.actions.completeJobExecution(job1Id, { result: "success" });
      store.actions.completeJobExecution(job2Id, { result: "success" });
      store.actions.completeJobExecution(job3Id, { result: "success" });

      const state = store.getState();
      expect(state.executionHistory).toEqual([job3Id, job2Id, job1Id]);
    });

    it("should clear execution history", () => {
      const job1Id = store.actions.addJob(ExecutionMockFactory.createJob());
      const job2Id = store.actions.addJob(ExecutionMockFactory.createJob());

      store.actions.completeJobExecution(job1Id, { result: "success" });
      store.actions.completeJobExecution(job2Id, { result: "success" });

      let state = store.getState();
      expect(state.executionHistory).toHaveLength(2);

      store.actions.clearHistory();

      state = store.getState();
      expect(state.executionHistory).toHaveLength(0);
    });
  });

  describe("Selection Management", () => {
    let job1Id: string;
    let job2Id: string;

    beforeEach(() => {
      job1Id = store.actions.addJob(ExecutionMockFactory.createJob());
      job2Id = store.actions.addJob(ExecutionMockFactory.createJob());
    });

    it("should select job by ID", () => {
      store.actions.selectJob(job1Id);

      const state = store.getState();
      expect(state.selectedJobId).toBe(job1Id);
    });

    it("should clear selection", () => {
      store.actions.selectJob(job1Id);
      store.actions.selectJob(null);

      const state = store.getState();
      expect(state.selectedJobId).toBeNull();
    });

    it("should change selection", () => {
      store.actions.selectJob(job1Id);
      store.actions.selectJob(job2Id);

      const state = store.getState();
      expect(state.selectedJobId).toBe(job2Id);
    });
  });

  describe("Filter and Sort Management", () => {
    beforeEach(() => {
      // Create jobs with different statuses
      const queuedJob = store.actions.addJob(
        ExecutionMockFactory.createJob({ status: "queued" }),
      );
      const runningJob = store.actions.addJob(
        ExecutionMockFactory.createJob({ status: "running" }),
      );
      const completedJob = store.actions.addJob(
        ExecutionMockFactory.createJob({ status: "completed" }),
      );
      const failedJob = store.actions.addJob(
        ExecutionMockFactory.createJob({ status: "failed" }),
      );

      store.actions.updateJobStatus(queuedJob, "queued");
      store.actions.updateJobStatus(runningJob, "running");
      store.actions.updateJobStatus(completedJob, "completed");
      store.actions.updateJobStatus(failedJob, "failed");
    });

    it("should set status filter", () => {
      store.actions.setStatusFilter("running");

      const state = store.getState();
      expect(state.filterStatus).toBe("running");
    });

    it("should clear status filter", () => {
      store.actions.setStatusFilter("running");
      store.actions.setStatusFilter(null);

      const state = store.getState();
      expect(state.filterStatus).toBeNull();
    });

    it("should set sort settings", () => {
      store.actions.setSortSettings("priority", "asc");

      const state = store.getState();
      expect(state.sortBy).toBe("priority");
      expect(state.sortDirection).toBe("asc");
    });
  });

  describe("Node State Management", () => {
    let jobId: string;

    beforeEach(() => {
      const jobData = ExecutionMockFactory.createJob();
      jobData.nodeStates = new Map([
        ["node-1", { status: "pending", progress: 0 }],
        ["node-2", { status: "pending", progress: 0 }],
      ]);
      jobId = store.actions.addJob(jobData);
    });

    it("should update node state", () => {
      store.actions.updateNodeState(jobId, "node-1", {
        status: "running",
        progress: 50,
        message: "Processing...",
      });

      const state = store.getState();
      const job = state.jobs.get(jobId)!;
      const nodeState = job.nodeStates.get("node-1")!;

      expect(nodeState.status).toBe("running");
      expect(nodeState.progress).toBe(50);
      expect(nodeState.message).toBe("Processing...");
    });

    it("should create node state if not exists", () => {
      store.actions.updateNodeState(jobId, "node-3", {
        status: "running",
        progress: 25,
      });

      const state = store.getState();
      const job = state.jobs.get(jobId)!;
      const nodeState = job.nodeStates.get("node-3")!;

      expect(nodeState).toBeDefined();
      expect(nodeState.status).toBe("running");
      expect(nodeState.progress).toBe(25);
    });
  });

  describe("Execution Selectors", () => {
    let testState: ExecutionState;
    let jobs: Job[];

    beforeEach(() => {
      jobs = [
        ExecutionMockFactory.createJob({
          id: "job-1",
          status: "running",
          priority: 1,
          created: new Date("2024-01-01"),
        }),
        ExecutionMockFactory.createJob({
          id: "job-2",
          status: "completed",
          priority: 2,
          created: new Date("2024-01-02"),
        }),
        ExecutionMockFactory.createJob({
          id: "job-3",
          status: "failed",
          priority: 3,
          created: new Date("2024-01-03"),
        }),
      ];

      const jobsMap = new Map<string, Job>();
      jobs.forEach((job) => jobsMap.set(job.id, job));

      testState = {
        jobs: jobsMap,
        selectedJobId: "job-1",
        queue: ["job-1"],
        isExecuting: true,
        executionHistory: ["job-2", "job-3"],
        filterStatus: null,
        sortBy: "created",
        sortDirection: "desc",
      };
    });

    describe("getAllJobs", () => {
      it("should return all jobs as array", () => {
        const result = ExecutionSelectors.getAllJobs(testState);

        expect(result).toHaveLength(3);
        expect(result).toEqual(expect.arrayContaining(jobs));
      });
    });

    describe("getSelectedJob", () => {
      it("should return selected job", () => {
        const result = ExecutionSelectors.getSelectedJob(testState);

        expect(result).toEqual(jobs[0]); // job-1
      });

      it("should return null when no selection", () => {
        const noSelectionState = {
          ...testState,
          selectedJobId: null,
        };

        const result = ExecutionSelectors.getSelectedJob(noSelectionState);
        expect(result).toBeNull();
      });
    });

    describe("getFilteredJobs", () => {
      it("should return all jobs when no filter", () => {
        const result = ExecutionSelectors.getFilteredJobs(testState);

        expect(result).toHaveLength(3);
        // Should be sorted by created date desc
        expect(result[0].id).toBe("job-3");
        expect(result[1].id).toBe("job-2");
        expect(result[2].id).toBe("job-1");
      });

      it("should filter by status", () => {
        const filteredState = {
          ...testState,
          filterStatus: "completed" as JobStatus,
        };

        const result = ExecutionSelectors.getFilteredJobs(filteredState);

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe("completed");
      });

      it("should sort by priority ascending", () => {
        const sortedState = {
          ...testState,
          sortBy: "priority" as const,
          sortDirection: "asc" as const,
        };

        const result = ExecutionSelectors.getFilteredJobs(sortedState);

        expect(result[0].priority).toBe(1);
        expect(result[1].priority).toBe(2);
        expect(result[2].priority).toBe(3);
      });
    });

    describe("getJobsByStatus", () => {
      it("should return jobs with specific status", () => {
        const runningJobs = ExecutionSelectors.getJobsByStatus(
          testState,
          "running",
        );
        const completedJobs = ExecutionSelectors.getJobsByStatus(
          testState,
          "completed",
        );
        const failedJobs = ExecutionSelectors.getJobsByStatus(
          testState,
          "failed",
        );

        expect(runningJobs).toHaveLength(1);
        expect(runningJobs[0].status).toBe("running");

        expect(completedJobs).toHaveLength(1);
        expect(completedJobs[0].status).toBe("completed");

        expect(failedJobs).toHaveLength(1);
        expect(failedJobs[0].status).toBe("failed");
      });
    });

    describe("getRunningJobs", () => {
      it("should return only running jobs", () => {
        const result = ExecutionSelectors.getRunningJobs(testState);

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe("running");
      });
    });

    describe("getNextQueuedJob", () => {
      it("should return first job in queue", () => {
        const result = ExecutionSelectors.getNextQueuedJob(testState);

        expect(result?.id).toBe("job-1");
      });

      it("should return null for empty queue", () => {
        const emptyQueueState = {
          ...testState,
          queue: [],
        };

        const result = ExecutionSelectors.getNextQueuedJob(emptyQueueState);
        expect(result).toBeNull();
      });
    });
  });

  describe("Store Persistence", () => {
    it("should persist job data and history", async () => {
      const job = ExecutionMockFactory.createJob();
      const jobId = store.actions.addJob(job);
      store.actions.completeJobExecution(jobId, { result: "success" });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const newStore = createExecutionStore();
      const hydratedState = newStore.getState();

      expect(hydratedState.jobs.size).toBe(1);
      expect(hydratedState.executionHistory).toContain(jobId);
    });

    it("should not persist temporary execution state", async () => {
      const job = ExecutionMockFactory.createJob();
      const jobId = store.actions.addJob(job);
      store.actions.startJobExecution(jobId);
      store.actions.selectJob(jobId);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const newStore = createExecutionStore();
      const hydratedState = newStore.getState();

      expect(hydratedState.isExecuting).toBe(false);
      expect(hydratedState.selectedJobId).toBeNull();
      expect(hydratedState.queue).toEqual([]);
    });
  });

  describe("Subscription Behavior", () => {
    TestPatterns.testSubscriptions(store, (store: ExecutionStore) => {
      const job = ExecutionMockFactory.createJob();
      store.actions.addJob(job);
    });

    it("should notify on job state changes", () => {
      const mockCallback = vi.fn();
      const unsubscribe = store.subscribe(mockCallback);

      const job = ExecutionMockFactory.createJob();
      const jobId = store.actions.addJob(job);

      expect(mockCallback).toHaveBeenCalledTimes(1);

      store.actions.updateJobStatus(jobId, "running");
      expect(mockCallback).toHaveBeenCalledTimes(2);

      store.actions.updateJobProgress(jobId, {
        current: 50,
        total: 100,
        percentage: 50,
      });
      expect(mockCallback).toHaveBeenCalledTimes(3);

      unsubscribe();
    });
  });

  describe("Immutability and Pure Functions", () => {
    it("should maintain state immutability", () => {
      const job = ExecutionMockFactory.createJob();
      const jobId = store.actions.addJob(job);

      const state1 = store.getState();
      const jobs1 = state1.jobs;

      store.actions.updateJobStatus(jobId, "running");

      const state2 = store.getState();
      const jobs2 = state2.jobs;

      expect(state1).not.toBe(state2);
      expect(jobs1).not.toBe(jobs2);

      expect(jobs1.get(jobId)!.status).toBe("queued");
      expect(jobs2.get(jobId)!.status).toBe("running");
    });

    it("should ensure Map immutability for node states", () => {
      const job = ExecutionMockFactory.createJob();
      job.nodeStates = new Map([
        ["node-1", { status: "pending", progress: 0 }],
      ]);
      const jobId = store.actions.addJob(job);

      const state1 = store.getState();
      const nodeStates1 = state1.jobs.get(jobId)!.nodeStates;

      store.actions.updateNodeState(jobId, "node-1", {
        status: "running",
        progress: 50,
      });

      const state2 = store.getState();
      const nodeStates2 = state2.jobs.get(jobId)!.nodeStates;

      expect(nodeStates1).not.toBe(nodeStates2);
      expect(nodeStates1.get("node-1")!.status).toBe("pending");
      expect(nodeStates2.get("node-1")!.status).toBe("running");
    });

    it("should ensure selectors are pure functions", () => {
      const testState = ExecutionMockFactory.createExecutionState();

      const result1 = ExecutionSelectors.getAllJobs(testState);
      const result2 = ExecutionSelectors.getAllJobs(testState);
      const result3 = ExecutionSelectors.getFilteredJobs(testState);
      const result4 = ExecutionSelectors.getFilteredJobs(testState);

      expect(result1).toEqual(result2);
      expect(result3).toEqual(result4);

      // Original state should not be modified
      expect(testState).toEqual(ExecutionMockFactory.createExecutionState());
    });
  });

  describe("Complex Execution Scenarios", () => {
    it("should handle job lifecycle completely", () => {
      const job = ExecutionMockFactory.createJob();
      const jobId = store.actions.addJob(job);

      // Job starts queued
      expect(store.getState().jobs.get(jobId)!.status).toBe("queued");

      // Start execution
      store.actions.startJobExecution(jobId);
      expect(store.getState().jobs.get(jobId)!.status).toBe("running");
      expect(store.getState().isExecuting).toBe(true);

      // Update progress
      store.actions.updateJobProgress(jobId, {
        current: 50,
        total: 100,
        percentage: 50,
      });
      expect(store.getState().jobs.get(jobId)!.progress.percentage).toBe(50);

      // Complete execution
      store.actions.completeJobExecution(jobId, {
        result: "success",
        outputCount: 100,
      });

      const finalState = store.getState();
      const finalJob = finalState.jobs.get(jobId)!;

      expect(finalJob.status).toBe("completed");
      expect(finalJob.completed).toBeInstanceOf(Date);
      expect(finalState.executionHistory).toContain(jobId);
      expect(finalState.isExecuting).toBe(false);
    });

    it("should handle concurrent job execution", () => {
      const job1 = ExecutionMockFactory.createJob();
      const job2 = ExecutionMockFactory.createJob();

      const job1Id = store.actions.addJob(job1);
      const job2Id = store.actions.addJob(job2);

      // Start both jobs
      store.actions.startJobExecution(job1Id);
      store.actions.startJobExecution(job2Id);

      const runningState = store.getState();
      expect(runningState.isExecuting).toBe(true);
      expect(ExecutionSelectors.getRunningJobs(runningState)).toHaveLength(2);

      // Complete first job
      store.actions.completeJobExecution(job1Id, { result: "success" });

      const midState = store.getState();
      expect(midState.isExecuting).toBe(true); // Still running job2
      expect(ExecutionSelectors.getRunningJobs(midState)).toHaveLength(1);

      // Complete second job
      store.actions.completeJobExecution(job2Id, { result: "success" });

      const finalState = store.getState();
      expect(finalState.isExecuting).toBe(false);
      expect(ExecutionSelectors.getRunningJobs(finalState)).toHaveLength(0);
    });
  });
});
