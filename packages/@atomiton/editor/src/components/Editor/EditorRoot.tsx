import { useFlowToReactFlow } from "#hooks/useFlowToReactFlow";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { styled } from "@atomiton/ui";
import { ReactFlowProvider } from "@xyflow/react";
import type { HTMLAttributes } from "react";

type EditorProps = {
  children: React.ReactNode;
  className?: string;
  flow?: NodeDefinition;
} & HTMLAttributes<HTMLDivElement>;

const EditorRootStyled = styled("div", {
  name: "Editor",
})("flex h-screen w-full overflow-hidden bg-background");

/**
 * Editor root container component.
 * This is a simple container that wraps the entire editor layout.
 * Use with Panel, Toolbar, Canvas, and other standalone components.
 *
 */
function EditorRoot({ children, className, flow, ...props }: EditorProps) {
  const { nodes, edges } = useFlowToReactFlow(flow);

  return (
    <EditorRootStyled data-editor-root {...props}>
      <ReactFlowProvider defaultNodes={nodes} defaultEdges={edges}>
        {children}
      </ReactFlowProvider>
    </EditorRootStyled>
  );
}

export default EditorRoot;
