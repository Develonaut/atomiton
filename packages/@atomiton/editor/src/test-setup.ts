import "@testing-library/jest-dom";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  interface Assertion
    extends jest.Matchers<void, unknown>,
      TestingLibraryMatchers<unknown, void> {}
}
