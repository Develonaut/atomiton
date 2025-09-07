import { CanvasRoot } from "./CanvasRoot";
import { CanvasViewport } from "./CanvasViewport";
import { CanvasGrid } from "./CanvasGrid";
import { CanvasElements } from "./CanvasElements";
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
  Elements: CanvasElements,
  Connections: CanvasConnections,
  Controls: Object.assign(CanvasControls, {
    Zoom: CanvasControlZoom,
    Pan: CanvasControlPan,
    Reset: CanvasControlReset,
  }),
  Minimap: CanvasMinimap,
  Selection: CanvasSelection,
});

export { Canvas };
export default Canvas;
