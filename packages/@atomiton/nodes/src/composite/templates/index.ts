/**
 * Composite Node Templates
 *
 * Predefined composite nodes (blueprints) that can be used as starting points
 * or examples. These are fully validated CompositeDefinitions.
 */

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
 * Composite template with metadata
 */
export type CompositeTemplate = {
  id: string;
  definition: CompositeDefinition;
  yaml: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
};

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
export const compositeTemplates: CompositeTemplate[] = [
  {
    id: TEMPLATE_IDS.HELLO_WORLD,
    definition: parseTemplate(helloWorldYaml, TEMPLATE_IDS.HELLO_WORLD),
    yaml: helloWorldYaml,
    tags: ["example", "beginner", "text"],
    difficulty: "beginner",
  },
  {
    id: TEMPLATE_IDS.DATA_TRANSFORM,
    definition: parseTemplate(dataTransformYaml, TEMPLATE_IDS.DATA_TRANSFORM),
    yaml: dataTransformYaml,
    tags: ["data", "transform", "etl"],
    difficulty: "intermediate",
  },
  {
    id: TEMPLATE_IDS.IMAGE_PROCESSOR,
    definition: parseTemplate(imageProcessorYaml, TEMPLATE_IDS.IMAGE_PROCESSOR),
    yaml: imageProcessorYaml,
    tags: ["image", "processing", "media"],
    difficulty: "advanced",
  },
];

/**
 * Get a composite template by ID
 */
export function getCompositeTemplate(
  id: string,
): CompositeTemplate | undefined {
  return compositeTemplates.find((template) => template.id === id);
}

/**
 * Get all composite templates
 */
export function getAllCompositeTemplates(): CompositeTemplate[] {
  return compositeTemplates;
}

/**
 * Get templates by tag
 */
export function getTemplatesByTag(tag: string): CompositeTemplate[] {
  return compositeTemplates.filter((template) =>
    template.tags.includes(tag.toLowerCase()),
  );
}

/**
 * Get templates by difficulty
 */
export function getTemplatesByDifficulty(
  difficulty: CompositeTemplate["difficulty"],
): CompositeTemplate[] {
  return compositeTemplates.filter(
    (template) => template.difficulty === difficulty,
  );
}

// Export aliases for simplified API
export type Template = CompositeTemplate;
export const getAllTemplates = getAllCompositeTemplates;
