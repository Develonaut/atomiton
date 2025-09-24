import type { UserConfig } from "vite";

export type BaseOptions = {
  name: string;
  entry?: string | Record<string, string>;
  external?: string[];
  additionalConfig?: UserConfig;
};

export type LibraryOptions = {
  chunks?: ChunkMapping;
  enableVisualizer?: boolean;
  enableMinification?: boolean;
  assetsInlineLimit?: number;
  enableSourceMap?: boolean;
} & BaseOptions;

export type ReactLibraryOptions = {
  enableTailwind?: boolean;
  enableTsconfigPaths?: boolean;
  optimizeDeps?: {
    include?: string[];
    exclude?: string[];
  };
} & LibraryOptions;

export type AppOptions = {
  port?: number;
  strictPort?: boolean;
  workspacePackages?: string[];
  aliases?: Record<string, string>;
  enableTailwind?: boolean;
  assetsInlineLimit?: number;
  chunkSizeWarningLimit?: number;
  additionalConfig?: UserConfig;
};

export type ChunkMapping = {
  [key: string]: string | RegExp | string[];
};

export type TerserConfig = {
  dropConsole?: boolean;
  dropDebugger?: boolean;
  keepClassNames?: boolean;
  keepFunctionNames?: boolean;
  pureFunctions?: string[];
};
