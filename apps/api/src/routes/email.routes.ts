import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { findCustomerByApiKey } from "../services/api-key.service.js";
import type { MessageService } from "../services/message.service.js";

const sendEmailSchema = z.object({
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string().min(1).max(998),
  html: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  callbackUrl: z.string().url().optional()
}).refine((value) => value.html || value.text, {
  message: "Either html or text is required",
  path: ["html"]
});

type Dependencies = {
  messageService: MessageService;
};

export function registerEmailRoutes(app: FastifyInstance, dependencies: Dependencies): void {
  app.post("/v1/email/send", async (request, reply) => {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "missing_api_key" });
    }

    const customer = await findCustomerByApiKey(authorization.slice("Bearer ".length));

    if (!customer) {
      return reply.code(401).send({ error: "invalid_api_key" });
    }

    const parsed = sendEmailSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "invalid_request",
        details: parsed.error.flatten()
      });
    }

    const result = await dependencies.messageService.sendEmail(customer.id, parsed.data);

    return reply.code(202).send(result);
  });
}
