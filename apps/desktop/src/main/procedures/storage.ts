import { app } from "electron";
import fs from "fs/promises";
import path from "path";
import { toYaml, parse as parseYaml } from "@atomiton/yaml";

type FlowNode = {
  version?: string;
  parentId?: string;
  metadata?: {
    version?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

type Flow = {
  id: string;
  nodes?: FlowNode[];
  [key: string]: unknown;
}

const FLOWS_DIR = path.join(app.getPath("documents"), "Atomiton", "flows");

export const storageProcedures = {
  save: async ({ input }: { input: Flow }) => {
    const flow = input;
    const flatFlow = {
      ...flow,
      nodes: flow.nodes?.map((n) => ({
        ...n,
        version: n.version || "1.0.0",
        parentId: n.parentId || undefined,
      })),
    };

    const yaml = toYaml(flatFlow);
    const filePath = path.join(FLOWS_DIR, `${flow.id}.flow.yaml`);

    await fs.mkdir(FLOWS_DIR, { recursive: true });
    await fs.writeFile(filePath, yaml, "utf-8");

    return { success: true, path: filePath };
  },

  load: async ({ input }: { input: string }) => {
    const filePath = path.join(FLOWS_DIR, `${input}.flow.yaml`);
    const yaml = await fs.readFile(filePath, "utf-8");
    const flow = parseYaml(yaml) as Flow;

    if (flow.nodes) {
      flow.nodes = flow.nodes.map((node) => ({
        ...node,
        version: node.version || node.metadata?.version || "1.0.0",
        parentId: node.parentId || undefined,
        metadata: node.metadata
          ? {
              ...node.metadata,
              version: undefined,
            }
          : undefined,
      }));
    }

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