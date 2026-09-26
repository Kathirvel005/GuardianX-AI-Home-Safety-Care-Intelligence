# Hackathon Track & Challenge Compliance

## 1. Primary Track: Ring
* **Adapter Pattern Architecture**: Implemented in `backend/src/integrations/ring/ringAdapter.ts` with `RingEventProvider` interface.
* **Official API Client**: Implemented in `backend/src/integrations/ring/ringClient.ts` with token verification and device polling.
* **Event Normalization**: `backend/src/integrations/ring/ringEvents.ts` normalizes Ring motion, doorbell ding, and camera sensor events into standardized schemas.
* **Hardware Simulator**: `backend/src/integrations/ring/ringSimulator.ts` provides a high-fidelity virtual Ring gateway (Doorbell Pro 2, Stick Up Cam Battery, Indoor Cam 2nd Gen, Alarm Contact Sensor) for deterministic zero-credential evaluation.
* **Transparency**: Clear UI watermarks explicitly distinguish between `LIVE`, `SIMULATOR`, and `DEMO` modes.

## 2. Mini Challenge: AWS Builder
* **Amazon Bedrock**:
  - Code: `backend/src/ai/bedrockService.ts`
  - Uses `@aws-sdk/client-bedrock-runtime` (`InvokeModelCommand`).
  - Supports Claude 3 Haiku and Amazon Nova models with conservative safety reasoning guardrails.
* **Amazon DynamoDB**:
  - Code: `backend/src/database/dynamoDbService.ts`
  - Uses `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`.
  - Schema defined in `aws/dynamodb/tables.json` for `guardianx-events` and `guardianx-incidents`.
* **AWS Lambda**:
  - Handlers in `aws/lambda/`: `eventProcessor.ts`, `aiAnalyzer.ts`, `incidentProcessor.ts`, `notificationProcessor.ts`.
* **Amazon S3**:
  - Code: `backend/src/services/s3Service.ts`
  - Uses `@aws-sdk/client-s3` for event snapshots and audit export.

## 3. Optional Track: Open Source
* Licensed under the permissive **MIT License** (`LICENSE`).
* Clean modular codebase adhering to ESLint, Prettier, and TypeScript strict mode.
