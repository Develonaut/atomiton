import { yaml } from "@atomiton/yaml";
import type { CompositeNodeDefinition } from "../CompositeNode.js";
import { toJson } from "./toJson.js";

export function toYaml(composite: CompositeNodeDefinition): string {
  const jsonData = toJson(composite);
  return yaml.toYaml(jsonData);
}
