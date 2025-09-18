import { CanvasGrid } from "./CanvasGrid";
import { CanvasMinimap } from "./CanvasMinimap";
import { CanvasRoot } from "./CanvasRoot";

const Canvas = Object.assign(CanvasRoot, {
  Grid: CanvasGrid,
  Minimap: CanvasMinimap,
});

export default Canvas;
