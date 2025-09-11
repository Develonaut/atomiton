import "@testing-library/jest-dom";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  type Assertion = {} & jest.Matchers<void, unknown> &
    TestingLibraryMatchers<unknown, void>;
}
