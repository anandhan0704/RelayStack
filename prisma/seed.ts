import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ??= "postgresql://relaystack:relaystack_dev_password@127.0.0.1:55432/relaystack";

const prisma = new PrismaClient();

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function main() {
  const demoApiKey = "rs_test_demo_key";

  const customer = await prisma.customer.upsert({
    where: { email: "ops@demo-commerce.example" },
    update: {},
    create: {
      name: "Demo Commerce",
      email: "ops@demo-commerce.example",
      status: "active",
      wallet: {
        create: {
          balance: 2840.5,
          currency: "USD"
        }
      },
      apiKeys: {
        create: {
          name: "Default API key",
          keyHash: hashApiKey(demoApiKey),
          preview: "rs_test_dem..._key",
          status: "active"
        }
      }
    }
  });

  await prisma.customer.upsert({
    where: { email: "platform@novacart.example" },
    update: {},
    create: {
      name: "NovaCart",
      email: "platform@novacart.example",
      status: "active"
    }
  });

  await prisma.providerRoute.createMany({
    data: [
      { id: "route_twilio_sms_us", name: "Twilio", channel: "sms", country: "US", health: "healthy", unitCost: 0.012, priority: 1 },
      { id: "route_bandwidth_voice_us", name: "Bandwidth", channel: "voice", country: "US", health: "degraded", unitCost: 0.0068, priority: 2 },
      { id: "route_relaystack_mta_global", name: "RelayStack MTA", channel: "email", country: "GLOBAL", health: "healthy", unitCost: 0.001, priority: 1 },
      { id: "route_local_sms_in", name: "Local SMS Gateway", channel: "sms", country: "IN", health: "healthy", unitCost: 0.0042, priority: 1 }
    ],
    skipDuplicates: true
  });

  await prisma.complianceApproval.createMany({
    data: [
      { id: "appr_001", customerName: "NovaCart", type: "sender_id", status: "pending" },
      { id: "appr_002", customerName: "Finovo", type: "template", status: "review" },
      { id: "appr_003", customerName: "MediLink", type: "kyc", status: "approved" }
    ],
    skipDuplicates: true
  });

  const existingMessages = await prisma.message.count({
    where: { customerId: customer.id }
  });

  if (existingMessages === 0) {
    await prisma.message.createMany({
      data: [
        {
          customerId: customer.id,
          channel: "sms",
          fromAddress: "RELAY",
          toAddress: "+91 98765 43210",
          body: "Your order has shipped.",
          status: "delivered",
          provider: "Twilio",
          cost: 0.012
        },
        {
          customerId: customer.id,
          channel: "email",
          fromAddress: "noreply@relaystack.dev",
          toAddress: "buyer@example.com",
          subject: "Your receipt is ready",
          body: "Your receipt is ready.",
          status: "accepted",
          provider: "RelayStack MTA",
          cost: 0.001
        },
        {
          customerId: customer.id,
          channel: "otp",
          fromAddress: "RELAY",
          toAddress: "+1 415 555 0199",
          body: "Your OTP is 123456",
          status: "queued",
          provider: "Local OTP",
          cost: 0.018
        }
      ]
    });
  }

  console.log(`Seeded demo customer. API key: ${demoApiKey}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
