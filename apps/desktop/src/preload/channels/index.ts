export const CONDUCTOR_CHANNELS = {
  NODE_RUN: "conductor:node:run",
  SYSTEM_HEALTH: "conductor:system:health",
} as const;

export type ConductorChannels = typeof CONDUCTOR_CHANNELS;
export type ConductorChannelName = keyof ConductorChannels;
