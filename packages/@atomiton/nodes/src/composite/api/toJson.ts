import type { CompositeNode } from "../CompositeNode";
import { CompositeSerializer } from "../serializer";
import type { JsonCompositeDefinition } from "../serializer/types";

const serializer = new CompositeSerializer();

export function toJson(composite: CompositeNode): JsonCompositeDefinition {
  const definition = composite.getDefinition();
  return serializer.toJsonFormat(definition);
}
