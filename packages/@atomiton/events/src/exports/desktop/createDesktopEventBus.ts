import { createIPCBridge } from "../../ipc";
import type { EventBus, IPCBridge } from "../../types";
import createLocalEventBus from "./createLocalEventBus";

function createDesktopEventBus<T extends Record<string, unknown>>(
  domain: string,
): EventBus<T> & { ipc: IPCBridge } {
  const bus = createLocalEventBus<T>(domain);
  const ipc = createIPCBridge();
  return Object.assign(bus, { ipc });
}

export default createDesktopEventBus;
