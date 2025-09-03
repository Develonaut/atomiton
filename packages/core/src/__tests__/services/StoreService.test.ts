/**
 * StoreService Integration Tests
 * Testing the public API layer and orchestration across multiple stores
 * Following Brian's testing strategy for integration testing and cross-store interactions
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { StoreService } from "../../services/StoreService";
import type { Theme } from "../../store/uiStore";
import { MockFactories, ScenarioBuilder } from "../helpers/store-mocks";
import { StoreTestFactory } from "../helpers/store-test-utils";

describe("StoreService", () => {
  let service: StoreService;
  let storeFactory: StoreTestFactory;

  beforeEach(async () => {
    storeFactory = new StoreTestFactory();
    await storeFactory.initializeStoreClient();

    // Use a fresh instance for testing
    service = new (StoreService as any)();
    await service.initialize();
  });

  afterEach(async () => {
    await service.cleanup();
    await storeFactory.cleanup();
  });

  describe("Service Initialization", () => {
    it("should create singleton instance", () => {
      const instance1 = StoreService.getInstance();
      const instance2 = StoreService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should initialize all stores", async () => {
      const freshService = new (StoreService as any)();
      expect(freshService.isInitialized()).toBe(false);

      await freshService.initialize();
      expect(freshService.isInitialized()).toBe(true);

      // Should be able to access all stores
      expect(() => freshService.getUIStore()).not.toThrow();
      expect(() => freshService.getSessionStore()).not.toThrow();
      expect(() => freshService.getBlueprintStore()).not.toThrow();
      expect(() => freshService.getExecutionStore()).not.toThrow();

      await freshService.cleanup();
    });

    it("should throw error when accessing stores before initialization", () => {
      const uninitializedService = new (StoreService as any)();

      expect(() => uninitializedService.getUIStore()).toThrow(
        /not initialized/,
      );
      expect(() => uninitializedService.getSessionStore()).toThrow(
        /not initialized/,
      );
      expect(() => uninitializedService.getBlueprintStore()).toThrow(
        /not initialized/,
      );
      expect(() => uninitializedService.getExecutionStore()).toThrow(
        /not initialized/,
      );
    });

    it("should handle multiple initialization calls gracefully", async () => {
      const freshService = new (StoreService as any)();

      await freshService.initialize();
      await freshService.initialize(); // Second call should be no-op

      expect(freshService.isInitialized()).toBe(true);

      await freshService.cleanup();
    });
  });

  describe("Store Access", () => {
    it("should provide access to all store instances", () => {
      const uiStore = service.getUIStore();
      const sessionStore = service.getSessionStore();
      const blueprintStore = service.getBlueprintStore();
      const executionStore = service.getExecutionStore();

      expect(uiStore).toBeDefined();
      expect(sessionStore).toBeDefined();
      expect(blueprintStore).toBeDefined();
      expect(executionStore).toBeDefined();

      // Stores should have expected methods
      expect(typeof uiStore.getState).toBe("function");
      expect(typeof sessionStore.getState).toBe("function");
      expect(typeof blueprintStore.getState).toBe("function");
      expect(typeof executionStore.getState).toBe("function");
    });

    it("should return same store instances on multiple calls", () => {
      const uiStore1 = service.getUIStore();
      const uiStore2 = service.getUIStore();

      expect(uiStore1).toBe(uiStore2);
    });
  });

  describe("Domain Methods - Theme Management", () => {
    it("should set application theme", () => {
      const customTheme: Theme = {
        mode: "light",
        colors: {
          primary: "#007acc",
          secondary: "#6c757d",
          background: "#ffffff",
          surface: "#f8f9fa",
          text: "#000000",
        },
        components: {},
      };

      service.setTheme(customTheme);

      const uiState = service.getUIStore().getState();
      expect(uiState.theme).toEqual(customTheme);
    });
  });

  describe("Domain Methods - Notifications", () => {
    it("should show notification and return ID", () => {
      const notificationId = service.showNotification(
        "success",
        "Test Success",
        "Operation completed successfully",
        5000,
      );

      expect(typeof notificationId).toBe("string");
      expect(notificationId).not.toBe("");

      const uiState = service.getUIStore().getState();
      expect(uiState.notifications).toHaveLength(1);
      expect(uiState.notifications[0]).toMatchObject({
        id: notificationId,
        type: "success",
        title: "Test Success",
        message: "Operation completed successfully",
        duration: 5000,
      });
    });

    it("should show notification with minimal parameters", () => {
      const notificationId = service.showNotification("info", "Info Message");

      const uiState = service.getUIStore().getState();
      expect(uiState.notifications[0]).toMatchObject({
        id: notificationId,
        type: "info",
        title: "Info Message",
        message: undefined,
        duration: undefined,
      });
    });

    it("should show different types of notifications", () => {
      service.showNotification("info", "Info");
      service.showNotification("success", "Success");
      service.showNotification("warning", "Warning");
      service.showNotification("error", "Error");

      const uiState = service.getUIStore().getState();
      expect(uiState.notifications).toHaveLength(4);

      const types = uiState.notifications.map((n) => n.type);
      expect(types).toEqual(["info", "success", "warning", "error"]);
    });
  });

  describe("Domain Methods - Blueprint Management", () => {
    it("should select blueprint", () => {
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);

      service.selectBlueprint(blueprint.id);

      const blueprintState = service.getBlueprintStore().getState();
      expect(blueprintState.selectedBlueprintId).toBe(blueprint.id);
    });

    it("should clear blueprint selection", () => {
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);
      service.selectBlueprint(blueprint.id);

      service.selectBlueprint(null);

      const blueprintState = service.getBlueprintStore().getState();
      expect(blueprintState.selectedBlueprintId).toBeNull();
    });
  });

  describe("Domain Methods - Blueprint Execution", () => {
    it("should execute blueprint and return job ID", () => {
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);

      const inputs = { csvFile: "/path/to/data.csv", outputFormat: "json" };
      const jobId = service.executeBlueprint(blueprint.id, inputs);

      expect(typeof jobId).toBe("string");
      expect(jobId).not.toBe("");

      const executionState = service.getExecutionStore().getState();
      expect(executionState.jobs.has(jobId)).toBe(true);

      const job = executionState.jobs.get(jobId)!;
      expect(job.blueprintId).toBe(blueprint.id);
      expect(job.blueprintName).toBe(blueprint.name);
      expect(job.inputs).toEqual(inputs);
      expect(job.tags).toEqual(blueprint.tags);
    });

    it("should execute blueprint with default inputs", () => {
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);

      const jobId = service.executeBlueprint(blueprint.id);

      const executionState = service.getExecutionStore().getState();
      const job = executionState.jobs.get(jobId)!;
      expect(job.inputs).toEqual({});
    });

    it("should throw error for non-existent blueprint", () => {
      expect(() => {
        service.executeBlueprint("non-existent-blueprint");
      }).toThrow(/Blueprint non-existent-blueprint not found/);
    });

    it("should create job with proper initial state", () => {
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);

      const jobId = service.executeBlueprint(blueprint.id);

      const executionState = service.getExecutionStore().getState();
      const job = executionState.jobs.get(jobId)!;

      expect(job).toMatchObject({
        id: jobId,
        blueprintId: blueprint.id,
        blueprintName: blueprint.name,
        status: "queued",
        priority: 1,
        progress: {
          current: 0,
          total: 100,
          percentage: 0,
        },
        outputs: {},
        tags: blueprint.tags,
      });

      expect(job.nodeStates).toBeInstanceOf(Map);
      expect(job.created).toBeInstanceOf(Date);
      expect(job.modified).toBeInstanceOf(Date);
    });
  });

  describe("State Snapshot", () => {
    it("should get complete state snapshot", () => {
      // Set up some state in each store
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);
      service.selectBlueprint(blueprint.id);

      const jobId = service.executeBlueprint(blueprint.id);

      service.showNotification("info", "Test notification");

      const snapshot = service.getStateSnapshot();

      expect(snapshot).toMatchObject({
        ui: expect.objectContaining({
          notifications: expect.arrayContaining([
            expect.objectContaining({
              type: "info",
              title: "Test notification",
            }),
          ]),
        }),
        session: expect.objectContaining({
          dragItem: null,
          selection: null,
          clipboard: null,
        }),
        blueprint: expect.objectContaining({
          blueprints: expect.any(Map),
          selectedBlueprintId: blueprint.id,
        }),
        execution: expect.objectContaining({
          jobs: expect.any(Map),
          isExecuting: false,
        }),
      });

      expect(snapshot.blueprint.blueprints.has(blueprint.id)).toBe(true);
      expect(snapshot.execution.jobs.has(jobId)).toBe(true);
    });

    it("should provide consistent snapshot data", () => {
      const snapshot1 = service.getStateSnapshot();
      const snapshot2 = service.getStateSnapshot();

      // Structure should be the same
      expect(Object.keys(snapshot1)).toEqual(Object.keys(snapshot2));
      expect(Object.keys(snapshot1)).toEqual([
        "ui",
        "session",
        "blueprint",
        "execution",
      ]);
    });
  });

  describe("Cross-Store Interactions", () => {
    it("should coordinate blueprint execution with UI notifications", () => {
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);

      // Execute blueprint
      const jobId = service.executeBlueprint(blueprint.id);

      // Simulate execution completion with notification
      service.getExecutionStore().actions.completeJobExecution(jobId, {
        result: "success",
        outputCount: 100,
      });

      service.showNotification(
        "success",
        "Blueprint Executed",
        `${blueprint.name} completed successfully`,
        3000,
      );

      // Verify cross-store state
      const snapshot = service.getStateSnapshot();

      const job = snapshot.execution.jobs.get(jobId)!;
      expect(job.status).toBe("completed");

      const notification = snapshot.ui.notifications[0];
      expect(notification.type).toBe("success");
      expect(notification.title).toBe("Blueprint Executed");
    });

    it("should handle blueprint selection with session state", () => {
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);

      // Select blueprint and simulate UI selection
      service.selectBlueprint(blueprint.id);
      service.getSessionStore().actions.setSelection({
        type: "blueprint",
        items: [blueprint.id],
        boundingBox: { x: 0, y: 0, width: 200, height: 100 },
      });

      const snapshot = service.getStateSnapshot();

      expect(snapshot.blueprint.selectedBlueprintId).toBe(blueprint.id);
      expect(snapshot.session.selection?.items).toContain(blueprint.id);
    });

    it("should coordinate theme changes across stores", () => {
      const darkTheme: Theme = {
        mode: "dark",
        colors: {
          primary: "#007acc",
          secondary: "#6c757d",
          background: "#1e1e1e",
          surface: "#2d2d30",
          text: "#cccccc",
        },
        components: {},
      };

      service.setTheme(darkTheme);

      // Theme should be reflected in UI state
      const uiState = service.getUIStore().getState();
      expect(uiState.theme).toEqual(darkTheme);

      // Show notification to test theme-aware UI
      service.showNotification("info", "Theme Updated", "Dark theme applied");

      const notification = uiState.notifications[0];
      expect(notification).toBeDefined();
      expect(notification.title).toBe("Theme Updated");
    });
  });

  describe("Complex Integration Scenarios", () => {
    it("should handle complete blueprint workflow", async () => {
      // 1. Add blueprint
      const blueprint = MockFactories.Blueprint.createBlueprint({
        name: "Data Processing Pipeline",
        description: "Processes CSV data and generates reports",
      });

      service.getBlueprintStore().actions.addBlueprint(blueprint);

      // 2. Select blueprint
      service.selectBlueprint(blueprint.id);

      // 3. Execute blueprint
      const jobId = service.executeBlueprint(blueprint.id, {
        inputFile: "/data/input.csv",
        outputFormat: "json",
      });

      // 4. Show execution started notification
      service.showNotification(
        "info",
        "Execution Started",
        `${blueprint.name} is now running`,
      );

      // 5. Simulate execution progress
      service.getExecutionStore().actions.startJobExecution(jobId);
      service.getExecutionStore().actions.updateJobProgress(jobId, {
        current: 50,
        total: 100,
        percentage: 50,
        message: "Processing records...",
      });

      // 6. Complete execution
      service.getExecutionStore().actions.completeJobExecution(jobId, {
        result: "success",
        outputFile: "/data/output.json",
        recordsProcessed: 1000,
      });

      // 7. Show completion notification
      service.showNotification(
        "success",
        "Execution Complete",
        `${blueprint.name} finished successfully`,
      );

      // Verify final state
      const snapshot = service.getStateSnapshot();

      // Blueprint should be selected
      expect(snapshot.blueprint.selectedBlueprintId).toBe(blueprint.id);

      // Job should be completed
      const job = snapshot.execution.jobs.get(jobId)!;
      expect(job.status).toBe("completed");
      expect(job.progress.percentage).toBe(50); // Last updated progress

      // Should have notifications
      expect(snapshot.ui.notifications).toHaveLength(2);
      expect(snapshot.ui.notifications[1].type).toBe("success");

      // Should have execution history
      expect(snapshot.execution.executionHistory).toContain(jobId);
    });

    it("should handle error scenarios across stores", () => {
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);

      const jobId = service.executeBlueprint(blueprint.id);

      // Simulate execution failure
      service.getExecutionStore().actions.startJobExecution(jobId);
      service
        .getExecutionStore()
        .actions.failJobExecution(jobId, "Node execution timeout");

      // Show error notification
      service.showNotification(
        "error",
        "Execution Failed",
        "Blueprint execution encountered an error",
      );

      // Set error state in blueprint store
      service.getBlueprintStore().actions.setError("Execution failed");

      const snapshot = service.getStateSnapshot();

      // Job should be failed
      const job = snapshot.execution.jobs.get(jobId)!;
      expect(job.status).toBe("failed");
      expect(job.error).toBe("Node execution timeout");

      // Should have error notification
      expect(snapshot.ui.notifications[0].type).toBe("error");

      // Blueprint store should have error
      expect(snapshot.blueprint.error).toBe("Execution failed");
    });

    it("should handle concurrent operations", () => {
      const blueprint1 = MockFactories.Blueprint.createBlueprint({
        name: "Pipeline 1",
      });
      const blueprint2 = MockFactories.Blueprint.createBlueprint({
        name: "Pipeline 2",
      });

      service.getBlueprintStore().actions.addBlueprint(blueprint1);
      service.getBlueprintStore().actions.addBlueprint(blueprint2);

      // Execute both blueprints concurrently
      const job1Id = service.executeBlueprint(blueprint1.id);
      const job2Id = service.executeBlueprint(blueprint2.id);

      // Start both executions
      service.getExecutionStore().actions.startJobExecution(job1Id);
      service.getExecutionStore().actions.startJobExecution(job2Id);

      // Show concurrent execution notification
      service.showNotification(
        "info",
        "Concurrent Executions",
        "2 blueprints are running",
      );

      const snapshot = service.getStateSnapshot();

      expect(snapshot.execution.isExecuting).toBe(true);
      expect(snapshot.execution.jobs.get(job1Id)!.status).toBe("running");
      expect(snapshot.execution.jobs.get(job2Id)!.status).toBe("running");
    });
  });

  describe("Service Lifecycle", () => {
    it("should cleanup all stores on service cleanup", async () => {
      // Set up some state
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);
      service.showNotification("info", "Test notification");

      // Verify state exists
      expect(service.getBlueprintStore().getState().blueprints.size).toBe(1);
      expect(service.getUIStore().getState().notifications).toHaveLength(1);

      await service.cleanup();
      expect(service.isInitialized()).toBe(false);

      // Should throw when accessing stores after cleanup
      expect(() => service.getUIStore()).toThrow(/not initialized/);
    });

    it("should allow re-initialization after cleanup", async () => {
      await service.cleanup();
      expect(service.isInitialized()).toBe(false);

      await service.initialize();
      expect(service.isInitialized()).toBe(true);

      // Should be able to use service again
      const blueprint = MockFactories.Blueprint.createBlueprint();
      service.getBlueprintStore().actions.addBlueprint(blueprint);

      expect(service.getBlueprintStore().getState().blueprints.size).toBe(1);
    });
  });

  describe("Comprehensive Scenario Tests", () => {
    it("should handle ScenarioBuilder complete app state", () => {
      const appState = ScenarioBuilder.buildCompleteAppState();

      // Apply the state to our service
      const uiStore = service.getUIStore();
      const sessionStore = service.getSessionStore();
      const blueprintStore = service.getBlueprintStore();
      const executionStore = service.getExecutionStore();

      // Set UI state
      uiStore.actions.showNotification(appState.ui.notifications[0]);

      // Set session state
      if (appState.session.selection) {
        sessionStore.actions.setSelection(appState.session.selection);
      }

      // Set blueprint state
      appState.blueprint.blueprints.forEach((blueprint) => {
        blueprintStore.actions.addBlueprint(blueprint);
      });
      if (appState.blueprint.selectedBlueprintId) {
        blueprintStore.actions.selectBlueprint(
          appState.blueprint.selectedBlueprintId,
        );
      }

      // Set execution state
      appState.execution.jobs.forEach((job) => {
        const jobId = executionStore.actions.addJob({
          ...job,
          id: undefined, // Let the store generate ID
          created: undefined,
          modified: undefined,
        } as any);

        // Update to match expected state
        if (job.status !== "queued") {
          executionStore.actions.updateJobStatus(jobId, job.status);
        }
      });

      // Verify the service state matches expectations
      const snapshot = service.getStateSnapshot();

      expect(snapshot.ui.notifications).toHaveLength(1);
      expect(snapshot.session.selection).toBeDefined();
      expect(snapshot.blueprint.blueprints.size).toBeGreaterThan(0);
      expect(snapshot.execution.jobs.size).toBeGreaterThan(0);
    });

    it("should handle ScenarioBuilder error scenario", () => {
      const errorState = ScenarioBuilder.buildErrorScenario();

      // Apply error state
      service.getBlueprintStore().actions.setError(errorState.blueprint.error!);
      service
        .getUIStore()
        .actions.showNotification(errorState.ui.notifications[0]);

      // Add failed job
      const failedJob = Array.from(errorState.execution.jobs.values())[0];
      const jobId = service.getExecutionStore().actions.addJob({
        ...failedJob,
        id: undefined,
        created: undefined,
        modified: undefined,
      } as any);

      service.getExecutionStore().actions.updateJobStatus(jobId, "failed");
      service.getExecutionStore().actions.setJobError(jobId, failedJob.error!);

      const snapshot = service.getStateSnapshot();

      expect(snapshot.blueprint.error).toBeDefined();
      expect(snapshot.ui.notifications[0].type).toBe("error");
      expect(Array.from(snapshot.execution.jobs.values())[0].status).toBe(
        "failed",
      );
    });
  });

  describe("Performance and Memory", () => {
    it("should handle rapid state changes efficiently", () => {
      const startTime = Date.now();

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        const blueprint = MockFactories.Blueprint.createBlueprint();
        service.getBlueprintStore().actions.addBlueprint(blueprint);
        service.selectBlueprint(blueprint.id);
        service.showNotification("info", `Notification ${i}`);

        if (i % 10 === 0) {
          const jobId = service.executeBlueprint(blueprint.id);
          service
            .getExecutionStore()
            .actions.updateJobStatus(jobId, "completed");
        }
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast

      // Verify final state
      const snapshot = service.getStateSnapshot();
      expect(snapshot.blueprint.blueprints.size).toBe(100);
      expect(snapshot.ui.notifications).toHaveLength(100);
      expect(snapshot.execution.jobs.size).toBe(10);
    });

    it("should not leak memory on repeated operations", async () => {
      // This test checks for obvious memory leaks by doing repeated operations
      const initialSnapshot = service.getStateSnapshot();

      for (let i = 0; i < 10; i++) {
        const blueprint = MockFactories.Blueprint.createBlueprint();
        service.getBlueprintStore().actions.addBlueprint(blueprint);
        const jobId = service.executeBlueprint(blueprint.id);
        service
          .getExecutionStore()
          .actions.completeJobExecution(jobId, { result: "success" });
        service.getBlueprintStore().actions.deleteBlueprint(blueprint.id);
        service.getExecutionStore().actions.removeJob(jobId);
      }

      const finalSnapshot = service.getStateSnapshot();

      // Should return to roughly initial state
      expect(finalSnapshot.blueprint.blueprints.size).toBe(
        initialSnapshot.blueprint.blueprints.size,
      );
      expect(finalSnapshot.execution.jobs.size).toBe(
        initialSnapshot.execution.jobs.size,
      );
    });
  });
});
