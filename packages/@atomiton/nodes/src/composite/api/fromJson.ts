import { CompositeNode } from "../CompositeNode";
import { CompositeSerializer } from "../serializer";
import type { JsonCompositeDefinition } from "../serializer/types";

const serializer = new CompositeSerializer();

export function fromJson(jsonData: JsonCompositeDefinition): CompositeNode {
  const definition = serializer.fromJsonFormat(jsonData);
  return new CompositeNode(definition);
}
