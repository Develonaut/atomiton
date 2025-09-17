// Import YAML files as raw strings
import helloWorldYaml from "./hello-world.yaml?raw";
import imageProcessorYaml from "./image-processor.yaml?raw";
import dataTransformYaml from "./data-transform.yaml?raw";

export type PredefinedBlueprint = {
  id: string;
  yaml: string;
};

export const predefinedBlueprints: PredefinedBlueprint[] = [
  {
    id: "hello-world",
    yaml: helloWorldYaml,
  },
  {
    id: "image-processor",
    yaml: imageProcessorYaml,
  },
  {
    id: "data-transform",
    yaml: dataTransformYaml,
  },
];

export function getPredefinedBlueprint(id: string): string | undefined {
  const blueprint = predefinedBlueprints.find((bp) => bp.id === id);
  return blueprint?.yaml;
}
