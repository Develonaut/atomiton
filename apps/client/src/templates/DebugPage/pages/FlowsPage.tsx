import { useFlowOperations } from "#templates/DebugPage/hooks/useFlowOperations";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { useDebugStore } from "#templates/DebugPage/store";
import { Button, Icon } from "@atomiton/ui";
import { useEffect } from "react";

export default function FlowsPage() {
  const { addLog } = useDebugLogs();
  const selectedFlow = useDebugStore((state) => state.selectedFlow);
  const setSelectedFlow = useDebugStore((state) => state.setSelectedFlow);

  const {
    availableFlows,
    flowContent,
    loadFlows,
    saveFlow,
    deleteFlow,
    loadSelectedFlow,
  } = useFlowOperations(addLog, selectedFlow, setSelectedFlow);

  // Load initial data
  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  return (
    <div className="bg-white rounded-lg p-6 shadow mb-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={loadFlows}>
            <Icon name="refresh" className="w-4 h-4 mr-2" />
            Refresh Flows
          </Button>
          <Button onClick={saveFlow}>
            <Icon name="save" className="w-4 h-4 mr-2" />
            Save Flow
          </Button>
          <Button onClick={deleteFlow} variant="destructive">
            <Icon name="trash" className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Available Flows:</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={selectedFlow || ""}
            onChange={(e) => setSelectedFlow(e.target.value || null)}
          >
            <option value="">Select a flow...</option>
            {availableFlows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.id}
              </option>
            ))}
          </select>
        </div>

        {selectedFlow && (
          <div className="space-y-2">
            <Button onClick={loadSelectedFlow}>
              <Icon name="download" className="w-4 h-4 mr-2" />
              Load Flow Content
            </Button>
            {flowContent && (
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                {flowContent}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
