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
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [showAsError, setShowAsError] = useState<boolean>(false);
  const [debugEnabled, setDebugEnabled] = useState<boolean>(false);

  const { isExecuting, progress, runFlow, reset, resetKey, slowMo, setSlowMo } =
    useFlowOperations();

  const { clearLogs } = useDebugLogs();

  // Update node and edge progress when execution slider changes (only if debug enabled)
  useEffect(() => {
    if (!debugEnabled) return;

    // Execution slider simulates flow: Node1 → Edge1 → Node2 → Edge2 → Node3
    // Each node gets its own progress, edges progress after their source node completes
    const nodes = document.querySelectorAll(".react-flow__node");
    const edges = document.querySelectorAll(".react-flow__edge");

    const totalNodes = nodes.length;
    const totalEdges = edges.length;

    // Total segments = nodes + edges (interleaved)
    const totalSegments = totalNodes + totalEdges;
    const segmentSize = 100 / totalSegments;

    // For each node, calculate its progress based on execution slider position
    nodes.forEach((node, nodeIndex) => {
      const element = node as HTMLElement;
      const nodeSegmentStart = nodeIndex * 2; // Nodes are at even positions (0, 2, 4...)
      const nodeSegmentEnd = nodeSegmentStart + 1;

      const nodeStartThreshold = nodeSegmentStart * segmentSize;
      const nodeEndThreshold = nodeSegmentEnd * segmentSize;

      let nodeProgress = 0;

      // Don't fill node progress if error is active
      if (!showAsError) {
        if (executionProgress >= nodeEndThreshold) {
          nodeProgress = 100; // Node fully complete
        } else if (executionProgress > nodeStartThreshold) {
          // Node is actively progressing
          const segmentRange = nodeEndThreshold - nodeStartThreshold;
          const progressInSegment = executionProgress - nodeStartThreshold;
          nodeProgress = (progressInSegment / segmentRange) * 100;
        }
      }

      // Set node state based on progress
      let nodeState = "pending";
      if (showAsError && executionProgress > 0) {
        nodeState = "error"; // Show error state but no progress
      } else if (nodeProgress === 100) {
        nodeState = "completed"; // Green when fully complete
      } else if (nodeProgress > 0) {
        nodeState = "executing"; // Blue while progressing
      }

      element.setAttribute("data-execution-state", nodeState);

      // Set progress on the inner .atomiton-node element
      const atomitonNode = element.querySelector(
        ".atomiton-node",
      ) as HTMLElement | null;
      if (atomitonNode) {
        atomitonNode.style.setProperty("--progress", String(nodeProgress));
      }
    });

    // Edge progress (existing logic uses this)
    edges.forEach((edge, edgeIndex) => {
      const element = edge as HTMLElement;

      // Edge comes AFTER its source node
      const edgeSegmentStart = edgeIndex * 2 + 1;
      const edgeSegmentEnd = edgeSegmentStart + 1;

      const edgeStartThreshold = edgeSegmentStart * segmentSize;
      const edgeEndThreshold = edgeSegmentEnd * segmentSize;

      let edgeProgress = 0;

      // Don't fill edge progress if error is active
      if (!showAsError) {
        if (executionProgress >= edgeEndThreshold) {
          edgeProgress = 100;
        } else if (executionProgress > edgeStartThreshold) {
          const segmentRange = edgeEndThreshold - edgeStartThreshold;
          const progressInSegment = executionProgress - edgeStartThreshold;
          edgeProgress = (progressInSegment / segmentRange) * 100;
        }
      }

      // Update edge state based on progress
      let edgeState = "inactive";
      if (showAsError && executionProgress > 0) {
        edgeState = "error"; // Show error state but no progress
      } else if (edgeProgress === 100) {
        edgeState = "completed"; // Green when fully complete
      } else if (edgeProgress > 0) {
        edgeState = "executing"; // Blue while progressing
      }

      element.setAttribute("data-edge-state", edgeState);

      const pathElement = element.querySelector(
        ".react-flow__edge-path",
      ) as SVGPathElement | null;
      if (pathElement) {
        const pathLength = pathElement.getTotalLength();
        pathElement.style.strokeDasharray = String(pathLength);
        pathElement.style.strokeDashoffset = String(
          pathLength * (1 - edgeProgress / 100),
        );
      }
    });
  }, [executionProgress, showAsError, debugEnabled]);

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

  // Use debug values when debug enabled, otherwise use actual flow execution values
  const displayProgress = debugEnabled
    ? {
        currentNode: (() => {
          const totalNodes = selectedFlow?.nodes?.length || 0;
          const totalEdges = totalNodes > 0 ? totalNodes - 1 : 0;
          const totalSegments = totalNodes + totalEdges;
          const segmentSize = totalSegments > 0 ? 100 / totalSegments : 0;
          const currentNodeIndex = Math.floor(
            executionProgress / segmentSize / 2,
          );
          return Math.min(currentNodeIndex + 1, totalNodes);
        })(),
        totalNodes: selectedFlow?.nodes?.length || 0,
        currentNodeName: (() => {
          const totalNodes = selectedFlow?.nodes?.length || 0;
          const totalEdges = totalNodes > 0 ? totalNodes - 1 : 0;
          const totalSegments = totalNodes + totalEdges;
          const segmentSize = totalSegments > 0 ? 100 / totalSegments : 0;
          const currentNodeIndex = Math.floor(
            executionProgress / segmentSize / 2,
          );
          return selectedFlow?.nodes?.[currentNodeIndex]?.type || "";
        })(),
        isExecuting: executionProgress > 0 && executionProgress < 100,
        graphProgress: executionProgress,
      }
    : {
        ...progress,
        isExecuting,
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
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-yellow-800">
                Debug Controls
              </h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={debugEnabled}
                  onChange={(e) => setDebugEnabled(e.target.checked)}
                  className="mr-2"
                  data-testid="debug-enabled-checkbox"
                />
                <span className="text-xs font-medium text-gray-700">
                  Enable Debug Mode
                </span>
              </label>
            </div>

            {/* Execution Progress Slider */}
            <div className="mb-3">
              <label
                htmlFor="execution-progress"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Execution Progress: {executionProgress}%
              </label>
              <input
                type="range"
                id="execution-progress"
                min="0"
                max="100"
                step="5"
                value={executionProgress}
                onChange={(e) => setExecutionProgress(Number(e.target.value))}
                disabled={!debugEnabled}
                className="block w-full disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="execution-progress-slider"
              />
            </div>

            {/* Error State Checkbox */}
            <div className="mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showAsError}
                  onChange={(e) => setShowAsError(e.target.checked)}
                  disabled={!debugEnabled}
                  className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="show-as-error-checkbox"
                />
                <span className="text-xs font-medium text-gray-700">
                  Show as Error
                </span>
              </label>
            </div>

            {/* Slow-Mo Control */}
            <div>
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
                disabled={isExecuting || debugEnabled}
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
            currentNode={displayProgress.currentNode}
            totalNodes={displayProgress.totalNodes}
            currentNodeName={displayProgress.currentNodeName}
            isExecuting={displayProgress.isExecuting}
            graphProgress={displayProgress.graphProgress}
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
