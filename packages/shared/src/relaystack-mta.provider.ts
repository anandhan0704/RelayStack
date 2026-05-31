import nodemailer from "nodemailer";
import type { EmailProvider, SendEmailRequest, SendMessageResult } from "@relaystack/domain";
import type { RelayStackConfig } from "@relaystack/config";

type MtaProviderConfig = Pick<RelayStackConfig, "mtaHost" | "mtaPort" | "mtaMode">;

export function createRelayStackMtaProvider(config: MtaProviderConfig): EmailProvider {
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
      const headers: Record<string, string> = {
        "X-RelayStack-Provider": "RelayStack MTA"
      };

      if (request.relaystackMessageId) {
        headers["X-RelayStack-Message-Id"] = request.relaystackMessageId;
      }

      const info = await transport.sendMail({
        from: request.from,
        to: request.to,
        subject: request.subject,
        html: request.html,
        text: request.text,
        headers
      });

      return {
        messageId: info.messageId,
        status: "accepted",
        provider: "RelayStack MTA",
        note: config.mtaMode === "capture"
          ? "Message captured locally in apps/mta/var/spool. Set MTA_MODE=deliver for MX delivery."
          : undefined
      };
    }
  };
}
