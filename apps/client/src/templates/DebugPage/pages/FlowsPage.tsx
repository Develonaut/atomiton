import { useTemplates } from "#store/useTemplates";
import { ExecutionGraphViewer } from "#templates/DebugPage/components/ExecutionGraphViewer";
import { FlowActionButtons } from "#templates/DebugPage/components/FlowActionButtons";
import { FlowProgressBar } from "#templates/DebugPage/components/FlowProgressBar";
import { FlowSelector } from "#templates/DebugPage/components/FlowSelector";
import { LogsSection } from "#templates/DebugPage/components/LogsSection";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { useFlowOperations } from "#templates/DebugPage/hooks/useFlowOperations";
import { useEffect, useState } from "react";

export default function FlowsPage() {
  const { templates } = useTemplates();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const {
    isExecuting,
    progress,
    runFlow,
    reset,
    resetKey,
    slowMo,
    setSlowMo,
    debugOptions,
    setDebugOptions,
  } = useFlowOperations();

  const { clearLogs } = useDebugLogs();

  // Convert templates to flow list format
  const availableFlows = templates.map((template) => ({
    id: template.id,
    name: template.name || template.id,
    description: template.metadata.description,
    nodeCount: template.nodes?.length || 0,
  }));

  // Auto-select first flow on mount
  useEffect(() => {
    if (availableFlows.length > 0 && !selectedFlowId) {
      setSelectedFlowId(availableFlows[0].id);
    }
  }, [availableFlows, selectedFlowId]);

  // Clear logs when flow selection changes
  useEffect(() => {
    clearLogs();
  }, [selectedFlowId, clearLogs]);

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

          {/* Debug Controls */}
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-semibold text-yellow-800 mb-3">
              Debug Options
            </h4>

            {/* Slow-Mo Control */}
            <div className="mb-3">
              <label
                htmlFor="slow-mo"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Slow-Mo
              </label>
              <select
                id="slow-mo"
                value={slowMo}
                onChange={(e) => setSlowMo(Number(e.target.value))}
                disabled={isExecuting}
                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

            {/* Simulate Error */}
            <div className="mb-3">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={debugOptions.simulateError}
                  onChange={(e) =>
                    setDebugOptions({
                      ...debugOptions,
                      simulateError: e.target.checked,
                    })
                  }
                  disabled={isExecuting}
                  className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="simulate-error-checkbox"
                />
                <span className="text-xs font-medium text-gray-700">
                  Simulate Error
                </span>
              </label>

              {debugOptions.simulateError && (
                <div className="ml-6 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Error Type
                    </label>
                    <select
                      value={debugOptions.errorType}
                      onChange={(e) =>
                        setDebugOptions({
                          ...debugOptions,
                          errorType: e.target.value as
                            | "generic"
                            | "timeout"
                            | "network"
                            | "validation"
                            | "permission",
                        })
                      }
                      disabled={isExecuting}
                      className="block w-full px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                    >
                      <option value="generic">Generic Error</option>
                      <option value="timeout">Timeout</option>
                      <option value="network">Network Error</option>
                      <option value="validation">Validation Error</option>
                      <option value="permission">Permission Denied</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Node
                    </label>
                    <select
                      value={debugOptions.errorNode}
                      onChange={(e) =>
                        setDebugOptions({
                          ...debugOptions,
                          errorNode: e.target.value,
                        })
                      }
                      disabled={isExecuting}
                      className="block w-full px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                    >
                      <option value="random">Random Node</option>
                      {selectedFlow?.nodes?.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.name || node.type} ({node.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Error Delay (simulates mid-execution failure)
                    </label>
                    <select
                      value={debugOptions.errorDelay}
                      onChange={(e) =>
                        setDebugOptions({
                          ...debugOptions,
                          errorDelay: Number(e.target.value),
                        })
                      }
                      disabled={isExecuting}
                      className="block w-full px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                    >
                      <option value={0}>Immediate (fails instantly)</option>
                      <option value={100}>100ms (quick failure)</option>
                      <option value={200}>200ms (mid-execution)</option>
                      <option value={500}>500ms (half second)</option>
                      <option value={1000}>1 second</option>
                      <option value={2000}>2 seconds</option>
                      <option value={5000}>5 seconds</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Simulate Long-Running Node */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={debugOptions.simulateLongRunning}
                  onChange={(e) =>
                    setDebugOptions({
                      ...debugOptions,
                      simulateLongRunning: e.target.checked,
                    })
                  }
                  disabled={isExecuting}
                  className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="simulate-long-running-checkbox"
                />
                <span className="text-xs font-medium text-gray-700">
                  Simulate Long-Running Node
                </span>
              </label>

              {debugOptions.simulateLongRunning && (
                <div className="ml-6 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Delay (ms)
                    </label>
                    <select
                      value={debugOptions.longRunningDelay}
                      onChange={(e) =>
                        setDebugOptions({
                          ...debugOptions,
                          longRunningDelay: Number(e.target.value),
                        })
                      }
                      disabled={isExecuting}
                      className="block w-full px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                    >
                      <option value={1000}>1 second</option>
                      <option value={3000}>3 seconds</option>
                      <option value={5000}>5 seconds</option>
                      <option value={10000}>10 seconds</option>
                      <option value={15000}>15 seconds</option>
                      <option value={30000}>30 seconds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Node
                    </label>
                    <select
                      value={debugOptions.longRunningNode}
                      onChange={(e) =>
                        setDebugOptions({
                          ...debugOptions,
                          longRunningNode: e.target.value,
                        })
                      }
                      disabled={isExecuting}
                      className="block w-full px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
                    >
                      <option value="random">Random Node</option>
                      {selectedFlow?.nodes?.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.name || node.type} ({node.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
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
