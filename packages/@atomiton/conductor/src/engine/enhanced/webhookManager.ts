/**
 * Webhook management for enhanced execution engine
 */

import { events } from "@atomiton/events";
import type { ExecutionResult } from "../../interfaces/IExecutionEngine";
import type { WebhookHandler } from "./types";

type WebhookEvents = {
  "webhook:registered": { webhookId: string };
  "webhook:received": unknown;
};

export function createWebhookManager() {
  const webhookHandlers = new Map<string, WebhookHandler>();
  // Use the simplified events API
  const webhookEvents = events;

  const registerWebhook = async (
    webhookId: string,
    handler: WebhookHandler,
  ): Promise<void> => {
    webhookHandlers.set(webhookId, handler);
    webhookEvents.emit("webhook:registered", { webhookId });
  };

  const handleWebhook = async (
    webhookId: string,
    data: unknown,
    executeCallback: (
      blueprintId: string,
      inputs: Record<string, unknown>,
    ) => Promise<ExecutionResult>,
  ): Promise<ExecutionResult> => {
    const handler = webhookHandlers.get(webhookId);
    if (!handler) {
      throw new Error(`Webhook ${webhookId} not registered`);
    }

    const input = await handler(data);
    return executeCallback(
      `webhook_${webhookId}`,
      input as Record<string, unknown>,
    );
  };

  const clear = (): void => {
    webhookHandlers.clear();
  };

  const onWebhookReceived = (callback: (response: unknown) => void) => {
    return webhookEvents.on("webhook:received", callback);
  };

  const emitWebhookReceived = (response: unknown): void => {
    webhookEvents.emit("webhook:received", response);
  };

  return {
    registerWebhook,
    handleWebhook,
    clear,
    onWebhookReceived,
    emitWebhookReceived,
  };
}
