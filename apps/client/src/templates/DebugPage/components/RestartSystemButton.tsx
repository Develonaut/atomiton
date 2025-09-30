import { Button, Icon } from "@atomiton/ui";
import { useSystemOperations } from "#templates/DebugPage/hooks/useSystemOperations";

/**
 * Self-contained Restart System Button component
 * - Handles system restart logic internally
 * - Logs restart actions to debug logs
 */
export function RestartSystemButton() {
  const { restartSystem } = useSystemOperations();

  return (
    <Button onClick={restartSystem} variant="outline">
      <Icon name="rotate-cw" className="w-4 h-4 mr-2" />
      Restart System
    </Button>
  );
}
