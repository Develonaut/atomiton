// Import YAML files as raw strings
import helloWorldYaml from "./hello-world.yaml?raw";
import dataTransformYaml from "./data-transform.yaml?raw";
import imageProcessorYaml from "./image-processor.yaml?raw";

// Predefined blueprint IDs (using deterministic UUIDs)
export const BLUEPRINT_IDS = {
  HELLO_WORLD: "550e8400-e29b-41d4-a716-446655440001",
  DATA_TRANSFORM: "550e8400-e29b-41d4-a716-446655440002",
  IMAGE_PROCESSOR: "550e8400-e29b-41d4-a716-446655440003",
} as const;

export interface PredefinedBlueprint {
  id: string;
  yaml: string;
}

export const predefinedBlueprints: PredefinedBlueprint[] = [
  {
    id: BLUEPRINT_IDS.HELLO_WORLD,
    yaml: helloWorldYaml,
  },
  {
    id: BLUEPRINT_IDS.DATA_TRANSFORM,
    yaml: dataTransformYaml,
  },
  {
    id: BLUEPRINT_IDS.IMAGE_PROCESSOR,
    yaml: imageProcessorYaml,
  },
];

export function getPredefinedBlueprint(id: string): string | undefined {
  const blueprint = predefinedBlueprints.find((bp) => bp.id === id);
  return blueprint?.yaml;
}
