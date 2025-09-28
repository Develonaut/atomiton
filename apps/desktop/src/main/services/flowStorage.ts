import { app } from "electron";
import fs from "fs/promises";
import path from "path";
import { toYaml, parse } from "@atomiton/yaml";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type {
  IStorageService,
  ServiceResult,
  StorageResult,
} from "#main/services/types";

export type FlowStorageService = IStorageService;

export const createFlowStorageService = (): FlowStorageService => {
  const flowsDir = path.join(app.getPath("documents"), "Atomiton", "flows");

  const save = async (
    node: NodeDefinition,
  ): Promise<ServiceResult<StorageResult>> => {
    try {
      const yaml = toYaml(node);
      const filePath = path.join(flowsDir, `${node.id}.flow.yaml`);

      await fs.mkdir(flowsDir, { recursive: true });
      await fs.writeFile(filePath, yaml, "utf-8");

      return {
        success: true,
        data: { success: true, path: filePath },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save flow",
        code: "STORAGE_SAVE_ERROR",
      };
    }
  };

  const load = async (id: string): Promise<ServiceResult<NodeDefinition>> => {
    try {
      const filePath = path.join(flowsDir, `${id}.flow.yaml`);
      const yamlContent = await fs.readFile(filePath, "utf-8");
      const node = parse(yamlContent) as NodeDefinition;

      return {
        success: true,
        data: node,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load flow",
        code: "STORAGE_LOAD_ERROR",
      };
    }
  };

  const list = async (): Promise<ServiceResult<string[]>> => {
    try {
      await fs.mkdir(flowsDir, { recursive: true });
      const files = await fs.readdir(flowsDir);
      const flowIds = files
        .filter((f) => f.endsWith(".flow.yaml"))
        .map((f) => f.replace(".flow.yaml", ""));

      return {
        success: true,
        data: flowIds,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list flows",
        code: "STORAGE_LIST_ERROR",
      };
    }
  };

  return {
    save,
    load,
    list,
  };
};
