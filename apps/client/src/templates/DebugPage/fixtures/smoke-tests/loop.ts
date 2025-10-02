/**
 * Loop Node Smoke Tests
 * Covers forEach, times, and while loop types with various scenarios
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export const loopSmokeTests: SmokeTest[] = [
  // forEach scenarios
  {
    name: "forEach with numbers",
    config: {
      loopType: "forEach",
      array: [1, 2, 3, 4, 5],
      collectResults: true,
    },
  },
  {
    name: "forEach with objects",
    config: {
      loopType: "forEach",
      array: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ],
      collectResults: true,
    },
  },
  {
    name: "forEach without collecting results",
    config: {
      loopType: "forEach",
      array: [1, 2, 3],
      collectResults: false,
    },
  },
  {
    name: "forEach with empty array",
    config: {
      loopType: "forEach",
      array: [],
      collectResults: true,
    },
  },

  // times scenarios
  {
    name: "times with small count",
    config: {
      loopType: "times",
      count: 3,
      collectResults: true,
    },
  },
  {
    name: "times with default count (10)",
    config: {
      loopType: "times",
      collectResults: true,
    },
  },
  {
    name: "times with large count",
    config: {
      loopType: "times",
      count: 50,
      collectResults: true,
    },
  },

  // while scenarios
  {
    name: "while with simple condition",
    config: {
      loopType: "while",
      condition: "iteration < 5",
      collectResults: true,
    },
  },
  {
    name: "while with complex condition",
    config: {
      loopType: "while",
      condition: "iteration < 10 && iteration % 2 === 0",
      collectResults: true,
    },
  },
  {
    name: "while with always-false (no iterations)",
    config: {
      loopType: "while",
      condition: "false",
      collectResults: true,
    },
  },
];
