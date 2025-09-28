import { ipcRenderer } from "electron";
import { CONDUCTOR_CHANNELS } from "#preload/channels";
import type { NodeAPI, NodeExecutionPayload } from "#preload/types/api";

export function createNodeAPI(): NodeAPI {
  return {
    run: (payload: NodeExecutionPayload) => {
      console.log("[PRELOAD:IPC] Node.run invoked", {
        nodeId: payload.node?.id,
        nodeType: payload.node?.type,
      });
      return ipcRenderer.invoke(CONDUCTOR_CHANNELS.NODE_RUN, payload);
    },
  };
}
