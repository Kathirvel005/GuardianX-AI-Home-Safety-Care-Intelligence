/**
 * AWS Lambda Handler: Event Processor
 * Triggered by API Gateway (POST /events) or EventBridge / IoT Core.
 * Normalizes incoming Ring payload and routes to Amazon Bedrock analysis.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface NormalizedEvent {
  id: string;
  timestamp: string;
  source: string;
  deviceId: string;
  location: string;
  eventType: string;
  confidence: number;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const normalized: NormalizedEvent = {
      id: `evt_lambda_${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: body.source || 'ring-webhook',
      deviceId: body.doorbot_id || 'front-door-bell',
      location: body.doorbot_description || 'Front Entrance',
      eventType: body.kind === 'ding' ? 'visitor_detected' : body.kind || 'motion',
      confidence: 0.95,
    };

    console.log('[Lambda:eventProcessor] Normalized event:', JSON.stringify(normalized));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, event: normalized }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Lambda:eventProcessor] Error:', message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
