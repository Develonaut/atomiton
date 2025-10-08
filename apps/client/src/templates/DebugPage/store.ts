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
      const now = new Date();
      const timestamp = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, "0")}`;
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

  // Track executions to log start message only once per execution
  const executionStarted = new Map<string, boolean>();

  const subscriptions = [
    conductor.node?.onProgress?.((event: NodeProgressEvent) => {
      // Find the current executing node
      const executingNode = event.nodes.find((n) => n.state === "executing");

      // Track execution for cleanup purposes
      if (!executionStarted.get(event.executionId)) {
        executionStarted.set(event.executionId, true);
      }

      // Skip generic "Waiting to start..." messages - they're noise
      if (event.message === "Waiting to start...") return;

      // Skip completion-related messages - we have a dedicated onComplete handler
      if (
        event.message?.toLowerCase().includes("completed") ||
        event.message?.toLowerCase().includes("finished")
      ) {
        return;
      }

      // Only log progress if we have a meaningful message or an executing node
      if (!event.message && !executingNode) return;

      // Calculate node position (current/total)
      const completedCount = event.nodes.filter(
        (n) => n.state === "completed",
      ).length;
      const currentNodeIndex = completedCount + 1; // +1 because we're executing the next one
      const totalNodes = event.nodes.length;
      const nodePosition = `[${currentNodeIndex}/${totalNodes}]`;

      // Extract node name from message (remove "Executing: " prefix)
      const nodeName =
        event.message?.replace(/^(Executing|Creating|Running):\s*/, "") || "";

      // Format overall graph progress
      const graphProgress = `${event.progress}%`;

      // Get state indicator with text
      const state = executingNode?.state || "pending";
      const stateText =
        state === "executing"
          ? "Running"
          : state === "completed"
            ? "Completed"
            : state === "error"
              ? "Error"
              : "Pending";

      addLog(`${nodePosition} ${graphProgress} - ${stateText} ${nodeName}`);
    }),

    conductor.node?.onComplete?.((event: NodeCompleteEvent) => {
      // Clean up execution tracking
      executionStarted.delete(event.executionId);

      // Only log completion message
      addLog(`🎉 Execution completed!`);
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
