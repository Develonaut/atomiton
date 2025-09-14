/**
 * Webhook handling functions for queue system
 */

import type { WebhookResponse } from "./types";

export function createWebhookManager(resultTTL: number) {
  const webhookResponses = new Map<string, WebhookResponse>();

  const addWebhookResponse = async (
    response: WebhookResponse,
  ): Promise<void> => {
    webhookResponses.set(response.executionId, response);

    setTimeout(() => {
      webhookResponses.delete(response.executionId);
    }, resultTTL);
  };

  const getWebhookResponse = async (
    executionId: string,
  ): Promise<WebhookResponse | undefined> => {
    return webhookResponses.get(executionId);
  };

  const decodeWebhookResponse = (response: WebhookResponse): unknown => {
    if (typeof response.response.body === "string") {
      try {
        return JSON.parse(response.response.body);
      } catch {
        return response.response.body;
      }
    }
    return response.response.body;
  };

  const clear = (): void => {
    webhookResponses.clear();
  };

  return {
    addWebhookResponse,
    getWebhookResponse,
    decodeWebhookResponse,
    clear,
  };
}
