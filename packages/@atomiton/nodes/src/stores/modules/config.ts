/**
 * Domain: Node Configuration
 *
 * Purpose: Manages node configuration schemas and validation
 *
 * Responsibilities:
 * - Cache node configuration schemas
 * - Track config loading states
 * - Provide config access methods
 */

import type { BaseStore } from "../types";

export type ConfigActions = {
  setConfig: (nodeType: string, config: any) => void;
  setAllConfigs: (configs: Map<string, any>) => void;
  getConfigs: () => Map<string, any>;
  getConfigByType: (type: string) => any | undefined;
  hasConfigs: () => boolean;
  clearConfigs: () => void;
  setConfigLoading: (loading: boolean) => void;
  setConfigError: (error: Error | null) => void;
};

export const createConfigModule = (store: BaseStore): ConfigActions => ({
  setConfig: (nodeType: string, config: any) => {
    store.setState((state) => {
      state.configs.set(nodeType, config);
      state.lastUpdated.configs = Date.now();
    });
  },

  setAllConfigs: (configs: Map<string, any>) => {
    store.setState((state) => {
      state.configs = configs;
      state.lastUpdated.configs = Date.now();
    });
  },

  getConfigs: () => {
    return store.getState().configs;
  },

  getConfigByType: (type: string) => {
    return store.getState().configs.get(type);
  },

  hasConfigs: () => {
    return store.getState().configs.size > 0;
  },

  clearConfigs: () => {
    store.setState((state) => {
      state.configs.clear();
      state.lastUpdated.configs = null;
    });
  },

  setConfigLoading: (loading: boolean) => {
    store.setState((state) => {
      state.loading.configs = loading;
    });
  },

  setConfigError: (error: Error | null) => {
    store.setState((state) => {
      state.errors.configs = error;
    });
  },
});
