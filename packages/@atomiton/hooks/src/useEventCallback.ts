import { useCallback, useRef } from "react";

export function useEventCallback<T extends (...args: unknown[]) => unknown>(
  fn: T,
): T {
  const ref = useRef(fn);
  ref.current = fn;

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, []) as T;
}
