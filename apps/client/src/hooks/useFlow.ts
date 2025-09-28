/**
 * Flow execution hooks using the new Conductor API
 * Provides compatibility layer for components using the old tRPC hooks
 */

import conductor from "#lib/conductor";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useState, useCallback } from "react";

export interface FlowExecutionState {
  isExecuting: boolean;
  error: Error | null;
  result: any | null;
}

/**
 * Hook for executing flows - compatible with tRPC mutation pattern
 */
export function useExecuteFlow() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const mutate = useCallback(
    async ({
      executable,
      context,
    }: {
      executable: NodeDefinition | any;
      context?: any;
    }) => {
      setIsPending(true);
      setError(null);

      try {
        // Use the new conductor.node.run() API
        const result = await conductor.node.run(executable, context);

        setData(result);
        setIsPending(false);

        // Call onSuccess if provided
        console.log("Execution complete:", result);

        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsPending(false);

        // Call onError if provided
        console.error("Execution failed:", errorObj);

        throw errorObj;
      }
    },
    [],
  );

  return {
    mutate,
    isPending,
    error,
    data,
  };
}

/**
 * Hook for saving flows - placeholder until storage is properly integrated
 */
export function useSaveFlow() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (flow: any) => {
    setIsPending(true);
    setError(null);

    try {
      // TODO: Implement actual save via storage package
      // For now, just log and simulate success
      console.log("Saving flow:", flow);

      // Simulate async save
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsPending(false);
      console.log("Flow saved successfully");

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
  };
}

/**
 * Hook for loading a flow by ID - placeholder until storage is properly integrated
 */
export function useLoadFlow(id: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // TODO: Implement actual list via storage package
  // For now, return empty list
  return {
    data,
    isLoading,
    error,
  };
}

/**
 * Original useFlow hook for backward compatibility
 */
export function useFlow() {
  const [state, setState] = useState<FlowExecutionState>({
    isExecuting: false,
    error: null,
    result: null,
  });

  const executeFlow = useCallback(async (flow: NodeDefinition) => {
    setState({ isExecuting: true, error: null, result: null });

    try {
      // Use the new conductor.node.run() API
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
    executeFlow,
    resetFlow,
    isExecuting: state.isExecuting,
    error: state.error,
    result: state.result,
  };
}

export default useFlow;
