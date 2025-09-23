import { fromYaml } from '#serialization/fromYaml';
import type { NodeDefinition } from '#core/types/definition';

/**
 * Load and validate a template from YAML content
 */
export async function loadTemplate(yamlContent: string): Promise<NodeDefinition> {
  // Parse YAML to definition
  const definition = fromYaml(yamlContent);

  // Basic validation
  validateTemplateStructure(definition);

  // Ensure all referenced nodes exist
  validateNodeReferences(definition);

  return definition;
}

/**
 * Validate basic template structure
 */
function validateTemplateStructure(definition: NodeDefinition): void {
  if (!definition.id) {
    throw new Error('Template must have an id');
  }

  if (!definition.name) {
    throw new Error('Template must have a name');
  }

  if (!definition.metadata) {
    throw new Error('Template must have metadata');
  }

  if (!definition.children || definition.children.length === 0) {
    throw new Error('Templates must have children nodes');
  }
}

/**
 * Validate that all edge references point to valid nodes
 */
function validateNodeReferences(definition: NodeDefinition): void {
  if (!definition.children || !definition.edges) {
    return; // No nodes or edges to validate
  }

  const nodeIds = new Set(definition.children.map(n => n.id));

  for (const edge of definition.edges) {
    if (!nodeIds.has(edge.source)) {
      throw new Error(`Edge references unknown source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      throw new Error(`Edge references unknown target node: ${edge.target}`);
    }
  }
}

/**
 * Load template from file path (for Node.js environments)
 */
export async function loadTemplateFromFile(filePath: string): Promise<NodeDefinition> {
  try {
    // In browser environments, this would be imported as a string
    // In Node.js, read from file system
    const fs = await import('fs/promises');
    const yamlContent = await fs.readFile(filePath, 'utf-8');
    return loadTemplate(yamlContent);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load template from ${filePath}: ${message}`);
  }
}