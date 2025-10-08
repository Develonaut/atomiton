// import Export from "#components/Export";
import Zoom from "#components/Zoom";
import OutputPanel from "#components/OutputPanel";
import { useNodeExecution } from "#hooks/useNodeExecution";
import { useEditorUI } from "#store/editorUI";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import {
  useSelectedNode,
  useEditorNodes,
  useEditorEdges,
  reactFlowToFlow,
} from "@atomiton/editor";
import { Box, Button, Icon } from "@atomiton/ui";
import { useCallback, useState } from "react";

function Toolbar() {
  // TODO: Re-implement undo/redo functionality
  const canUndo = false;
  const canRedo = false;
  const undo = () => {};
  const redo = () => {};
  const [active, setActive] = useState<number | null>(0);

  // Use shared UI state store
  const { showOutputPanel, showMinimap, toggleOutputPanel, toggleMinimap } =
    useEditorUI();

  // Get selected node and editor state
  const selectedNode = useSelectedNode() as NodeDefinition | null;
  const { nodes } = useEditorNodes();
  const { edges } = useEditorEdges();

  // Use shared execution hook
  const { execute, isExecuting } = useNodeExecution({
    validateBeforeRun: true,
    onExecutionComplete: (result) => {
      // Note: 🎉 Completion message is logged universally by the store's onComplete handler
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
      icon: "pointer",
      onClick: () => {},
    },
    {
      id: 1,
      icon: "hand",
      onClick: () => {},
    },
    {
      id: 2,
      icon: "message-square",
      onClick: () => {},
    },
    {
      id: 3,
      icon: "crop",
      onClick: () => {},
    },
    {
      id: 4,
      icon: "terminal",
      onClick: toggleOutputPanel,
    },
    {
      id: 5,
      icon: "scan",
      onClick: toggleMinimap,
    },
  ];

  return (
    <>
      <Box
        className="fixed top-3 left-1/2 z-20 -translate-x-1/2 flex shadow-toolbar border border-s-01 bg-surface-01 rounded-[1.25rem]"
        data-testid="toolbar"
      >
        <Box className="flex gap-2 p-2">
          {actions.map((action) => (
            <Button
              size="icon"
              variant={
                (action.id === 4 && showOutputPanel) ||
                (action.id === 5 && showMinimap) ||
                active === action.id
                  ? "embossed"
                  : "ghost"
              }
              key={action.id}
              onClick={() => {
                if (action.id !== 4 && action.id !== 5) {
                  setActive(action.id);
                }
                action.onClick();
              }}
            >
              <Icon name={action.icon} />
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
            <Icon name="undo" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z)"
          >
            <Icon name="redo" />
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
              name={isExecuting ? "loader-2" : "play"}
              className={isExecuting ? "animate-spin" : ""}
            />
            {isExecuting ? "Running..." : "Run"}
          </Button>
          {/* <Export disabled /> */}
        </Box>
      </Box>

      {/* Output Panel - Outside toolbar box for proper positioning */}
      <OutputPanel />
    </>
  );
}

export default Toolbar;
