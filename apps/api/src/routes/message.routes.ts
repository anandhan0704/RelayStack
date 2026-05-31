import type { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma.js";
import { getRequestCustomer } from "../plugins/auth.js";

export function registerMessageRoutes(app: FastifyInstance): void {
  app.get("/v1/messages", async (request, reply) => {
    const customer = await getRequestCustomer(request);

    if (!customer) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const messages = await prisma.message.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return {
      messages: messages.map((message) => ({
        id: message.id,
        customerId: message.customerId,
        channel: message.channel,
        from: message.fromAddress,
        to: message.toAddress,
        subject: message.subject,
        body: message.body,
        status: message.status,
        provider: message.provider,
        cost: Number(message.cost),
        callbackUrl: message.callbackUrl,
        createdAt: message.createdAt.toISOString()
      }))
    };
  });
}
