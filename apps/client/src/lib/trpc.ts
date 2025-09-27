import { createTRPCClient } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { ipcLink } from "electron-trpc/renderer";
import type { AppRouter } from "#lib/rpcTypes";
import superjson from "superjson";

export const trpc = createTRPCClient<AppRouter>({
  links: [ipcLink()],
});

export const trpcReact = createTRPCReact<AppRouter>();
