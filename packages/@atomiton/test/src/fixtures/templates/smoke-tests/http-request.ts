/**
 * HTTP Request Node Smoke Tests
 * Covers GET, POST, PUT, DELETE with headers and body handling
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

const TEST_BASE_URL =
  import.meta.env.TEST_HTTP_SERVER_URL || "http://localhost:8888";

export const httpRequestSmokeTests: SmokeTest[] = [
  {
    name: "GET request",
    config: {
      method: "GET",
      url: `${TEST_BASE_URL}/get`,
    },
  },
  {
    name: "GET with query params",
    config: {
      method: "GET",
      url: `${TEST_BASE_URL}/get?param1=value1&param2=value2`,
    },
  },
  {
    name: "POST with JSON body",
    config: {
      method: "POST",
      url: `${TEST_BASE_URL}/post`,
      body: JSON.stringify({ test: "data", number: 42 }),
      headers: JSON.stringify({ "Content-Type": "application/json" }),
    },
  },
  {
    name: "POST with custom headers",
    config: {
      method: "POST",
      url: `${TEST_BASE_URL}/post`,
      body: JSON.stringify({ message: "Hello" }),
      headers: JSON.stringify({
        "Content-Type": "application/json",
        "X-Custom-Header": "test-value",
      }),
    },
  },
  {
    name: "PUT request",
    config: {
      method: "PUT",
      url: `${TEST_BASE_URL}/put`,
      body: JSON.stringify({ updated: true, timestamp: Date.now() }),
      headers: JSON.stringify({ "Content-Type": "application/json" }),
    },
  },
  {
    name: "DELETE request",
    config: {
      method: "DELETE",
      url: `${TEST_BASE_URL}/delete`,
    },
  },
];
