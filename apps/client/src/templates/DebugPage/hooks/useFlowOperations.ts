import { useState, useCallback } from "react";
import conductor from "#lib/conductor";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

type FlowDefinition = {
  id?: string;
  nodes: NodeDefinition[];
  version?: string;
  savedAt?: string;
  deleted?: boolean;
};

export function useFlowOperations(
  addLog: (message: string) => void,
  selectedFlow: string | null,
  setSelectedFlow: (id: string | null) => void,
) {
  const [availableFlows, setAvailableFlows] = useState<FlowDefinition[]>([]);
  const [flowContent, setFlowContent] = useState<string>("");

  const loadFlows = useCallback(async () => {
    try {
      addLog("Loading flows...");
      const response = await conductor.storage.listFlows();
      const flows = response.flows || [];
      setAvailableFlows(
        flows.map((flow) => ({
          id: flow.id,
          nodes: [],
          version: "1.0.0",
        })),
      );
      addLog(`Found ${flows.length} flows`);
    } catch (error) {
      addLog(`Error loading flows: ${error}`);
      console.error("Error loading flows:", error);
    }
  }, [addLog]);

  const saveFlow = useCallback(async () => {
    try {
      const flowData: FlowDefinition = {
        id: selectedFlow || `flow_${Date.now()}`,
        nodes: [],
        version: "1.0.0",
        savedAt: new Date().toISOString(),
      };

      addLog(`Saving flow: ${flowData.id}`);
      await conductor.storage.saveFlow(flowData);
      addLog("Flow saved successfully");
      await loadFlows();
    } catch (error) {
      addLog(`Error saving flow: ${error}`);
      console.error("Error saving flow:", error);
    }
  }, [selectedFlow, addLog, loadFlows]);

  const deleteFlow = useCallback(async () => {
    if (!selectedFlow) {
      addLog("No flow selected for deletion");
      return;
    }

    try {
      addLog(`Deleting flow: ${selectedFlow}`);
      await conductor.storage.deleteFlow(selectedFlow);
      addLog("Flow deleted successfully");
      setSelectedFlow(null);
      setFlowContent("");
      await loadFlows();
    } catch (error) {
      addLog(`Error deleting flow: ${error}`);
      console.error("Error deleting flow:", error);
    }
  }, [selectedFlow, addLog, setSelectedFlow, loadFlows]);

  const loadSelectedFlow = useCallback(async () => {
    if (!selectedFlow) {
      addLog("No flow selected");
      return;
    }

    try {
      addLog(`Loading flow: ${selectedFlow}`);
      const flow = await conductor.storage.loadFlow(selectedFlow);
      setFlowContent(JSON.stringify(flow, null, 2));
      addLog(`Flow loaded: ${flow.id}`);
    } catch (error) {
      addLog(`Error loading flow: ${error}`);
      console.error("Error loading flow:", error);
    }
  }, [selectedFlow, addLog]);

  return {
    availableFlows,
    flowContent,
    loadFlows,
    saveFlow,
    deleteFlow,
    loadSelectedFlow,
  };
}
