import { useHover } from "@atomiton/hooks";
import type { NavigateOptions } from "@atomiton/router";
import { useCallback } from "react";
import { useRouter } from "@/router/index";
import type { AppRouteState } from "@/router/types";

export type UseLinkOptions = {
  preloadDelay?: number;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void | Promise<void>;
};

// Extend NavigateOptions to include our custom state
export type AppNavigateOptions = NavigateOptions & {
  state?: AppRouteState;
};

export function useLink(to: AppNavigateOptions, options?: UseLinkOptions) {
  const router = useRouter();
  const { preloadDelay = 0, disabled = false, onClick } = options || {};

  const doPreload = useCallback(() => {
    router.preloadRoute(to).catch(() => {
      if (process.env.NODE_ENV !== "production")
        console.warn(
          `Failed to preload route: ${typeof to === "string" ? to : to.to}`,
        );
    });
  }, [router, to]);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      if (disabled) return;

      if (onClick) {
        await onClick(e);
      }

      if (!e.defaultPrevented) {
        router.navigate(to);
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
