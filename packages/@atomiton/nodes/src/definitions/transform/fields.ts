/**
 * Transform Field Configuration
 * UI field configurations for transform parameters
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
      { value: "map", label: "Map - Transform each item" },
      { value: "filter", label: "Filter - Keep items matching condition" },
      {
        value: "reduce",
        label: "Reduce - Combine items into single value",
      },
      { value: "sort", label: "Sort - Order items" },
      { value: "group", label: "Group - Group items by key" },
      { value: "flatten", label: "Flatten - Flatten nested arrays" },
      { value: "unique", label: "Unique - Remove duplicate items" },
      { value: "reverse", label: "Reverse - Reverse array order" },
    ],
  },
  transformFunction: {
    controlType: "code",
    label: "Transform Function",
    placeholder: "item => ({ ...item, processed: true })",
    helpText: "JavaScript function for map/filter transformation",
    rows: 5,
  },
  filterCondition: {
    controlType: "code",
    label: "Filter Condition",
    placeholder: "item => item.value > 0",
    helpText: "Condition function for filter operation",
    rows: 3,
  },
  sortKey: {
    controlType: "text",
    label: "Sort Key",
    placeholder: "name",
    helpText: "Property to sort by (leave empty to sort primitive values)",
  },
  sortDirection: {
    controlType: "select",
    label: "Sort Direction",
    helpText: "Sort order direction",
    options: [
      { value: "asc", label: "Ascending" },
      { value: "desc", label: "Descending" },
    ],
  },
  groupBy: {
    controlType: "text",
    label: "Group By",
    placeholder: "category",
    helpText: "Property to group by",
  },
  reduceFunction: {
    controlType: "code",
    label: "Reduce Function",
    placeholder:
      "(accumulator, currentItem, index) => accumulator + currentItem",
    helpText: "Function to combine array items",
    rows: 3,
  },
  reduceInitial: {
    controlType: "text",
    label: "Initial Value",
    placeholder: "0",
    helpText: "Initial value for reduce operation (JSON format)",
  },
  flattenDepth: {
    controlType: "number",
    label: "Flatten Depth",
    helpText: "How many levels deep to flatten",
    min: 1,
    max: 10,
  },
};
