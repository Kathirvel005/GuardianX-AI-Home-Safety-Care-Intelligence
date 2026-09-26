/**
 * AWS Lambda Handler: AI Analyzer
 * Invokes Amazon Bedrock Anthropic Claude model to reason over home events.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

export const handler = async (event: { currentEvent: any; recentContext?: any[] }): Promise<any> => {
  const systemPrompt = `You are GuardianX, an AI home-event interpretation assistant.
You analyze structured connected-home events from smart doorbells and safety cameras.
You must:
1. Describe what the event indicates.
2. Consider available context.
3. Assign a conservative severity: "low", "medium", "high", or "critical".
4. Explain uncertainty.
5. Recommend a reasonable next action.
6. Never claim certainty when evidence is incomplete.
7. Never diagnose medical conditions.
8. Never identify someone as a criminal based solely on behavior.
9. Return strictly valid JSON:
{
  "summary": "string",
  "severity": "low|medium|high|critical",
  "confidence": 0.0 to 1.0,
  "reasoning": "string",
  "recommendedAction": "string",
  "requiresAttention": boolean
}`;

  const payload = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyze this home event:\n${JSON.stringify(event, null, 2)}`,
      },
    ],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(payload),
  });

  const response = await bedrock.send(command);
  const text = new TextDecoder().decode(response.body);
  const parsed = JSON.parse(text);
  const content = parsed.content?.[0]?.text;

  return JSON.parse(content);
};
