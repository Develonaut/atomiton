import { FlowSelector } from "#templates/DebugPage/components/FlowSelector";
import { FlowActionButtons } from "#templates/DebugPage/components/FlowActionButtons";
import { FlowProgressBar } from "#templates/DebugPage/components/FlowProgressBar";
import { LogsSection } from "#templates/DebugPage/components/LogsSection";
import { ExecutionGraphViewer } from "#templates/DebugPage/components/ExecutionGraphViewer";
import { useTemplates } from "#store/useTemplates";
import { useFlowOperations } from "#templates/DebugPage/hooks/useFlowOperations";
import { useState } from "react";

export default function FlowsPage() {
  const { templates } = useTemplates();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const { isExecuting, progress, runFlow } = useFlowOperations();

  // Convert templates to flow list format
  const availableFlows = templates.map((template) => ({
    id: template.id,
    name: template.name || template.id,
    description: template.metadata.description,
    nodeCount: template.nodes?.length || 0,
  }));

  // Get the selected flow template
  const selectedFlow = templates.find((t) => t.id === selectedFlowId);

  const handleRunFlow = () => {
    runFlow(selectedFlow ?? null);
  };

  return (
    <div
      className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6"
      data-testid="flows-page"
    >
      {/* LEFT COLUMN: Flow Selection & Control */}
      <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h3 className="text-lg font-semibold mb-4">Flow Builder</h3>
          <FlowActionButtons
            selectedFlowId={selectedFlowId}
            isExecuting={isExecuting}
            onRun={handleRunFlow}
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

        {/* Execution Graph Viewer */}
        {selectedFlow && (
          <div className="bg-white rounded-lg shadow p-6">
            <ExecutionGraphViewer flow={selectedFlow} />
          </div>
        )}

        {/* Activity Logs */}
        <div className="flex-1 overflow-hidden">
          <LogsSection />
        </div>
      </div>
    </div>
  );
}
