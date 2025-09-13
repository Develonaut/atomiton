import type { CompositeNode } from "../CompositeNode";
import type { ValidationResult } from "../types";
import type { JsonCompositeDefinition } from "../serializer/types";
import { create } from "./createComposite";
import { fromJson } from "./fromJson";
import { fromYaml } from "./fromYaml";
import { toJson } from "./toJson";
import { toYaml } from "./toYaml";
import { validate } from "./validate";
import { validateJson } from "./validateJson";
import { validateYaml } from "./validateYaml";
import { clone } from "./clone";
import { merge } from "./merge";

export class CompositeAPI {
  private static instance: CompositeAPI;

  private constructor() {}

  static getInstance(): CompositeAPI {
    if (!CompositeAPI.instance) {
      CompositeAPI.instance = new CompositeAPI();
    }
    return CompositeAPI.instance;
  }

  // ========== Creation Methods ==========

  fromJson(jsonData: JsonCompositeDefinition): CompositeNode {
    return fromJson(jsonData);
  }

  fromYaml(yamlString: string): CompositeNode {
    return fromYaml(yamlString);
  }

  create(
    id: string,
    name: string,
    category: string = "user-defined",
  ): CompositeNode {
    return create(id, name, category);
  }

  // ========== Serialization Methods ==========

  toJson(composite: CompositeNode): JsonCompositeDefinition {
    return toJson(composite);
  }

  toYaml(composite: CompositeNode): string {
    return toYaml(composite);
  }

  // ========== Validation Methods ==========

  validate(composite: CompositeNode): ValidationResult {
    return validate(composite);
  }

  validateJson(jsonData: JsonCompositeDefinition): ValidationResult {
    return validateJson(jsonData);
  }

  validateYaml(yamlString: string): ValidationResult {
    return validateYaml(yamlString);
  }

  // ========== Utility Methods ==========

  clone(
    composite: CompositeNode,
    newId?: string,
    newName?: string,
  ): CompositeNode {
    return clone(composite, newId, newName);
  }

  merge(base: CompositeNode, overlay: CompositeNode): CompositeNode {
    return merge(base, overlay);
  }

  getVersion(): string {
    return "0.1.0";
  }
}

// Export singleton instance
export const composites = CompositeAPI.getInstance();
