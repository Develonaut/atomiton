// Pure RPC transport types
export type RPCRequest<T = any> = {
  id: string;
  method: string;
  params: T;
};

export type RPCResponse<T = any> = {
  id: string;
  result?: T;
  error?: RPCError;
};

export type RPCError = {
  code: number;
  message: string;
  data?: any;
};

// Re-export from index
export * from "#shared/channels";
