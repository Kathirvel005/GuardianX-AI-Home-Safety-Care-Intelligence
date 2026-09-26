# GuardianX Setup & Installation Guide

## Quick Start (Zero Credentials Required)

GuardianX is demo-ready out of the box without requiring AWS credentials or Ring hardware.

### 1. Clone & Install
```bash
git clone https://github.com/your-org/guardianx.git
cd guardianx

# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Run Locally
```bash
# Starts both Backend (port 5000) and Frontend (port 5173) concurrently
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## Production Setup (Connecting Live Services)

To connect GuardianX to real AWS Bedrock and Ring devices:

### 1. Copy Environment Configuration
```bash
cp .env.example .env
```

### 2. Configure AWS Bedrock & DynamoDB
```env
AI_MODE=bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

STORAGE_MODE=dynamodb
DYNAMODB_TABLE_EVENTS=guardianx-events
DYNAMODB_TABLE_INCIDENTS=guardianx-incidents
```

### 3. Configure Ring API
```env
RING_MODE=live
RING_API_TOKEN=your_ring_oauth_token
```

### 4. Restart Server
```bash
npm run dev
```
Navigate to `/integrations` to verify that all connections show **CONNECTED** (verified via live SDK handshake).
