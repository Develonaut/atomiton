import type { NodeDefinition } from '#core/types/definition';

/**
 * Templates are just composite node definitions
 * No special type needed - just use NodeDefinition directly
 */
export type Template = NodeDefinition & {
  type: 'composite';
};

/**
 * Additional metadata interface for template information
 */
export type TemplateMetadata = {
  name: string;
  description: string;
  author: string;
  tags: string[];
  keywords: string[];
  category: string;
  version: string;
}