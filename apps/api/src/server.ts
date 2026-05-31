import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { loadConfig } from "@relaystack/config";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerSmsRoutes } from "./routes/sms.routes.js";
import { registerEmailRoutes } from "./routes/email.routes.js";
import { registerCustomerRoutes } from "./routes/customer.routes.js";
import { registerMessageRoutes } from "./routes/message.routes.js";
import { registerDashboardRoutes } from "./routes/dashboard.routes.js";
import { registerAdminRoutes } from "./routes/admin.routes.js";
import { createStubSmsProvider } from "./providers/stub-sms.provider.js";
import { createRelayStackMtaProvider } from "./providers/relaystack-mta.provider.js";
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

const emailProvider = createRelayStackMtaProvider(config);
const smsProvider = createStubSmsProvider();
const messageService = createMessageService({ emailProvider, smsProvider });

registerHealthRoutes(app);
registerCustomerRoutes(app);
registerMessageRoutes(app);
registerDashboardRoutes(app);
registerAdminRoutes(app);
registerEmailRoutes(app, { messageService });
registerSmsRoutes(app, { messageService });

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
