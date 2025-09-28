import { ipcRenderer } from "electron";
import { CONDUCTOR_CHANNELS } from "#preload/channels";
import type { SystemAPI } from "#preload/types/api";

export function createSystemAPI(): SystemAPI {
  return {
    health: () => {
      console.log("[PRELOAD:IPC] System.health invoked");
      return ipcRenderer.invoke(CONDUCTOR_CHANNELS.SYSTEM_HEALTH);
    },
  };
}
