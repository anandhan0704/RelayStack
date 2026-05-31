import type { FastifyRequest } from "fastify";
import { prisma } from "../db/prisma.js";
import { findCustomerByApiKey } from "../services/api-key.service.js";

export async function getRequestCustomer(request: FastifyRequest) {
  const header = request.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    return findCustomerByApiKey(header.slice("Bearer ".length));
  }

  return prisma.customer.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "asc" }
  });
}

