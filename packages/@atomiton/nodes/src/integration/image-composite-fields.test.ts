/**
 * Integration tests for image-composite node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { imageCompositeFields } from "#definitions/image-composite/fields";
import { imageCompositeSchema } from "#schemas/image-composite";

describe("Image Composite Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(imageCompositeFields);

      // Should include all fields from imageCompositeSchemaShape
      expect(fieldKeys).toContain("operation");
      expect(fieldKeys).toContain("images");
      expect(fieldKeys).toContain("output");
      expect(fieldKeys).toContain("width");
      expect(fieldKeys).toContain("height");
      expect(fieldKeys).toContain("format");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 11 fields total", () => {
      // 6 image-composite-specific + 5 base fields
      expect(Object.keys(imageCompositeFields)).toHaveLength(11);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(imageCompositeSchema.shape);

      for (const key of schemaKeys) {
        expect(imageCompositeFields[key]).toBeDefined();
        expect(imageCompositeFields[key].controlType).toBeDefined();
        expect(imageCompositeFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(imageCompositeSchema.shape);
      const fieldKeys = Object.keys(imageCompositeFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Operation Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(imageCompositeFields.operation.controlType).toBe("select");
      });

      it("should have custom options with labels (overridden)", () => {
        expect(imageCompositeFields.operation.options).toEqual([
          { value: "overlay", label: "Overlay" },
          { value: "merge", label: "Merge" },
          { value: "composite", label: "Composite" },
          { value: "blend", label: "Blend" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(imageCompositeFields.operation.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(imageCompositeFields.operation.placeholder).toBe(
          "Default: overlay",
        );
      });

      it("should have helpText from schema description", () => {
        expect(imageCompositeFields.operation.helpText).toBe(
          "Type of image composition operation",
        );
      });

      it("should use default value when not provided", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.operation).toBe("overlay");
        }
      });

      it("should validate enum values", () => {
        const validOps = ["overlay", "merge", "composite", "blend"];

        for (const op of validOps) {
          const result = imageCompositeSchema.safeParse({
            operation: op,
            images: ["/path/to/image.png"],
            output: "/path/to/output.png",
          });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid operation", () => {
        const result = imageCompositeSchema.safeParse({
          operation: "combine",
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Images Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(imageCompositeFields.images.controlType).toBe("textarea");
      });

      it("should be required (no default, not optional)", () => {
        expect(imageCompositeFields.images.required).toBe(true);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(imageCompositeFields.images.placeholder).toBe(
          '["/path/to/image1.png", "/path/to/image2.png"]',
        );
      });

      it("should have custom rows (overridden)", () => {
        expect(imageCompositeFields.images.rows).toBe(3);
      });

      it("should have helpText from schema description", () => {
        expect(imageCompositeFields.images.helpText).toBe(
          "Array of image paths or URLs to composite",
        );
      });

      it("should reject missing images", () => {
        const result = imageCompositeSchema.safeParse({
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].path).toContain("images");
        }
      });

      it("should reject empty array", () => {
        const result = imageCompositeSchema.safeParse({
          images: [],
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(false);
      });

      it("should accept array with one or more images", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image1.png", "/path/to/image2.png"],
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(true);
      });

      it("should reject non-string array values", () => {
        const result = imageCompositeSchema.safeParse({
          images: [1, 2, 3],
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Output Field", () => {
      it("should have text control type (auto-derived from string)", () => {
        expect(imageCompositeFields.output.controlType).toBe("text");
      });

      it("should be required (no default, not optional)", () => {
        expect(imageCompositeFields.output.required).toBe(true);
      });

      it("should have helpText from schema description", () => {
        expect(imageCompositeFields.output.helpText).toBe(
          "Output path for the composed image",
        );
      });

      it("should reject missing output", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].path).toContain("output");
        }
      });

      it("should accept valid output paths", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Width Field", () => {
      it("should have number control type (auto-derived)", () => {
        expect(imageCompositeFields.width.controlType).toBe("number");
      });

      it("should be optional (no default, marked optional)", () => {
        expect(imageCompositeFields.width.required).toBe(false);
      });

      it("should have helpText from schema description", () => {
        expect(imageCompositeFields.width.helpText).toBe(
          "Output image width in pixels",
        );
      });

      it("should accept undefined", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.width).toBeUndefined();
        }
      });

      it("should accept positive numbers", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
          width: 1920,
        });

        expect(result.success).toBe(true);
      });

      it("should reject zero", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
          width: 0,
        });

        expect(result.success).toBe(false);
      });

      it("should reject negative numbers", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
          width: -100,
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Height Field", () => {
      it("should have number control type (auto-derived)", () => {
        expect(imageCompositeFields.height.controlType).toBe("number");
      });

      it("should be optional (no default, marked optional)", () => {
        expect(imageCompositeFields.height.required).toBe(false);
      });

      it("should have helpText from schema description", () => {
        expect(imageCompositeFields.height.helpText).toBe(
          "Output image height in pixels",
        );
      });

      it("should accept undefined", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.height).toBeUndefined();
        }
      });

      it("should accept positive numbers", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
          height: 1080,
        });

        expect(result.success).toBe(true);
      });

      it("should reject zero", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
          height: 0,
        });

        expect(result.success).toBe(false);
      });

      it("should reject negative numbers", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
          height: -100,
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Format Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(imageCompositeFields.format.controlType).toBe("select");
      });

      it("should have custom options with labels (overridden)", () => {
        expect(imageCompositeFields.format.options).toEqual([
          { value: "png", label: "PNG" },
          { value: "jpeg", label: "JPEG" },
          { value: "webp", label: "WebP" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(imageCompositeFields.format.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(imageCompositeFields.format.placeholder).toBe("Default: png");
      });

      it("should have helpText from schema description", () => {
        expect(imageCompositeFields.format.helpText).toBe(
          "Output image format",
        );
      });

      it("should use default value when not provided", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.format).toBe("png");
        }
      });

      it("should validate enum values", () => {
        const validFormats = ["png", "jpeg", "webp"];

        for (const format of validFormats) {
          const result = imageCompositeSchema.safeParse({
            images: ["/path/to/image.png"],
            output: "/path/to/output.png",
            format,
          });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid format", () => {
        const result = imageCompositeSchema.safeParse({
          images: ["/path/to/image.png"],
          output: "/path/to/output.png",
          format: "gif",
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(imageCompositeFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(imageCompositeFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(imageCompositeFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultInvalid = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
        timeout: 0,
      });
      expect(resultInvalid.success).toBe(false);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(imageCompositeFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(imageCompositeFields.retries.min).toBe(0);
    });

    it("label field should be auto-derived as optional", () => {
      expect(imageCompositeFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });
    });

    it("description field should be auto-derived as optional", () => {
      expect(imageCompositeFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const field of Object.values(imageCompositeFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const field of Object.values(imageCompositeFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("fields with options should have valid options array", () => {
      const fieldsWithOptions = [
        imageCompositeFields.operation,
        imageCompositeFields.format,
      ];

      for (const field of fieldsWithOptions) {
        if (field.options) {
          expect(Array.isArray(field.options)).toBe(true);
          expect(field.options.length).toBeGreaterThan(0);

          for (const option of field.options) {
            expect(option.value).toBeDefined();
            expect(option.label).toBeDefined();
          }
        }
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.operation).toBe("overlay");
        expect(result.data.format).toBe("png");
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate overlay operation", () => {
      const result = imageCompositeSchema.safeParse({
        operation: "overlay",
        images: ["/path/to/base.png", "/path/to/overlay.png"],
        output: "/path/to/result.png",
      });

      expect(result.success).toBe(true);
    });

    it("should validate merge operation", () => {
      const result = imageCompositeSchema.safeParse({
        operation: "merge",
        images: [
          "/path/to/image1.png",
          "/path/to/image2.png",
          "/path/to/image3.png",
        ],
        output: "/path/to/merged.png",
        format: "jpeg",
      });

      expect(result.success).toBe(true);
    });

    it("should validate with dimensions", () => {
      const result = imageCompositeSchema.safeParse({
        operation: "composite",
        images: ["/path/to/image1.png", "/path/to/image2.png"],
        output: "/path/to/composite.png",
        width: 1920,
        height: 1080,
        format: "webp",
      });

      expect(result.success).toBe(true);
    });

    it("should validate blend operation", () => {
      const result = imageCompositeSchema.safeParse({
        operation: "blend",
        images: ["/path/to/image1.png", "/path/to/image2.png"],
        output: "/path/to/blended.png",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject missing images", () => {
      const result = imageCompositeSchema.safeParse({
        output: "/path/to/output.png",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("images");
      }
    });

    it("should reject empty images array", () => {
      const result = imageCompositeSchema.safeParse({
        images: [],
        output: "/path/to/output.png",
      });

      expect(result.success).toBe(false);
    });

    it("should reject missing output", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("output");
      }
    });

    it("should reject invalid operation", () => {
      const result = imageCompositeSchema.safeParse({
        operation: "combine",
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid format", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
        format: "gif",
      });

      expect(result.success).toBe(false);
    });

    it("should reject zero width", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
        width: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject negative width", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
        width: -100,
      });

      expect(result.success).toBe(false);
    });

    it("should reject zero height", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
        height: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject negative height", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
        height: -100,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = imageCompositeSchema.safeParse({
        images: ["/path/to/image.png"],
        output: "/path/to/output.png",
        retries: -1,
      });

      expect(result.success).toBe(false);
    });
  });
});
