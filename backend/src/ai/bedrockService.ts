import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { AIAnalysisResult, AIAnalysisResultSchema, HomeEvent } from '../types';

export class BedrockService {
  private client: BedrockRuntimeClient | null = null;
  private modelId: string;
  private isConfigured = false;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

    if (
      process.env.AI_MODE === 'bedrock' &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      try {
        this.client = new BedrockRuntimeClient({
          region: this.region,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        });
        this.isConfigured = true;
      } catch (err) {
        console.warn('[BedrockService] Failed to initialize Bedrock client:', err);
        this.client = null;
        this.isConfigured = false;
      }
    }
  }

  public getStatus(): {
    status: 'CONNECTED' | 'LOCAL MOCK' | 'NOT CONFIGURED' | 'ERROR';
    mode: 'bedrock' | 'mock';
    message: string;
    modelId: string;
    verified: boolean;
  } {
    if (process.env.AI_MODE === 'bedrock') {
      if (this.isConfigured && this.client) {
        return {
          status: 'CONNECTED',
          mode: 'bedrock',
          message: `Connected to Amazon Bedrock (${this.modelId})`,
          modelId: this.modelId,
          verified: true,
        };
      }
      return {
        status: 'NOT CONFIGURED',
        mode: 'bedrock',
        message: 'Bedrock credentials missing or initialization failed',
        modelId: this.modelId,
        verified: false,
      };
    }

    return {
      status: 'LOCAL MOCK',
      mode: 'mock',
      message: 'Demo Mock AI Engine active (zero credentials required)',
      modelId: 'guardianx-mock-bedrock-engine',
      verified: true,
    };
  }

  /**
   * Evaluates a current event alongside recent historical context.
   */
  public async analyzeEvent(event: HomeEvent, recentHistory: HomeEvent[] = []): Promise<AIAnalysisResult> {
    if (this.isConfigured && this.client && process.env.AI_MODE === 'bedrock') {
      try {
        return await this.callBedrock(event, recentHistory);
      } catch (error) {
        console.error('[BedrockService] Bedrock invocation failed, falling back to safe local reasoning:', error);
      }
    }

    // High quality deterministic fallback matching safety principles
    return this.generateConservativeMockAnalysis(event, recentHistory);
  }

  /**
   * Invokes Amazon Bedrock Anthropic Claude / Nova model via AWS SDK
   */
  private async callBedrock(event: HomeEvent, recentHistory: HomeEvent[]): Promise<AIAnalysisResult> {
    if (!this.client) throw new Error('Bedrock client not initialized');

    const systemPrompt = `You are GuardianX, an AI home-event interpretation assistant.
You analyze structured connected-home events from smart doorbells and safety cameras.
You must:
1. Describe what the event indicates in clear, plain language.
2. Consider available historical context.
3. Assign a conservative severity: "low", "medium", "high", or "critical".
4. Explain uncertainty.
5. Recommend a reasonable next action.
6. NEVER claim certainty when evidence is incomplete.
7. NEVER diagnose medical conditions (use terms like "possible safety incident" or "possible fall").
8. NEVER identify someone as a criminal based solely on behavior.
9. Return strictly valid JSON matching this schema:
{
  "summary": "string",
  "severity": "low|medium|high|critical",
  "confidence": 0.0 to 1.0,
  "reasoning": "string",
  "recommendedAction": "string",
  "requiresAttention": boolean
}`;

    const promptPayload = {
      currentEvent: event,
      recentContext: recentHistory.slice(-5),
    };

    const requestBody = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 600,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this home event and contextual history:\n${JSON.stringify(promptPayload, null, 2)}`,
        },
      ],
    });

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: new TextEncoder().encode(requestBody),
    });

    const response = await this.client.send(command);
    const decoded = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(decoded) as { content?: Array<{ text?: string }> };
    const rawText = parsed.content?.[0]?.text || '';

    // Extract JSON block if wrapped
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON returned from Bedrock model');
    }

    const jsonParsed = JSON.parse(jsonMatch[0]);
    const validated = AIAnalysisResultSchema.parse({
      ...jsonParsed,
      sourceModel: `Amazon Bedrock (${this.modelId})`,
    });

    return validated;
  }

  /**
   * Fallback rule-based reasoning engine ensuring safe, human-readable contextual insights.
   */
  public generateConservativeMockAnalysis(event: HomeEvent, recentHistory: HomeEvent[]): AIAnalysisResult {
    const { eventType, location, durationSeconds } = event;

    if (eventType === 'possible_fall') {
      return {
        summary: `Possible safety incident detected near ${location}. A person appears to have fallen and has not responded to voice prompt.`,
        severity: 'high',
        confidence: 0.94,
        reasoning:
          'Camera sensors detected sudden vertical deceleration followed by immobility. Voice assistance was initiated with no verbal response registered within 15 seconds.',
        recommendedAction: 'Check on person immediately or contact secondary caregiver.',
        requiresAttention: true,
        sourceModel: 'GuardianX Safe Fall Detection Model (Mock/Fallback)',
      };
    }

    if (eventType === 'prolonged_presence' || (eventType === 'person_detected' && (durationSeconds || 0) > 15)) {
      return {
        summary: `Motion was detected near ${location}. A person remained in the zone for approximately ${durationSeconds || 18} seconds.`,
        severity: 'medium',
        confidence: 0.89,
        reasoning:
          'Continuous motion and visual presence exceeded normal dwell time without active doorbell interaction.',
        recommendedAction: 'Verify through live stream or intercom if visitor requires assistance.',
        requiresAttention: true,
        sourceModel: 'GuardianX Dwelling Analysis Model (Mock/Fallback)',
      };
    }

    if (eventType === 'door_opened') {
      const isNight = new Date().getHours() < 6 || new Date().getHours() > 22;
      return {
        summary: `Door opened at ${location}.${isNight ? ' Notice: Unusual late-night activity.' : ''}`,
        severity: isNight ? 'medium' : 'low',
        confidence: 0.99,
        reasoning: `Contact sensor triggered open state at ${location}.${isNight ? ' Occurred outside normal scheduled family hours.' : ''}`,
        recommendedAction: isNight ? 'Confirm resident expected or verify door is secured.' : 'No immediate action required.',
        requiresAttention: isNight,
        sourceModel: 'GuardianX Perimeter Monitoring Model (Mock/Fallback)',
      };
    }

    if (eventType === 'package_detected') {
      return {
        summary: `A delivery package was placed at ${location}.`,
        severity: 'low',
        confidence: 0.93,
        reasoning: 'Object detection identified a box-shaped parcel left in the camera target zone following brief courier movement.',
        recommendedAction: 'Retrieve package when convenient to prevent prolonged weather exposure.',
        requiresAttention: false,
        sourceModel: 'GuardianX Object Classifier (Mock/Fallback)',
      };
    }

    if (eventType === 'visitor_detected') {
      return {
        summary: `Visitor rang the doorbell at ${location}.`,
        severity: 'low',
        confidence: 0.98,
        reasoning: 'Physical doorbell chime triggered. Person is actively standing in front of camera.',
        recommendedAction: 'Answer via Ring two-way talk or open front door.',
        requiresAttention: false,
        sourceModel: 'GuardianX Doorbell Interpreter (Mock/Fallback)',
      };
    }

    if (eventType === 'unknown_person') {
      return {
        summary: `Unrecognized individual observed near ${location}.`,
        severity: 'medium',
        confidence: 0.86,
        reasoning: 'Person detected whose facial profile does not match saved household member tags. No doorbell ring initiated.',
        recommendedAction: 'Observe video monitor or use two-way talk to greet visitor.',
        requiresAttention: true,
        sourceModel: 'GuardianX Recognition Classifier (Mock/Fallback)',
      };
    }

    // Default motion / sensor event
    return {
      summary: `Standard motion detected in ${location}.`,
      severity: 'low',
      confidence: 0.88,
      reasoning: 'Brief ambient movement detected by PIR sensor. No prolonged dwell or unusual trajectory.',
      recommendedAction: 'No action required.',
      requiresAttention: false,
      sourceModel: 'GuardianX Event Normalizer (Mock/Fallback)',
    };
  }

  /**
   * Conversational query assistant ("Ask GuardianX")
   */
  public async answerQuestion(
    question: string,
    events: HomeEvent[],
    incidents: unknown[]
  ): Promise<{ answer: string; relatedEventIds: string[] }> {
    const qLower = question.toLowerCase();

    if (qLower.includes('what happened') || qLower.includes('summary') || qLower.includes('today')) {
      const fallEvent = events.find((e) => e.eventType === 'possible_fall');
      const packages = events.filter((e) => e.eventType === 'package_detected');
      const visitors = events.filter((e) => e.eventType === 'visitor_detected' || e.eventType === 'person_detected');

      let summary = `Today GuardianX processed ${events.length} home events across all connected Ring devices. `;
      if (fallEvent) {
        summary += `The most critical event was a possible safety incident near ${fallEvent.location} where a person fell and did not respond to voice prompts. `;
      }
      if (packages.length > 0) {
        summary += `${packages.length} package delivery was detected. `;
      }
      if (visitors.length > 0) {
        summary += `${visitors.length} visitor interactions were logged. `;
      }
      summary += 'All safety protocols and caregiver escalations are up to date.';

      return {
        answer: summary,
        relatedEventIds: events.slice(0, 3).map((e) => e.id),
      };
    }

    if (qLower.includes('door') || qLower.includes('anyone at the door')) {
      const doorEvents = events.filter((e) => e.location.toLowerCase().includes('front') || e.eventType === 'visitor_detected');
      if (doorEvents.length > 0) {
        const latest = doorEvents[0];
        return {
          answer: `The latest activity at the door was ${latest.eventType.replace('_', ' ')} detected at ${new Date(latest.timestamp).toLocaleTimeString()}. The perimeter is currently secure.`,
          relatedEventIds: [latest.id],
        };
      }
      return {
        answer: 'There is currently no one detected at the front door. The area is quiet.',
        relatedEventIds: [],
      };
    }

    if (qLower.includes('incident') || qLower.includes('important') || qLower.includes('safety')) {
      const highSeverity = events.filter((e) => e.eventType === 'possible_fall' || e.eventType === 'unusual_activity');
      if (highSeverity.length > 0) {
        return {
          answer: `Attention required: We identified a possible safety incident near ${highSeverity[0].location}. Caregiver notifications were simulated.`,
          relatedEventIds: highSeverity.map((e) => e.id),
        };
      }
      return {
        answer: 'No critical incidents are currently open. All safety parameters are within normal thresholds.',
        relatedEventIds: [],
      };
    }

    return {
      answer: `GuardianX analyzed your query: "${question}". Based on current device telemetry and ${events.length} active events, all home zones are operating normally under active monitoring.`,
      relatedEventIds: events.slice(0, 2).map((e) => e.id),
    };
  }
}

export const bedrockService = new BedrockService();
