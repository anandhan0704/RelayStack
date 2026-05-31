import pino from "pino";
import { loadConfig } from "@relaystack/config";
import type { EmailSendJob, EmailStatusJob } from "@relaystack/domain";
import { createQueueClient, EMAIL_SEND_QUEUE, EMAIL_STATUS_QUEUE } from "@relaystack/queue";
import { createRelayStackMtaProvider } from "@relaystack/shared";
import { processEmailSendJob } from "./jobs/process-email-send.js";
import { processEmailStatusJob } from "./jobs/process-email-status.js";

const config = loadConfig();
const logger = pino({ level: config.logLevel });
const emailProvider = createRelayStackMtaProvider(config);

const queue = await createQueueClient(config.rabbitmqUrl);

logger.info({ service: "relaystack-worker" }, "worker started");

await queue.consume(EMAIL_SEND_QUEUE, async (payload) => {
  await processEmailSendJob(payload as EmailSendJob, emailProvider, logger);
});

await queue.consume(EMAIL_STATUS_QUEUE, async (payload) => {
  await processEmailStatusJob(payload as EmailStatusJob, logger);
});

logger.info({ queues: [EMAIL_SEND_QUEUE, EMAIL_STATUS_QUEUE] }, "email workers listening");
