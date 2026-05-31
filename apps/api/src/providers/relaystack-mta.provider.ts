import nodemailer from "nodemailer";
import type { EmailProvider, SendEmailRequest, SendMessageResult } from "@relaystack/domain";
import type { RelayStackConfig } from "@relaystack/config";

export function createRelayStackMtaProvider(config: Pick<RelayStackConfig, "mtaHost" | "mtaPort">): EmailProvider {
  const transport = nodemailer.createTransport({
    host: config.mtaHost,
    port: config.mtaPort,
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });

  return {
    async sendEmail(request: SendEmailRequest): Promise<SendMessageResult> {
      const info = await transport.sendMail({
        from: request.from,
        to: request.to,
        subject: request.subject,
        html: request.html,
        text: request.text,
        headers: {
          "X-RelayStack-Provider": "RelayStack MTA"
        }
      });

      return {
        messageId: info.messageId,
        status: "accepted",
        provider: "RelayStack MTA"
      };
    }
  };
}
