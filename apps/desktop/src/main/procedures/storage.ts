import { app } from "electron";
import fs from "fs/promises";
import path from "path";
import { toYaml, parse as parseYaml, registerMigrationUtilities } from "@atomiton/yaml";
import {
  migrateFlow,
  detectNodeStructure,
  needsMigration,
  getFlowSchemaVersion,
} from "@atomiton/flow/migrations";
import type { Flow } from "@atomiton/flow";

// Register migration utilities with yaml package to avoid circular dependency
registerMigrationUtilities({
  migrateFlow,
  detectNodeStructure,
  needsMigration,
  getFlowSchemaVersion,
});

// FlowNode type removed as it's not used

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
    const rawFlow = parseYaml(yaml);

    // Always migrate flows on load
    const migratedFlow = migrateFlow(rawFlow);

    // Log if migration occurred
    if (needsMigration(rawFlow)) {
      const originalStructure = detectNodeStructure(rawFlow.nodes);
      const originalVersion = getFlowSchemaVersion(rawFlow);
      console.log(
        `Flow "${input}" migrated from v${originalVersion} (${originalStructure}) to v${migratedFlow.schemaVersion} (flat)`,
      );

      // Optionally save the migrated version back to disk
      // This ensures future loads are faster and the file format is updated
      try {
        const migratedYaml = toYaml(migratedFlow);
        await fs.writeFile(filePath, migratedYaml, "utf-8");
        console.log(`Updated flow file "${input}" with migrated format`);
      } catch (error) {
        console.warn(
          `Failed to update flow file "${input}" with migrated format:`,
          error,
        );
      }
    }

    return migratedFlow;
  },

  list: async () => {
    await fs.mkdir(FLOWS_DIR, { recursive: true });
    const files = await fs.readdir(FLOWS_DIR);
    return files
      .filter((f) => f.endsWith(".flow.yaml"))
      .map((f) => f.replace(".flow.yaml", ""));
  },
};
