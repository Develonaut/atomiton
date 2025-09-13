import { yaml } from "@atomiton/yaml";
import type { CompositeNodeDefinition } from "../CompositeNode.js";
import type { JsonCompositeDefinition } from "./types.js";
import { fromJson } from "./fromJson.js";

export async function fromYaml(
  yamlContent: string,
): Promise<CompositeNodeDefinition> {
  const jsonData = yaml.fromYaml(yamlContent) as JsonCompositeDefinition;
  return fromJson(jsonData);
}
