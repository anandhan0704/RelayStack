import type { SendMessageResult, SendSmsRequest, SmsProvider } from "@relaystack/domain";

type Dependencies = {
  smsProvider: SmsProvider;
};

export type MessageService = {
  sendSms(request: SendSmsRequest): Promise<SendMessageResult>;
};

export function createMessageService(dependencies: Dependencies): MessageService {
  return {
    async sendSms(request) {
      return dependencies.smsProvider.sendSms(request);
    }
  };
}

