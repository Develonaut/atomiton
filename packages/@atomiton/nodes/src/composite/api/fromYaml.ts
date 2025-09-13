import type { CompositeNode } from "../CompositeNode";
import { yaml } from "@atomiton/yaml";
import type { JsonCompositeDefinition } from "../serializer/types";
import { fromJson } from "./fromJson";

export function fromYaml(yamlString: string): CompositeNode {
  const jsonData = yaml.fromYaml(yamlString) as JsonCompositeDefinition;
  return fromJson(jsonData);
}
