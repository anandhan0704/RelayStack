# RelayStack

RelayStack is a developer-first CPaaS and ESP platform concept: a practical communications product for SMS, owned email infrastructure, OTP, voice-ready workflows, webhooks, billing, compliance, and provider routing.

Start here:

- [Product Requirements](docs/prd.md)
- [Architecture Diagrams](docs/architecture.md)
- [Production Infrastructure](docs/production-infra.md)
- [Wholesale Telecom Infrastructure](docs/wholesale-telecom.md)

## Recommended MVP

Build RelayStack first as a provider-backed aggregator platform:

- Node.js + TypeScript API
- Fastify for HTTP APIs
- PostgreSQL
- Redis
- RabbitMQ or AWS SQS
- Node.js background worker services
- Angular or React dashboard
- AWS ECS Fargate
- Owned RelayStack MTA path for email
- Twilio, Bandwidth, or a local aggregator for SMS

Do not start with SIP trunking or carrier interconnects. Build the API, billing, compliance, routing, webhooks, and dashboard first.

## Project Layout

```text
apps/
  api/          Fastify API service
  mta/          Haraka SMTP service for owned email flow
  worker/       Background worker service
  dashboard/    Customer dashboard
  admin/        Internal admin panel
packages/
  config/       Environment configuration
  domain/       Shared business types
  shared/       Common utilities
deploy/
  docker/       Local PostgreSQL, Redis, RabbitMQ
  aws/          Production deployment notes
docs/           PRD and architecture diagrams
tests/          Unit and API tests
```

## Local Development

```bash
npm install
npm run db:generate
npm run db:bootstrap
npm run db:seed
npm run dev:mta
npm run dev:api
```

The API starts on `http://localhost:3100` by default.
The Haraka MTA listens on `127.0.0.1:2525`. With `MTA_MODE=deliver` (default), accepted mail is signed with DKIM and delivered to recipient MX servers. With `MTA_MODE=capture`, messages are written to `apps/mta/var/spool` only.

Email sending is asynchronous: the API enqueues jobs on RabbitMQ and the worker submits them to Haraka. Start all three for end-to-end delivery:

```bash
npm run dev:mta
npm run dev:worker
npm run dev:api
```

See [apps/mta/README.md](apps/mta/README.md) for DKIM key generation and SPF/DMARC DNS setup.

Frontend apps:

```bash
npm run dev:dashboard
npm run dev:admin
```

The customer dashboard runs on `http://localhost:5173`.
The admin panel runs on `http://localhost:5174`.
