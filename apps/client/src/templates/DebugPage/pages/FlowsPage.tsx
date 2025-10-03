import { FlowSelector } from "#templates/DebugPage/components/FlowSelector";
import { FlowActionButtons } from "#templates/DebugPage/components/FlowActionButtons";
import { FlowProgressBar } from "#templates/DebugPage/components/FlowProgressBar";
import { LogsSection } from "#templates/DebugPage/components/LogsSection";
import { useDebugStore } from "#templates/DebugPage/store";
import { useState, useEffect } from "react";

export default function FlowsPage() {
  const selectedFlowId = useDebugStore((state) => state.selectedFlow);
  const setSelectedFlowId = useDebugStore((state) => state.setSelectedFlow);

  const [availableFlows] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
      nodeCount?: number;
    }>
  >([]);
  const [isExecuting] = useState(false);
  const [progress] = useState({
    currentNode: 0,
    totalNodes: 0,
    currentNodeName: undefined as string | undefined,
  });

  // TODO: Load flow templates from conductor.flowTemplates.listTemplates()
  useEffect(() => {
    // loadFlowTemplates();
  }, []);

  const executeFlow = () => {
    // TODO: Implement flow execution
    console.log("Execute flow:", selectedFlowId);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT COLUMN: Flow Selection & Control */}
      <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h3 className="text-lg font-semibold mb-4">Flow Builder</h3>
          <FlowActionButtons
            selectedFlowId={selectedFlowId}
            isExecuting={isExecuting}
            onRun={executeFlow}
          />
        </div>

        {/* Scrollable Flow List */}
        <div className="flex-1 overflow-y-auto p-6">
          <FlowSelector
            flows={availableFlows}
            selectedFlowId={selectedFlowId}
            onSelectFlow={setSelectedFlowId}
            disabled={isExecuting}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Execution Monitor */}
      <div className="flex flex-col gap-6 h-full">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <FlowProgressBar
            currentNode={progress.currentNode}
            totalNodes={progress.totalNodes}
            currentNodeName={progress.currentNodeName}
            isExecuting={isExecuting}
          />
        </div>

        {/* Activity Logs */}
        <div className="flex-1 overflow-hidden">
          <LogsSection />
        </div>
      </div>
    </div>
  );
}
