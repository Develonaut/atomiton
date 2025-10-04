import conductor from "#lib/conductor";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useCallback, useEffect, useRef, useState } from "react";

type ExecutionProgress = {
  currentNode: number;
  totalNodes: number;
  currentNodeName?: string;
};

export function useFlowOperations() {
  const { addLog } = useDebugLogs();
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState<ExecutionProgress>({
    currentNode: 0,
    totalNodes: 0,
  });

  // Track current execution ID to filter events
  const currentExecutionIdRef = useRef<string | null>(null);

  // Track completed nodes for progress
  const completedNodesRef = useRef<Set<string>>(new Set());

  // Subscribe to node completion events
  useEffect(() => {
    const unsubscribe = conductor.node.onComplete((event) => {
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

    return unsubscribe;
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
        addLog(`🚀 Executing flow: ${flow.name}`);

        // Initialize progress
        const totalNodes = flow.nodes?.length || 0;
        completedNodesRef.current.clear();
        setProgress({
          currentNode: 0,
          totalNodes,
          currentNodeName: undefined,
        });
        addLog(`📊 Flow has ${totalNodes} nodes to execute`);

        // Generate execution ID and set it for event filtering
        const executionId = `flow_exec_${Date.now()}`;
        currentExecutionIdRef.current = executionId;

        const result = await conductor.node.run(flow, {
          executionId,
        });

        // Check result and update final state
        if (result.success) {
          setProgress({
            currentNode: totalNodes,
            totalNodes,
            currentNodeName: undefined,
          });
          addLog("🎉 Flow execution completed!");
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
    [addLog],
  );

  return {
    isExecuting,
    progress,
    runFlow,
  };
}
