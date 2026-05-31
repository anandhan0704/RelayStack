export type MessageStatus = "queued" | "accepted" | "sent" | "delivered" | "failed";

export type SendSmsRequest = {
  from: string;
  to: string;
  body: string;
  callbackUrl?: string;
};

export type SendEmailRequest = {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  callbackUrl?: string;
  relaystackMessageId?: string;
};

export type SendMessageResult = {
  messageId: string;
  status: MessageStatus;
  provider: string;
  note?: string;
};

export type EmailSendJob = {
  messageId: string;
  customerId: string;
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  callbackUrl?: string;
};

export type EmailStatusJob = {
  messageId: string;
  harakaUuid: string;
  status: "delivered" | "failed";
  recipient?: string;
  response?: string;
  error?: string;
};

export type SmsProvider = {
  sendSms(request: SendSmsRequest): Promise<SendMessageResult>;
};

export type EmailProvider = {
  sendEmail(request: SendEmailRequest): Promise<SendMessageResult>;
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

export type Message = {
  id: string;
  customerId: string;
  channel: "sms" | "email" | "otp" | "voice";
  from: string;
  to: string;
  subject?: string;
  body: string;
  status: MessageStatus;
  provider: string;
  cost: number;
  callbackUrl?: string;
  createdAt: string;
};

export type ProviderRoute = {
  id: string;
  name: string;
  channel: "sms" | "email" | "voice" | "otp";
  country: string;
  health: "healthy" | "degraded" | "down";
  unitCost: number;
  priority: number;
};

export type ComplianceApproval = {
  id: string;
  customerName: string;
  type: "sender_id" | "template" | "kyc";
  status: "pending" | "review" | "approved" | "rejected";
  createdAt: string;
};
