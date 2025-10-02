/**
 * Transform Node Smoke Tests
 * Covers JavaScript code execution for data transformation
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export const transformSmokeTests: SmokeTest[] = [
  {
    name: "simple return",
    config: {
      code: "return { message: 'Transform executed', timestamp: Date.now() };",
    },
  },
  {
    name: "data manipulation",
    config: {
      code: `
        const result = {
          doubled: [1, 2, 3].map(x => x * 2),
          sum: [1, 2, 3].reduce((a, b) => a + b, 0)
        };
        return result;
      `,
    },
  },
  {
    name: "string operations",
    config: {
      code: `
        return {
          uppercase: 'hello'.toUpperCase(),
          reversed: 'hello'.split('').reverse().join(''),
          length: 'hello world'.length
        };
      `,
    },
  },
  {
    name: "object transformation",
    config: {
      code: `
        const user = { firstName: 'John', lastName: 'Doe', age: 30 };
        return {
          fullName: user.firstName + ' ' + user.lastName,
          isAdult: user.age >= 18
        };
      `,
    },
  },
  {
    name: "array filtering",
    config: {
      code: `
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        return {
          evens: numbers.filter(n => n % 2 === 0),
          odds: numbers.filter(n => n % 2 !== 0),
          sum: numbers.reduce((a, b) => a + b, 0)
        };
      `,
    },
  },
];
