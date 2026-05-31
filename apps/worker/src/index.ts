import pino from "pino";
import { loadConfig } from "@relaystack/config";

const config = loadConfig();
const logger = pino({ level: config.logLevel });

logger.info({ service: "relaystack-worker" }, "worker started");

setInterval(() => {
  logger.info({ service: "relaystack-worker" }, "worker heartbeat");
}, 30_000);

