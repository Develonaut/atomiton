/**
 * useAsync Hook - Async data fetching with loading, error, and data states
 *
 * Provides a clean interface for async operations with:
 * - Loading states
 * - Error handling
 * - Data caching
 * - Automatic retries
 * - Request deduplication
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
}

export interface UseAsyncOptions {
  // Auto-execute on mount
  executeOnMount?: boolean;
  // Dedupe requests within this window (ms)
  dedupingInterval?: number;
  // Dependencies that trigger re-execution
  dependencies?: unknown[];
  // Retry configuration
  retry?: number;
  retryDelay?: number;
  // Keep previous data while revalidating
  keepPreviousData?: boolean;
}

export interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
  mutate: (data: T | ((current: T | undefined) => T)) => void;
}

/**
 * Hook for async operations with loading, error, and data states
 */
export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: UseAsyncOptions = {},
): UseAsyncReturn<T> {
  const {
    executeOnMount = true,
    dedupingInterval = 2000,
    dependencies = [],
    retry = 0,
    retryDelay = 1000,
    keepPreviousData = false,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
  });

  // Track in-flight requests for deduplication
  const activeRequestRef = useRef<Promise<T> | null>(null);
  const lastExecuteTime = useRef<number>(0);
  const mountedRef = useRef(true);
  const executeCount = useRef(0);

  // Execute the async function
  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      const now = Date.now();
      const executeId = ++executeCount.current;

      // Dedupe if there's an active request within the interval
      if (
        activeRequestRef.current &&
        now - lastExecuteTime.current < dedupingInterval
      ) {
        return activeRequestRef.current;
      }

      // Create the async operation with retries
      const operation = async (): Promise<T> => {
        let lastError: Error;
        let attempts = 0;

        while (attempts <= retry) {
          try {
            // Set loading state
            if (mountedRef.current && executeId === executeCount.current) {
              setState((prev) => ({
                ...prev,
                isLoading: !prev.data,
                isValidating: !!prev.data,
                error: undefined,
                ...(keepPreviousData ? {} : { data: prev.data }),
              }));
            }

            // Execute the async function
            const result = await asyncFunction(...args);

            // Update state with result
            if (mountedRef.current && executeId === executeCount.current) {
              setState({
                data: result,
                error: undefined,
                isLoading: false,
                isValidating: false,
              });
            }

            return result;
          } catch (error) {
            lastError =
              error instanceof Error ? error : new Error(String(error));
            attempts++;

            // If we have retries left, wait and try again
            if (attempts <= retry) {
              await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * Math.pow(2, attempts - 1)),
              );
            }
          }
        }

        // All retries exhausted
        if (mountedRef.current && executeId === executeCount.current) {
          setState((prev) => ({
            ...prev,
            error: lastError!,
            isLoading: false,
            isValidating: false,
            ...(keepPreviousData ? {} : { data: undefined }),
          }));
        }

        throw lastError!;
      };

      // Store the promise and execute
      lastExecuteTime.current = now;
      activeRequestRef.current = operation();

      try {
        const result = await activeRequestRef.current;
        return result;
      } finally {
        // Clear the active request
        if (activeRequestRef.current === operation) {
          activeRequestRef.current = null;
        }
      }
    },
    [asyncFunction, dedupingInterval, retry, retryDelay, keepPreviousData],
  );

  // Reset state
  const reset = useCallback(() => {
    executeCount.current++;
    setState({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
    });
  }, []);

  // Mutate data directly
  const mutate = useCallback((data: T | ((current: T | undefined) => T)) => {
    setState((prev) => ({
      ...prev,
      data:
        typeof data === "function"
          ? (data as (current: T | undefined) => T)(prev.data)
          : data,
      error: undefined,
    }));
  }, []);

  // Execute on mount if requested
  useEffect(() => {
    if (executeOnMount) {
      execute().catch(() => {
        // Error is handled in state
      });
    }
  }, [executeOnMount, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    mutate,
  };
}

/**
 * Create a typed async hook for a specific service
 */
export function createAsyncHook<T, Args extends unknown[] = []>(
  fetcher: (...args: Args) => Promise<T>,
) {
  return (options?: UseAsyncOptions) => {
    return useAsync(fetcher, options);
  };
}

/**
 * Hook for lazy async operations (manual trigger only)
 */
export function useAsyncCallback<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: Omit<UseAsyncOptions, "executeOnMount"> = {},
): UseAsyncReturn<T> {
  return useAsync(asyncFunction, {
    ...options,
    executeOnMount: false,
  });
}
