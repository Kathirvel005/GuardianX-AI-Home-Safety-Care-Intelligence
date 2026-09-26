# GuardianX 3-Minute Hackathon Presentation Script

## Target Timing & Stage Directions

### 0:00 – 0:15 | The Problem & Introduction
* **Visual**: Landing Page (`/`) showing the hero title and contrast comparison.
* **Speaker**:
  > "Smart home cameras generate endless notifications. 'Motion detected. Motion detected.' When an elderly parent falls or a stranger loiters, that critical signal is buried in noise.
  >
  > Welcome to **GuardianX: AI Home Safety & Care Intelligence**. GuardianX understands what is happening at home and turns events into intelligent, actionable assistance."

---

### 0:15 – 0:35 | Normal Home Activity & Command Center
* **Visual**: Click **'Open Command Center'** (`/dashboard`). Show clean status: `HOME STATUS: SAFE`, 3 Devices Online. Click Demo Bar: `Visitor Arrives`.
* **Speaker**:
  > "Here in the Command Center, GuardianX monitors connected Ring doorbells and indoor cameras. When a guest arrives, GuardianX doesn't just ping 'motion'; it correlates the approach with the chime and logs a routine visitor."

---

### 0:35 – 1:20 | Possible Safety Incident Scenario (Fall Detection)
* **Visual**: Click **'RUN SCENARIO: Possible Safety Incident'** on the Demo Bar.
  - Camera bounding box turns red: `POSSIBLE FALL DETECTED (CONF: 94%)`.
  - Event Stream ticks: Motion -> Person -> Possible Fall -> AI Reasoning.
  - Home Status flips to `CRITICAL`.
  - Notification toast appears: `SIMULATED NOTIFICATION dispatched to Sarah Mitchell`.
* **Speaker**:
  > "Now, let's trigger our primary hackathon scenario: an elderly resident trips near the front entrance.
  >
  > Immediately, GuardianX detects rapid deceleration followed by zero movement. It triggers an automatic two-way voice check: 'Are you okay?' When no verbal response is registered within 15 seconds, the incident is escalated in real time without human delay."

---

### 1:20 – 1:50 | AI Reasoning & Incident Timeline
* **Visual**: Click into **'Incidents'** (`/incidents`). Show the AI Insight card and the vertical chronological sequence.
* **Speaker**:
  > "Look at the AI Insight. Powered by Amazon Bedrock, GuardianX provides conservative, human-readable reasoning: 'Possible safety incident detected. Resident appears to have fallen and not responded to voice prompt.'
  >
  > Notice that GuardianX never makes reckless medical claims—it assigns conservative severity and recommends immediate verification. The vertical timeline logs every millisecond from sensor trigger to caregiver notification."

---

### 1:50 – 2:15 | Voice Assistant ("Ask GuardianX")
* **Visual**: Click **'AI Assistant'** (`/assistant`). Click suggested prompt: *"What happened today?"* or speak into the microphone. Assistant responds in text and synthesizes speech.
* **Speaker**:
  > "Family members can check in using conversational natural language: 'What happened today?'
  >
  > GuardianX summarizes the day's events, highlighting the fall event and current escalation state."

---

### 2:15 – 2:35 | AWS Architecture
* **Visual**: Click **'Integrations'** (`/integrations`).
* **Speaker**:
  > "Under the hood, GuardianX uses Amazon Bedrock for foundation model reasoning, Amazon DynamoDB for millisecond document storage, AWS Lambda for serverless event processing, and Amazon S3 for event snapshots."

---

### 2:35 – 2:50 | Ring Integration & Transparency
* **Visual**: Point out Ring adapter card with verified status and simulator mode watermark.
* **Speaker**:
  > "Our architecture implements a clean Ring adapter pattern. It runs seamlessly in demo mode for zero-setup judging, and connects directly to official Ring APIs when production credentials are provided—with zero fabricated statuses."

---

### 2:50 – 3:00 | Closing Statement
* **Visual**: Return to dashboard. Click **'Mark Resolved'** on Incident (confetti triggers, status returns to `SAFE`).
* **Speaker**:
  > "GuardianX doesn't just detect what happens at home. It turns home events into understandable, contextual, and actionable assistance. Thank you!"
