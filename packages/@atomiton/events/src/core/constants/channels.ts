// IPC channel constants for consistent communication
export const IPC_CHANNELS = {
  // Event forwarding channels
  EVENT_FORWARD: "event:forward",
  EVENT_BROADCAST: "event:broadcast",

  // System channels
  PING: "system:ping",
  PONG: "system:pong",
  READY: "system:ready",

  // Bridge control channels
  BRIDGE_ENABLE: "bridge:enable",
  BRIDGE_DISABLE: "bridge:disable",
  BRIDGE_STATUS: "bridge:status",

  // Auto-forwarding channels
  AUTO_FORWARD_SETUP: "auto:forward:setup",
  AUTO_FORWARD_TEARDOWN: "auto:forward:teardown",
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
