# Production Infrastructure Diagram

This production design assumes AWS and a practical MVP stack. Start with ECS Fargate instead of Kubernetes unless the platform already has a team ready to operate Kubernetes.

```mermaid
flowchart LR
    subgraph Edge["Public Edge"]
        Users["Customer Apps / Browsers / Servers"]
        Route53["Route 53 DNS"]
        Cdn["CloudFront CDN"]
        Waf["AWS WAF"]
    end

    subgraph Aws["AWS VPC"]
        subgraph Public["Public Subnets"]
            Alb["Application Load Balancer"]
            Nat["NAT Gateway"]
        end

        subgraph PrivateApp["Private App Subnets"]
            Api["API Service - Node.js / Fastify"]
            Dashboard["Dashboard Frontend Service"]
            Admin["Admin Service"]
            Auth["Auth Service"]
            Routing["Routing Engine"]
            Messaging["Messaging Service"]
            Email["Email Service"]
            Billing["Billing Service"]
            Webhook["Webhook Service"]
            Voice["Voice Service"]
        end

        subgraph PrivateWorkers["Private Worker Subnets"]
            SmsWorker["SMS Workers"]
            EmailWorker["Email Workers"]
            OtpWorker["OTP Workers"]
            DlqWorker["DLQ Workers"]
            BillingWorker["Billing Workers"]
            VoiceWorker["Voice Workers"]
        end

        subgraph Data["Private Data Layer"]
            Postgres[("Amazon RDS PostgreSQL")]
            Redis[("ElastiCache Redis")]
            Queue[("RabbitMQ / Amazon MQ")]
            Sqs["AWS SQS Queues"]
            S3["S3 Storage"]
        end

        Secrets["AWS Secrets Manager"]
        Logs["CloudWatch Logs"]
        Metrics["Grafana / Prometheus / OpenTelemetry"]
    end

    subgraph Providers["External Providers"]
        SmsProvider["Twilio / Bandwidth / Local SMS Aggregator"]
        EmailProvider["SendGrid / Amazon SES"]
        SipProvider["SIP Carrier / Twilio Voice / Bandwidth Voice"]
        OtpProvider["OTP Channels"]
    end

    Users --> Route53 --> Cdn --> Waf --> Alb
    Alb --> Api
    Alb --> Dashboard
    Alb --> Admin

    Api --> Auth
    Api --> Routing
    Api --> Messaging
    Api --> Email
    Api --> Billing
    Api --> Webhook
    Api --> Voice

    Auth --> Redis
    Routing --> Redis
    Messaging --> Queue
    Email --> Queue
    Billing --> Queue
    Webhook --> Queue
    Voice --> Queue

    Auth --> Postgres
    Messaging --> Postgres
    Email --> Postgres
    Billing --> Postgres
    Webhook --> Postgres
    Voice --> Postgres

    Queue --> SmsWorker
    Queue --> EmailWorker
    Queue --> OtpWorker
    Queue --> BillingWorker
    Queue --> VoiceWorker
    Sqs --> DlqWorker

    SmsWorker --> SmsProvider
    EmailWorker --> EmailProvider
    OtpWorker --> OtpProvider
    VoiceWorker --> SipProvider

    Api --> Secrets
    SmsWorker --> Secrets
    EmailWorker --> Secrets
    VoiceWorker --> Secrets

    Api --> Logs
    SmsWorker --> Logs
    EmailWorker --> Logs
    BillingWorker --> Logs
    Logs --> Metrics
```

## MVP AWS Components

| Component | Recommendation |
| --- | --- |
| Compute | ECS Fargate |
| API ingress | Application Load Balancer |
| Database | Amazon RDS PostgreSQL |
| Cache/rate limits | ElastiCache Redis |
| Queue | RabbitMQ/Amazon MQ or AWS SQS |
| Object storage | S3 |
| Secrets | AWS Secrets Manager |
| Logs | CloudWatch Logs |
| Metrics/traces | OpenTelemetry + Prometheus/Grafana |
| Edge security | AWS WAF + CloudFront |

## Deployment Notes

1. Keep API and worker services private except for the ALB-facing API and dashboard.
2. Store provider credentials only in Secrets Manager.
3. Use queue-based processing for SMS, email, OTP, voice, billing, and webhooks.
4. Add idempotency keys to customer-facing send APIs.
5. Use immutable wallet ledger transactions instead of directly mutating balance without audit.
6. Track provider latency, error rate, delivery rate, and cost per route.
