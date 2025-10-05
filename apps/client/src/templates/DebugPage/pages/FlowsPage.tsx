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
  const [debugNodeProgress, setDebugNodeProgress] = useState<number>(0);
  const [debugGraphProgress, setDebugGraphProgress] = useState<number>(0);
  const [debugState, setDebugState] = useState<string>("executing");

  const { isExecuting, progress, runFlow, reset, resetKey, slowMo, setSlowMo } =
    useFlowOperations();

  const { clearLogs } = useDebugLogs();

  // Apply debug styling to nodes when debug controls are changed
  useEffect(() => {
    const nodes = document.querySelectorAll(".react-flow__node");
    nodes.forEach((node) => {
      const element = node as HTMLElement;
      element.setAttribute("data-execution-state", debugState);

      // Set progress on the inner .atomiton-node element (where pseudo-element lives)
      const atomitonNode = element.querySelector(
        ".atomiton-node",
      ) as HTMLElement | null;
      if (atomitonNode) {
        atomitonNode.style.setProperty("--progress", String(debugNodeProgress));
      }
    });
  }, [debugNodeProgress, debugState]);

  // Apply debug styling to edges based on graph progress
  // Edges fill AFTER source node completes, representing data transfer
  useEffect(() => {
    const nodes = document.querySelectorAll(".react-flow__node");
    const edges = document.querySelectorAll(".react-flow__edge");

    const totalNodes = nodes.length;
    const totalEdges = edges.length;

    // Total segments = nodes + edges (interleaved: node, edge, node, edge, node)
    const totalSegments = totalNodes + totalEdges;
    const segmentSize = 100 / totalSegments;

    edges.forEach((edge, edgeIndex) => {
      const element = edge as HTMLElement;

      // Edge comes AFTER its source node
      // Pattern: Node0, Edge0, Node1, Edge1, Node2
      // Edge N starts at segment (N*2 + 1) and ends at segment (N*2 + 2)
      const edgeSegmentStart = edgeIndex * 2 + 1;
      const edgeSegmentEnd = edgeSegmentStart + 1;

      const edgeStartThreshold = edgeSegmentStart * segmentSize;
      const edgeEndThreshold = edgeSegmentEnd * segmentSize;

      // Calculate edge progress as a percentage of its segment
      let edgeProgress = 0;
      if (debugGraphProgress >= edgeEndThreshold) {
        edgeProgress = 100; // Fully filled
      } else if (debugGraphProgress > edgeStartThreshold) {
        // Partially filled - calculate percentage within this edge's segment
        const segmentRange = edgeEndThreshold - edgeStartThreshold;
        const progressInSegment = debugGraphProgress - edgeStartThreshold;
        edgeProgress = (progressInSegment / segmentRange) * 100;
      }

      // Determine edge state
      let edgeState = "inactive";

      if (debugState === "error") {
        edgeState = "error";
      } else if (edgeProgress > 0) {
        if (debugState === "completed" && edgeProgress === 100) {
          edgeState = "completed"; // Solid green when fully filled and completed
        } else if (debugState === "executing" || debugState === "pending") {
          edgeState = "executing"; // Progress bar fill
        }
      }

      element.setAttribute("data-edge-state", edgeState);

      // Set dasharray/dashoffset for progressive fill on foreground path
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
  }, [debugGraphProgress, debugState]);

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
              Debug Controls
            </h4>

            {/* State Selector */}
            <div className="mb-3">
              <label
                htmlFor="debug-state"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Execution State
              </label>
              <select
                id="debug-state"
                value={debugState}
                onChange={(e) => setDebugState(e.target.value)}
                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                data-testid="debug-state-selector"
              >
                <option value="pending">Pending</option>
                <option value="executing">Executing</option>
                <option value="completed">Completed</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Node Progress Slider */}
            <div className="mb-3">
              <label
                htmlFor="debug-node-progress"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Node Progress: {debugNodeProgress}%
              </label>
              <input
                type="range"
                id="debug-node-progress"
                min="0"
                max="100"
                step="5"
                value={debugNodeProgress}
                onChange={(e) => setDebugNodeProgress(Number(e.target.value))}
                className="block w-full"
                data-testid="debug-node-progress-slider"
              />
            </div>

            {/* Graph Progress Slider */}
            <div className="mb-3">
              <label
                htmlFor="debug-graph-progress"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Graph Progress (Edges): {debugGraphProgress}%
              </label>
              <input
                type="range"
                id="debug-graph-progress"
                min="0"
                max="100"
                step="5"
                value={debugGraphProgress}
                onChange={(e) => setDebugGraphProgress(Number(e.target.value))}
                className="block w-full"
                data-testid="debug-graph-progress-slider"
              />
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
