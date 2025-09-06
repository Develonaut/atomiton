import type { SystemProps } from "../types";
import { systemPropsMap } from "../constants/systemPropsMap";

export function extractSystemProps<T extends Record<string, unknown>>(
  props: T,
): {
  systemClasses: string[];
  restProps: Omit<T, keyof SystemProps>;
} {
  const systemClasses: string[] = [];
  const restProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;

    // Check if it's a system prop
    if (key in systemPropsMap) {
      const resolver = systemPropsMap[key as keyof SystemProps];
      const className = resolver(value as string | number | boolean);
      if (className) {
        systemClasses.push(className);
      }
    } else {
      // Keep non-system props
      restProps[key] = value;
    }
  }

  return {
    systemClasses,
    restProps: restProps as Omit<T, keyof SystemProps>,
  };
}
