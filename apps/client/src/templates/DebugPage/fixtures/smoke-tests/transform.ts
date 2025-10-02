/**
 * Transform Node Smoke Tests
 * Covers all 11 transformation operations: map, filter, reduce, sort, group, flatten, unique, reverse, limit, skip, slice
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export const transformSmokeTests: SmokeTest[] = [
  // Map operation
  {
    name: "map - double numbers",
    config: {
      operation: "map",
      transformFunction: "item => item * 2",
      data: [1, 2, 3, 4, 5],
    },
  },
  {
    name: "map - extract properties",
    config: {
      operation: "map",
      transformFunction: "item => ({ id: item.id, name: item.name })",
      data: [
        { id: 1, name: "Alice", age: 30 },
        { id: 2, name: "Bob", age: 25 },
      ],
    },
  },

  // Filter operation
  {
    name: "filter - even numbers",
    config: {
      operation: "filter",
      transformFunction: "item => item % 2 === 0",
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
  {
    name: "filter - adults only",
    config: {
      operation: "filter",
      transformFunction: "item => item.age >= 18",
      data: [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 17 },
        { name: "Charlie", age: 25 },
      ],
    },
  },

  // Reduce operation
  {
    name: "reduce - sum numbers",
    config: {
      operation: "reduce",
      transformFunction: "({ acc, item }) => acc + item",
      reduceInitial: "0",
      data: [1, 2, 3, 4, 5],
    },
  },
  {
    name: "reduce - concatenate strings",
    config: {
      operation: "reduce",
      transformFunction: "({ acc, item }) => acc + item",
      reduceInitial: "",
      data: ["Hello", " ", "World", "!"],
    },
  },

  // Sort operation
  {
    name: "sort - ascending",
    config: {
      operation: "sort",
      sortDirection: "asc",
      data: [5, 2, 8, 1, 9, 3],
    },
  },
  {
    name: "sort - descending",
    config: {
      operation: "sort",
      sortDirection: "desc",
      data: [5, 2, 8, 1, 9, 3],
    },
  },
  {
    name: "sort - by property",
    config: {
      operation: "sort",
      sortKey: "name",
      sortDirection: "asc",
      data: [
        { name: "Charlie", age: 25 },
        { name: "Alice", age: 30 },
        { name: "Bob", age: 20 },
      ],
    },
  },

  // Group operation
  {
    name: "group - by category",
    config: {
      operation: "group",
      groupKey: "category",
      data: [
        { name: "apple", category: "fruit" },
        { name: "carrot", category: "vegetable" },
        { name: "banana", category: "fruit" },
        { name: "broccoli", category: "vegetable" },
      ],
    },
  },

  // Flatten operation
  {
    name: "flatten - depth 1",
    config: {
      operation: "flatten",
      flattenDepth: 1,
      data: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    },
  },
  {
    name: "flatten - depth 2",
    config: {
      operation: "flatten",
      flattenDepth: 2,
      data: [
        [1, [2, 3]],
        [4, [5, 6]],
        [7, [8, 9]],
      ],
    },
  },

  // Unique operation
  {
    name: "unique - remove duplicates",
    config: {
      operation: "unique",
      data: [1, 2, 2, 3, 3, 3, 4, 5, 5],
    },
  },
  {
    name: "unique - strings",
    config: {
      operation: "unique",
      data: ["apple", "banana", "apple", "cherry", "banana"],
    },
  },

  // Reverse operation
  {
    name: "reverse - numbers",
    config: {
      operation: "reverse",
      data: [1, 2, 3, 4, 5],
    },
  },
  {
    name: "reverse - strings",
    config: {
      operation: "reverse",
      data: ["first", "second", "third", "fourth"],
    },
  },

  // Limit operation
  {
    name: "limit - first 3",
    config: {
      operation: "limit",
      limitCount: 3,
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
  {
    name: "limit - first 5",
    config: {
      operation: "limit",
      limitCount: 5,
      data: ["a", "b", "c", "d", "e", "f", "g", "h"],
    },
  },

  // Skip operation
  {
    name: "skip - first 3",
    config: {
      operation: "skip",
      skipCount: 3,
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
  {
    name: "skip - first 5",
    config: {
      operation: "skip",
      skipCount: 5,
      data: ["a", "b", "c", "d", "e", "f", "g", "h"],
    },
  },

  // Slice operation
  {
    name: "slice - middle section",
    config: {
      operation: "slice",
      sliceStart: 2,
      sliceEnd: 5,
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
  {
    name: "slice - from index to end",
    config: {
      operation: "slice",
      sliceStart: 5,
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
];
