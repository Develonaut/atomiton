import { initializeServices } from "#main/services";
import { createConductor, registerHandlers } from "@atomiton/conductor/desktop";
import { createNodeService, type NodeService } from "#main/services/node";
import { safeLog } from "#main/utils/safeLogging";
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
  dispose(): void;
};

export const createServiceRegistryManager = (): ServiceRegistryManager => {
  let registry: ServiceRegistry | null = null;
  let isInitialized = false;

  const initializeServicesImpl = async (): Promise<ServiceRegistry> => {
    // Prevent double initialization
    if (isInitialized && registry) {
      safeLog("Services already initialized, returning existing registry");
      return registry;
    }

    safeLog("Initializing application services");

    const legacyServices = initializeServices();
    safeLog("Legacy application services initialized");

    const errorBoundary = createErrorBoundaryService();
    const nodeService = createNodeService(errorBoundary);
    const executionService = createExecutionService();
    const flowStorageService = createFlowStorageService();

    safeLog("Initializing Conductor handlers");
    const conductor = createConductor();
    const handlers = conductor.createMainHandlers();
    registerHandlers(ipcMain, handlers);
    safeLog("Conductor handlers initialized");

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

  const dispose = (): void => {
    if (registry) {
      safeLog("Disposing service registry...");

      // Clear the registry and reset initialization flag
      registry = null;
      isInitialized = false;

      safeLog("Service registry disposed successfully");
    }
  };

  return {
    initializeServices: initializeServicesImpl,
    getServices,
    dispose,
  };
};
