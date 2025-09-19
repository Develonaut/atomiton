import type { EventBus, IPCBridge } from "../../types";

function setupAutoForwarding<T extends Record<string, unknown>>(
  bus: EventBus<T>,
  ipc: IPCBridge,
  domain: string,
  eventsToForward: string[],
): void {
  eventsToForward.forEach((eventType) => {
    const eventName = `${domain}:${String(eventType)}`;
    const originalEmit = bus.emit.bind(bus);
    const busWithEmit = bus as EventBus<T> & {
      emit: <K extends keyof T>(event: K, data: T[K]) => void;
    };

    busWithEmit.emit = function emit<K extends keyof T>(event: K, data: T[K]) {
      originalEmit(event, data);
      ipc.send(eventName, data);
    };
    ipc.on(eventName, (ipcEvent) => {
      const temp = busWithEmit.emit;
      busWithEmit.emit = originalEmit;
      bus.emit(eventType as keyof T, ipcEvent.data as T[keyof T]);
      busWithEmit.emit = temp;
    });
  });
}

export default setupAutoForwarding;
