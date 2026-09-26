# GuardianX System Architecture

## Overview
GuardianX is an intelligent interpretation layer connecting Ring-enabled smart homes with Amazon Web Services (Bedrock, Lambda, DynamoDB, S3) and caregivers. Instead of generic sensor alerts, GuardianX contextualizes events into human-readable safety intelligence.

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

## Key Architectural Principles
1. **Adapter Pattern for Device Sources**:
   `RingEventProvider` abstracts live Ring hardware from virtual simulators and deterministic demo scenarios. Swapping modes requires only changing `RING_MODE=demo|simulator|live`.

2. **Conservative AI Safety Reasoning**:
   GuardianX utilizes Amazon Bedrock (Anthropic Claude 3 / Amazon Nova) with explicit guardrails:
   - No medical diagnoses (uses "possible fall" rather than certainty)
   - Never labels people as criminals based solely on behavior
   - Quantified confidence metrics
   - Structured JSON validation with Zod

3. **Zero-Configuration Demo-First Execution**:
   Out of the box, `npm install && npm run dev` runs in deterministic demo mode with in-memory stores, allowing judges to evaluate the entire pipeline without AWS credentials or physical Ring devices.

4. **Multi-Tier Incident Escalation**:
   - Level 1: Automatic two-way audio check prompt ("Are you okay?")
   - Level 2: Primary caregiver push notification if no verbal response in 15 seconds
   - Level 3: Secondary contact & emergency escalation if unacknowledged
