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
      {/* Background path - always visible gray */}
      <path
        id={`${id}-bg`}
        className="react-flow__edge-path-bg"
        d={edgePath}
        fill="none"
        strokeWidth={2}
      />

      {/* Foreground progress path - colored, uses dasharray for progress */}
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
