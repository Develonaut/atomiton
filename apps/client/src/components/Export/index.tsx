import Images from "#components/Export/Images";
import Menu from "#components/Export/Menu";
import Object3D from "#components/Export/Object3D";
import Preview from "#components/Export/Preview";
import Video from "#components/Export/Video";
// TODO: Replace with IPC implementation
// import { getConductor } from "#services/conductor";
import { createBrowserLogger } from "@atomiton/logger/browser";
import { Box, Button } from "@atomiton/ui";
import { Popover, PopoverPanel } from "@headlessui/react";
import { useState } from "react";

// Generate debug output path (matching E2E test logic)
const getDebugOutputPath = () => {
  // For E2E tests, use a fixed path
  if (
    process.env.NODE_ENV === "test" ||
    (typeof window !== "undefined" &&
      (window as Window & { electron?: unknown }).electron)
  ) {
    return `/Users/Ryan/Desktop/atomiton-e2e-test/execute-test-result.txt`;
  }
  // Fallback for browser-only testing
  const timestamp =
    new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
    "_" +
    new Date()
      .toLocaleTimeString("en-US", { hour12: false })
      .replace(/:/g, "-");
  return `/tmp/atomiton-debug-${timestamp}/execute-test-result.txt`;
};

const menu = [
  {
    id: 0,
    title: "Images",
    icon: "image",
  },
  {
    id: 1,
    title: "Video",
    icon: "video-camera",
  },
  {
    id: 2,
    title: "3D Object",
    icon: "cube",
  },
];

type ExportProps = {
  disabled?: boolean;
};

function Export({ disabled = false }: ExportProps) {
  const [active, setActive] = useState(0);
  const logger = createBrowserLogger({ namespace: "execute:ui" });

  const handleOnClick = async () => {
    const isElectron =
      typeof window !== "undefined" &&
      (
        window as Window & {
          electron?: {
            ipcRenderer?: { send: (channel: string, data: unknown) => void };
          };
        }
      ).electron;

    // In Electron, send IPC message directly for file system operations
    if (isElectron) {
      const electronWindow = window as Window & {
        electron?: {
          ipcRenderer?: { send: (channel: string, data: unknown) => void };
        };
      };
      const electronIPC = electronWindow.electron?.ipcRenderer;
      electronIPC?.send("ipc-bridge-message", {
        channel: "conductor:execute",
        data: {
          definition: {
            metadata: { type: "file-system" },
            parameters: {
              defaults: {
                path: getDebugOutputPath(),
                content: "Execute button test successful!",
              },
            },
          },
        },
      });
      return;
    }

    // TODO: Replace with IPC implementation
    // For web-only mode, previously used conductor - now needs IPC
    logger.info("Web-only mode execution not yet implemented with IPC");
    // try {
    //   const conductor = getConductor();
    //   const testNode = {
    //     id: "test-file-system",
    //     name: "Test File System",
    //     position: { x: 0, y: 0 },
    //     metadata: {
    //       id: "test-file-system",
    //       name: "Test File System",
    //       type: "file-system" as const,
    //       version: "1.0.0",
    //       author: "System",
    //       description: "Test file system node for E2E testing",
    //       category: "io" as const,
    //       icon: "folder" as const,
    //     },
    //     parameters: {
    //       defaults: {
    //         operation: "write",
    //         path: getDebugOutputPath(),
    //         content: "Execute button test successful!",
    //         encoding: "utf8",
    //         createDirectories: true,
    //         overwrite: true,
    //       },
    //       fields: {},
    //     },
    //     inputPorts: [],
    //     outputPorts: [],
    //   };

    //   const testInput = {};
    //   logger.info("Executing File System node", { nodeId: testNode.id });

    //   const result = await conductor.execute(testNode, testInput);

    //   logger.info("Execute finished successfully", { result });
    // } catch (error) {
    //   logger.error("Execute failed with error", { error });
    // }
  };

  if (disabled) {
    return (
      <Button
        className="w-23"
        variant="default"
        disabled
        title="Export feature coming soon"
      >
        Export
      </Button>
    );
  }

  return (
    <Popover className="relative">
      <Button
        className="w-23"
        variant="default"
        onClick={handleOnClick}
        data-testid="execute-button"
      >
        Execute
      </Button>
      {/* <PopoverButton as={Button} className="w-23" variant="default">
        Export
      </PopoverButton> */}
      <PopoverPanel
        className="z-20 [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] min-w-137.5 min-h-79.5 bg-surface-01 shadow-popover border border-s-01 rounded-[1.25rem] transition duration-200 data-closed:opacity-0"
        anchor="bottom end"
        transition
      >
        <Box className="flex">
          <Box className="flex flex-col shrink-0 w-38 p-2 border-r border-s-01">
            <Menu items={menu} onClick={setActive} isActive={active} />
            <Preview video={active === 1} />
          </Box>
          <Box className="flex flex-col grow">
            {active === 0 && <Images />}
            {active === 1 && <Video />}
            {active === 2 && <Object3D />}
          </Box>
        </Box>
      </PopoverPanel>
    </Popover>
  );
}

export default Export;
