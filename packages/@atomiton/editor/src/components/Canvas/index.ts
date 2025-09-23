import { CanvasGrid } from "#components/Canvas/CanvasGrid";
import { CanvasMinimap } from "#components/Canvas/CanvasMinimap";
import { CanvasRoot } from "#components/Canvas/CanvasRoot";

const Canvas = Object.assign(CanvasRoot, {
  Grid: CanvasGrid,
  Minimap: CanvasMinimap,
});

export default Canvas;
