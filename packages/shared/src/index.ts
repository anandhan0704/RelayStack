export type ApiError = {
  error: string;
  message?: string;
  details?: unknown;
};

export function nowIso(): string {
  return new Date().toISOString();
}

export { createRelayStackMtaProvider } from "./relaystack-mta.provider.js";

