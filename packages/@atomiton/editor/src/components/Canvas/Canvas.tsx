import { CanvasRoot } from "./CanvasRoot";
import { CanvasViewport } from "./CanvasViewport";
import { CanvasGrid } from "./CanvasGrid";
import { CanvasNodes } from "./CanvasNodes";
import { CanvasConnections } from "./CanvasConnections";
import { CanvasControls } from "./CanvasControls";
import { CanvasMinimap } from "./CanvasMinimap";
import { CanvasSelection } from "./CanvasSelection";
import { CanvasControlZoom } from "./CanvasControlZoom";
import { CanvasControlPan } from "./CanvasControlPan";
import { CanvasControlReset } from "./CanvasControlReset";

// Create compound component
const Canvas = Object.assign(CanvasRoot, {
  Viewport: CanvasViewport,
  Grid: CanvasGrid,
  Nodes: CanvasNodes,
  Connections: CanvasConnections,
  Controls: Object.assign(CanvasControls, {
    Zoom: CanvasControlZoom,
    Pan: CanvasControlPan,
    Reset: CanvasControlReset,
  }),
  Minimap: CanvasMinimap,
  Selection: CanvasSelection,
});

export default Canvas;
