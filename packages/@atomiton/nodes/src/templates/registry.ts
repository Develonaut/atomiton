import type { NodeDefinition } from "#core/types/definition";
import { loadTemplate } from "#templates/loader";

// Import YAML content as strings (will be handled by build system)
// @ts-expect-error - Vite will handle these raw imports
import helloWorldYaml from "#templates/flows/hello-world.flow.yaml?raw";
// @ts-expect-error - Vite will handle these raw imports
import dataTransformYaml from "#templates/flows/data-transform.flow.yaml?raw";
// @ts-expect-error - Vite will handle these raw imports
import imageProcessorYaml from "#templates/flows/image-processor.flow.yaml?raw";

/**
 * Template registry - simple array of templates
 */
export const templates: NodeDefinition[] = [];

/**
 * Template loading state
 */
let templatesLoaded = false;

/**
 * Load built-in templates from YAML files
 */
export async function loadBuiltInTemplates(): Promise<void> {
  if (templatesLoaded) {
    return; // Already loaded
  }

  try {
    // Load all built-in templates
    const helloWorld = await loadTemplate(helloWorldYaml);
    const dataTransform = await loadTemplate(dataTransformYaml);
    const imageProcessor = await loadTemplate(imageProcessorYaml);

    // Clear existing templates and add new ones
    templates.length = 0;
    templates.push(helloWorld, dataTransform, imageProcessor);

    templatesLoaded = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load built-in templates: ${message}`);
  }
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): NodeDefinition | undefined {
  return templates.find((t) => t.id === id);
}

/**
 * Get all templates
 */
export function getAllTemplates(): NodeDefinition[] {
  return [...templates];
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): NodeDefinition[] {
  return templates.filter((t) => t.metadata?.category === category);
}

/**
 * Get templates by tag
 */
export function getTemplatesByTag(tag: string): NodeDefinition[] {
  return templates.filter((t) => t.metadata?.tags?.includes(tag));
}

/**
 * Get templates by keyword search
 */
export function searchTemplates(query: string): NodeDefinition[] {
  const lowerQuery = query.toLowerCase();

  return templates.filter((template) => {
    const name = template.name?.toLowerCase() || "";
    const description = template.metadata?.description?.toLowerCase() || "";
    const keywords = template.metadata?.keywords?.join(" ").toLowerCase() || "";
    const tags = template.metadata?.tags?.join(" ").toLowerCase() || "";

    return (
      name.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      keywords.includes(lowerQuery) ||
      tags.includes(lowerQuery)
    );
  });
}

/**
 * Get all template IDs
 */
export function getTemplateIds(): string[] {
  return templates.map((t) => t.id);
}

/**
 * Check if template exists
 */
export function hasTemplate(id: string): boolean {
  return templates.some((t) => t.id === id);
}

/**
 * Add template to registry
 */
export function addTemplate(template: NodeDefinition): void {
  if (!template.nodes || template.nodes.length === 0) {
    throw new Error("Only nodes with nodes can be added as templates");
  }

  // Remove existing template with same ID
  const existingIndex = templates.findIndex((t) => t.id === template.id);
  if (existingIndex !== -1) {
    templates.splice(existingIndex, 1);
  }

  templates.push(template);
}

/**
 * Remove template from registry
 */
export function removeTemplate(id: string): boolean {
  const index = templates.findIndex((t) => t.id === id);
  if (index !== -1) {
    templates.splice(index, 1);
    return true;
  }
  return false;
}
