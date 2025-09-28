import conductor from "#lib/conductor/index.js";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { useEditorNodes } from "@atomiton/editor";
import { Button, Icon } from "@atomiton/ui";
import { useState } from "react";

export type ExecuteHandler = (
  node: NodeDefinition,
) => void | Promise<void>;

type RunFlowProps = {
  onClick?: ExecuteHandler;
  isRunning?: boolean;
  flow?: NodeDefinition;
};

function RunFlow({ onClick, isRunning = false, flow }: RunFlowProps) {
  const nodes = useEditorNodes();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRun = async () => {
    if (flow) {
      setIsExecuting(true);
      try {
        await conductor.node.run(flow);
      } catch (error) {
        console.error("Failed to execute flow:", error);
      } finally {
        setIsExecuting(false);
      }
      return;
    }

    if (!onClick) {
      console.error("No onClick handler or flow provided to RunFlow");
      return;
    }

    try {
      const nodeArray = nodes.nodes || [];

      console.log("Nodes from editor:", nodeArray);

      // Convert editor nodes to a single NodeDefinition (group/flow)
      const flowNode = createNodeDefinition({
        id: `flow-${Date.now()}`,
        type: "group",
        version: "1.0.0",
        name: "Editor Flow",
        position: { x: 0, y: 0 },
        nodes: nodeArray.map((node) => createNodeDefinition({
          id: node.id,
          type: (node.data as Record<string, unknown>)?.name as string || node.type || "unknown",
          version: ((node.data as Record<string, unknown>)?.version as string) || "1.0.0",
          name: ((node.data as Record<string, unknown>)?.label || (node.data as Record<string, unknown>)?.name || node.type) as string,
          position: node.position,
          metadata: ((node.data as Record<string, unknown>)?.metadata as Record<string, unknown>) || {},
          parameters: ((node.data as Record<string, unknown>)?.parameters || (node.data as Record<string, unknown>)?.config) as Record<string, unknown> || {},
        })),
      });

      await onClick(flowNode);
    } catch (error) {
      console.error("Failed to prepare flow for execution:", error);
    }
  };

  const executing = isExecuting || isRunning;

  return (
    <Button
      variant="default"
      onClick={handleRun}
      disabled={executing || (!onClick && !flow)}
      className="flex items-center gap-2"
    >
      <Icon
        name={executing ? "loader" : "play"}
        size={16}
        className={executing ? "animate-spin" : ""}
      />
      {executing ? "Running..." : "Run"}
    </Button>
  );
}

export default RunFlow;
