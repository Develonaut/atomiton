import { initTRPC, TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import superjson from "superjson";
import { v } from "@atomiton/validation";
import type { Context } from "./context";
import {
  NodeDefinitionSchema,
  ExecutableSchema,
  ExecutionContextSchema,
  ExecutionResultSchema,
  FlowSchema,
  StorageItemSchema,
} from "../schemas";

const t = initTRPC.context<Context>().create({
  transformer: superjson, // For Date serialization
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const isAuthed = middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(isAuthed);

export const appRouter = router({
  nodes: router({
    list: publicProcedure.query(async () => {
      // Return flat array of node definitions
      // This will be implemented by desktop/client
      return [];
    }),

    getChildren: publicProcedure
      .input(v.string()) // parentId
      .query(async ({ input }) => {
        // Return nodes with this parentId
        // Implementation will filter nodes by parentId
        return [];
      }),

    getByVersion: publicProcedure
      .input(
        v.object({
          type: v.string(),
          version: v.string(),
        }),
      )
      .query(async ({ input }) => {
        // Get specific node version
        // Implementation will find node by type and version
        return null;
      }),

    getById: publicProcedure
      .input(v.string()) // node id
      .query(async ({ input }) => {
        // Get node by id
        return null;
      }),

    search: publicProcedure
      .input(
        v.object({
          query: v.string().optional(),
          category: v.string().optional(),
          tags: v.array(v.string()).optional(),
        }),
      )
      .query(async ({ input }) => {
        // Search nodes by various criteria
        return [];
      }),
  }),

  execution: router({
    execute: publicProcedure
      .input(
        v.object({
          executable: ExecutableSchema,
          context: ExecutionContextSchema.optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        // This will be implemented by desktop
        if (ctx.platform !== "desktop") {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Execution is only available on desktop platform",
          });
        }
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Execution not yet implemented",
        });
      }),

    getStatus: publicProcedure
      .input(v.string()) // execution id
      .query(async ({ input }) => {
        // Get execution status
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Status query not yet implemented",
        });
      }),

    cancel: publicProcedure
      .input(v.string()) // execution id
      .mutation(async ({ input }) => {
        // Cancel execution
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Cancel not yet implemented",
        });
      }),

    // Add subscription for progress
    onProgress: publicProcedure
      .input(v.string()) // execution ID
      .subscription(({ input }) => {
        // Desktop will implement
        return observable<{
          executionId: string;
          status: string;
          progress?: number;
          message?: string;
        }>((emit) => {
          // Placeholder implementation
          emit.error(
            new TRPCError({
              code: "NOT_IMPLEMENTED",
              message: "Progress subscription not yet implemented",
            }),
          );
        });
      }),
  }),

  storage: router({
    save: publicProcedure.input(FlowSchema).mutation(async ({ input, ctx }) => {
      if (!ctx.capabilities.storage) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Storage capability not available",
        });
      }
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Save not yet implemented",
      });
    }),

    load: publicProcedure
      .input(v.string()) // flow id
      .query(async ({ input, ctx }) => {
        if (!ctx.capabilities.storage) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Storage capability not available",
          });
        }
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Load not yet implemented",
        });
      }),

    list: publicProcedure
      .input(
        v
          .object({
            type: v.enum(["flow", "template", "component"]).optional(),
            tags: v.array(v.string()).optional(),
            search: v.string().optional(),
          })
          .optional(),
      )
      .query(async ({ input, ctx }) => {
        if (!ctx.capabilities.storage) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Storage capability not available",
          });
        }
        return [];
      }),

    delete: publicProcedure
      .input(v.string()) // item id
      .mutation(async ({ input, ctx }) => {
        if (!ctx.capabilities.storage) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Storage capability not available",
          });
        }
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Delete not yet implemented",
        });
      }),

    export: publicProcedure
      .input(
        v.object({
          id: v.string(),
          format: v.enum(["json", "yaml"]).optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        if (!ctx.capabilities.storage) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Storage capability not available",
          });
        }
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Export not yet implemented",
        });
      }),

    import: publicProcedure
      .input(
        v.object({
          data: v.string(),
          format: v.enum(["json", "yaml"]).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.capabilities.storage) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Storage capability not available",
          });
        }
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Import not yet implemented",
        });
      }),
  }),

  system: router({
    health: publicProcedure.query(async ({ ctx }) => {
      return {
        status: "healthy",
        platform: ctx.platform,
        environment: ctx.environment,
        version: ctx.version,
        capabilities: ctx.capabilities,
      };
    }),

    info: publicProcedure.query(async ({ ctx }) => {
      return {
        platform: ctx.platform,
        environment: ctx.environment,
        version: ctx.version,
        user: ctx.user,
        capabilities: ctx.capabilities,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
