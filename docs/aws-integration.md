# AWS Integration & Cloud Architecture

## AWS Builder Challenge Integration
GuardianX leverages four core AWS services:

### 1. Amazon Bedrock
- **SDK**: `@aws-sdk/client-bedrock-runtime` (`InvokeModelCommand`)
- **Models**: `anthropic.claude-3-haiku-20240307-v1:0` / `amazon.nova-micro-v1:0`
- **System Prompting**: Implements conservative situational reasoning guardrails. Output strictly parsed and validated against Zod schema `AIAnalysisResultSchema`.

### 2. Amazon DynamoDB
- **SDK**: `@aws-sdk/client-dynamodb` & `@aws-sdk/lib-dynamodb`
- **Tables**:
  - `guardianx-events`: Stores normalized telemetry, device IDs, and sensor confidence.
  - `guardianx-incidents`: Stores escalation histories, caregiver notifications, and resolution audit notes.

### 3. AWS Lambda
- Serverless handlers located in `/aws/lambda/`:
  - `eventProcessor.ts`: Normalizes incoming webhooks
  - `aiAnalyzer.ts`: Invokes Bedrock model
  - `incidentProcessor.ts`: Persists incidents to DynamoDB
  - `notificationProcessor.ts`: Dispatches alerts via SNS

### 4. Amazon S3
- **SDK**: `@aws-sdk/client-s3`
- Stores event snapshots and compliance reports.
