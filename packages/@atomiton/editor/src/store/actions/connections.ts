import { core } from "@atomiton/core";
import type { EditorState, Connection } from "../types";
import { pushHistory } from "../history";

// Pure action functions for testing
export const connectionActionFunctions = {
  addConnection: (state: EditorState, connection: Connection) => {
    pushHistory(state);
    state.connections.push(connection);
    state.isDirty = true;
  },

  deleteConnection: (state: EditorState, id: string) => {
    pushHistory(state);
    state.connections = state.connections.filter(
      (connection) => connection.id !== id,
    );
    state.isDirty = true;
  },

  setConnections: (state: EditorState, connections: Connection[]) => {
    const hasChanged =
      JSON.stringify(state.connections) !== JSON.stringify(connections);
    if (hasChanged) {
      pushHistory(state);
    }
    state.connections = connections;
    state.isDirty = true;
  },
};

// Store-bound actions
export function createConnectionActions(store: any) {
  return {
    addConnection: core.store.createAction(
      store,
      connectionActionFunctions.addConnection,
    ),
    deleteConnection: core.store.createAction(
      store,
      connectionActionFunctions.deleteConnection,
    ),
    setConnections: core.store.createAction(
      store,
      connectionActionFunctions.setConnections,
    ),
  };
}
