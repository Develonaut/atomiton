import { defineBenchmarkTestConfig } from "@atomiton/vite-config/vitest";

export default defineBenchmarkTestConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.benchmark.test.{ts,tsx}"],
  },
});