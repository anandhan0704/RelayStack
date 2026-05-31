import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.string().default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3100),
  LOG_LEVEL: z.string().default("info"),
  CORS_ORIGIN: z.string().default("*"),
  DATABASE_URL: z.string().default("postgresql://relaystack:relaystack_dev_password@127.0.0.1:55432/relaystack"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  RABBITMQ_URL: z.string().default("amqp://localhost:5672"),
  MTA_HOST: z.string().default("127.0.0.1"),
  MTA_PORT: z.coerce.number().int().positive().default(2525),
  MTA_MODE: z.enum(["capture", "deliver"]).default("deliver"),
  EMAIL_SENDING_DOMAIN: z.string().default("relaystack.local")
});

export type RelayStackConfig = ReturnType<typeof loadConfig>;

export function loadConfig() {
  const parsed = configSchema.parse(process.env);

  return {
    nodeEnv: parsed.NODE_ENV,
    host: parsed.HOST,
    port: parsed.PORT,
    logLevel: parsed.LOG_LEVEL,
    corsOrigin: parsed.CORS_ORIGIN,
    databaseUrl: parsed.DATABASE_URL,
    redisUrl: parsed.REDIS_URL,
    rabbitmqUrl: parsed.RABBITMQ_URL,
    mtaHost: parsed.MTA_HOST,
    mtaPort: parsed.MTA_PORT,
    mtaMode: parsed.MTA_MODE,
    emailSendingDomain: parsed.EMAIL_SENDING_DOMAIN
  };
}
