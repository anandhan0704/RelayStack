import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.string().default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default("info"),
  CORS_ORIGIN: z.string().default("*"),
  DATABASE_URL: z.string().default("postgresql://relaystack:relaystack_dev_password@localhost:5432/relaystack"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  RABBITMQ_URL: z.string().default("amqp://localhost:5672")
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
    rabbitmqUrl: parsed.RABBITMQ_URL
  };
}

