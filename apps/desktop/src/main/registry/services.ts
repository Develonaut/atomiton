import { initializeServices } from "#main/services";
import {
  createErrorBoundaryService,
  type ErrorBoundaryService,
} from "#main/services/errorBoundary";
import {
  createExecutionService,
  type ExecutionService,
} from "#main/services/execution";
import {
  createFlowStorageService,
  type FlowStorageService,
} from "#main/services/flowStorage";
import { createNodeService, type NodeService } from "#main/services/node";
import { createLogger } from "@atomiton/logger/desktop";

const logger = createLogger({ scope: "SERVICE_REGISTRY" });

export type ServiceRegistry = {
  storage: ReturnType<typeof initializeServices>["storage"];
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
      logger.info("Services already initialized, returning existing registry");
      return registry;
    }

    logger.info("Initializing application services");

    const legacyServices = initializeServices();
    logger.info("Legacy application services initialized");

    const errorBoundary = createErrorBoundaryService();
    const nodeService = createNodeService(errorBoundary);
    const executionService = createExecutionService();
    const flowStorageService = createFlowStorageService();

    logger.info(
      "Application services initialized (IPC handled by channel manager)",
    );

    registry = {
      storage: legacyServices.storage,
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
      logger.info("Disposing service registry...");

      // Clear the registry and reset initialization flag
      registry = null;
      isInitialized = false;

      logger.info("Service registry disposed successfully");
    }
  };

  return {
    initializeServices: initializeServicesImpl,
    getServices,
    dispose,
  };
};
