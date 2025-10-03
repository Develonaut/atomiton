/**
 * Flow Template Loading System
 *
 * Provides access to bundled flow templates (read-only examples).
 * These are separate from user storage - templates are immutable starter examples.
 */

import type { NodeDefinition } from "#core/types/definition";
import { loadTemplate } from "#templates/loader";

// Import YAML templates as raw strings (handled by build system)
// @ts-expect-error - Build system handles raw imports
import helloWorldYaml from "#templates/flows/hello-world.flow.yaml?raw";
// @ts-expect-error - Build system handles raw imports
import dataTransformYaml from "#templates/flows/data-transform.flow.yaml?raw";
// @ts-expect-error - Build system handles raw imports
import imageProcessorYaml from "#templates/flows/image-processor.flow.yaml?raw";

export type FlowTemplate = {
  id: string;
  name: string;
  description?: string;
  filename: string;
  definition: NodeDefinition;
};

/**
 * Metadata for built-in flow templates
 */
const FLOW_TEMPLATES = [
  {
    filename: "hello-world.flow.yaml",
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Hello World Flow",
    yamlContent: helloWorldYaml,
  },
  {
    filename: "data-transform.flow.yaml",
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Data Transform Pipeline",
    yamlContent: dataTransformYaml,
  },
  {
    filename: "image-processor.flow.yaml",
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Image Processing Workflow",
    yamlContent: imageProcessorYaml,
  },
];

/**
 * Load all flow templates
 * Returns metadata for UI display
 */
export async function loadFlowTemplates(): Promise<FlowTemplate[]> {
  const templates = await Promise.all(
    FLOW_TEMPLATES.map(async (template) => {
      const definition = await loadTemplate(template.yamlContent);

      return {
        id: template.id,
        name: template.name,
        description: definition.metadata?.description as string | undefined,
        filename: template.filename,
        definition,
      };
    }),
  );

  return templates;
}

/**
 * Get a specific flow template by ID
 */
export async function getFlowTemplate(
  id: string,
): Promise<NodeDefinition | null> {
  const template = FLOW_TEMPLATES.find((t) => t.id === id);
  if (!template) {
    return null;
  }

  const definition = await loadTemplate(template.yamlContent);
  return definition;
}
