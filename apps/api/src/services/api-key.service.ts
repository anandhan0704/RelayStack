import crypto from "node:crypto";
import { prisma } from "../db/prisma.js";

export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function createApiKeyPreview(apiKey: string): string {
  return `${apiKey.slice(0, 11)}...${apiKey.slice(-4)}`;
}

export async function findCustomerByApiKey(apiKey: string) {
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiKey(apiKey) },
    include: { customer: true }
  });

  if (!apiKeyRecord || apiKeyRecord.status !== "active" || apiKeyRecord.customer.status !== "active") {
    return null;
  }

  return apiKeyRecord.customer;
}

export async function createApiKey(customerId: string, name: string) {
  const key = `rs_test_${crypto.randomBytes(24).toString("hex")}`;

  const apiKey = await prisma.apiKey.create({
    data: {
      customerId,
      name,
      keyHash: hashApiKey(key),
      preview: createApiKeyPreview(key),
      status: "active"
    }
  });

  return { ...apiKey, key };
}

