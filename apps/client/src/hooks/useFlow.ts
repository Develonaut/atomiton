/**
 * Flow hooks for execution and storage operations
 * Uses conductor for execution
 */

import conductor from "#lib/conductor";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useState, useCallback } from "react";

export type FlowExecutionState = {
  isExecuting: boolean;
  error: Error | null;
  result: unknown | null;
};

/**
 * Hook for saving flows - placeholder until storage is properly integrated
 */
export function useSaveFlow() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = useCallback(async (flow: unknown) => {
    setIsPending(true);
    setError(null);

    try {
      // TODO: Implement actual save via storage package
      // For now, just log and simulate success
      console.log("Saving flow:", flow);

      // Simulate async save
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsPending(false);
      setIsSuccess(true);
      console.log("Flow saved successfully");

      // Clear success after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);

      return { success: true };
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setIsPending(false);
      console.error("Save failed:", errorObj);
      throw errorObj;
    }
  }, []);

  return {
    mutate,
    isPending,
    error,
    isSuccess,
  };
}

/**
 * Hook for loading a flow by ID - placeholder until storage is properly integrated
 */
export function useLoadFlow(_id: string) {
  const [data] = useState<unknown>(null);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  // TODO: Implement actual load via storage package
  // For now, return mock data
  return {
    data,
    isLoading,
    error,
  };
}

/**
 * Hook for listing flows - placeholder until storage is properly integrated
 */
export function useFlowList() {
  const [data] = useState<unknown[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  // TODO: Implement actual list via storage package
  // For now, return empty list
  return {
    data,
    isLoading,
    error,
  };
}

/**
 * Original useFlow hook - now using conductor for execution
 */
export function useFlow() {
  const [state, setState] = useState<FlowExecutionState>({
    isExecuting: false,
    error: null,
    result: null,
  });

  const runFlow = useCallback(async (flow: NodeDefinition) => {
    setState({ isExecuting: true, error: null, result: null });

    try {
      const result = await conductor.node.run(flow);
      setState({
        isExecuting: false,
        error: null,
        result,
      });
      return result;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      setState({
        isExecuting: false,
        error: errorObj,
        result: null,
      });
      throw errorObj;
    }
  }, []);

  const resetFlow = useCallback(() => {
    setState({ isExecuting: false, error: null, result: null });
  }, []);

  return {
    runFlow,
    resetFlow,
    isExecuting: state.isExecuting,
    error: state.error,
    result: state.result,
  };
}

export default useFlow;
