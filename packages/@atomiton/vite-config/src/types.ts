import type { UserConfig } from "vite";

export type BaseOptions = {
  name: string;
  entry?: string;
  external?: string[];
  additionalConfig?: UserConfig;
};

export type LibraryOptions = {
  chunks?: ChunkMapping;
  enableVisualizer?: boolean;
  enableMinification?: boolean;
  testEnvironment?: "node" | "jsdom" | "happy-dom";
} & BaseOptions;

export type ReactLibraryOptions = {
  enableTailwind?: boolean;
  enableTsconfigPaths?: boolean;
} & LibraryOptions;

export type AppOptions = {
  port?: number;
  strictPort?: boolean;
  workspacePackages?: string[];
  aliases?: Record<string, string>;
  enableTailwind?: boolean;
  additionalConfig?: UserConfig;
};

export type ChunkMapping = {
  [key: string]: string | RegExp;
};

export type TerserConfig = {
  dropConsole?: boolean;
  dropDebugger?: boolean;
  keepClassNames?: boolean;
  keepFunctionNames?: boolean;
  pureFunctions?: string[];
};
