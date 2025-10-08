import { LogsSection } from "#components/LogsSection";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { useEditorUI } from "#store/editorUI";
import { Box, Icon } from "@atomiton/ui";

function OutputPanel() {
  const { clearLogs } = useDebugLogs();
  const { showOutputPanel, setShowOutputPanel } = useEditorUI();

  if (!showOutputPanel) return null;

  return (
    <Box className="fixed left-1/2 bottom-5 z-50 -translate-x-1/2 w-[600px] max-w-[90vw] max-h-[300px] shadow-prompt-input border border-s-01 bg-surface-01 rounded-3xl overflow-hidden">
      {/* Header */}
      <Box className="flex items-center justify-between p-4 border-b border-s-01">
        <h3 className="text-heading font-semibold text-primary flex items-center gap-2">
          <Icon name="terminal" className="!size-5" />
          Output
        </h3>
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="group size-8 flex items-center justify-center rounded-lg transition-colors hover:bg-surface-03"
            title="Clear logs"
          >
            <Icon
              name="trash-2"
              className="text-secondary transition-colors group-hover:text-primary"
            />
          </button>
          <button
            onClick={() => setShowOutputPanel(false)}
            className="group size-8 flex items-center justify-center rounded-lg transition-colors hover:bg-surface-03"
          >
            <Icon
              name="x"
              className="text-secondary transition-colors group-hover:text-primary"
            />
          </button>
        </div>
      </Box>

      {/* Logs Content */}
      <Box className="p-4">
        <LogsSection timestampFormat="short" />
      </Box>
    </Box>
  );
}

export default OutputPanel;
