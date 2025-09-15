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
import { blueprintStore } from "../store";
import type { Blueprint } from "../types";

/**
 * Convert a CompositeTemplate to a Blueprint
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

  // Add UI metadata
  return Object.assign(compositeNode, {
    content: template.yaml,
    lastModified: new Date().toISOString(),
    tags: template.tags,
    author: "Atomiton Team",
    isPublic: true,
    isTemplate: true, // Mark as read-only template
  });
}

/**
 * Initialize the blueprint store with all available templates
 */
export function initializeTemplates(): void {
  try {
    const templates = getAllCompositeTemplates();
    console.log(`Initializing ${templates.length} templates...`);

    if (!templates || templates.length === 0) {
      console.error("No templates found from getAllCompositeTemplates()");
      return;
    }

    // Batch process templates to avoid rapid setState calls
    const currentBlueprints = blueprintStore.getState().blueprints;
    const newBlueprints: Blueprint[] = [];

    templates.forEach((template) => {
      try {
        // Check if template already exists in store
        const existingBlueprint = currentBlueprints.find(
          (bp) => bp.id === template.id,
        );

        if (!existingBlueprint) {
          // Convert template to blueprint
          const blueprint = templateToBlueprint(template);
          console.log(
            `Preparing template: ${template.id} - ${template.definition.name}`,
          );
          newBlueprints.push(blueprint);
        } else {
          console.log(`Template already exists: ${template.id}`);
        }
      } catch (error) {
        console.error(`Failed to prepare template ${template.id}:`, error);
      }
    });

    // Add all new blueprints in a single setState call
    if (newBlueprints.length > 0) {
      blueprintStore.setState((state) => {
        state.blueprints.push(...newBlueprints);
        state.error = null;
      });
      console.log(`Added ${newBlueprints.length} new templates to store`);
    }

    const finalBlueprints = blueprintStore.getState().blueprints;
    console.log(
      `Templates initialized. Current blueprints count: ${finalBlueprints.length}`,
    );
    console.log(
      "Current blueprints:",
      finalBlueprints.map((b) => ({
        id: b.id,
        name: b.name,
        hasInputPorts: !!b.inputPorts,
        hasOutputPorts: !!b.outputPorts,
      })),
    );
  } catch (error) {
    console.error("Failed to initialize templates:", error);
  }
}

/**
 * Load templates by tag
 */
export function loadTemplatesByTag(tag: string): void {
  const templates = getTemplatesByTag(tag);

  templates.forEach((template) => {
    const blueprint = templateToBlueprint(template);
    blueprintStore.createBlueprint(blueprint);
  });
}

/**
 * Load templates by difficulty
 */
export function loadTemplatesByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced",
): void {
  const templates = getTemplatesByDifficulty(difficulty);

  templates.forEach((template) => {
    const blueprint = templateToBlueprint(template);
    blueprintStore.createBlueprint(blueprint);
  });
}
