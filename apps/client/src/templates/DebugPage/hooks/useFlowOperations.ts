import conductor, { DEFAULT_SLOWMO_MS } from "#lib/conductor";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ExecutionProgress } from "#templates/DebugPage/types";

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
  const [debugOptions, setDebugOptions] = useState({
    simulateError: false,
    errorType: "generic" as
      | "generic"
      | "timeout"
      | "network"
      | "validation"
      | "permission",
    errorNode: "random" as string | "random",
    errorDelay: 0, // 0 = immediate, >0 = delayed (simulates mid-execution failure)
    simulateLongRunning: false,
    longRunningNode: "random" as string | "random",
    longRunningDelay: 5000,
  });

  // Track current execution ID to filter events
  const currentExecutionIdRef = useRef<string | null>(null);

  // Track completed nodes for progress
  const completedNodesRef = useRef<Set<string>>(new Set());

  // Track execution trace from result (server-side trace)
  const executionTraceRef = useRef<unknown>(null);

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

  // Subscribe to node events for progress updates
  useEffect(() => {
    const unsubscribeProgress = conductor.node.onProgress?.((event) => {
      if (currentExecutionIdRef.current) {
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

    return () => {
      unsubscribeProgress?.();
      unsubscribeComplete?.();
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
        addLog(
          `⚙️  Execution options: slowMo=${slowMo}ms, debug=${JSON.stringify(debugOptions)}`,
        );

        // Initialize progress
        const totalNodes = flow.nodes?.length || 0;
        completedNodesRef.current.clear();
        executionTraceRef.current = null; // Clear previous trace
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

        const contextOptions = {
          executionId,
          slowMo,
          ...((debugOptions.simulateError ||
            debugOptions.simulateLongRunning) && {
            debug: {
              ...(debugOptions.simulateError && {
                simulateError: {
                  nodeId: debugOptions.errorNode,
                  errorType: debugOptions.errorType,
                  ...(debugOptions.errorDelay > 0 && {
                    delayMs: debugOptions.errorDelay,
                  }),
                },
              }),
              ...(debugOptions.simulateLongRunning && {
                simulateLongRunning: {
                  nodeId: debugOptions.longRunningNode,
                  delayMs: debugOptions.longRunningDelay,
                },
              }),
            },
          }),
        };

        console.log("[DEBUG] Debug options state:", debugOptions);
        console.log("[DEBUG] Context options being passed:", contextOptions);

        const result = await conductor.node.run(flow, contextOptions);

        // Store trace from result (server-side trace)
        executionTraceRef.current = result.trace;

        // Check result and update final state
        if (result.success) {
          setProgress({
            currentNode: totalNodes,
            totalNodes,
            currentNodeName: undefined,
            graphProgress: 100,
          });
          addLog("🎉 Flow execution completed!");

          // Output execution trace to console
          if (result.trace) {
            const executionDuration = Date.now() - executionStartTime;
            console.group(
              `📊 Execution Trace: ${flow.name} (${executionDuration}ms)`,
            );
            console.log("⚙️ Config:", { slowMo, totalNodes, executionId });
            console.log("📈 Trace:", result.trace);
            console.groupEnd();
          }
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
    [addLog, slowMo, debugOptions],
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
    executionTraceRef.current = null;
    currentExecutionIdRef.current = null;
    clearLogs();
    setResetKey((prev) => prev + 1); // Increment to force remount
    addLog("🔄 Reset execution state");
    console.log("[DEBUG] Reset complete");
  }, [clearLogs, addLog]);

  // Get current trace from server result
  const getTrace = useCallback(() => {
    return executionTraceRef.current;
  }, []);

  return {
    isExecuting,
    progress,
    runFlow,
    reset,
    resetKey,
    slowMo,
    setSlowMo,
    debugOptions,
    setDebugOptions,
    getTrace,
  };
}
