import { ReactFlowProvider as XYFlowProvider } from "@xyflow/react";

type ReactFlowProviderProps = {
  children: React.ReactNode;
};

/**
 * Pure ReactFlow provider primitive
 * Just wraps @xyflow/react ReactFlowProvider with no business logic
 */
export function ReactFlowProvider({ children }: ReactFlowProviderProps) {
  return <XYFlowProvider>{children}</XYFlowProvider>;
}
