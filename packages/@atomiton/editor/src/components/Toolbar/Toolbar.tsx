import { ToolbarRoot } from "./ToolbarRoot";
import { ToolbarGroup } from "./ToolbarGroup";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarSeparator } from "./ToolbarSeparator";
import { ToolbarDropdown } from "./ToolbarDropdown";
import { ToolbarToggle } from "./ToolbarToggle";

/**
 * Composable toolbar component for editor layouts.
 * Provides flexible positioning and content slots.
 *
 * @example
 * ```tsx
 * <Toolbar position="center" verticalPosition="top">
 *   <Toolbar.Group>
 *     <Toolbar.Button icon={<Icon />} tooltip="Save">Save</Toolbar.Button>
 *     <Toolbar.Toggle icon={<Icon />} tooltip="Bold" />
 *   </Toolbar.Group>
 *   <Toolbar.Separator />
 *   <Toolbar.Dropdown trigger="Options">
 *     <MenuItem>Option 1</MenuItem>
 *   </Toolbar.Dropdown>
 * </Toolbar>
 * ```
 */
export const Toolbar = Object.assign(ToolbarRoot, {
  Group: ToolbarGroup,
  Button: ToolbarButton,
  Separator: ToolbarSeparator,
  Dropdown: ToolbarDropdown,
  Toggle: ToolbarToggle,
});

export default Toolbar;
