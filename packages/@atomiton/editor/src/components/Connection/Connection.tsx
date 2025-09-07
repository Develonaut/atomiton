import { ConnectionRoot } from "./ConnectionRoot";
import { ConnectionPath } from "./ConnectionPath";
import { ConnectionLabel } from "./ConnectionLabel";
import { ConnectionArrow } from "./ConnectionArrow";
import { ConnectionHandle } from "./ConnectionHandle";

// Create compound component using Object.assign
const Connection = Object.assign(ConnectionRoot, {
  Path: ConnectionPath,
  Label: ConnectionLabel,
  Arrow: ConnectionArrow,
  Handle: ConnectionHandle,
});

export { Connection };
export default Connection;
