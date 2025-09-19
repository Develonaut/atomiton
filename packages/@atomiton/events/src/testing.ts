/**
 * Internal testing utilities - not part of public API
 *
 * These exports are for internal testing only and should not be used by consumers.
 * The public API only exposes the singleton `events` instance.
 */

import { Events as BrowserEvents } from "./browser";
import type { EventManager } from "./types";

export function createEvents<
  T extends Record<string, unknown>,
>(): EventManager<T> {
  return BrowserEvents<T>();
}

export type { EventManager };
