import { styled } from "@atomiton/ui";
import type { EditorRootProps } from "./Editor.types";

const EditorStyled = styled("div", {
  name: "Editor",
})("flex h-screen w-full overflow-hidden bg-background");

/**
 * Editor root container component.
 * This is a simple container that wraps the entire editor layout.
 * Use with Panel, Toolbar, Canvas, and other standalone components.
 *
 * @example
 * <Editor>
 *   <Toolbar>...</Toolbar>
 *   <Panel side="left">...</Panel>
 *   <Canvas>...</Canvas>
 *   <Panel side="right">...</Panel>
 * </Editor>
 */
function Editor({ children, className, ...props }: EditorRootProps) {
  return (
    <EditorStyled data-editor-root {...props}>
      {children}
    </EditorStyled>
  );
}

export default Editor;
