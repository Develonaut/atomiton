import { useEditorNodes } from "@atomiton/editor";
import { Button, Icon } from "@atomiton/ui";
import { useExecuteFlow } from "#hooks/useFlow";
import type { Flow } from "#lib/rpcTypes";

export type ExecuteHandler = (
  nodeDefinitions: unknown[],
) => void | Promise<void>;

type RunFlowProps = {
  onClick?: ExecuteHandler;
  isRunning?: boolean;
  flow?: Flow;
};

function RunFlow({ onClick, isRunning = false, flow }: RunFlowProps) {
  const nodes = useEditorNodes();
  const executeFlow = useExecuteFlow();

  const handleRun = async () => {
    if (flow) {
      executeFlow.mutate({
        executable: flow,
        context: { variables: { source: "editor" } },
      });
      return;
    }

    if (!onClick) {
      console.error("No onClick handler or flow provided to RunFlow");
      return;
    }

    try {
      const nodeArray = nodes.nodes || [];

      console.log("Nodes from editor:", nodeArray);

      const nodeDefinitions = nodeArray.map((node) => ({
        id: node.id,
        type: node.data?.name || node.type,
        version: node.data?.version || "1.0.0",
        parentId: node.data?.parentId,
        position: node.position,
        metadata: node.data?.metadata || {},
        inputs: node.data?.inputPorts || [],
        outputs: node.data?.outputPorts || [],
        configuration: node.data?.parameters || {},
      }));

      await onClick(nodeDefinitions);
    } catch (error) {
      console.error("Failed to prepare flow for execution:", error);
    }
  };

  const isExecuting = executeFlow.isPending || isRunning;

  return (
    <Button
      variant="default"
      onClick={handleRun}
      disabled={isExecuting || (!onClick && !flow)}
      className="flex items-center gap-2"
    >
      <Icon
        name={isExecuting ? "loader" : "play"}
        size={16}
        className={isExecuting ? "animate-spin" : ""}
      />
      {isExecuting ? "Running..." : "Run"}
    </Button>
  );
}

export default RunFlow;
