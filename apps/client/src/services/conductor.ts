import { createConductor } from "@atomiton/conductor/browser";
import { createBrowserLogger } from "@atomiton/logger/browser";

const logger = createBrowserLogger({ namespace: "conductor:client" });

let conductorInstance: ReturnType<typeof createConductor> | null = null;

export function getConductor() {
  if (!conductorInstance) {
    logger.info("Creating new conductor instance");
    conductorInstance = createConductor();
    logger.info("Conductor instance created and ready");
  }
  return conductorInstance;
}
