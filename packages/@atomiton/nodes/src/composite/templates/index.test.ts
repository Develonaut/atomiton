import { beforeAll, describe, expect, it } from "vitest";
import { createCompositeNode } from "../createCompositeNode";
import { fromYaml } from "../transform/fromYaml";
import {
  getAllCompositeTemplates,
  getCompositeTemplate,
  getTemplatesByDifficulty,
  getTemplatesByTag,
  TEMPLATE_IDS,
  type CompositeTemplate,
} from "./index";

describe("Composite Templates", () => {
  let templates: CompositeTemplate[];

  beforeAll(() => {
    templates = getAllCompositeTemplates();
  });

  describe("Template Loading", () => {
    it("should load all templates", () => {
      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.length).toBe(3); // We have 3 templates defined
    });

    it("should have valid template IDs", () => {
      expect(templates[0].id).toBe(TEMPLATE_IDS.HELLO_WORLD);
      expect(templates[1].id).toBe(TEMPLATE_IDS.DATA_TRANSFORM);
      expect(templates[2].id).toBe(TEMPLATE_IDS.IMAGE_PROCESSOR);
    });

    it("should have valid YAML content for each template", () => {
      templates.forEach((template) => {
        expect(template.yaml).toBeDefined();
        expect(template.yaml.length).toBeGreaterThan(0);
        // YAML uses quotes around the value
        expect(template.yaml).toContain('type: "composite"');
      });
    });
  });

  describe("YAML Parsing", () => {
    it("should successfully parse all template YAML files", () => {
      templates.forEach((template) => {
        const result = fromYaml(template.yaml);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
      });
    });

    it("should create valid CompositeDefinitions from YAML", () => {
      templates.forEach((template) => {
        expect(template.definition).toBeDefined();
        expect(template.definition.name).toBeDefined();
        expect(template.definition.type).toBe("composite");
        expect(template.definition.nodes).toBeDefined();
        expect(Array.isArray(template.definition.nodes)).toBe(true);
        expect(template.definition.edges).toBeDefined();
        expect(Array.isArray(template.definition.edges)).toBe(true);
      });
    });

    it("should have valid edge format (nodeId/portId)", () => {
      templates.forEach((template) => {
        template.definition.edges?.forEach((edge) => {
          expect(edge.source).toBeDefined();
          expect(edge.source.nodeId).toBeDefined();
          expect(edge.source.portId).toBeDefined();
          expect(edge.target).toBeDefined();
          expect(edge.target.nodeId).toBeDefined();
          expect(edge.target.portId).toBeDefined();
        });
      });
    });
  });

  describe("Composite Node Creation", () => {
    it("should create valid ICompositeNode from each template", () => {
      templates.forEach((template) => {
        const node = createCompositeNode({
          id: template.id,
          name: template.definition.name,
          description: template.definition.description || "",
          category: template.definition.category || "blueprints",
          nodes: template.definition.nodes || [],
          edges: template.definition.edges || [],
          variables: template.definition.variables,
          settings: template.definition.settings,
        });

        expect(node).toBeDefined();
        expect(node.id).toBe(template.id);
        expect(node.type).toBe("composite");
        expect(node.name).toBe(template.definition.name);

        // Check that ports are properly initialized as arrays
        expect(Array.isArray(node.inputPorts)).toBe(true);
        expect(Array.isArray(node.outputPorts)).toBe(true);

        // Check that we can get child nodes and edges through methods
        const childNodes = node.getChildNodes();
        const executionFlow = node.getExecutionFlow();
        expect(childNodes).toBeDefined();
        expect(Array.isArray(childNodes)).toBe(true);
        expect(executionFlow).toBeDefined();
        expect(Array.isArray(executionFlow)).toBe(true);
      });
    });

    it("should have iterable inputPorts and outputPorts", () => {
      templates.forEach((template) => {
        const node = createCompositeNode({
          id: template.id,
          name: template.definition.name,
          description: template.definition.description || "",
          category: template.definition.category || "blueprints",
          nodes: template.definition.nodes || [],
          edges: template.definition.edges || [],
          variables: template.definition.variables,
          settings: template.definition.settings,
        });

        // Test that we can iterate over ports
        let inputPortCount = 0;
        for (const port of node.inputPorts) {
          inputPortCount++;
          expect(port).toBeDefined();
        }

        let outputPortCount = 0;
        for (const port of node.outputPorts) {
          outputPortCount++;
          expect(port).toBeDefined();
        }

        // At least verify the iteration worked
        expect(inputPortCount).toBeGreaterThanOrEqual(0);
        expect(outputPortCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Template Getters", () => {
    it("should get template by ID", () => {
      const helloWorld = getCompositeTemplate(TEMPLATE_IDS.HELLO_WORLD);
      expect(helloWorld).toBeDefined();
      expect(helloWorld?.id).toBe(TEMPLATE_IDS.HELLO_WORLD);
      expect(helloWorld?.definition.name).toBe("Hello World");
    });

    it("should get templates by tag", () => {
      const beginnerTemplates = getTemplatesByTag("beginner");
      expect(beginnerTemplates.length).toBeGreaterThan(0);
      expect(beginnerTemplates[0].tags).toContain("beginner");

      const dataTemplates = getTemplatesByTag("data");
      expect(dataTemplates.length).toBeGreaterThan(0);
      expect(dataTemplates[0].tags).toContain("data");
    });

    it("should get templates by difficulty", () => {
      const beginnerTemplates = getTemplatesByDifficulty("beginner");
      expect(beginnerTemplates.length).toBeGreaterThan(0);
      expect(beginnerTemplates[0].difficulty).toBe("beginner");

      const intermediateTemplates = getTemplatesByDifficulty("intermediate");
      expect(intermediateTemplates.length).toBeGreaterThan(0);
      expect(intermediateTemplates[0].difficulty).toBe("intermediate");

      const advancedTemplates = getTemplatesByDifficulty("advanced");
      expect(advancedTemplates.length).toBeGreaterThan(0);
      expect(advancedTemplates[0].difficulty).toBe("advanced");
    });
  });

  describe("Template Metadata", () => {
    it("should have proper metadata for each template", () => {
      templates.forEach((template) => {
        expect(template.tags).toBeDefined();
        expect(Array.isArray(template.tags)).toBe(true);
        expect(template.tags.length).toBeGreaterThan(0);
        expect(template.difficulty).toBeDefined();
        expect(["beginner", "intermediate", "advanced"]).toContain(
          template.difficulty,
        );
      });
    });
  });
});
