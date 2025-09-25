import { createBrowserLogger } from "@atomiton/logger/browser";

export const logger = createBrowserLogger({
  level: import.meta.env.DEV ? "debug" : "info",
  namespace: "client",
});
