# AWS Deployment

Initial production target:

- ECS Fargate for API and workers
- RDS PostgreSQL
- ElastiCache Redis
- Amazon MQ or SQS for queues
- Application Load Balancer
- CloudWatch Logs
- Secrets Manager
- OpenTelemetry metrics and traces

Infrastructure-as-code can be added here with Terraform, AWS CDK, or Pulumi.

