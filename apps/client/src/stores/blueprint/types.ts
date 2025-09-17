/**
 * Blueprint Store Types
 *
 * Simple, clean types for blueprint management.
 * Blueprint is just a CompositeDefinition with optional user-specific fields.
 */

import type { CompositeDefinition } from "@atomiton/nodes/browser";

/**
 * Blueprint type - extends CompositeDefinition with user-specific fields
 *
 * A Blueprint IS a CompositeDefinition, not a separate shape.
 * We only add user-specific fields for client-side management.
 */
export type Blueprint = CompositeDefinition & {
  // User blueprint specific fields for client-side management
  createdAt?: string;
  updatedAt?: string;
};

export type BlueprintState = {
  templates: Blueprint[];
  blueprints: Blueprint[];
  isLoading: boolean;
  error: string | null;
};

// Note: BlueprintActions is now defined in store.ts as BlueprintStoreActions
// combining CrudActions and TemplateActions for better modularity
