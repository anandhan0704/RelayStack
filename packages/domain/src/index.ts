export type MessageStatus = "queued" | "accepted" | "sent" | "delivered" | "failed";

export type SendSmsRequest = {
  from: string;
  to: string;
  body: string;
  callbackUrl?: string;
};

export type SendMessageResult = {
  messageId: string;
  status: MessageStatus;
  provider: string;
};

export type SmsProvider = {
  sendSms(request: SendSmsRequest): Promise<SendMessageResult>;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  status: "active" | "suspended" | "closed";
  createdAt: string;
};

export type Wallet = {
  id: string;
  customerId: string;
  balance: number;
  currency: string;
};

