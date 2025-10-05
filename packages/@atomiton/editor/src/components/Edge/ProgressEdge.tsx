import { type EdgeProps, getBezierPath } from "@xyflow/react";
import { useEdgeExecutionState } from "#hooks/useEdgeExecutionState";

/**
 * Custom edge component with execution progress visualization
 * Uses direct DOM manipulation for performance (mirrors useNodeExecutionState pattern)
 *
 * @example
 * ```tsx
 * <ReactFlow
 *   nodes={nodes}
 *   edges={edges}
 *   edgeTypes={{ default: ProgressEdge }}
 * />
 * ```
 *
 * @performance
 * - Uses direct DOM manipulation (no React re-renders)
 * - GPU-accelerated CSS animations
 * - Efficient for graphs with 500+ edges
 */
export function ProgressEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  markerEnd,
  markerStart,
  style,
  // Filter out React Flow internal props that shouldn't be passed to DOM
  selectable: _selectable,
  deletable: _deletable,
  labelStyle: _labelStyle,
  labelShowBg: _labelShowBg,
  labelBgStyle: _labelBgStyle,
  labelBgPadding: _labelBgPadding,
  labelBgBorderRadius: _labelBgBorderRadius,
  sourceHandleId: _sourceHandleId,
  targetHandleId: _targetHandleId,
  pathOptions: _pathOptions,
  interactionWidth: _interactionWidth,
  ...props
}: EdgeProps) {
  const edgeRef = useEdgeExecutionState(id, source, target);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  console.log("[ProgressEdge] Rendering:", {
    id,
    source,
    target,
    path: edgePath,
  });

  return (
    <g ref={edgeRef as React.RefObject<SVGGElement>}>
      {/* Background path - always visible gray (3px) */}
      <path
        id={`${id}-bg`}
        className="react-flow__edge-path-bg"
        d={edgePath}
        fill="none"
        strokeWidth={3}
      />

      {/* Foreground progress path - colored overlay (2px), leaves 1px gray visible */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        strokeWidth={2}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
        {...props}
      />
    </g>
  );
}
