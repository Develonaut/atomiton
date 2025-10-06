import conductor, { DEFAULT_SLOWMO_MS } from "#lib/conductor";
import type { ProgressEvent } from "@atomiton/conductor/browser";
import { createExecutionId } from "@atomiton/conductor/browser";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ExecutionProgress } from "#templates/DebugPage/types";
import { createLogger } from "@atomiton/logger/browser";

const logger = createLogger({ scope: "FLOW_OPERATIONS" });

export function useFlowOperations() {
  const { addLog, clearLogs } = useDebugLogs();
  const [isExecuting, setIsExecuting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
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
    errorDelay: 0,
    simulateLongRunning: false,
    longRunningNode: "random" as string | "random",
    longRunningDelay: 5000,
  });

  const currentExecutionIdRef = useRef<string | null>(null);
  const completedNodesRef = useRef<Set<string>>(new Set());
  const executionTraceRef = useRef<unknown>(null);
  // Track last known executing node name to prevent flashing
  const lastExecutingNodeNameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentExecutionIdRef.current) {
        logger.info(
          "Page unloading - canceling execution:",
          currentExecutionIdRef.current,
        );
        conductor.node.cancel(currentExecutionIdRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (currentExecutionIdRef.current) {
        logger.info(
          "Component unmounting - canceling execution:",
          currentExecutionIdRef.current,
        );
        conductor.node.cancel(currentExecutionIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribeProgress = conductor.node.onProgress?.(
      (progressData: ProgressEvent) => {
        if (currentExecutionIdRef.current) {
          if (
            !progressData ||
            !progressData.nodes ||
            !Array.isArray(progressData.nodes)
          ) {
            logger.error(
              "Invalid progress data - missing or invalid nodes array:",
              progressData,
            );
            return;
          }

          const executingNode = progressData.nodes.find(
            (n) => n.state === "executing",
          );

          // Only update node name if there's a new executing node, preventing flash
          if (executingNode?.name) {
            lastExecutingNodeNameRef.current = executingNode.name;
          }

          setProgress((prev) => ({
            ...prev,
            graphProgress: progressData.progress,
            currentNodeName: lastExecutingNodeNameRef.current,
          }));
        }
      },
    );

    const unsubscribeComplete = conductor.node.onComplete((event) => {
      if (event.executionId !== currentExecutionIdRef.current) {
        return;
      }

      completedNodesRef.current.add(event.nodeId);
      const completedCount = completedNodesRef.current.size;

      setProgress((prev) => ({
        ...prev,
        currentNode: completedCount,
      }));

      addLog(`  ✅ Node completed: ${event.nodeId}`);
    });

    return () => {
      unsubscribeProgress?.();
      unsubscribeComplete?.();
    };
  }, [addLog]);

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

        const totalNodes = flow.nodes?.length || 0;
        completedNodesRef.current.clear();
        executionTraceRef.current = null;
        lastExecutingNodeNameRef.current = undefined;
        setProgress({
          currentNode: 0,
          totalNodes,
          currentNodeName: undefined,
          graphProgress: 0,
        });
        addLog(`📊 Flow has ${totalNodes} nodes to execute`);

        const executionId = createExecutionId(`flow_exec_${Date.now()}`);
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

        logger.debug("Debug options state:", debugOptions);
        logger.debug("Context options being passed:", contextOptions);

        const result = await conductor.node.run(flow, contextOptions);

        executionTraceRef.current = result.trace;

        if (result.success) {
          setProgress({
            currentNode: totalNodes,
            totalNodes,
            currentNodeName: undefined,
            graphProgress: 100,
          });
          addLog("🎉 Flow execution completed!");

          if (result.trace) {
            const executionDuration = Date.now() - executionStartTime;
            logger.info(
              `📊 Execution Trace: ${flow.name} (${executionDuration}ms)`,
              {
                config: { slowMo, totalNodes, executionId },
                trace: result.trace,
              },
            );
          }
        } else {
          addLog(`❌ Flow execution error: ${result.error?.message}`);
        }
      } catch (error) {
        addLog(`❌ Flow execution error: ${error}`);
        logger.error("Flow execution error:", error);
      } finally {
        setIsExecuting(false);
        currentExecutionIdRef.current = null;
      }
    },
    [addLog, slowMo, debugOptions],
  );

  const reset = useCallback(() => {
    logger.debug("Reset button clicked");
    setProgress({
      currentNode: 0,
      totalNodes: 0,
      currentNodeName: undefined,
      graphProgress: 0,
    });
    completedNodesRef.current.clear();
    executionTraceRef.current = null;
    lastExecutingNodeNameRef.current = undefined;
    currentExecutionIdRef.current = null;
    clearLogs();
    setResetKey((prev) => prev + 1);
    addLog("🔄 Reset execution state");
    logger.debug("Reset complete");
  }, [clearLogs, addLog]);

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
