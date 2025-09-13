import type { CompositeDefinition } from "../types";
import { validateComposite } from "./validateComposite";

/**
 * Type guard function to check if data is a valid CompositeDefinition
 */
export function isCompositeDefinition(
  data: unknown,
): data is CompositeDefinition {
  const result = validateComposite(data);
  return result.success;
}
