import { Button, Icon } from "@atomiton/ui";
import { useSaveFlow, useExecuteFlow } from "#hooks/useFlow";
import type { Flow } from "#lib/rpcTypes";

type EditorToolbarProps = {
  flow: Flow;
};

function EditorToolbar({ flow }: EditorToolbarProps) {
  const executeFlow = useExecuteFlow();
  const saveFlow = useSaveFlow();

  const handleRun = () => {
    executeFlow.mutate({
      executable: flow,
      context: { variables: { source: "editor" } },
    });
  };

  const handleSave = () => {
    saveFlow.mutate(flow);
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Button
        variant="default"
        onClick={handleRun}
        disabled={executeFlow.isPending}
        className="flex items-center gap-2"
      >
        <Icon
          name={executeFlow.isPending ? "loader" : "play"}
          size={16}
          className={executeFlow.isPending ? "animate-spin" : ""}
        />
        {executeFlow.isPending ? "Running..." : "Run"}
      </Button>

      <Button
        variant="outline"
        onClick={handleSave}
        disabled={saveFlow.isPending}
        className="flex items-center gap-2"
      >
        <Icon
          name={saveFlow.isPending ? "loader" : "save"}
          size={16}
          className={saveFlow.isPending ? "animate-spin" : ""}
        />
        {saveFlow.isPending ? "Saving..." : "Save"}
      </Button>

      {saveFlow.isSuccess && (
        <span className="text-sm text-green-600">Saved successfully!</span>
      )}

      {executeFlow.isSuccess && (
        <span className="text-sm text-green-600">Execution complete!</span>
      )}
    </div>
  );
}

export default EditorToolbar;