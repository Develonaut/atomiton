import type {
  ExecutionRequest,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";

export type TransportType = "local" | "ipc" | "http" | "websocket";

export type IExecutionTransport = {
  type: TransportType;
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
};

export type IExecutionRouter = {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  registerTransport(transport: IExecutionTransport): void;
  setDefaultTransport(type: TransportType): void;
};

export type IPCMessage = {
  type: "conductor:execute";
  payload: ExecutionRequest;
  id: string;
};

export type IPCResponse = {
  type: "conductor:result";
  payload: ExecutionResult;
  id: string;
};
