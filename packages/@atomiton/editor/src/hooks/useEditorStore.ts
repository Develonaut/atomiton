import { useStore as useReactFlowStore } from "@xyflow/react";
import type { ReactFlowState } from "@xyflow/react";
import { shallow } from "@atomiton/store";

/**
 * Custom wrapper around React Flow's useStore that includes shallow comparison by default.
 * This prevents unnecessary re-renders when the selected state hasn't actually changed.
 *
 * @performance
 * - Automatically applies shallow comparison to prevent re-renders
 * - Only re-renders when the actual selected values change
 * - Reduces performance overhead from object recreation
 */
export function useEditorStore<T>(
  selector: (state: ReactFlowState) => T,
  equalityFn: (a: T, b: T) => boolean = shallow,
): T {
  return useReactFlowStore(selector, equalityFn);
}
