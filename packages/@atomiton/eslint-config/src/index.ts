// Note: .js extensions are required for ESM modules in Node.js
// This package uses "type": "module" in package.json, making it an ESM module
// Node.js ESM spec requires explicit file extensions for relative imports
export { default as baseConfig } from "#base.js";
export { default as reactConfig } from "#react-internal.js";
