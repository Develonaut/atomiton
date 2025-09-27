import { trpc } from "#lib/trpc";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

export const rpc = {
  async execute(executable: NodeDefinition) {
    return trpc.execution.execute.mutate({
      executable,
      context: { user: "current-user" },
    });
  },

  async getNodeDefinitions() {
    return trpc.nodes.list.query();
  },

  async getNodeChildren(parentId: string) {
    return trpc.nodes.getChildren.query(parentId);
  },

  async saveFlow(flow: NodeDefinition) {
    return trpc.storage.save.mutate(flow);
  },

  async loadFlow(id: string) {
    return trpc.storage.load.query(id);
  },

  executeNode: function (node: NodeDefinition) {
    return this.execute(node);
  },
};

export const ipc = rpc;
