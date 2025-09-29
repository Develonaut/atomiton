import { initializeServices } from "#main/services";
import { createConductor, registerHandlers } from "@atomiton/conductor/desktop";
import { createNodeService, type NodeService } from "#main/services/node";
import {
  createExecutionService,
  type ExecutionService,
} from "#main/services/execution";
import {
  createFlowStorageService,
  type FlowStorageService,
} from "#main/services/flowStorage";
import {
  createErrorBoundaryService,
  type ErrorBoundaryService,
} from "#main/services/errorBoundary";
import { ipcMain } from "electron";

export type ServiceRegistry = {
  storage: ReturnType<typeof initializeServices>["storage"];
  conductor: ReturnType<typeof createConductor>;
  nodeService: NodeService;
  executionService: ExecutionService;
  flowStorageService: FlowStorageService;
  errorBoundary: ErrorBoundaryService;
};

export type ServiceRegistryManager = {
  initializeServices(): Promise<ServiceRegistry>;
  getServices(): ServiceRegistry;
};

export const createServiceRegistryManager = (): ServiceRegistryManager => {
  let registry: ServiceRegistry | null = null;
  let isInitialized = false;

  const initializeServicesImpl = async (): Promise<ServiceRegistry> => {
    // Prevent double initialization
    if (isInitialized && registry) {
      console.log("Services already initialized, returning existing registry");
      return registry;
    }

    console.log("Initializing application services");

    const legacyServices = initializeServices();
    console.log("Legacy application services initialized");

    const errorBoundary = createErrorBoundaryService();
    const nodeService = createNodeService(errorBoundary);
    const executionService = createExecutionService();
    const flowStorageService = createFlowStorageService();

    console.log("Initializing Conductor handlers");
    const conductor = createConductor();
    const handlers = conductor.createMainHandlers();
    registerHandlers(ipcMain, handlers);
    console.log("Conductor handlers initialized");

    registry = {
      storage: legacyServices.storage,
      conductor,
      nodeService,
      executionService,
      flowStorageService,
      errorBoundary,
    };

    isInitialized = true;
    return registry;
  };

  const getServices = (): ServiceRegistry => {
    if (!registry) {
      throw new Error(
        "Services not initialized. Call initializeServices() first.",
      );
    }
    return registry;
  };

  return {
    initializeServices: initializeServicesImpl,
    getServices,
  };
};
