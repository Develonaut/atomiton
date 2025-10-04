import conductor, { DEFAULT_SLOWMO_MS } from "#lib/conductor";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ExecutionProgress,
  ExecutionTraceEvent,
} from "#templates/DebugPage/types";

export function useFlowOperations() {
  const { addLog, clearLogs } = useDebugLogs();
  const [isExecuting, setIsExecuting] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Used to force remount of components
  const [progress, setProgress] = useState<ExecutionProgress>({
    currentNode: 0,
    totalNodes: 0,
    graphProgress: 0,
  });
  const [slowMo, setSlowMo] = useState(DEFAULT_SLOWMO_MS);

  // Track current execution ID to filter events
  const currentExecutionIdRef = useRef<string | null>(null);

  // Track completed nodes for progress
  const completedNodesRef = useRef<Set<string>>(new Set());

  // Track execution trace
  const executionTraceRef = useRef<ExecutionTraceEvent[]>([]);

  // Cancel execution on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentExecutionIdRef.current) {
        console.log(
          "[CLEANUP] Page unloading - canceling execution:",
          currentExecutionIdRef.current,
        );
        conductor.node.cancel(currentExecutionIdRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also cancel on component unmount
      if (currentExecutionIdRef.current) {
        console.log(
          "[CLEANUP] Component unmounting - canceling execution:",
          currentExecutionIdRef.current,
        );
        conductor.node.cancel(currentExecutionIdRef.current);
      }
    };
  }, []);

  // Subscribe to node events and capture trace
  useEffect(() => {
    const unsubscribeProgress = conductor.node.onProgress?.((event) => {
      if (currentExecutionIdRef.current) {
        executionTraceRef.current.push({
          timestamp: Date.now(),
          type: "progress",
          data: {
            progress: event.progress,
            message: event.message,
            nodes: event.nodes.map((n) => ({
              id: n.id,
              name: n.name,
              state: n.state,
            })),
          },
        });

        // Update progress bar with graph progress
        const executingNode = event.nodes.find((n) => n.state === "executing");
        setProgress((prev) => ({
          ...prev,
          graphProgress: event.progress,
          currentNodeName: executingNode?.name,
        }));
      }
    });

    const unsubscribeComplete = conductor.node.onComplete((event) => {
      // Only process events for the current execution
      if (event.executionId !== currentExecutionIdRef.current) {
        return;
      }

      // Track in trace
      executionTraceRef.current.push({
        timestamp: Date.now(),
        type: "complete",
        data: { nodeId: event.nodeId, executionId: event.executionId },
      });

      // Track this node as completed
      completedNodesRef.current.add(event.nodeId);
      const completedCount = completedNodesRef.current.size;

      // Update progress
      setProgress((prev) => ({
        ...prev,
        currentNode: completedCount,
      }));

      // Log completion
      addLog(`  ✅ Node completed: ${event.nodeId}`);
    });

    const unsubscribeError = conductor.node.onError?.((event) => {
      if (currentExecutionIdRef.current) {
        executionTraceRef.current.push({
          timestamp: Date.now(),
          type: "error",
          data: { error: event.error, nodeId: event.nodeId },
        });
      }
    });

    return () => {
      unsubscribeProgress?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
    };
  }, [addLog]);

  // Run a flow
  const runFlow = useCallback(
    async (flow: NodeDefinition | null) => {
      if (!flow) {
        addLog("❌ No flow selected");
        return;
      }

      try {
        setIsExecuting(true);
        const executionStartTime = Date.now();

        addLog(`🚀 Executing flow: ${flow.name}`);
        addLog(`⚙️  Execution options: slowMo=${slowMo}ms`);

        // Initialize progress
        const totalNodes = flow.nodes?.length || 0;
        completedNodesRef.current.clear();
        executionTraceRef.current = []; // Clear previous trace
        setProgress({
          currentNode: 0,
          totalNodes,
          currentNodeName: undefined,
          graphProgress: 0,
        });
        addLog(`📊 Flow has ${totalNodes} nodes to execute`);

        // Generate execution ID and set it for event filtering
        const executionId = `flow_exec_${Date.now()}`;
        currentExecutionIdRef.current = executionId;

        // Add trace start event
        executionTraceRef.current.push({
          timestamp: Date.now(),
          type: "started",
          data: {
            executionId,
            flowName: flow.name,
            totalNodes,
            slowMo,
            startTime: executionStartTime,
          },
        });

        const result = await conductor.node.run(flow, {
          executionId,
          slowMo,
        });

        // Check result and update final state
        if (result.success) {
          setProgress({
            currentNode: totalNodes,
            totalNodes,
            currentNodeName: undefined,
            graphProgress: 100,
          });
          addLog("🎉 Flow execution completed!");

          // Output execution trace
          const executionDuration = Date.now() - executionStartTime;
          console.group(
            `📊 Execution Trace: ${flow.name} (${executionDuration}ms)`,
          );
          console.log("⚙️ Config:", { slowMo, totalNodes, executionId });
          console.log("📈 Events:", executionTraceRef.current);
          console.table(
            executionTraceRef.current
              .filter(
                (e): e is Extract<ExecutionTraceEvent, { type: "progress" }> =>
                  e.type === "progress",
              )
              .map((e) => ({
                time: new Date(e.timestamp).toLocaleTimeString(),
                progress: e.data.progress,
                message: e.data.message,
                executing: e.data.nodes
                  .filter((n) => n.state === "executing")
                  .map((n) => n.name)
                  .join(", "),
              })),
          );
          console.groupEnd();

          // Also add to logs for easy copy
          addLog(
            `📊 Trace: ${JSON.stringify(executionTraceRef.current, null, 2)}`,
          );
        } else {
          addLog(`❌ Flow execution error: ${result.error?.message}`);
        }
      } catch (error) {
        addLog(`❌ Flow execution error: ${error}`);
        console.error("Flow execution error:", error);
      } finally {
        setIsExecuting(false);
        currentExecutionIdRef.current = null;
      }
    },
    [addLog, slowMo],
  );

  // Reset all execution state
  const reset = useCallback(() => {
    console.log("[DEBUG] Reset button clicked");
    setProgress({
      currentNode: 0,
      totalNodes: 0,
      currentNodeName: undefined,
      graphProgress: 0,
    });
    completedNodesRef.current.clear();
    executionTraceRef.current = [];
    currentExecutionIdRef.current = null;
    clearLogs();
    setResetKey((prev) => prev + 1); // Increment to force remount
    addLog("🔄 Reset execution state");
    console.log("[DEBUG] Reset complete");
  }, [clearLogs, addLog]);

  return {
    isExecuting,
    progress,
    runFlow,
    reset,
    resetKey,
    slowMo,
    setSlowMo,
  };
}
