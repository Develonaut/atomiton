export type ElectronLogTransport = {
  level: string;
  resolvePathFn?: () => string;
  format?: (info: ElectronLogInfo) => string;
};

export type ElectronLogInfo = {
  level: string;
  msg: string;
  scope?: string;
  variables: unknown[];
};

export type ElectronLogTransports = {
  file: ElectronLogTransport;
  console: ElectronLogTransport;
};

export type ElectronLog = {
  transports: ElectronLogTransports;
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  scope: (namespace: string) => ElectronLog;
};
