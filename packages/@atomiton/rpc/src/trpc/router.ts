import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Minimal router for pure transport
export const appRouter = router({
  system: router({
    ping: publicProcedure.query(async () => {
      return { status: "ok" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
