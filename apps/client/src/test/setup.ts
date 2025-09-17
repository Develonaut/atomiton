import "@testing-library/jest-dom/vitest";

// Ensure global test utilities are available
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});
