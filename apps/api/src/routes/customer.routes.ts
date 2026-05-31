import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { getRequestCustomer } from "../plugins/auth.js";
import { createApiKey } from "../services/api-key.service.js";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(80).default("API key")
});

export function registerCustomerRoutes(app: FastifyInstance): void {
  app.get("/v1/me", async (request, reply) => {
    const requestCustomer = await getRequestCustomer(request);

    if (!requestCustomer) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: requestCustomer.id },
      include: {
        wallet: true,
        apiKeys: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    return {
      customer,
      wallet: customer?.wallet ? { ...customer.wallet, balance: Number(customer.wallet.balance) } : null,
      apiKeys: customer?.apiKeys.map(({ keyHash: _keyHash, ...apiKey }) => apiKey) ?? []
    };
  });

  app.post("/v1/api-keys", async (request, reply) => {
    const customer = await getRequestCustomer(request);

    if (!customer) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const parsed = createApiKeySchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      return reply.code(400).send({
        error: "invalid_request",
        details: parsed.error.flatten()
      });
    }

    const apiKey = await createApiKey(customer.id, parsed.data.name);
    const { keyHash: _keyHash, ...response } = apiKey;

    return reply.code(201).send(response);
  });
}
