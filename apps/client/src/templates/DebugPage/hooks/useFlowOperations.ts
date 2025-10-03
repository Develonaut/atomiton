import conductor from "#lib/conductor";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useCallback, useEffect, useRef, useState } from "react";

type FlowTemplate = {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
};

type ExecutionProgress = {
  currentNode: number;
  totalNodes: number;
  currentNodeName?: string;
};

export function useFlowOperations(addLog: (message: string) => void) {
  const [availableFlows, setAvailableFlows] = useState<FlowTemplate[]>([]);
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
    const unsubscribe = conductor.events.onNodeComplete((event) => {
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

  // Load flow templates from backend
  const loadFlowTemplates = useCallback(async () => {
    try {
      addLog("📦 Loading flow templates...");
      const response = await conductor.flow.listTemplates();
      setAvailableFlows(response.templates);
      addLog(`✅ Loaded ${response.templates.length} flow templates`);
    } catch (error) {
      addLog(`❌ Error loading flow templates: ${error}`);
      console.error("Error loading flow templates:", error);
    }
  }, [addLog]);

  // Run selected flow
  const runFlow = useCallback(
    async (selectedFlowId: string | null) => {
      if (!selectedFlowId) {
        addLog("❌ No flow selected");
        return;
      }

      try {
        setIsExecuting(true);
        addLog(`🚀 Executing flow: ${selectedFlowId}`);

        // Get flow template
        const response = await conductor.flow.getTemplate(selectedFlowId);
        const flowDefinition = response.definition as NodeDefinition;

        // Initialize progress
        const totalNodes = flowDefinition.nodes?.length || 0;
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

        const result = await conductor.node.run(flowDefinition, {
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
    availableFlows,
    isExecuting,
    progress,
    loadFlowTemplates,
    runFlow,
  };
}
