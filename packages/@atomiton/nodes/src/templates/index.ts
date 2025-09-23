/**
 * Template System
 *
 * Pre-built group node workflows that serve as examples and starting points.
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
} from '#templates/registry';

// Loader functions
export { loadTemplate, loadTemplateFromFile } from '#templates/loader';

// Types
export type { Template, TemplateMetadata } from '#templates/types';