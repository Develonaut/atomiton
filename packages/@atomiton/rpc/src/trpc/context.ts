// Basic context for pure transport tRPC
export interface Context {
  platform: string;
  environment: string;
  version: string;
}

export const createContext = (): Context => ({
  platform: "electron",
  environment: process.env.NODE_ENV || "development",
  version: "1.0.0",
});
