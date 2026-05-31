import type { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma.js";
import { getRequestCustomer } from "../plugins/auth.js";

export function registerDashboardRoutes(app: FastifyInstance): void {
  app.get("/v1/dashboard/summary", async (request, reply) => {
    const customer = await getRequestCustomer(request);

    if (!customer) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const [messages, wallet] = await Promise.all([
      prisma.message.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 100
      }),
      prisma.wallet.findUnique({
        where: { customerId: customer.id }
      })
    ]);

    const delivered = messages.filter((message) => message.status === "delivered").length;
    const deliveryRate = messages.length === 0 ? 0 : Math.round((delivered / messages.length) * 1000) / 10;

    return {
      metrics: {
        messagesToday: messages.length,
        deliveryRate,
        walletBalance: Number(wallet?.balance ?? 0),
        walletCurrency: wallet?.currency ?? "USD",
        webhookSuccessRate: 99.2
      },
      apiHealth: {
        uptime: "99.99%",
        primarySmsRoute: "Twilio US 10DLC",
        emailRoute: "RelayStack MTA",
        webhookRetries: 3
      }
    };
  });
}
