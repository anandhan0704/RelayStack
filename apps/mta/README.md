# RelayStack MTA

Local Haraka-based MTA for RelayStack email development and outbound delivery.

## Modes

Set `MTA_MODE` (or `RELAYSTACK_MTA_MODE`) in the environment:

| Mode | Behavior |
| --- | --- |
| `capture` | Accept SMTP on `127.0.0.1:2525` and write `.eml` files to `var/spool` only |
| `deliver` | Relay accepted mail to recipient MX servers (Gmail, etc.) |

Default: `deliver`

```bash
npm run dev:mta       # deliver mode
npm run dev:capture   # local capture only
```

## End-to-end flow

```text
POST /v1/email/send
  → API enqueues relaystack.email.send (RabbitMQ)
  → Worker submits to Haraka on 127.0.0.1:2525
  → Haraka signs (DKIM), queues outbound, delivers via MX
  → relaystack.email.status updates message to delivered/failed
```

## Prerequisites

1. Docker services running: Postgres, Redis, RabbitMQ
2. Haraka MTA: `npm run dev:mta`
3. API: `npm run dev:api`
4. Worker: `npm run dev:worker`

## DNS authentication (SPF / DKIM / DMARC)

Public inbox delivery requires DNS records for the **From** domain.

Generate DKIM keys:

```bash
cd apps/mta
npm run dkim:generate relaystack.local
cat config/dkim/relaystack.local/dns
```

Publish:

- **DKIM** — TXT at `<selector>._domainkey.<domain>` (from the `dns` file)
- **SPF** — `v=spf1 a mx ip4:<your-sending-ip> -all`
- **DMARC** — `_dmarc.<domain>` TXT `v=DMARC1; p=none; rua=mailto:dmarc@<domain>`

Also set a matching **PTR/reverse DNS** on the sending IP.

For local testing to Gmail, use a domain you control with these records published. Sending from `relaystack.local` without DNS will queue but receivers may reject the mail.

## Spool

Capture-mode and audit metadata live under:

```text
apps/mta/var/spool
```

Haraka outbound queue files are managed internally by Haraka.
