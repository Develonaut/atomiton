import Export from "#components/Export";
import Icon from "#components/Icon";
import Zoom from "#components/Zoom";
import { useNodeExecution } from "#hooks/useNodeExecution";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import {
  useSelectedNode,
  useEditorNodes,
  useEditorEdges,
  reactFlowToFlow,
} from "@atomiton/editor";
import { Box, Button } from "@atomiton/ui";
import { useCallback, useState } from "react";

function Toolbar() {
  // TODO: Re-implement undo/redo functionality
  const canUndo = false;
  const canRedo = false;
  const undo = () => {};
  const redo = () => {};
  const [active, setActive] = useState<number | null>(0);
  const [showOutput, setShowOutput] = useState(false);

  // Get selected node and editor state
  const selectedNode = useSelectedNode() as NodeDefinition | null;
  const { nodes } = useEditorNodes();
  const { edges } = useEditorEdges();

  // Use shared execution hook
  const { execute, isExecuting, result } = useNodeExecution({
    validateBeforeRun: true,
    onExecutionStart: (node) => {
      console.log(
        `Executing ${selectedNode ? "selected node" : "flow"}: ${node.name || node.id}`,
      );
      setShowOutput(true);
    },
    onExecutionComplete: (result) => {
      console.log("Execution complete:", result);
    },
    onValidationError: (errors) => {
      console.error("Validation failed:", errors);
    },
  });

  const handleRun = useCallback(async () => {
    // Determine what to run: selected node or entire flow
    const nodeToRun = selectedNode || reactFlowToFlow(nodes, edges);
    await execute(nodeToRun);
  }, [selectedNode, nodes, edges, execute]);

  const actions = [
    {
      id: 0,
      icon: "cursor",
      onClick: () => {},
    },
    {
      id: 1,
      icon: "pinch",
      onClick: () => {},
    },
    {
      id: 2,
      icon: "message",
      onClick: () => {},
    },
    {
      id: 3,
      icon: "crop",
      onClick: () => {},
    },
    {
      id: 4,
      icon: "play",
      onClick: () => {},
    },
  ];

  return (
    <Box
      className="fixed top-3 left-1/2 z-20 -translate-x-1/2 flex shadow-toolbar border border-s-01 bg-surface-01 rounded-[1.25rem]"
      data-testid="toolbar"
    >
      <Box className="flex gap-2 p-2">
        {actions.map((action) => (
          <Button
            size="icon"
            variant={active === action.id ? "embossed" : "ghost"}
            key={action.id}
            onClick={() => {
              setActive(action.id);
              action.onClick();
            }}
          >
            <Icon className="fill-primary" name={action.icon} />
          </Button>
        ))}
        <Zoom />
        <Button
          size="icon"
          variant="ghost"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
        >
          <Icon className="fill-primary rotate-180" name="arrow" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
        >
          <Icon className="fill-primary" name="arrow" />
        </Button>
      </Box>
      <Box className="p-2 flex gap-2">
        <Button
          onClick={handleRun}
          disabled={isExecuting}
          variant="default"
          title={selectedNode ? "Run selected node" : "Run entire flow"}
        >
          <Icon
            name={isExecuting ? "loader" : "play"}
            className={isExecuting ? "animate-spin" : ""}
          />
          {isExecuting ? "Running..." : "Run"}
        </Button>
        <Export disabled />
      </Box>

      {/* Output Panel */}
      {showOutput && result && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-96 bg-surface-01 rounded-xl border border-s-01 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-s-01 flex items-center justify-between">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Icon name="terminal" />
              Execution Output
            </h3>
            <button
              onClick={() => setShowOutput(false)}
              className="text-secondary hover:text-primary transition-colors"
            >
              <Icon name="x" />
            </button>
          </div>

          <div className="p-4 max-h-80 overflow-y-auto">
            {/* Output */}
            <div
              className={`p-3 rounded-lg border ${
                result.success
                  ? "bg-success/5 border-success/20"
                  : "bg-error/5 border-error/20"
              }`}
            >
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Icon
                  name={result.success ? "check-circle" : "x-circle"}
                  className={result.success ? "text-success" : "text-error"}
                />
                {result.success ? "Success" : "Error"}
              </p>
              {result.error && (
                <p className="text-sm text-error">{result.error.message}</p>
              )}
              {result.data !== null && result.data !== undefined && (
                <div className="mt-2">
                  <p className="text-xs text-secondary mb-1">Result:</p>
                  <pre className="text-xs bg-surface-02 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Show message if not in Electron */}
            {!("electron" in window) && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg mt-2">
                <p className="text-sm text-warning">
                  Run functionality requires the desktop application
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Box>
  );
}

export default Toolbar;
