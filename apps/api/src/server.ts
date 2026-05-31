import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { loadConfig } from "@relaystack/config";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerSmsRoutes } from "./routes/sms.routes.js";
import { createStubSmsProvider } from "./providers/stub-sms.provider.js";
import { createMessageService } from "./services/message.service.js";

const config = loadConfig();

const app = Fastify({
  logger: {
    level: config.logLevel
  }
});

await app.register(helmet);
await app.register(cors, {
  origin: config.corsOrigin
});

const smsProvider = createStubSmsProvider();
const messageService = createMessageService({ smsProvider });

registerHealthRoutes(app);
registerSmsRoutes(app, { messageService });

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

