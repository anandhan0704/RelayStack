import crypto from "node:crypto";
import type { SendMessageResult, SendSmsRequest, SmsProvider } from "@relaystack/domain";

export function createStubSmsProvider(): SmsProvider {
  return {
    async sendSms(_request: SendSmsRequest): Promise<SendMessageResult> {
      return {
        messageId: crypto.randomUUID(),
        status: "accepted",
        provider: "stub"
      };
    }
  };
}

