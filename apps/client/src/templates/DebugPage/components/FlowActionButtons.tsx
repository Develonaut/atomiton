import { Button, Icon } from "@atomiton/ui";

type FlowActionButtonsProps = {
  selectedFlowId: string | null;
  isExecuting: boolean;
  onRun: () => void;
  onReset?: () => void;
  onLoad?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
};

export function FlowActionButtons({
  selectedFlowId,
  isExecuting,
  onRun,
  onReset,
  onLoad,
  onSave,
  onDownload,
}: FlowActionButtonsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={onLoad} disabled={true} variant="outline" size="sm">
        <Icon name="upload" className="w-4 h-4 mr-2" />
        Load
      </Button>
      <Button onClick={onSave} disabled={true} variant="outline" size="sm">
        <Icon name="save" className="w-4 h-4 mr-2" />
        Save
      </Button>
      <Button onClick={onDownload} disabled={true} variant="outline" size="sm">
        <Icon name="download" className="w-4 h-4 mr-2" />
        Download
      </Button>
      <Button
        onClick={onRun}
        disabled={!selectedFlowId || isExecuting}
        variant="default"
        size="sm"
      >
        <Icon name={isExecuting ? "loader" : "play"} className="w-4 h-4 mr-2" />
        {isExecuting ? "Running..." : "Run"}
      </Button>
      <Button
        onClick={onReset}
        disabled={isExecuting}
        variant="outline"
        size="sm"
      >
        <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}
