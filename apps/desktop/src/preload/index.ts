import "#preload/preload.d";
import { createAtomitonRPC } from "#preload/api/factory";
import { createBridgeManager } from "#preload/bridge/manager";

console.log("[PRELOAD] Starting conductor preload script");
console.log("[PRELOAD] contextIsolated:", process.contextIsolated);

const api = createAtomitonRPC();
const bridgeManager = createBridgeManager();

bridgeManager.exposeAPI(api);

console.log("[PRELOAD] Conductor preload script completed");
