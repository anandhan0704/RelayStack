import type { Logger } from "pino";
import type { EmailStatusJob } from "@relaystack/domain";
import { prisma } from "../db/prisma.js";

export async function processEmailStatusJob(job: EmailStatusJob, logger: Logger): Promise<void> {
  const message = await prisma.message.findUnique({
    where: { id: job.messageId }
  });

  if (!message) {
    logger.warn({ messageId: job.messageId }, "email status job skipped: message not found");
    return;
  }

  if (message.status === job.status) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.message.update({
      where: { id: job.messageId },
      data: { status: job.status }
    });

    await tx.messageStatusEvent.create({
      data: {
        messageId: job.messageId,
        status: job.status,
        rawPayload: {
          harakaUuid: job.harakaUuid,
          recipient: job.recipient,
          response: job.response,
          error: job.error
        }
      }
    });
  });

  if (message.callbackUrl) {
    try {
      await fetch(message.callbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: job.messageId,
          status: job.status,
          recipient: job.recipient,
          harakaUuid: job.harakaUuid
        })
      });
    } catch (error) {
      logger.warn({ messageId: job.messageId, error }, "customer webhook delivery failed");
    }
  }

  logger.info({ messageId: job.messageId, status: job.status }, "email delivery status updated");
}
