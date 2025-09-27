import { styled } from "@atomiton/ui";
import { ReactFlowProvider } from "@xyflow/react";
import type { HTMLAttributes } from "react";
import type { Flow } from "@atomiton/flow";

type EditorProps = {
  children: React.ReactNode;
  className?: string;
  flow?: Flow;
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
  return (
    <EditorRootStyled data-editor-root {...props}>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </EditorRootStyled>
  );
}

export default EditorRoot;
