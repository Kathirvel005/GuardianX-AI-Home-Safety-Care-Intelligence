# GUARDIANX
### AI Home Safety & Care Intelligence

> *"GuardianX understands what is happening at home and turns events into intelligent, actionable safety assistance."*

[![Hackathon Track](https://img.shields.io/badge/Hackathon-Ring%20Track-blue.svg)](#hackathon-track)
[![AWS Builder](https://img.shields.io/badge/AWS%20Builder-Bedrock%20%7C%20Lambda%20%7C%20DynamoDB-orange.svg)](#aws-integration)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Status](https://img.shields.io/badge/System-Demo%20Ready%20%26%20Production%20Adapter-cyan.svg)](#demo-mode)

---

## 1. Problem Statement
Connected-home security devices flood residents and caregivers with hundreds of repetitive, isolated notifications every week:
* `14:02:18 — Motion detected`
* `14:02:24 — Motion detected`
* `14:02:30 — Motion detected`

This constant stream causes **alert fatigue**. When an elderly parent trips near the doorway or an unfamiliar individual loiters suspiciously on the patio, the critical signal is buried in raw sensor noise. Caregivers and busy family members cannot continuously monitor video feeds.

---

## 2. Solution: The GuardianX Intelligence Layer
GuardianX introduces a real-time contextual interpretation layer between connected home devices (Ring doorbells, cameras, contact sensors) and humans:

* **Instead of:** *"Motion detected."*
* **GuardianX produces:** *"Motion was detected near the front entrance. A person was subsequently detected and remained near the entrance for approximately 18 seconds."*
* **For a safety event:** *"Possible safety incident detected near the front entrance. The person appears to have fallen and has not responded to the voice prompt. Immediate verification recommended."*

---

## 3. Core Features
* **AI Command Center (`/dashboard`)**:
  Real-time Home Status card (`SAFE`, `ATTENTION REQUIRED`, `CRITICAL`), live stats counters (Devices, People Detected, Daily Events, AI Status), and instant sensor simulation buttons.
* **Live Activity & Camera HUD (`/events`)**:
  Simulated Ring Pro 2 camera feed with computer vision bounding box overlays, optical dwell metrics, and high-fidelity video telemetry.
* **AI Insight Card**:
  Contextual summaries powered by Amazon Bedrock with conservative severity scoring, confidence metrics, and explicit non-diagnostic disclaimers.
* **Incident Timeline & Dispatch (`/incidents`)**:
  Chronological vertical escalation timeline detailing millisecond sensor telemetry, two-way audio ping state, and simulated caregiver notification dispatch.
* **Voice Assistant ("Ask GuardianX") (`/assistant`)**:
  Conversational voice input powered by the Web Speech API and Amazon Bedrock with automated audio response read-out.
* **Caregiver Center (`/caregivers`)**:
  Care team availability, multi-tier escalation policy, and simulated push alerts.
* **Filterable Event History (`/history`)**:
  Audit log with CSV export capability and filters for Safety, Visitors, Packages, Doors, and Motion.
* **Diagnostics & Anti-Fabrication Transparency (`/integrations`)**:
  Live connectivity checks for Ring, Amazon Bedrock, DynamoDB, S3, and WebSockets.
* **Command Palette (`Ctrl + K`)**:
  Keyboard-first power navigation for rapid demo control.
* **Deterministic Demo Controller**:
  One-click execution of scripted hackathon scenarios (`Possible Safety Incident`, `Visitor Arrives`, `Package Detected`, `Door Left Open`).

---

## 4. System Architecture
```
                         +------------------------+
                         |  Ring Event Providers  |
                         |  (Live / Sim / Demo)   |
                         +-----------+------------+
                                     |
                                     v
                         +------------------------+
                         |  Event Normalizer      |
                         +-----------+------------+
                                     |
                                     v
                  +------------------+------------------+
                  |                                     |
                  v                                     v
     +-------------------------+           +-------------------------+
     | Amazon DynamoDB / Local |           | Amazon Bedrock / Engine |
     | (Document Store)        |           | (Conservative Reasoning)|
     +-------------------------+           +------------+------------+
                  |                                     |
                  +------------------+------------------+
                                     |
                                     v
                         +------------------------+
                         | Event Processor        |
                         | & Incident Escalation  |
                         +-----------+------------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
    +-------------------------+             +-------------------------+
    | Socket.IO Server        |             | Caregiver Notification  |
    | (Real-time Broadcast)   |             | (Simulated / SNS)       |
    +------------+------------+             +-------------------------+
                 |
                 v
    +-------------------------+
    | GuardianX Frontend      |
    | (React + Vite + UI/UX)  |
    +-------------------------+
```

---

## 5. Technology Stack
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Canvas Confetti.
* **Backend**: Node.js, Express, TypeScript, Socket.IO, Zod.
* **AI Reasoning**: Amazon Bedrock (`@aws-sdk/client-bedrock-runtime`) with Claude 3 Haiku and Amazon Nova.
* **Database**: Amazon DynamoDB (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`) with local memory fallback.
* **Storage**: Amazon S3 (`@aws-sdk/client-s3`).
* **Device Integration**: Ring Adapter Pattern (`RingLiveProvider`, `RingSimulatorProvider`, `DemoProvider`).
* **Testing & Quality**: Vitest, ESLint, TypeScript Strict Mode.

---

## 6. Demo Mode (Zero Credentials Required)
GuardianX is built **demo-first**. Judges and evaluators can clone the repository and run the complete application immediately without configuring AWS accounts or physical Ring devices.

The UI displays clear status badges (`DEMO MODE` / `SIMULATOR` / `LIVE`) ensuring 100% honesty and zero false claims.

---

## 7. Running Locally

### Prerequisites
* Node.js v18+ (tested on Node v20/v24)
* npm v9+

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/your-username/guardianx.git
cd guardianx

# 2. Install all dependencies (root, backend, frontend)
npm run install:all

# 3. Start development servers concurrently
npm run dev
```

Open **http://localhost:5173** to view GuardianX.

### One-Command Test Suite
```bash
npm run test
```

### Production Build
```bash
npm run build
```

---

## 8. Environment Variables
Create a `.env` file in the root or copy from `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# Ring Mode: demo | simulator | live
RING_MODE=demo
RING_API_TOKEN=

# AI Mode: mock | bedrock
AI_MODE=mock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Database: local | dynamodb
STORAGE_MODE=local
DYNAMODB_TABLE_EVENTS=guardianx-events
DYNAMODB_TABLE_INCIDENTS=guardianx-incidents

# Storage: local | s3
S3_MODE=local
S3_BUCKET=guardianx-event-snapshots
```

---

## 9. AI Safety Principles
GuardianX follows strict conservative safety guardrails:
1. **Never Diagnoses Medical Conditions**: Uses terms like *"possible safety incident"* or *"possible fall requiring attention"*, never claiming clinical certainty.
2. **Never Declares Anyone a Criminal**: Describes observed behavioral patterns without making unsupported legal or character assertions.
3. **No Automatic Dangerous Actions**: Employs two-way voice check prompts and caregiver escalation rather than dispatching emergency sirens prematurely.

---

## 10. Hackathon Track & Challenge Alignment
* **Primary Track — Ring**: Standardized `RingEventProvider` adapter architecture, event normalizer, and virtual simulator gateway for Ring Video Doorbells and cameras.
* **Mini Challenge — AWS Builder**: Real AWS SDK implementations for Amazon Bedrock, DynamoDB, S3, and deployable Lambda handlers in `/aws/lambda/`.
* **Optional — Open Source**: Released under the permissive MIT License.

---

## 11. Documentation Links
* [System Architecture](docs/architecture.md)
* [Setup & Installation Guide](docs/setup.md)
* [Ring Integration Specifications](docs/ring-integration.md)
* [AWS Integration Guide](docs/aws-integration.md)
* [3-Minute Demo Presentation Script](docs/demo-script.md)
* [Hackathon Compliance Checklist](docs/hackathon-compliance.md)
* [Developer Product Feedback](docs/product-feedback.md)
* [Developer Friction Log](docs/friction-log.md)

---

## 12. License
MIT License. See [LICENSE](LICENSE) for details.
