/**
 * Initialize Blueprint Store with Composite Templates
 *
 * Loads all composite templates from the nodes package into the blueprint store
 */

import {
  createCompositeNode,
  getAllCompositeTemplates,
  getTemplatesByDifficulty,
  getTemplatesByTag,
  type CompositeTemplate,
} from "@atomiton/nodes";
import type { BaseStore, Blueprint } from "../types";
import { compositeNodeToBlueprint } from "../types";

/**
 * Convert a CompositeTemplate to a serializable Blueprint
 */
function templateToBlueprint(template: CompositeTemplate): Blueprint {
  // Create a proper composite node from the template
  // IMPORTANT: Pass the template ID to preserve it
  const compositeNode = createCompositeNode({
    id: template.id, // Use template.id, not template.definition.id
    name: template.definition.name,
    description: template.definition.description || "",
    category: template.definition.category || "blueprints",
    nodes: template.definition.nodes || [],
    edges: template.definition.edges || [],
    settings: template.definition.settings,
  });

  // Convert to serializable format
  const blueprint = compositeNodeToBlueprint(compositeNode);

  // Add UI metadata
  return {
    ...blueprint,
    content: template.yaml,
    lastModified: new Date().toISOString(),
    author: "Atomiton Team",
    isPublic: true,
    isTemplate: true, // Mark as read-only template
  };
}

/**
 * Initialize templates - returns array of templates for initial state
 */
export function initializeTemplates(): Blueprint[] {
  try {
    const templates = getAllCompositeTemplates();
    console.log(`Initializing ${templates.length} templates...`);

    if (!templates || templates.length === 0) {
      console.error("No templates found from getAllCompositeTemplates()");
      return [];
    }

    const blueprintTemplates = templates
      .map((template) => {
        try {
          const blueprint = templateToBlueprint(template);
          console.log(
            `Preparing template: ${template.id} - ${template.definition.name}`,
          );
          return blueprint;
        } catch (error) {
          console.error(`Failed to prepare template ${template.id}:`, error);
          return null;
        }
      })
      .filter(Boolean) as Blueprint[];

    console.log(`Initialized ${blueprintTemplates.length} templates`);
    return blueprintTemplates;
  } catch (error) {
    console.error("Failed to initialize templates:", error);
    return [];
  }
}

/**
 * Load templates by tag
 */
export function loadTemplatesByTag(store: BaseStore, tag: string): void {
  const templates = getTemplatesByTag(tag);

  templates.forEach((template) => {
    const blueprint = templateToBlueprint(template);
    const newTemplates = [blueprint];
    store.setState((state) => {
      state.templates.push(...newTemplates);
    });
  });
}

/**
 * Load templates by difficulty
 */
export function loadTemplatesByDifficulty(
  store: BaseStore,
  difficulty: "beginner" | "intermediate" | "advanced",
): void {
  const templates = getTemplatesByDifficulty(difficulty);

  templates.forEach((template) => {
    const blueprint = templateToBlueprint(template);
    const newTemplates = [blueprint];
    store.setState((state) => {
      state.templates.push(...newTemplates);
    });
  });
}
