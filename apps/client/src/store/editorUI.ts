import { createStore } from "@atomiton/store";

type EditorUIState = {
  showMinimap: boolean;
  showOutputPanel: boolean;
};

type EditorUIActions = {
  setShowMinimap: (show: boolean) => void;
  setShowOutputPanel: (show: boolean) => void;
  toggleMinimap: () => void;
  toggleOutputPanel: () => void;
};

const editorUIStore = createStore<EditorUIState & EditorUIActions>(
  () => ({
    showMinimap: true,
    showOutputPanel: false,

    setShowMinimap: (show: boolean) => {
      editorUIStore.setState((state) => ({ ...state, showMinimap: show }));
    },

    setShowOutputPanel: (show: boolean) => {
      editorUIStore.setState((state) => ({ ...state, showOutputPanel: show }));
    },

    toggleMinimap: () => {
      editorUIStore.setState((state) => ({
        ...state,
        showMinimap: !state.showMinimap,
      }));
    },

    toggleOutputPanel: () => {
      editorUIStore.setState((state) => ({
        ...state,
        showOutputPanel: !state.showOutputPanel,
      }));
    },
  }),
  {
    name: "editor-ui-store",
  },
);

export const useEditorUI = editorUIStore.useStore;
