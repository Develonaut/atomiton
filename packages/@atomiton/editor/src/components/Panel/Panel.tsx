import { PanelRoot } from "./PanelRoot";
import { PanelHeader } from "./PanelHeader";
import { PanelContent } from "./PanelContent";
import { PanelFooter } from "./PanelFooter";
import { PanelSection } from "./PanelSection";

/**
 * Generic panel component for flexible content areas.
 * Can be positioned on any side of the screen with configurable sizing.
 *
 * @example
 * ```tsx
 * <Panel side="left" size="md">
 *   <Panel.Header title="My Panel" closable onClose={handleClose} />
 *   <Panel.Content scrollable>
 *     <Panel.Section title="Section 1" collapsible>
 *       Content here
 *     </Panel.Section>
 *   </Panel.Content>
 *   <Panel.Footer>
 *     <Button>Save</Button>
 *   </Panel.Footer>
 * </Panel>
 * ```
 */
export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Content: PanelContent,
  Footer: PanelFooter,
  Section: PanelSection,
});

export default Panel;
