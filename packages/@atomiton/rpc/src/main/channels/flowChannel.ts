import {
  createChannelServer,
  type ChannelServer,
} from "#main/channels/createChannelServer";
import type { IpcMain } from "electron";
import {
  loadFlowTemplates,
  getFlowTemplate,
} from "@atomiton/nodes/templates/flows";

/**
 * Flow Channel - Serves read-only flow templates
 *
 * This channel provides access to bundled flow templates (examples).
 * These are separate from user storage - templates are immutable.
 */
export const createFlowChannelServer = (ipcMain: IpcMain): ChannelServer => {
  const server = createChannelServer("flow", ipcMain);

  /**
   * List all available flow templates
   */
  server.handle("listTemplates", async () => {
    const templates = await loadFlowTemplates();
    return {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        nodeCount: t.definition.nodes?.length || 0,
      })),
    };
  });

  /**
   * Get a specific flow template by ID
   */
  server.handle("getTemplate", async (params: unknown) => {
    const { id } = params as { id: string };
    const definition = await getFlowTemplate(id);
    if (!definition) {
      throw new Error(`Flow template ${id} not found`);
    }
    return { definition };
  });

  return server;
};
