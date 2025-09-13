import type { CompositeDefinition } from "../types.js";
import { validateComposite } from "./validateComposite.js";

/**
 * Type guard function to check if data is a valid CompositeDefinition
 */
export function isCompositeDefinition(
  data: unknown,
): data is CompositeDefinition {
  const result = validateComposite(data);
  return result.success;
}
