import { describe, it, expect, beforeEach } from 'vitest';
import {
  addTemplate,
  getAllTemplates,
  getTemplate,
  getTemplateIds,
  getTemplatesByCategory,
  getTemplatesByTag,
  hasTemplate,
  removeTemplate,
  searchTemplates,
  templates,
} from './registry.js';
import type { NodeDefinition } from '../core/types/definition.js';

// Mock template for testing
const mockTemplate: NodeDefinition = {
  id: 'test-template',
  name: 'Test Template',
  type: 'composite',
  position: { x: 0, y: 0 },
  metadata: {
    id: 'test-template',
    name: 'Test Template',
    variant: 'composite',
    version: '1.0.0',
    author: 'Test Author',
    description: 'A test template for unit tests',
    category: 'test',
    icon: 'layers',
    tags: ['test', 'example'],
    keywords: ['testing', 'sample'],
    experimental: false,
    deprecated: false,
  },
  parameters: {
    schema: {} as any,
    defaults: {},
    fields: {},
    parse: () => ({}) as any,
    safeParse: () => ({ success: true, data: {} as any }),
    isValid: () => true,
    withDefaults: () => ({}) as any,
  },
  inputPorts: [],
  outputPorts: [],
  children: [],
  edges: [],
};

describe('Template Registry', () => {
  beforeEach(() => {
    // Clear templates before each test
    templates.length = 0;
  });

  describe('addTemplate', () => {
    it('should add template to registry', () => {
      addTemplate(mockTemplate);
      expect(templates).toHaveLength(1);
      expect(templates[0]).toBe(mockTemplate);
    });

    it('should replace existing template with same ID', () => {
      addTemplate(mockTemplate);

      const updatedTemplate = { ...mockTemplate, name: 'Updated Template' };
      addTemplate(updatedTemplate);

      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('Updated Template');
    });

    it('should throw error for non-composite template', () => {
      const atomicTemplate = { ...mockTemplate, type: 'atomic' as const };
      expect(() => addTemplate(atomicTemplate)).toThrow('Only nodes with children can be added as templates');
    });
  });

  describe('getTemplate', () => {
    it('should return template by ID', () => {
      addTemplate(mockTemplate);
      const result = getTemplate('test-template');
      expect(result).toBe(mockTemplate);
    });

    it('should return undefined for non-existent template', () => {
      const result = getTemplate('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllTemplates', () => {
    it('should return empty array when no templates', () => {
      const result = getAllTemplates();
      expect(result).toEqual([]);
    });

    it('should return all templates', () => {
      addTemplate(mockTemplate);
      const result = getAllTemplates();
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockTemplate);
    });

    it('should return copy of templates array', () => {
      addTemplate(mockTemplate);
      const result = getAllTemplates();
      result.push({} as any); // Modify the returned array
      expect(templates).toHaveLength(1); // Original should be unchanged
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates matching category', () => {
      addTemplate(mockTemplate);
      const result = getTemplatesByCategory('test');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockTemplate);
    });

    it('should return empty array for non-matching category', () => {
      addTemplate(mockTemplate);
      const result = getTemplatesByCategory('other');
      expect(result).toEqual([]);
    });
  });

  describe('getTemplatesByTag', () => {
    it('should return templates with matching tag', () => {
      addTemplate(mockTemplate);
      const result = getTemplatesByTag('test');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockTemplate);
    });

    it('should return empty array for non-matching tag', () => {
      addTemplate(mockTemplate);
      const result = getTemplatesByTag('other');
      expect(result).toEqual([]);
    });
  });

  describe('searchTemplates', () => {
    it('should find templates by name', () => {
      addTemplate(mockTemplate);
      const result = searchTemplates('Test');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockTemplate);
    });

    it('should find templates by description', () => {
      addTemplate(mockTemplate);
      const result = searchTemplates('unit tests');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockTemplate);
    });

    it('should find templates by keywords', () => {
      addTemplate(mockTemplate);
      const result = searchTemplates('testing');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockTemplate);
    });

    it('should find templates by tags', () => {
      addTemplate(mockTemplate);
      const result = searchTemplates('example');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockTemplate);
    });

    it('should be case insensitive', () => {
      addTemplate(mockTemplate);
      const result = searchTemplates('TEST');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockTemplate);
    });

    it('should return empty array for no matches', () => {
      addTemplate(mockTemplate);
      const result = searchTemplates('nomatch');
      expect(result).toEqual([]);
    });
  });

  describe('hasTemplate', () => {
    it('should return true for existing template', () => {
      addTemplate(mockTemplate);
      expect(hasTemplate('test-template')).toBe(true);
    });

    it('should return false for non-existent template', () => {
      expect(hasTemplate('non-existent')).toBe(false);
    });
  });

  describe('getTemplateIds', () => {
    it('should return array of template IDs', () => {
      addTemplate(mockTemplate);
      const result = getTemplateIds();
      expect(result).toEqual(['test-template']);
    });

    it('should return empty array when no templates', () => {
      const result = getTemplateIds();
      expect(result).toEqual([]);
    });
  });

  describe('removeTemplate', () => {
    it('should remove template by ID', () => {
      addTemplate(mockTemplate);
      const removed = removeTemplate('test-template');
      expect(removed).toBe(true);
      expect(templates).toHaveLength(0);
    });

    it('should return false for non-existent template', () => {
      const removed = removeTemplate('non-existent');
      expect(removed).toBe(false);
    });
  });
});