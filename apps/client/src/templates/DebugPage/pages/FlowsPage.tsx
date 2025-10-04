import { FlowSelector } from "#templates/DebugPage/components/FlowSelector";
import { FlowActionButtons } from "#templates/DebugPage/components/FlowActionButtons";
import { FlowProgressBar } from "#templates/DebugPage/components/FlowProgressBar";
import { LogsSection } from "#templates/DebugPage/components/LogsSection";
import { ExecutionGraphViewer } from "#templates/DebugPage/components/ExecutionGraphViewer";
import { useTemplates } from "#store/useTemplates";
import { useFlowOperations } from "#templates/DebugPage/hooks/useFlowOperations";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { useState, useEffect } from "react";

export default function FlowsPage() {
  const { templates } = useTemplates();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const { isExecuting, progress, runFlow, reset, resetKey, slowMo, setSlowMo } =
    useFlowOperations();

  const { clearLogs } = useDebugLogs();

  // Clear logs when flow selection changes
  useEffect(() => {
    clearLogs();
  }, [selectedFlowId, clearLogs]);

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

          {/* Slow-Mo Control */}
          <div className="mb-4">
            <label
              htmlFor="slow-mo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Slow-Mo
            </label>
            <select
              id="slow-mo"
              value={slowMo}
              onChange={(e) => setSlowMo(Number(e.target.value))}
              disabled={isExecuting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={0}>Instant (no delays)</option>
              <option value={50}>Quick (100ms per node)</option>
              <option value={125}>Normal (250ms per node)</option>
              <option value={250}>Medium (500ms per node)</option>
              <option value={500}>Slow (1s per node)</option>
              <option value={1000}>Slower (2s per node)</option>
              <option value={2500}>Very Slow (5s per node)</option>
              <option value={7500}>Super Slow (15s per node)</option>
            </select>
          </div>

          <FlowActionButtons
            selectedFlowId={selectedFlowId}
            isExecuting={isExecuting}
            onRun={handleRunFlow}
            onReset={reset}
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
            graphProgress={progress.graphProgress}
          />
        </div>

        {/* Execution Graph Viewer */}
        {selectedFlow && (
          <div className="bg-white rounded-lg shadow p-6">
            <ExecutionGraphViewer
              key={`${selectedFlow.id}-${resetKey}`}
              flow={selectedFlow}
            />
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
