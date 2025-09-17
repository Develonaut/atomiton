import { useCallback, useRef } from "react";

export type UseHoverConfig = {
  delay?: number;
  disabled?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
};

export function useHover(config?: UseHoverConfig) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { delay = 0, disabled = false, onEnter, onLeave } = config || {};

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;

    if (!delay) {
      onEnter?.();
    } else {
      if (timeoutRef.current) return;

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        onEnter?.();
      }, delay);
    }
  }, [disabled, delay, onEnter]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    onLeave?.();
  }, [disabled, onLeave]);

  return { handleMouseEnter, handleMouseLeave };
}
