# Developer Product Feedback

Honest technical feedback based on actual full-stack architecture and hackathon engineering.

---

## 1. Ring
* **What we used it for**: Connected home event triggers (motion, doorbell dings, person detection, sensor contact state) to provide real-time input to our AI reasoning pipeline.
* **What worked well**: The Ring device ecosystem concept is ubiquitous; homeowners already trust Ring hardware at their entrance doors and perimeters.
* **What could improve**: Developer onboarding for non-enterprise partners is restrictive. Providing an official sandbox environment with simulated WebSocket webhooks out of the box would accelerate developer prototyping exponentially.
* **Onboarding experience**: Navigating third-party Ring wrappers vs official enterprise developer access required designing our own adapter pattern to ensure demo reproducibility.
* **Would we build with it again?**: Yes. The hardware reliability and market penetration make Ring the premier foundation for ambient assisted living.

---

## 2. Amazon Bedrock
* **What we used it for**: Multi-event context synthesis, situational reasoning, and conservative severity classification using Claude 3 Haiku and Amazon Nova.
* **What worked well**: The `@aws-sdk/client-bedrock-runtime` API is clean and predictable. Setting temperature to 0.1 combined with system prompts yielded consistently valid JSON matching our Zod schemas.
* **What could improve**: Region-based model access quotas can cause friction during hackathons when a specific model requires manual quota approval in AWS console.
* **Onboarding experience**: Smooth once model access is granted in IAM and Bedrock console.
* **Would we build with it again?**: Absolutely. Bedrock is our preferred enterprise generative AI inference engine.

---

## 3. AWS Lambda
* **What we used it for**: Serverless event processor, AI analyzer, and notification dispatcher handlers.
* **What worked well**: Lightweight, stateless handlers that scale to zero cost when cameras are idle.
* **What could improve**: Cold start latency when loading AWS SDK v3 modules can add 400–800ms to initial triggers without provisioned concurrency.
* **Onboarding experience**: Standard, highly documented.
* **Would we build with it again?**: Yes, ideal for event-driven IoT architectures.

---

## 4. Amazon DynamoDB
* **What we used it for**: Document storage for high-frequency telemetry events and persistent incident histories.
* **What worked well**: Sub-10ms read/write latency and single-table secondary indexing.
* **What could improve**: The document client unmarshalling syntax still has occasional edge cases with empty strings or nested object types.
* **Onboarding experience**: Fast and reliable with on-demand capacity mode.
* **Would we build with it again?**: Yes, first choice for IoT time-series and state tracking.
