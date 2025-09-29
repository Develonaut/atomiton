/**
 * Type definitions for browser conductor
 */

import type { ExecutionResult } from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

export type AtomitonBridgeResponse<T = unknown> = {
  result?: T;
  status?: string;
  token?: string;
  flows?: FlowListItem[];
};

export type AtomitonBridge = {
  call<T = unknown>(
    channel: string,
    method: string,
    data?: unknown,
  ): Promise<AtomitonBridgeResponse<T>>;
  listen(
    channel: string,
    event: string,
    callback: (data: unknown) => void,
  ): () => void;
};

// Flow types
export type FlowDefinition = {
  id?: string;
  nodes: NodeDefinition[];
  version?: string;
  savedAt?: string;
  deleted?: boolean;
};

export type FlowListItem = {
  id: string;
  name?: string;
  deleted?: boolean;
  createdAt?: string;
  modifiedAt?: string;
};

export type FlowListResponse = {
  flows: FlowListItem[];
  total?: number;
};

// Auth types
export type AuthCredentials = {
  username: string;
  password: string;
};

export type AuthResult = {
  token?: string;
  user?: UserInfo;
  expiresAt?: string;
};

export type UserInfo = {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
};

// Validation types
export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

// Progress event types
export type NodeProgressEvent = {
  nodeId: string;
  executionId: string;
  progress: number;
  message?: string;
};

export type NodeCompleteEvent = {
  nodeId: string;
  executionId: string;
  result: ExecutionResult;
};

export type NodeErrorEvent = {
  nodeId: string;
  executionId: string;
  error: string;
  code?: string;
};

export type FlowSavedEvent = {
  flowId: string;
  timestamp: string;
};

// Window global interface
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    atomitonBridge?: AtomitonBridge;
    localStorage?: {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
    };
    sessionStorage?: {
      clear(): void;
    };
    confirm?: (message: string) => boolean;
    navigator?: {
      userAgent: string;
      platform: string;
    };
  }
  const window: Window | undefined;
}
