import { Button, Icon } from "@atomiton/ui";
import conductor from "#lib/conductor";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useState } from "react";
// TODO: Implement actual save functionality with storage package

type EditorToolbarProps = {
  flow: NodeDefinition;
};

function EditorToolbar({ flow }: EditorToolbarProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRun = async () => {
    setIsExecuting(true);
    setExecutionSuccess(false);
    try {
      const result = await conductor.node.run(flow, {
        variables: { source: "editor" },
      });
      if (result.success) {
        setExecutionSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setExecutionSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to execute flow:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // TODO: Implement actual save with storage package
      console.log("Saving flow:", flow);
      // Simulate async save
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save flow:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Button
        variant="default"
        onClick={handleRun}
        disabled={isExecuting}
        className="flex items-center gap-2"
      >
        <Icon
          name={isExecuting ? "loader" : "play"}
          size={16}
          className={isExecuting ? "animate-spin" : ""}
        />
        {isExecuting ? "Running..." : "Run"}
      </Button>

      <Button
        variant="outline"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        <Icon
          name={isSaving ? "loader" : "save"}
          size={16}
          className={isSaving ? "animate-spin" : ""}
        />
        {isSaving ? "Saving..." : "Save"}
      </Button>

      {saveSuccess && (
        <span className="text-sm text-green-600">Saved successfully!</span>
      )}

      {executionSuccess && (
        <span className="text-sm text-green-600">Execution complete!</span>
      )}
    </div>
  );
}

export default EditorToolbar;
