import conductor from "#lib/conductor";
import type {
  FlowSavedEvent,
  NodeCompleteEvent,
  NodeErrorEvent,
  NodeProgressEvent,
} from "@atomiton/conductor/browser";
import { createStore } from "@atomiton/store";

export type DebugLog = {
  timestamp: string;
  message: string;
  metadata?: Record<string, unknown>;
};

type DebugState = {
  logs: DebugLog[];
  activeSection: string;
  selectedFlow: string | null;
};

type DebugActions = {
  addLog: (message: string, metadata?: Record<string, unknown>) => void;
  clearLogs: () => void;
  setActiveSection: (section: string) => void;
  setSelectedFlow: (flowId: string | null) => void;
};

const debugStore = createStore<DebugState & DebugActions>(
  () => ({
    logs: [],
    activeSection: "environment",
    selectedFlow: null,

    addLog: (message: string, metadata?: Record<string, unknown>) => {
      const timestamp = new Date().toLocaleTimeString();
      debugStore.setState((state) => {
        // Skip if this is the exact same message as the last one
        const lastLog = state.logs[state.logs.length - 1];
        if (lastLog && lastLog.message === message) {
          return state;
        }

        return {
          ...state,
          logs: [...state.logs, { timestamp, message, metadata }],
        };
      });
    },

    clearLogs: () => {
      debugStore.setState((state) => ({ ...state, logs: [] }));
    },

    setActiveSection: (section: string) => {
      debugStore.setState((state) => ({ ...state, activeSection: section }));
    },

    setSelectedFlow: (flowId: string | null) => {
      debugStore.setState((state) => ({ ...state, selectedFlow: flowId }));
    },
  }),
  {
    name: "debug-store",
  },
);

export const useDebugStore = debugStore.useStore;

// Setup conductor event subscriptions outside React lifecycle
// This runs once when the module is imported
const setupConductorSubscriptions = () => {
  const addLog = debugStore.getState().addLog;

  const subscriptions = [
    conductor.node?.onProgress?.((event: NodeProgressEvent) => {
      // Find the current executing node
      const executingNode = event.nodes.find((n) => n.state === "executing");

      // Skip generic "Waiting to start..." messages - they're noise
      if (event.message === "Waiting to start...") return;

      // Only log if we have a meaningful message or an executing node
      if (!event.message && !executingNode) return;

      const nodeIndex = executingNode
        ? event.nodes.findIndex((n) => n.id === executingNode.id) + 1
        : 0;
      const nodeInfo =
        nodeIndex > 0 ? `[Node ${nodeIndex}/${event.nodes.length}] ` : "";
      addLog(`📊 ${nodeInfo}${event.progress}% - ${event.message || ""}`);
    }),

    conductor.node?.onComplete?.((event: NodeCompleteEvent) => {
      addLog(`✅ Node complete: ${event.nodeId}`);
    }),

    conductor.node?.onError?.((event: NodeErrorEvent) => {
      addLog(`❌ Node error: ${event.error}`);
    }),

    conductor.storage?.onFlowSaved?.((event: FlowSavedEvent) => {
      addLog(`💾 Flow saved: ${event.flowId}`);
    }),

    conductor.auth?.onAuthExpired?.(() => {
      addLog("🔒 Auth token expired");
    }),
  ].filter(Boolean);

  return () => {
    subscriptions.forEach((unsub) => unsub?.());
  };
};

// Initialize subscriptions when module loads
const cleanupSubscriptions = setupConductorSubscriptions();

// Cleanup on module unload (HMR support)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanupSubscriptions();
  });
}
