import type { Logger } from "pino";
import type { EmailProvider, EmailSendJob } from "@relaystack/domain";
import { prisma } from "../db/prisma.js";

export async function processEmailSendJob(
  job: EmailSendJob,
  emailProvider: EmailProvider,
  logger: Logger
): Promise<void> {
  const message = await prisma.message.findUnique({
    where: { id: job.messageId }
  });

  if (!message) {
    logger.warn({ messageId: job.messageId }, "email send job skipped: message not found");
    return;
  }

  if (message.status !== "queued") {
    logger.info({ messageId: job.messageId, status: message.status }, "email send job skipped: already processed");
    return;
  }

  try {
    const providerResult = await emailProvider.sendEmail({
      from: job.from,
      to: job.to,
      subject: job.subject,
      html: job.html,
      text: job.text,
      callbackUrl: job.callbackUrl,
      relaystackMessageId: job.messageId
    });

    await prisma.$transaction(async (tx) => {
      await tx.message.update({
        where: { id: job.messageId },
        data: {
          status: "sent",
          providerMessageId: providerResult.messageId
        }
      });

      await tx.messageStatusEvent.create({
        data: {
          messageId: job.messageId,
          status: "sent",
          rawPayload: {
            provider: providerResult.provider,
            providerMessageId: providerResult.messageId
          }
        }
      });
    });

    logger.info({ messageId: job.messageId, providerMessageId: providerResult.messageId }, "email submitted to MTA");
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      await tx.message.update({
        where: { id: job.messageId },
        data: { status: "failed" }
      });

      await tx.messageStatusEvent.create({
        data: {
          messageId: job.messageId,
          status: "failed",
          rawPayload: {
            error: error instanceof Error ? error.message : "email_send_failed"
          }
        }
      });
    });

    logger.error({ messageId: job.messageId, error }, "email send job failed");
    throw error;
  }
}
