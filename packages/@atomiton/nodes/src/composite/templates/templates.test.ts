import { describe, it, expect, beforeAll } from 'vitest';
import {
  TEMPLATE_IDS,
  compositeTemplates,
  getCompositeTemplate,
  getAllCompositeTemplates,
  getTemplatesByTag,
  getTemplatesByDifficulty,
} from './index';
import { fromYaml } from '../transform/fromYaml';
import { COMPOSITE_SCHEMA } from '../schema';

describe('Composite Templates', () => {
  describe('Template Definitions', () => {
    it('should have all expected template IDs', () => {
      expect(TEMPLATE_IDS.HELLO_WORLD).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(TEMPLATE_IDS.DATA_TRANSFORM).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(TEMPLATE_IDS.IMAGE_PROCESSOR).toBe('550e8400-e29b-41d4-a716-446655440003');
    });

    it('should have valid composite templates array', () => {
      expect(compositeTemplates).toBeDefined();
      expect(Array.isArray(compositeTemplates)).toBe(true);
      expect(compositeTemplates.length).toBeGreaterThan(0);
    });

    describe('Template YAML Validation', () => {
      compositeTemplates.forEach(template => {
        describe(`Template: ${template.id}`, () => {
          it('should have valid YAML', () => {
            expect(template.yaml).toBeDefined();
            expect(typeof template.yaml).toBe('string');
            expect(template.yaml.length).toBeGreaterThan(0);
          });

          it('should parse successfully with fromYaml', () => {
            const result = fromYaml(template.yaml);
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.errors).toBeUndefined();
          });

          it('should have valid CompositeDefinition', () => {
            expect(template.definition).toBeDefined();
            expect(template.definition.id).toBe(template.id);
            expect(template.definition.name).toBeDefined();
            expect(template.definition.type).toBe('composite');
            expect(template.definition.category).toBeDefined();
          });

          it('should validate against CompositeDefinitionSchema', () => {
            const validation = COMPOSITE_SCHEMA.safeParse(template.definition);
            if (!validation.success) {
              console.error(`Validation errors for ${template.id}:`, validation.error.errors);
            }
            expect(validation.success).toBe(true);
          });

          it('should have required metadata', () => {
            expect(template.tags).toBeDefined();
            expect(Array.isArray(template.tags)).toBe(true);
            expect(template.tags.length).toBeGreaterThan(0);
            expect(template.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
          });

          it('should have nodes and edges arrays', () => {
            expect(Array.isArray(template.definition.nodes)).toBe(true);
            expect(Array.isArray(template.definition.edges)).toBe(true);
          });
        });
      });
    });
  });

  describe('Template Retrieval Functions', () => {
    describe('getCompositeTemplate', () => {
      it('should return template by ID', () => {
        const helloWorld = getCompositeTemplate(TEMPLATE_IDS.HELLO_WORLD);
        expect(helloWorld).toBeDefined();
        expect(helloWorld?.id).toBe(TEMPLATE_IDS.HELLO_WORLD);
        expect(helloWorld?.definition.name).toContain('Hello World');
      });

      it('should return undefined for non-existent ID', () => {
        const nonExistent = getCompositeTemplate('non-existent-id');
        expect(nonExistent).toBeUndefined();
      });
    });

    describe('getAllCompositeTemplates', () => {
      it('should return all templates', () => {
        const allTemplates = getAllCompositeTemplates();
        expect(allTemplates).toEqual(compositeTemplates);
        expect(allTemplates.length).toBe(3);
      });
    });

    describe('getTemplatesByTag', () => {
      it('should return templates with specific tag', () => {
        const exampleTemplates = getTemplatesByTag('example');
        expect(exampleTemplates.length).toBeGreaterThan(0);
        expect(exampleTemplates.every(t => t.tags.includes('example'))).toBe(true);
      });

      it('should return templates with data tag', () => {
        const dataTemplates = getTemplatesByTag('data');
        expect(dataTemplates.length).toBeGreaterThan(0);
        expect(dataTemplates.every(t => t.tags.includes('data'))).toBe(true);
      });

      it('should handle case-insensitive tags', () => {
        const upperCaseResults = getTemplatesByTag('EXAMPLE');
        const lowerCaseResults = getTemplatesByTag('example');
        expect(upperCaseResults).toEqual(lowerCaseResults);
      });

      it('should return empty array for non-existent tag', () => {
        const noTemplates = getTemplatesByTag('non-existent-tag');
        expect(noTemplates).toEqual([]);
      });
    });

    describe('getTemplatesByDifficulty', () => {
      it('should return beginner templates', () => {
        const beginnerTemplates = getTemplatesByDifficulty('beginner');
        expect(beginnerTemplates.length).toBeGreaterThan(0);
        expect(beginnerTemplates.every(t => t.difficulty === 'beginner')).toBe(true);
      });

      it('should return intermediate templates', () => {
        const intermediateTemplates = getTemplatesByDifficulty('intermediate');
        expect(intermediateTemplates.length).toBeGreaterThan(0);
        expect(intermediateTemplates.every(t => t.difficulty === 'intermediate')).toBe(true);
      });

      it('should return advanced templates', () => {
        const advancedTemplates = getTemplatesByDifficulty('advanced');
        expect(advancedTemplates.length).toBeGreaterThan(0);
        expect(advancedTemplates.every(t => t.difficulty === 'advanced')).toBe(true);
      });
    });
  });

  describe('Template Content Validation', () => {
    describe('Hello World Template', () => {
      let template: typeof compositeTemplates[0] | undefined;

      beforeAll(() => {
        template = getCompositeTemplate(TEMPLATE_IDS.HELLO_WORLD);
      });

      it('should have correct metadata', () => {
        expect(template).toBeDefined();
        expect(template?.definition.category).toBe('tutorial');
        expect(template?.difficulty).toBe('beginner');
        expect(template?.tags).toContain('example');
        expect(template?.tags).toContain('beginner');
      });
    });

    describe('Data Transform Template', () => {
      let template: typeof compositeTemplates[0] | undefined;

      beforeAll(() => {
        template = getCompositeTemplate(TEMPLATE_IDS.DATA_TRANSFORM);
      });

      it('should have correct metadata', () => {
        expect(template).toBeDefined();
        expect(template?.definition.category).toBe('data');
        expect(template?.difficulty).toBe('intermediate');
        expect(template?.tags).toContain('data');
        expect(template?.tags).toContain('transform');
      });
    });

    describe('Image Processor Template', () => {
      let template: typeof compositeTemplates[0] | undefined;

      beforeAll(() => {
        template = getCompositeTemplate(TEMPLATE_IDS.IMAGE_PROCESSOR);
      });

      it('should have correct metadata', () => {
        expect(template).toBeDefined();
        expect(template?.definition.category).toBe('media');
        expect(template?.difficulty).toBe('advanced');
        expect(template?.tags).toContain('image');
        expect(template?.tags).toContain('processing');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed YAML gracefully', () => {
      const malformedYaml = `
        invalid: yaml: content
        :::: bad
      `;

      const result = fromYaml(malformedYaml);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it('should handle missing required fields', () => {
      const incompleteYaml = `
        id: test-id
        name: Test Template
        # missing type and category
      `;

      const result = fromYaml(incompleteYaml);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});