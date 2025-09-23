/**
 * Template System
 *
 * Pre-built composite node workflows that serve as examples and starting points.
 * Templates are stored as YAML for portability and loaded as NodeDefinitions.
 */

// Registry functions
export {
  addTemplate,
  getAllTemplates,
  getTemplate,
  getTemplateIds,
  getTemplatesByCategory,
  getTemplatesByTag,
  hasTemplate,
  loadBuiltInTemplates,
  removeTemplate,
  searchTemplates,
} from './registry.js';

// Loader functions
export { loadTemplate, loadTemplateFromFile } from './loader.js';

// Types
export type { Template, TemplateMetadata } from './types.js';