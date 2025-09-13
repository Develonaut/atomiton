import type { CompositeNodeDefinition } from "../CompositeNode";
import type { JsonCompositeDefinition } from "./types";
import { fromJson } from "./fromJson";
import { toJson } from "./toJson";
import { fromYaml } from "./fromYaml";
import { toYaml } from "./toYaml";
import { validate } from "./validate";

export class CompositeSerializer {
  fromJsonFormat(jsonData: JsonCompositeDefinition): CompositeNodeDefinition {
    return fromJson(jsonData);
  }

  toJsonFormat(composite: CompositeNodeDefinition): JsonCompositeDefinition {
    return toJson(composite);
  }

  async fromYaml(yamlContent: string): Promise<CompositeNodeDefinition> {
    return fromYaml(yamlContent);
  }

  toYaml(composite: CompositeNodeDefinition): string {
    return toYaml(composite);
  }

  validate(composite: CompositeNodeDefinition): {
    valid: boolean;
    errors: string[];
  } {
    return validate(composite);
  }
}
