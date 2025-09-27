import { useEditorNodes } from "@atomiton/editor";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { Button, Icon } from "@atomiton/ui";

export type ExecuteHandler = (
  nodeDefinitions: unknown[],
) => void | Promise<void>;

type RunFlowProps = {
  onClick?: ExecuteHandler;
  isRunning?: boolean;
};

function RunFlow({ onClick, isRunning = false }: RunFlowProps) {
  const nodes = useEditorNodes();

  const handleRun = async () => {
    if (!onClick) {
      console.error("No onClick handler provided to RunFlow");
      return;
    }

    try {
      // Convert nodes to array - nodes is an object with nodes property
      const nodeArray = nodes.nodes || [];

      console.log("Nodes from editor:", nodeArray);

      // Convert editor nodes to clean node definitions
      const nodeDefinitions = nodeArray.map((node) => {
        // Strip out editor-specific properties and keep only definition data
        return createNodeDefinition({
          id: node.id,
          name: node.data?.name || node.type,
          position: node.position,
          metadata: node.data?.metadata || {},
          inputPorts: node.data?.inputPorts || [],
          outputPorts: node.data?.outputPorts || [],
          parameters: node.data?.parameters || {},
        });
      });

      // Call the onClick handler with clean node definitions
      await onClick(nodeDefinitions);
    } catch (error) {
      console.error("Failed to prepare flow for execution:", error);
    }
  };

  return (
    <Button
      variant="default"
      onClick={handleRun}
      disabled={isRunning || !onClick}
      className="flex items-center gap-2"
    >
      <Icon
        name={isRunning ? "loader" : "play"}
        size={16}
        className={isRunning ? "animate-spin" : ""}
      />
      {isRunning ? "Running..." : "Run"}
    </Button>
  );
}

export default RunFlow;
