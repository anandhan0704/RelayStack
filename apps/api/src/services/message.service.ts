import type { EmailProvider, MessageStatus, SendEmailRequest, SendMessageResult, SendSmsRequest, SmsProvider } from "@relaystack/domain";
import { prisma } from "../db/prisma.js";

type Dependencies = {
  emailProvider: EmailProvider;
  smsProvider: SmsProvider;
};

export type MessageService = {
  sendEmail(customerId: string, request: SendEmailRequest): Promise<SendMessageResult>;
  sendSms(customerId: string, request: SendSmsRequest): Promise<SendMessageResult>;
};

export function createMessageService(dependencies: Dependencies): MessageService {
  return {
    async sendEmail(customerId, request) {
      const providerResult = await dependencies.emailProvider.sendEmail(request);
      const cost = estimateEmailCost(request.to);

      const message = await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { customerId }
        });

        if (!wallet) {
          throw new Error("wallet_not_found");
        }

        const nextBalance = Math.max(0, Number(wallet.balance) - cost);

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: nextBalance }
        });

        const createdMessage = await tx.message.create({
          data: {
            customerId,
            channel: "email",
            fromAddress: request.from,
            toAddress: request.to,
            subject: request.subject,
            body: request.html ?? request.text ?? "",
            status: providerResult.status,
            provider: providerResult.provider,
            providerMessageId: providerResult.messageId,
            cost,
            callbackUrl: request.callbackUrl
          }
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: -cost,
            type: "email_charge",
            referenceId: createdMessage.id
          }
        });

        await tx.messageStatusEvent.create({
          data: {
            messageId: createdMessage.id,
            status: providerResult.status,
            rawPayload: {
              provider: providerResult.provider,
              providerMessageId: providerResult.messageId
            }
          }
        });

        return createdMessage;
      });

      return {
        messageId: message.id,
        status: message.status as MessageStatus,
        provider: providerResult.provider
      };
    },

    async sendSms(customerId, request) {
      const providerResult = await dependencies.smsProvider.sendSms(request);
      const cost = estimateSmsCost(request.to);
      const provider = chooseSmsProvider(request.to);

      const message = await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { customerId }
        });

        if (!wallet) {
          throw new Error("wallet_not_found");
        }

        const nextBalance = Math.max(0, Number(wallet.balance) - cost);

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: nextBalance }
        });

        const createdMessage = await tx.message.create({
          data: {
            customerId,
            channel: "sms",
            fromAddress: request.from,
            toAddress: request.to,
            body: request.body,
            status: providerResult.status,
            provider,
            providerMessageId: providerResult.messageId,
            cost,
            callbackUrl: request.callbackUrl
          }
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: -cost,
            type: "message_charge",
            referenceId: createdMessage.id
          }
        });

        await tx.messageStatusEvent.create({
          data: {
            messageId: createdMessage.id,
            status: providerResult.status,
            rawPayload: {
              provider,
              providerMessageId: providerResult.messageId
            }
          }
        });

        return createdMessage;
      });

      return {
        messageId: message.id,
        status: message.status as MessageStatus,
        provider
      };
    }
  };
}

function estimateEmailCost(_to: string): number {
  return 0.001;
}

function estimateSmsCost(to: string): number {
  if (to.startsWith("+91")) {
    return 0.0042;
  }

  if (to.startsWith("+1")) {
    return 0.012;
  }

  return 0.018;
}

function chooseSmsProvider(to: string): string {
  if (to.startsWith("+91")) {
    return "Local SMS Gateway";
  }

  if (to.startsWith("+1")) {
    return "Twilio";
  }

  return "Bandwidth";
}
