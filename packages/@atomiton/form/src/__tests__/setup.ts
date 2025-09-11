import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// @ts-expect-error - vitest extend signature compatibility
expect.extend(matchers);

afterEach(() => {
  cleanup();
});
