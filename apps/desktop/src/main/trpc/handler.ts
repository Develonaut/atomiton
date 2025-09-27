import { createConductor } from "@atomiton/conductor";
import { appRouter } from "@atomiton/rpc";
import type { BrowserWindow } from "electron";
import { createIPCHandler } from "electron-trpc/main";

const conductor = createConductor();

export const createTRPCHandler = (mainWindow: BrowserWindow) => {
  return createIPCHandler({
    router: appRouter,
    windows: [mainWindow],
    createContext: async () => ({
      platform: "desktop",
      conductor,
    }),
    async resolve(opts) {
      const { ctx, input, path } = opts;

      if (path === "execution.execute") {
        const result = await ctx.conductor.execute(input.executable);
        return {
          success: result.success,
          outputs: result.outputs,
          error: result.error,
        };
      }

      if (path === "nodes.list") {
        const nodes = await getNodeDefinitions();
        return nodes;
      }

      if (path === "nodes.getChildren") {
        const nodes = await getNodeDefinitions();
        return nodes.filter((n) => n.parentId === input);
      }

      return undefined;
    },
  });
};

async function getNodeDefinitions() {
  return [
    {
      id: "trigger",
      name: "Trigger",
      version: "1.0.0",
      category: "trigger",
      description: "Trigger nodes",
      parentId: null,
    },
    {
      id: "trigger.manual",
      name: "Manual Trigger",
      version: "1.0.0",
      category: "trigger",
      description: "Manually trigger a flow",
      parentId: "trigger",
      inputs: [],
      outputs: [{ name: "trigger", type: "trigger" }],
    },
    {
      id: "trigger.schedule",
      name: "Schedule Trigger",
      version: "1.0.0",
      category: "trigger",
      description: "Schedule a flow to run",
      parentId: "trigger",
      inputs: [],
      outputs: [{ name: "trigger", type: "trigger" }],
      config: {
        cron: { type: "string", required: true },
      },
    },
    {
      id: "actions",
      name: "Actions",
      version: "1.0.0",
      category: "action",
      description: "Action nodes",
      parentId: null,
    },
    {
      id: "actions.http",
      name: "HTTP Request",
      version: "1.0.0",
      category: "action",
      description: "Make HTTP requests",
      parentId: "actions",
      inputs: [{ name: "trigger", type: "trigger" }],
      outputs: [{ name: "response", type: "any" }],
      config: {
        url: { type: "string", required: true },
        method: { type: "string", default: "GET" },
      },
    },
  ];
}
