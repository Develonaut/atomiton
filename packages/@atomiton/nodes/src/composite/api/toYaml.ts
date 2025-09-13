import type { CompositeNode } from "../CompositeNode";
import { yaml } from "@atomiton/yaml";
import { toJson } from "./toJson";

export function toYaml(composite: CompositeNode): string {
  const jsonData = toJson(composite);
  return yaml.toYaml(jsonData);
}
