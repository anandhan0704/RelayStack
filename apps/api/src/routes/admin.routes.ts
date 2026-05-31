import type { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma.js";

export function registerAdminRoutes(app: FastifyInstance): void {
  app.get("/v1/admin/summary", async () => {
    const [activeCustomers, openApprovals, providerIncidents] = await Promise.all([
      prisma.customer.count({ where: { status: "active" } }),
      prisma.complianceApproval.count({ where: { status: { in: ["pending", "review"] } } }),
      prisma.providerRoute.count({ where: { health: { not: "healthy" } } })
    ]);

    return {
      activeCustomers,
      openApprovals,
      providerIncidents,
      grossMargin: 42.8
    };
  });

  app.get("/v1/admin/providers", async () => {
    const providers = await prisma.providerRoute.findMany({
      orderBy: [{ priority: "asc" }, { name: "asc" }]
    });

    return {
      providers: providers.map((provider) => ({
        ...provider,
        unitCost: Number(provider.unitCost),
        createdAt: provider.createdAt.toISOString()
      }))
    };
  });

  app.get("/v1/admin/customers", async () => {
    const customers = await prisma.customer.findMany({
      include: { wallet: true },
      orderBy: { createdAt: "desc" }
    });

    return {
      customers: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
        walletBalance: Number(customer.wallet?.balance ?? 0),
        currency: customer.wallet?.currency ?? "USD",
        createdAt: customer.createdAt.toISOString()
      }))
    };
  });

  app.get("/v1/admin/approvals", async () => {
    const approvals = await prisma.complianceApproval.findMany({
      orderBy: { createdAt: "desc" }
    });

    return {
      approvals: approvals.map((approval) => ({
        ...approval,
        createdAt: approval.createdAt.toISOString()
      }))
    };
  });
}
