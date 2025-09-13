import { yaml } from "@atomiton/yaml";
import type { CompositeNodeDefinition } from "../CompositeNode";
import { toJson } from "./toJson";

export function toYaml(composite: CompositeNodeDefinition): string {
  const jsonData = toJson(composite);
  return yaml.toYaml(jsonData);
}
