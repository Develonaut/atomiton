import { useHover } from "@atomiton/hooks";
import { useCallback } from "react";
import { useRouter } from "../index";
import type { NavigateOptions } from "@atomiton/router";

export type UseLinkOptions = {
  preloadDelay?: number;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void | Promise<void>;
};

export function useLink(to: NavigateOptions, options?: UseLinkOptions) {
  const router = useRouter();
  const { preloadDelay = 0, disabled = false, onClick } = options || {};

  const doPreload = useCallback(() => {
    router.preloadRoute(to as any).catch(console.warn);
  }, [router, to]);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      if (disabled) return;

      if (onClick) {
        await onClick(e);
      }

      if (!e.defaultPrevented) {
        router.navigate(to as any);
      }
    },
    [router, to, disabled, onClick],
  );

  const { handleMouseEnter, handleMouseLeave } = useHover({
    delay: preloadDelay,
    disabled,
    onEnter: doPreload,
  });

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    disabled: !!disabled,
  };
}
