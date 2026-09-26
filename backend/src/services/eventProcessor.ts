import { dynamoDbService } from '../database/dynamoDbService';
import { bedrockService } from '../ai/bedrockService';
import { socketServer } from '../websocket/socketServer';
import { HomeEvent, Incident, EscalationStep } from '../types';

export class EventProcessor {
  /**
   * Processes an incoming event through the complete GuardianX pipeline:
   * 1. Persistence in DynamoDB / Local Storage
   * 2. Context retrieval
   * 3. AI Analysis via Bedrock / Mock Engine
   * 4. Real-time WebSocket emission
   * 5. High-severity incident generation & caregiver dispatch simulation
   */
  public async processEvent(event: HomeEvent): Promise<{ event: HomeEvent; incident?: Incident }> {
    // 1. Save event
    await dynamoDbService.saveEvent(event);

    // Broadcast new event immediately to frontend
    socketServer.broadcastEvent(event);

    // 2. Fetch recent contextual events for AI reasoning
    const recentHistory = await dynamoDbService.getEvents(10);

    // 3. AI Analysis
    socketServer.broadcastAiThinking({
      eventId: event.id,
      status: 'started',
      timestamp: new Date().toISOString(),
    });

    const aiAnalysis = await bedrockService.analyzeEvent(event, recentHistory);

    socketServer.broadcastAiThinking({
      eventId: event.id,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });

    socketServer.broadcastAiResult({
      eventId: event.id,
      analysis: aiAnalysis,
    });

    // 4. Incident Generation: If severity is high or critical, or requires attention
    let incident: Incident | undefined;
    if (aiAnalysis.severity === 'high' || aiAnalysis.severity === 'critical' || event.eventType === 'possible_fall') {
      incident = await this.createIncidentForEvent(event, aiAnalysis);
    }

    return { event, incident };
  }

  private async createIncidentForEvent(
    event: HomeEvent,
    aiAnalysis: Awaited<ReturnType<typeof bedrockService.analyzeEvent>>
  ): Promise<Incident> {
    const timestamp = new Date().toISOString();
    const incidentId = `inc_${Date.now()}`;

    const escalationHistory: EscalationStep[] = [
      {
        timestamp: event.timestamp,
        action: `Event detected at ${event.location} (${event.eventType.replace('_', ' ')})`,
        actor: 'Ring Sensor Gateway',
      },
      {
        timestamp,
        action: `AI reasoning completed with ${(aiAnalysis.confidence * 100).toFixed(0)}% confidence: "${aiAnalysis.summary}"`,
        actor: aiAnalysis.sourceModel || 'Amazon Bedrock AI Engine',
      },
    ];

    if (event.eventType === 'possible_fall') {
      escalationHistory.push({
        timestamp: new Date().toISOString(),
        action: 'Automated two-way audio check prompt initiated: "Are you okay?"',
        actor: 'GuardianX Intercom Subsystem',
      });
      escalationHistory.push({
        timestamp: new Date().toISOString(),
        action: 'No verbal response detected from resident within 15 seconds',
        actor: 'Voice Audio Telemetry',
      });
      escalationHistory.push({
        timestamp: new Date().toISOString(),
        action: 'Simulated high-priority alert dispatched to primary caregiver (Sarah Mitchell)',
        actor: 'Caregiver Notification Dispatcher',
      });
    }

    const caregivers = await dynamoDbService.getCaregivers();
    const primaryCaregiver = caregivers.find((c) => c.isPrimary) || caregivers[0];

    const incident: Incident = {
      id: incidentId,
      title: `${aiAnalysis.severity.toUpperCase()} Priority: ${event.eventType.replace('_', ' ').toUpperCase()} at ${event.location}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'open',
      severity: aiAnalysis.severity,
      location: event.location,
      events: [event],
      aiAnalysis,
      escalationHistory,
      caregiversNotified: primaryCaregiver ? [primaryCaregiver.name] : ['Family Contact'],
    };

    await dynamoDbService.saveIncident(incident);
    socketServer.broadcastIncident(incident);

    // Simulate Caregiver Push Notification
    if (primaryCaregiver) {
      socketServer.broadcastCaregiverNotification({
        id: `notif_${Date.now()}`,
        timestamp: new Date().toISOString(),
        caregiverName: primaryCaregiver.name,
        severity: aiAnalysis.severity,
        title: incident.title,
        message: aiAnalysis.summary,
        simulated: true,
      });
    }

    return incident;
  }
}

export const eventProcessor = new EventProcessor();
