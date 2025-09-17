import { useEffect } from "react";

export function useDidMount(callback: () => void | (() => void)) {
  useEffect(() => {
    const cleanup = callback();
    if (cleanup) {
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
