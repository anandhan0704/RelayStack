import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { MessageService } from "../services/message.service.js";

const sendSmsSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(6),
  body: z.string().min(1).max(1600),
  callbackUrl: z.string().url().optional()
});

type Dependencies = {
  messageService: MessageService;
};

export function registerSmsRoutes(app: FastifyInstance, dependencies: Dependencies): void {
  app.post("/v1/messages/sms", async (request, reply) => {
    const parsed = sendSmsSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "invalid_request",
        details: parsed.error.flatten()
      });
    }

    const result = await dependencies.messageService.sendSms(parsed.data);

    return reply.code(202).send(result);
  });
}

