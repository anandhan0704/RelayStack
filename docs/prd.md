# RelayStack PRD

## Product

RelayStack is a communication API platform for businesses and developers. It exposes simple APIs for SMS, email, OTP, and later voice/SIP, while handling routing, provider abstraction, wallet billing, delivery webhooks, logs, and compliance workflows.

## Goal

Build a realistic CPaaS aggregator first, powered by upstream providers such as SendGrid, Amazon SES, Twilio, Bandwidth, and local SMS gateways. Later phases can add deeper telecom infrastructure such as SIP routing, SBCs, CDR billing, and carrier interconnects.

## Target Users

| User | Need |
| --- | --- |
| SaaS companies | OTP, alerts, invoices, transactional messages |
| E-commerce companies | Order updates, delivery notifications, promotional messages |
| Internal enterprise apps | Workflow alerts and system notifications |
| Developers | Clean APIs, logs, webhooks, test mode |
| Support teams | Searchable message history and delivery troubleshooting |

## MVP Scope

| Module | MVP | Description |
| --- | --- | --- |
| Customer signup/login | Yes | Customers can register and manage accounts |
| API key management | Yes | Generate, rotate, revoke API keys |
| SMS API | Yes | Send SMS through provider abstraction |
| Email API | Yes | Send transactional email |
| OTP API | Yes | Generate, send, verify, expire, and rate-limit OTPs |
| Webhooks | Yes | Send delivery reports and status events to customer systems |
| Wallet and billing | Yes | Prepaid balance, reservation, deduction, refund |
| Dashboard | Yes | Message logs, delivery state, usage, API keys |
| Admin panel | Yes | Customers, providers, pricing, route controls |
| Provider routing | Yes | Select provider by country, channel, cost, quality, and compliance |
| Rate limiting | Yes | Per-customer and per-key limits |
| Audit logs | Yes | Track API calls, admin actions, and security events |
| Voice API | Later | Outbound/inbound programmable calls |
| SIP trunking | Later | Wholesale voice customers and PBX connectivity |
| Number management | Later | Buy, assign, port, and release numbers |
| WhatsApp | Later | Add after SMS/email/OTP are stable |

## Core API Examples

### Send SMS

```http
POST /v1/messages/sms
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

```json
{
  "from": "MYBRAND",
  "to": "+919876543210",
  "body": "Your OTP is 123456",
  "callbackUrl": "https://client.example/webhooks/sms"
}
```

### Send Email

```http
POST /v1/email/send
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

```json
{
  "from": "noreply@example.com",
  "to": "customer@example.com",
  "subject": "Your receipt",
  "html": "<p>Thanks for your order.</p>",
  "callbackUrl": "https://client.example/webhooks/email"
}
```

## Functional Requirements

1. Customers can create accounts and manage API keys.
2. API Gateway validates API keys, request schema, customer status, and rate limits.
3. Compliance Engine validates sender IDs, templates, consent, opt-outs, and regional metadata.
4. Billing Service reserves balance before enqueueing paid messages and finalizes charges after provider response.
5. Routing Engine chooses providers by channel, country, customer route policy, price, reliability, and compliance.
6. Worker services send messages asynchronously through provider adapters.
7. Provider callbacks update message status and trigger customer webhooks.
8. Webhook Worker retries failed customer callbacks with backoff and dead-letter handling.
9. Dashboard and admin panel expose searchable logs, message status, usage, invoices, and provider health.

## Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Availability | API should remain available during provider outage by using fallback routing |
| Reliability | Queue-based processing, idempotency keys, retries, and dead-letter queues |
| Security | API key hashing, least-privilege IAM, TLS, secrets manager, audit logs |
| Compliance | Consent, opt-out, sender/template approval, regional A2P/DLT-style metadata |
| Observability | Structured logs, traces, metrics, alerts, provider latency/error tracking |
| Billing accuracy | Ledger-style wallet transactions with immutable references |
| Abuse prevention | Rate limits, fraud scoring, destination restrictions, spam detection |

## Roadmap

### Phase 1: Core API Platform

- Customer onboarding
- API keys
- SMS API
- Email API
- OTP API
- Webhook delivery
- Dashboard
- Admin panel
- Basic prepaid wallet

### Phase 2: Reliability

- Retry engine
- Dead-letter queues
- Provider failover
- Rate limits
- Structured logs
- Alerting
- Usage analytics
- Webhook retry policy

### Phase 3: Compliance and Billing

- Customer KYC
- Sender ID approval
- Template approval
- Opt-out management
- A2P/DLT-style metadata
- Invoices
- Pricing plans
- Provider cost tracking
- Profit/loss per route

### Phase 4: Voice and SIP

- Outbound call API
- Inbound call webhooks
- Call recordings
- IVR
- SIP trunking
- CDR billing
- Fraud monitoring
- Carrier routing
