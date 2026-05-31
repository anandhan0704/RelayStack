import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ??= "postgresql://relaystack:relaystack_dev_password@127.0.0.1:55432/relaystack";

export const prisma = new PrismaClient();
