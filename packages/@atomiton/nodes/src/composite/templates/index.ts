import { fromYaml } from "../transform/fromYaml";
import type { CompositeDefinition } from "../types";
import { validateNodeTypesStrict } from "../validation/validateNodeTypes";
// @ts-expect-error - Vite will handle these raw imports
import dataTransformYaml from "./data-transform.yaml?raw";
// @ts-expect-error - Vite will handle these raw imports
import helloWorldYaml from "./hello-world.yaml?raw";
// @ts-expect-error - Vite will handle these raw imports
import imageProcessorYaml from "./image-processor.yaml?raw";

/**
 * Template IDs using deterministic UUIDs for consistency
 */
export const TEMPLATE_IDS = {
  HELLO_WORLD: "550e8400-e29b-41d4-a716-446655440001",
  DATA_TRANSFORM: "550e8400-e29b-41d4-a716-446655440002",
  IMAGE_PROCESSOR: "550e8400-e29b-41d4-a716-446655440003",
} as const;

/**
 * Parse and validate template YAML
 */
function parseTemplate(yaml: string, id: string): CompositeDefinition {
  const result = fromYaml(yaml);
  if (!result.success || !result.data) {
    const errorMessages = result.errors
      ?.map((e) => (typeof e === "string" ? e : JSON.stringify(e)))
      .join(", ");
    throw new Error(`Failed to parse template ${id}: ${errorMessages}`);
  }

  const composite: CompositeDefinition = {
    ...result.data,
    id,
  };

  // Validate that all node types in the template are registered
  if (composite.nodes && composite.nodes.length > 0) {
    try {
      validateNodeTypesStrict(composite.nodes);
    } catch (error) {
      throw new Error(
        `Invalid node types in template ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return composite;
}

/**
 * Predefined composite templates
 */
export const templates: CompositeDefinition[] = [
  parseTemplate(helloWorldYaml, TEMPLATE_IDS.HELLO_WORLD),
  parseTemplate(dataTransformYaml, TEMPLATE_IDS.DATA_TRANSFORM),
  parseTemplate(imageProcessorYaml, TEMPLATE_IDS.IMAGE_PROCESSOR),
];

/**
 * Template wrapper type for testing and backwards compatibility
 */
export type TemplateWithDefinition = {
  definition: CompositeDefinition;
};

/**
 * Get all templates in the format expected by tests
 * Returns templates wrapped with a definition property for compatibility
 */
export function getAllTemplates(): TemplateWithDefinition[] {
  return templates.map((template) => ({
    definition: template,
  }));
}
