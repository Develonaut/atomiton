/// <reference types="vite/client" />

// Declare module for YAML files imported with ?raw suffix
declare module "*.yaml?raw" {
  const content: string;
  export default content;
}

declare module "*.yml?raw" {
  const content: string;
  export default content;
}
