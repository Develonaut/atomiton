#!/usr/bin/env tsx
/**
 * Validates that preload types match RPC source of truth
 * Run: pnpm validate:preload-types
 *
 * This is a safety check to ensure preload types are in sync.
 * If validation fails, run: pnpm generate:preload-types
 */

import * as fs from "fs";
import * as path from "path";

const RPC_TYPES_PATH = path.join(
  __dirname,
  "../packages/@atomiton/rpc/src/shared/types.ts",
);
const PRELOAD_TYPES_PATH = path.join(
  __dirname,
  "../apps/desktop/src/preload/preload.d.ts",
);

function extractAtomitonBridgeSignature(content: string): string {
  const bridgeMatch = content.match(/type AtomitonBridge\s*=\s*{([^}]+)}/s);
  if (!bridgeMatch) {
    throw new Error("Could not find AtomitonBridge type definition");
  }

  // Normalize for comparison
  return bridgeMatch[1]
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
    .replace(/\/\/.*/g, "")
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\?:/g, ":") // Normalize optional properties
    .trim();
}

function validateTypes(): void {
  console.log("🔍 Validating preload types match RPC types...\n");

  const rpcContent = fs.readFileSync(RPC_TYPES_PATH, "utf-8");
  const preloadContent = fs.readFileSync(PRELOAD_TYPES_PATH, "utf-8");

  const rpcSignature = extractAtomitonBridgeSignature(rpcContent);
  const preloadSignature = extractAtomitonBridgeSignature(preloadContent);

  if (rpcSignature !== preloadSignature) {
    console.error("\n❌ TYPE MISMATCH DETECTED!\n");
    console.error(
      "The AtomitonBridge type in preload does not match RPC source.\n",
    );
    console.error("Source of truth:", RPC_TYPES_PATH);
    console.error("Preload copy:   ", PRELOAD_TYPES_PATH);
    console.error("\n💡 To fix, run: pnpm generate:preload-types\n");
    process.exit(1);
  }

  console.log("✅ Preload types match RPC types - validation passed!\n");
}

try {
  validateTypes();
} catch (error) {
  console.error("\n❌ Validation failed:", error);
  process.exit(1);
}
