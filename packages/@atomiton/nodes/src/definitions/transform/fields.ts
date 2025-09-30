/**
 * Transform Field Configuration
 * UI field configurations for transform parameters
 * MVP: Core transformation operations only
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for transform parameters
 */
export const transformFields: NodeFieldsConfig = {
  operation: {
    controlType: "select",
    label: "Operation",
    helpText: "Type of transformation to perform",
    options: [
      { value: "map", label: "Map" },
      { value: "filter", label: "Filter" },
      { value: "sort", label: "Sort" },
      { value: "flatten", label: "Flatten" },
    ],
  },
  transformFunction: {
    controlType: "code",
    label: "Transform Function",
    placeholder: "item => ({ ...item, processed: true })",
    helpText: "JavaScript function for map/filter operations",
    rows: 5,
  },
  sortKey: {
    controlType: "text",
    label: "Sort Key (optional)",
    placeholder: "name",
    helpText: "Property to sort by",
  },
  flattenDepth: {
    controlType: "number",
    label: "Flatten Depth",
    helpText: "How many levels deep to flatten",
    min: 1,
    max: 10,
  },
};
