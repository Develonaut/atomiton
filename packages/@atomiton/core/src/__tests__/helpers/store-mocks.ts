/**
 * Store Mock Factory
 * Provides mock data generators for all store types
 */

import { faker } from "@faker-js/faker";

import type { Blueprint, BlueprintState } from "../../store/blueprintStore";
import type {
  Job,
  JobStatus,
  JobProgress,
  JobResult,
  ExecutionState,
} from "../../store/executionStore";
import type {
  DragItem,
  Selection,
  Clipboard,
  UndoItem,
  SessionState,
} from "../../store/sessionStore";
import type {
  Theme,
  ColorScheme,
  LayoutMode,
  Notification,
  Modal,
  UIPreferences,
  PanelState,
  UIState,
} from "../../store/uiStore";

export const ExecutionMockFactory = {
  // Blueprint Store Mocks
  createBlueprint: (overrides?: Partial<Blueprint>): Blueprint => ({
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    version: "1.0.0",
    author: faker.person.fullName(),
    created: faker.date.past(),
    modified: faker.date.recent(),
    tags: faker.helpers.arrayElements(
      ["workflow", "data", "automation", "integration"],
      2,
    ),
    nodes: [],
    connections: [],
    metadata: {},
    ...overrides,
  }),

  createBlueprintState: (
    overrides?: Partial<BlueprintState>,
  ): BlueprintState => ({
    blueprints: new Map(),
    selectedBlueprintId: null,
    searchQuery: "",
    filterTags: [],
    sortBy: "modified",
    sortDirection: "desc",
    isLoading: false,
    error: null,
    ...overrides,
  }),

  // Execution Store Mocks
  createJob: (overrides?: Partial<Job>): Job => ({
    id: faker.string.uuid(),
    blueprintId: faker.string.uuid(),
    blueprintName: faker.lorem.words(3),
    status: faker.helpers.arrayElement<JobStatus>([
      "queued",
      "running",
      "completed",
      "failed",
    ]),
    priority: faker.number.int({ min: 1, max: 10 }),
    progress: {
      current: faker.number.int({ min: 0, max: 100 }),
      total: 100,
      percentage: faker.number.int({ min: 0, max: 100 }),
      message: faker.lorem.sentence(),
      estimatedTimeRemaining: faker.number.int({ min: 0, max: 60000 }),
    },
    result: undefined,
    startedAt: faker.date.recent(),
    completedAt: faker.date.recent(),
    error: undefined,
    nodeStates: new Map(),
    inputs: {},
    outputs: {},
    tags: faker.helpers.arrayElements(["batch", "scheduled", "manual"], 1),
    ...overrides,
  }),

  createExecutionState: (
    overrides?: Partial<ExecutionState>,
  ): ExecutionState => ({
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
    ...overrides,
  }),

  createJobProgress: (overrides?: Partial<JobProgress>): JobProgress => ({
    current: faker.number.int({ min: 0, max: 100 }),
    total: 100,
    percentage: faker.number.int({ min: 0, max: 100 }),
    message: faker.lorem.sentence(),
    estimatedTimeRemaining: faker.number.int({ min: 0, max: 60000 }),
    ...overrides,
  }),

  createJobResult: (overrides?: Partial<JobResult>): JobResult => ({
    success: faker.datatype.boolean(),
    data: {},
    error: undefined,
    logs: faker.helpers.multiple(() => faker.lorem.sentence(), { count: 5 }),
    metrics: {
      startTime: faker.date.recent(),
      endTime: faker.date.recent(),
      duration: faker.number.int({ min: 1000, max: 60000 }),
      nodesExecuted: faker.number.int({ min: 1, max: 20 }),
      memoryUsed: faker.number.int({ min: 1000000, max: 100000000 }),
    },
    ...overrides,
  }),

  // Session Store Mocks
  createDragItem: (overrides?: Partial<DragItem>): DragItem => ({
    type: faker.helpers.arrayElement([
      "node",
      "connection",
      "blueprint",
      "file",
    ]),
    id: faker.string.uuid(),
    data: {},
    source: faker.lorem.word(),
    ...overrides,
  }),

  createSelection: (overrides?: Partial<Selection>): Selection => ({
    type: faker.helpers.arrayElement(["node", "connection", "multiple"]),
    ids: [faker.string.uuid(), faker.string.uuid()],
    bounds: {
      x: faker.number.int({ min: 0, max: 1000 }),
      y: faker.number.int({ min: 0, max: 1000 }),
      width: faker.number.int({ min: 100, max: 500 }),
      height: faker.number.int({ min: 100, max: 500 }),
    },
    ...overrides,
  }),

  createClipboard: (overrides?: Partial<Clipboard>): Clipboard => ({
    type: faker.helpers.arrayElement(["nodes", "blueprint", "text", "data"]),
    data: {},
    timestamp: faker.date.recent(),
    source: faker.lorem.word(),
    ...overrides,
  }),

  createUndoItem: (overrides?: Partial<UndoItem>): UndoItem => ({
    type: faker.helpers.arrayElement(["add", "delete", "update", "move"]),
    description: faker.lorem.sentence(),
    data: {},
    timestamp: faker.date.recent(),
    ...overrides,
  }),

  createSessionState: (overrides?: Partial<SessionState>): SessionState => ({
    userId: faker.string.uuid(),
    userName: faker.person.fullName(),
    userRole: "developer",
    sessionStarted: faker.date.recent(),
    dragItem: null,
    dropTarget: null,
    isDragging: false,
    selection: null,
    multiSelectMode: false,
    clipboard: null,
    undoStack: [],
    redoStack: [],
    maxUndoItems: 50,
    tempData: new Map(),
    messages: [],
    activeOperations: new Map(),
    editorMode: "edit",
    zoomLevel: 1,
    panPosition: { x: 0, y: 0 },
    debugEnabled: false,
    debugBreakpoints: [],
    debugCurrentNode: null,
    ...overrides,
  }),

  // UI Store Mocks
  createNotification: (overrides?: Partial<Notification>): Notification => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(["info", "success", "warning", "error"]),
    title: faker.lorem.sentence(),
    message: faker.lorem.paragraph(),
    duration: faker.number.int({ min: 3000, max: 10000 }),
    timestamp: faker.date.recent(),
    actions: [],
    ...overrides,
  }),

  createModal: (overrides?: Partial<Modal>): Modal => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement([
      "info",
      "confirmation",
      "form",
      "custom",
    ]),
    title: faker.lorem.sentence(),
    props: {},
    onClose: undefined,
    ...overrides,
  }),

  createTheme: (): Theme => {
    return faker.helpers.arrayElement<Theme>(["light", "dark", "auto"]);
  },

  createColorScheme: (): ColorScheme => {
    return faker.helpers.arrayElement<ColorScheme>([
      "default",
      "dracula",
      "monokai",
      "solarized",
    ]);
  },

  createLayoutMode: (): LayoutMode => {
    return faker.helpers.arrayElement<LayoutMode>([
      "compact",
      "comfortable",
      "spacious",
    ]);
  },

  createPanelState: (overrides?: Partial<PanelState>): PanelState => ({
    visible: faker.datatype.boolean(),
    position: faker.datatype.boolean() ? { x: 100, y: 100 } : undefined,
    size: faker.datatype.boolean()
      ? {
          width: faker.number.int({ min: 200, max: 800 }),
          height: faker.number.int({ min: 200, max: 600 }),
        }
      : undefined,
    minimized: faker.datatype.boolean(),
    ...overrides,
  }),

  createUIPreferences: (overrides?: Partial<UIPreferences>): UIPreferences => ({
    theme: faker.helpers.arrayElement<Theme>(["light", "dark", "auto"]),
    colorScheme: faker.helpers.arrayElement<ColorScheme>([
      "default",
      "dracula",
      "monokai",
      "solarized",
    ]),
    layoutMode: faker.helpers.arrayElement<LayoutMode>([
      "compact",
      "comfortable",
      "spacious",
    ]),
    sidebarWidth: faker.number.int({ min: 200, max: 400 }),
    sidebarCollapsed: faker.datatype.boolean(),
    showMinimap: faker.datatype.boolean(),
    showGrid: faker.datatype.boolean(),
    snapToGrid: faker.datatype.boolean(),
    gridSize: faker.helpers.arrayElement([10, 20, 50]),
    autoSave: faker.datatype.boolean(),
    autoSaveInterval: faker.number.int({ min: 1, max: 10 }),
    fontSize: faker.number.int({ min: 12, max: 18 }),
    fontFamily: faker.helpers.arrayElement([
      "JetBrains Mono",
      "Fira Code",
      "Monaco",
    ]),
    animations: faker.datatype.boolean(),
    soundEffects: faker.datatype.boolean(),
    ...overrides,
  }),

  createUIState: (overrides?: Partial<UIState>): UIState => {
    const defaultPanelStates = new Map<string, PanelState>([
      ["nodeProperties", { visible: true }],
      ["nodeLibrary", { visible: true, position: { x: 0, y: 0 } }],
      ["minimap", { visible: false }],
    ]);

    return {
      preferences: ExecutionMockFactory.createUIPreferences(),
      activeModal: null,
      modalStack: [],
      notifications: [],
      panelStates: defaultPanelStates,
      globalLoading: false,
      loadingMessage: null,
      ...overrides,
    };
  },

  // Composite state creators for testing
  createPopulatedExecutionState: (): ExecutionState => {
    const jobs = new Map<string, Job>();

    // Add diverse job states
    const runningJob = ExecutionMockFactory.createJob({
      status: "running",
      progress: {
        current: 45,
        total: 100,
        percentage: 45,
        message: "Processing...",
      },
    });
    const completedJob = ExecutionMockFactory.createJob({
      status: "completed",
      progress: {
        current: 100,
        total: 100,
        percentage: 100,
        message: "Complete",
      },
    });
    const failedJob = ExecutionMockFactory.createJob({
      status: "failed",
      error: "Connection timeout",
    });
    const queuedJob = ExecutionMockFactory.createJob({
      status: "queued",
    });

    jobs.set(runningJob.id, runningJob);
    jobs.set(completedJob.id, completedJob);
    jobs.set(failedJob.id, failedJob);
    jobs.set(queuedJob.id, queuedJob);

    return ExecutionMockFactory.createExecutionState({
      jobs,
      activeJobs: [runningJob.id],
      queue: [queuedJob.id],
      selectedJobId: runningJob.id,
      totalJobsRun: 10,
      totalJobsSucceeded: 7,
      totalJobsFailed: 3,
      averageExecutionTime: 15000,
    });
  },

  createPopulatedBlueprintState: (): BlueprintState => {
    const blueprints = new Map<string, Blueprint>();

    // Add various blueprints
    for (let i = 0; i < 5; i++) {
      const blueprint = ExecutionMockFactory.createBlueprint();
      blueprints.set(blueprint.id, blueprint);
    }

    const firstBlueprintId = Array.from(blueprints.keys())[0];

    return ExecutionMockFactory.createBlueprintState({
      blueprints,
      selectedBlueprintId: firstBlueprintId,
    });
  },

  createActiveSessionState: (): SessionState => {
    const selection = ExecutionMockFactory.createSelection({
      type: "multiple",
      ids: ["node1", "node2", "node3"],
    });

    const clipboard = ExecutionMockFactory.createClipboard({
      type: "nodes",
      data: { nodes: ["node1", "node2"] },
    });

    const undoStack = [
      ExecutionMockFactory.createUndoItem({
        type: "add",
        description: "Add node",
      }),
      ExecutionMockFactory.createUndoItem({
        type: "delete",
        description: "Delete connection",
      }),
    ];

    return ExecutionMockFactory.createSessionState({
      selection,
      clipboard,
      undoStack,
      editorMode: "edit",
      zoomLevel: 1.2,
      panPosition: { x: 100, y: 50 },
    });
  },

  createBusyUIState: (): UIState => {
    const notifications = [
      ExecutionMockFactory.createNotification({
        type: "info",
        title: "Job started",
        duration: 5000,
      }),
      ExecutionMockFactory.createNotification({
        type: "success",
        title: "Blueprint saved",
        duration: 3000,
      }),
    ];

    const modal = ExecutionMockFactory.createModal({
      type: "confirmation",
      title: "Delete Blueprint?",
      props: { blueprintId: "test-bp-1" },
    });

    return ExecutionMockFactory.createUIState({
      activeModal: modal,
      modalStack: [modal],
      notifications,
      globalLoading: true,
      loadingMessage: "Processing blueprint...",
    });
  },

  // Testing utilities
  waitFor: (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms)),

  createMockStoreState: (): {
    blueprint: BlueprintState;
    execution: ExecutionState;
    session: SessionState;
    ui: UIState;
  } => ({
    blueprint: ExecutionMockFactory.createBlueprintState(),
    execution: ExecutionMockFactory.createExecutionState(),
    session: ExecutionMockFactory.createSessionState(),
    ui: ExecutionMockFactory.createUIState(),
  }),
};

// Simplified aliases for common mocks
export const mockBlueprint = ExecutionMockFactory.createBlueprint;
export const mockJob = ExecutionMockFactory.createJob;
export const mockNotification = ExecutionMockFactory.createNotification;
export const mockModal = ExecutionMockFactory.createModal;
export const mockSelection = ExecutionMockFactory.createSelection;

// Export organized mock factories
export const MockFactories = {
  Blueprint: {
    createBlueprint: ExecutionMockFactory.createBlueprint,
    createBlueprintState: ExecutionMockFactory.createBlueprintState,
    createPopulatedState: ExecutionMockFactory.createPopulatedBlueprintState,
  },
  Execution: {
    createJob: ExecutionMockFactory.createJob,
    createExecutionState: ExecutionMockFactory.createExecutionState,
    createJobProgress: ExecutionMockFactory.createJobProgress,
    createJobResult: ExecutionMockFactory.createJobResult,
    createPopulatedState: ExecutionMockFactory.createPopulatedExecutionState,
  },
  Session: {
    createDragItem: ExecutionMockFactory.createDragItem,
    createSelection: ExecutionMockFactory.createSelection,
    createClipboard: ExecutionMockFactory.createClipboard,
    createUndoItem: ExecutionMockFactory.createUndoItem,
    createSessionState: ExecutionMockFactory.createSessionState,
    createActiveState: ExecutionMockFactory.createActiveSessionState,
  },
  UI: {
    createNotification: ExecutionMockFactory.createNotification,
    createModal: ExecutionMockFactory.createModal,
    createTheme: ExecutionMockFactory.createTheme,
    createColorScheme: ExecutionMockFactory.createColorScheme,
    createLayoutMode: ExecutionMockFactory.createLayoutMode,
    createPanelState: ExecutionMockFactory.createPanelState,
    createUIPreferences: ExecutionMockFactory.createUIPreferences,
    createUIState: ExecutionMockFactory.createUIState,
    createBusyState: ExecutionMockFactory.createBusyUIState,
  },
};

// Export scenario builder for test scenarios
export const ScenarioBuilder = {
  createMockStoreState: ExecutionMockFactory.createMockStoreState,
  waitFor: ExecutionMockFactory.waitFor,
};

// Legacy exports for backward compatibility with counter reset
export const BlueprintMockFactory = {
  ...MockFactories.Blueprint,
  resetCounter: (): void => {
    // Reset the internal counter if needed for predictable tests
    // This is a no-op since we use faker which generates random data
  },
};

export const ExecutionFactoryWithReset = {
  ...MockFactories.Execution,
  resetCounter: (): void => {
    // Reset the internal counter if needed for predictable tests
    // This is a no-op since we use faker which generates random data
  },
};

export const SessionMockFactory = {
  ...MockFactories.Session,
  resetCounter: (): void => {
    // Reset the internal counter if needed for predictable tests
    // This is a no-op since we use faker which generates random data
  },
};

export const UIMockFactory = {
  ...MockFactories.UI,
  resetCounter: (): void => {
    // Reset the internal counter if needed for predictable tests
    // This is a no-op since we use faker which generates random data
  },
};
