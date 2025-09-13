import { yaml } from "@atomiton/yaml";
import type { CompositeNodeDefinition } from "../CompositeNode";
import type { JsonCompositeDefinition } from "./types";
import { fromJson } from "./fromJson";

export async function fromYaml(
  yamlContent: string,
): Promise<CompositeNodeDefinition> {
  const jsonData = yaml.fromYaml(yamlContent) as JsonCompositeDefinition;
  return fromJson(jsonData);
}
