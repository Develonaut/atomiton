import { yaml } from "@atomiton/yaml";
import type {
  CompositeDefinition,
  CompositeValidationContext,
  TransformationOptions,
  TransformationResult,
  ValidationError,
} from "../types";
import { validateComposite } from "../validation/index";
import { DEFAULT_TRANSFORMATION_OPTIONS } from "./constants";

/**
 * Convert CompositeDefinition JSON to YAML string
 * Intelligently picks only the properties that belong in a CompositeDefinition
 * and ignores any extra properties (like React Flow props)
 */
export function toYaml(
  composite: unknown,
  options: TransformationOptions = {},
  validationContext?: CompositeValidationContext,
): TransformationResult<string> {
  // Default to no validation for resilience - let caller opt-in to validation
  const opts = {
    ...DEFAULT_TRANSFORMATION_OPTIONS,
    validateResult: false, // Override default to be resilient
    ...options,
  };
  const warnings: ValidationError[] = [];

  try {
    // Pick only the properties we care about, ignore everything else
    const comp = composite as any;
    const cleanComposite: CompositeDefinition = {
      // Required Node fields
      id: comp.id,
      type: comp.type || "composite",
      name: comp.name,

      // Required fields with defaults if missing
      category: comp.category || "user",
      metadata: comp.metadata || {
        source: "user",
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      },

      // Optional Node fields - only include if they exist
      ...(comp.version && { version: comp.version }),
      ...(comp.description && { description: comp.description }),
      ...(comp.icon && { icon: comp.icon }),
      ...(comp.parameters && { parameters: comp.parameters }),
      ...(comp.inputs && { inputs: comp.inputs }),
      ...(comp.outputs && { outputs: comp.outputs }),

      // Clean nodes - pick only known properties
      nodes: (comp?.nodes || []).map((node: any) => ({
        id: node.id,
        type: node.type,
        position: node.position || { x: 0, y: 0 },
        ...(node.data && { data: node.data }),
        ...(node.width && { width: node.width }),
        ...(node.height && { height: node.height }),
        ...(node.parentId && { parentId: node.parentId }),
        ...(node.dragHandle && { dragHandle: node.dragHandle }),
        ...(node.style && { style: node.style }),
        ...(node.className && { className: node.className }),
      })),

      // Clean edges - pick only known properties
      edges: (comp?.edges || []).map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        ...(edge.sourceHandle && { sourceHandle: edge.sourceHandle }),
        ...(edge.targetHandle && { targetHandle: edge.targetHandle }),
        ...(edge.type && { type: edge.type }),
        ...(edge.animated && { animated: edge.animated }),
        ...(edge.style && { style: edge.style }),
        ...(edge.data && { data: edge.data }),
      })),

      // Composite-specific fields
      ...(comp.variables && { variables: comp.variables }),
      ...(comp.settings && { settings: comp.settings }),
    };

    // Validate if requested
    if (opts.validateResult) {
      const validationResult = validateComposite(
        cleanComposite,
        validationContext,
      );
      if (validationResult.warnings) {
        warnings.push(...validationResult.warnings);
      }

      // Don't proceed if there are validation errors
      if (validationResult.errors.length > 0) {
        return {
          success: false,
          errors: validationResult.errors,
          warnings: warnings.length > 0 ? warnings : undefined,
        };
      }
    }

    // Convert to YAML using @atomiton/yaml
    const yamlString = yaml.toYaml(cleanComposite, { indent: 2 });

    // Optionally format the output
    const finalYaml = opts.formatOutput
      ? yaml.prettify(yamlString)
      : yamlString;

    return {
      success: true,
      data: finalYaml,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to convert to YAML";

    return {
      success: false,
      errors: [
        {
          path: "root",
          message: errorMessage,
          code: "YAML_STRINGIFY_ERROR",
          data: { error, composite },
        },
      ],
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
