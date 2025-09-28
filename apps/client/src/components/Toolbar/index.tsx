import Export from "#components/Export";
import Icon from "#components/Icon";
import RunFlow, { type ExecuteHandler } from "#components/RunFlow";
import Zoom from "#components/Zoom";
import conductor from "#lib/conductor";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { Box, Button } from "@atomiton/ui";
import { useCallback, useState } from "react";

function Toolbar() {
  // TODO: Re-implement undo/redo functionality
  const canUndo = false;
  const canRedo = false;
  const undo = () => {};
  const redo = () => {};
  const [active, setActive] = useState<number | null>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [showOutput, setShowOutput] = useState(false);

  const handleExecute: ExecuteHandler = useCallback(async (nodeDefinitions) => {
    setIsRunning(true);
    setOutput(null);
    setShowOutput(true);

    try {
      // Create a group node with the node definitions as children
      const groupNode = createNodeDefinition({
        type: "group",
        nodes: nodeDefinitions,
      });

      console.log("Executing flow with Conductor API...");
      const response = await conductor.execute(groupNode);

      console.log("Flow execution response:", response);

      // Convert to old format for display compatibility
      const displayOutput = {
        id: groupNode.id,
        success: response.success,
        outputs: response.data,
        error: response.error,
      };

      setOutput(displayOutput);
    } catch (error) {
      console.error("Failed to execute flow:", error);
      setOutput({
        id: "error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsRunning(false);
    }
  }, []);

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
        <RunFlow onClick={handleExecute} isRunning={isRunning} />
        <Export />
      </Box>

      {/* Output Panel */}
      {showOutput && (
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
            {output && (
              <div
                className={`p-3 rounded-lg border ${
                  output.success
                    ? "bg-success/5 border-success/20"
                    : "bg-error/5 border-error/20"
                }`}
              >
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Icon
                    name={output.success ? "check-circle" : "x-circle"}
                    className={output.success ? "text-success" : "text-error"}
                  />
                  {output.success ? "Success" : "Error"}
                </p>
                {output.error && (
                  <p className="text-sm text-error">{output.error}</p>
                )}
                {output.outputs !== null && (
                  <div className="mt-2">
                    <p className="text-xs text-secondary mb-1">Result:</p>
                    <pre className="text-xs bg-surface-02 p-2 rounded overflow-x-auto">
                      {JSON.stringify(output.outputs, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Show message if not in Electron */}
            {!window.electron && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
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
