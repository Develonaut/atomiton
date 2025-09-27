import { app } from "electron";
import fs from "fs/promises";
import path from "path";
import { flowToYaml, parse } from "@atomiton/yaml";
import type { Flow } from "@atomiton/rpc/shared";

// FlowNode type removed as it's not used

const FLOWS_DIR = path.join(app.getPath("documents"), "Atomiton", "flows");

export const storageProcedures = {
  save: async ({ input }: { input: Flow }) => {
    const flow = input;
    const flatFlow = {
      ...flow,
      nodes: flow.nodes?.map((n: Record<string, unknown>) => ({
        ...n,
        version: (n.version as string) || "1.0.0",
        parentId: (n.parentId as string) || undefined,
      })),
    };

    const yaml = flowToYaml(flatFlow);
    const filePath = path.join(FLOWS_DIR, `${flow.id}.flow.yaml`);

    await fs.mkdir(FLOWS_DIR, { recursive: true });
    await fs.writeFile(filePath, yaml, "utf-8");

    return { success: true, path: filePath };
  },

  load: async ({ input }: { input: string }) => {
    const filePath = path.join(FLOWS_DIR, `${input}.flow.yaml`);
    const yaml = await fs.readFile(filePath, "utf-8");
    const flow = parse(yaml) as Flow;

    return flow;
  },

  list: async () => {
    await fs.mkdir(FLOWS_DIR, { recursive: true });
    const files = await fs.readdir(FLOWS_DIR);
    return files
      .filter((f) => f.endsWith(".flow.yaml"))
      .map((f) => f.replace(".flow.yaml", ""));
  },
};
