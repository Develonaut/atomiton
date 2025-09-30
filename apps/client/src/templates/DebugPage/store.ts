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
};

type DebugState = {
  logs: DebugLog[];
  activeSection: string;
  selectedFlow: string | null;
};

type DebugActions = {
  addLog: (message: string) => void;
  clearLogs: () => void;
  setActiveSection: (section: string) => void;
  setSelectedFlow: (flowId: string | null) => void;
};

const debugStore = createStore<DebugState & DebugActions>(
  () => ({
    logs: [],
    activeSection: "environment",
    selectedFlow: null,

    addLog: (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      debugStore.setState((state) => ({
        ...state,
        logs: [...state.logs, { timestamp, message }],
      }));
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
    conductor.events?.onNodeProgress?.((event: NodeProgressEvent) => {
      addLog(`📊 Node progress: ${event.progress}% - ${event.message || ""}`);
    }),

    conductor.events?.onNodeComplete?.((event: NodeCompleteEvent) => {
      addLog(`✅ Node complete: ${event.nodeId}`);
    }),

    conductor.events?.onNodeError?.((event: NodeErrorEvent) => {
      addLog(`❌ Node error: ${event.error}`);
    }),

    conductor.events?.onFlowSaved?.((event: FlowSavedEvent) => {
      addLog(`💾 Flow saved: ${event.flowId}`);
    }),

    conductor.events?.onAuthExpired?.(() => {
      addLog("🔒 Auth token expired");
    }),
  ].filter(Boolean);

  console.log("[DEBUG_STORE] Conductor event subscriptions initialized");

  return () => {
    subscriptions.forEach((unsub) => unsub?.());
    console.log("[DEBUG_STORE] Conductor event subscriptions cleaned up");
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
