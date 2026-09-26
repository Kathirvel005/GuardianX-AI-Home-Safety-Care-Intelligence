import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Caregiver, Device, HomeEvent, Incident } from '../types';

export class DynamoDbService {
  private docClient: DynamoDBDocumentClient | null = null;
  private isConfigured = false;
  private eventsTable: string;
  private incidentsTable: string;
  private caregiversTable: string;

  // In-memory fallback stores
  private localEvents: HomeEvent[] = [];
  private localIncidents: Incident[] = [];
  private localCaregivers: Caregiver[] = [];
  private localDevices: Device[] = [];

  constructor() {
    this.eventsTable = process.env.DYNAMODB_TABLE_EVENTS || 'guardianx-events';
    this.incidentsTable = process.env.DYNAMODB_TABLE_INCIDENTS || 'guardianx-incidents';
    this.caregiversTable = process.env.DYNAMODB_TABLE_CAREGIVERS || 'guardianx-caregivers';

    if (
      process.env.STORAGE_MODE === 'dynamodb' &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      try {
        const rawClient = new DynamoDBClient({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        });
        this.docClient = DynamoDBDocumentClient.from(rawClient);
        this.isConfigured = true;
      } catch (err) {
        console.warn('[DynamoDbService] Failed to initialize DynamoDB client:', err);
        this.docClient = null;
        this.isConfigured = false;
      }
    }

    this.seedInitialLocalData();
  }

  public getStatus(): {
    status: 'CONNECTED' | 'LOCAL STORAGE' | 'ERROR';
    mode: 'dynamodb' | 'local';
    message: string;
    verified: boolean;
  } {
    if (process.env.STORAGE_MODE === 'dynamodb') {
      if (this.isConfigured && this.docClient) {
        return {
          status: 'CONNECTED',
          mode: 'dynamodb',
          message: `Connected to DynamoDB (${this.eventsTable}, ${this.incidentsTable})`,
          verified: true,
        };
      }
      return {
        status: 'ERROR',
        mode: 'dynamodb',
        message: 'DynamoDB configured in environment but connection/credentials failed',
        verified: false,
      };
    }

    return {
      status: 'LOCAL STORAGE',
      mode: 'local',
      message: 'Local memory storage mode active (ready for immediate local demo)',
      verified: true,
    };
  }

  public async saveEvent(event: HomeEvent): Promise<void> {
    // Add to local cache first
    this.localEvents.unshift(event);
    if (this.localEvents.length > 500) {
      this.localEvents.pop();
    }

    if (this.isConfigured && this.docClient) {
      try {
        await this.docClient.send(
          new PutCommand({
            TableName: this.eventsTable,
            Item: event,
          })
        );
      } catch (err) {
        console.error('[DynamoDbService] Failed to write event to DynamoDB:', err);
      }
    }
  }

  public async getEvents(limit = 100): Promise<HomeEvent[]> {
    if (this.isConfigured && this.docClient) {
      try {
        const res = await this.docClient.send(
          new ScanCommand({
            TableName: this.eventsTable,
            Limit: limit,
          })
        );
        if (res.Items && res.Items.length > 0) {
          return (res.Items as HomeEvent[]).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }
      } catch (err) {
        console.error('[DynamoDbService] Failed to scan events from DynamoDB:', err);
      }
    }

    return this.localEvents.slice(0, limit);
  }

  public async getEventById(id: string): Promise<HomeEvent | null> {
    if (this.isConfigured && this.docClient) {
      try {
        const res = await this.docClient.send(
          new GetCommand({
            TableName: this.eventsTable,
            Key: { id },
          })
        );
        if (res.Item) {
          return res.Item as HomeEvent;
        }
      } catch (err) {
        console.error('[DynamoDbService] Failed to get event from DynamoDB:', err);
      }
    }

    return this.localEvents.find((e) => e.id === id) || null;
  }

  public async saveIncident(incident: Incident): Promise<void> {
    const existingIndex = this.localIncidents.findIndex((i) => i.id === incident.id);
    if (existingIndex >= 0) {
      this.localIncidents[existingIndex] = incident;
    } else {
      this.localIncidents.unshift(incident);
    }

    if (this.isConfigured && this.docClient) {
      try {
        await this.docClient.send(
          new PutCommand({
            TableName: this.incidentsTable,
            Item: incident,
          })
        );
      } catch (err) {
        console.error('[DynamoDbService] Failed to write incident to DynamoDB:', err);
      }
    }
  }

  public async getIncidents(limit = 50): Promise<Incident[]> {
    if (this.isConfigured && this.docClient) {
      try {
        const res = await this.docClient.send(
          new ScanCommand({
            TableName: this.incidentsTable,
            Limit: limit,
          })
        );
        if (res.Items && res.Items.length > 0) {
          return (res.Items as Incident[]).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      } catch (err) {
        console.error('[DynamoDbService] Failed to scan incidents from DynamoDB:', err);
      }
    }

    return this.localIncidents.slice(0, limit);
  }

  public async getIncidentById(id: string): Promise<Incident | null> {
    if (this.isConfigured && this.docClient) {
      try {
        const res = await this.docClient.send(
          new GetCommand({
            TableName: this.incidentsTable,
            Key: { id },
          })
        );
        if (res.Item) {
          return res.Item as Incident;
        }
      } catch (err) {
        console.error('[DynamoDbService] Failed to get incident from DynamoDB:', err);
      }
    }

    return this.localIncidents.find((i) => i.id === id) || null;
  }

  public async getCaregivers(): Promise<Caregiver[]> {
    return this.localCaregivers;
  }

  public async saveCaregiver(caregiver: Caregiver): Promise<void> {
    const idx = this.localCaregivers.findIndex((c) => c.id === caregiver.id);
    if (idx >= 0) {
      this.localCaregivers[idx] = caregiver;
    } else {
      this.localCaregivers.push(caregiver);
    }
  }

  public async getDevices(): Promise<Device[]> {
    return this.localDevices;
  }

  public setDevices(devices: Device[]): void {
    this.localDevices = devices;
  }

  public clearAll(): void {
    this.localEvents = [];
    this.localIncidents = [];
    this.seedInitialLocalData();
  }

  /**
   * Seeds realistic sample data satisfying hackathon requirements:
   * > 20 normal events, 5 visitor events, 3 package events, 2 door events, 2 safety scenarios, 1 high-priority incident
   */
  private seedInitialLocalData(): void {
    const now = Date.now();
    const minutesAgo = (m: number) => new Date(now - m * 60 * 1000).toISOString();

    this.localCaregivers = [
      {
        id: 'cg_01',
        name: 'Sarah Mitchell',
        role: 'Primary Family Caregiver (Daughter)',
        phone: '+1 (555) 234-8901',
        email: 'sarah.m@example.com',
        status: 'online',
        isPrimary: true,
        lastNotification: minutesAgo(12),
      },
      {
        id: 'cg_02',
        name: 'David Mitchell',
        role: 'Secondary Family Contact (Son)',
        phone: '+1 (555) 234-8902',
        email: 'david.m@example.com',
        status: 'online',
        isPrimary: false,
        lastNotification: minutesAgo(90),
      },
      {
        id: 'cg_03',
        name: 'Visiting Nurse Services (VNS)',
        role: 'Healthcare Professional',
        phone: '+1 (555) 888-0199',
        email: 'dispatch@vns-care.org',
        status: 'online',
        isPrimary: false,
        lastNotification: minutesAgo(240),
      },
    ];

    // Seed realistic events
    const sampleEvents: HomeEvent[] = [
      // 1 high priority safety event
      {
        id: 'evt_1042',
        timestamp: minutesAgo(14),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'possible_fall',
        confidence: 0.94,
        durationSeconds: 18,
        responseDetected: false,
        metadata: { voicePromptInitiated: true, responseStatus: 'NO_RESPONSE_RECEIVED' },
      },
      // Earlier events leading to fall
      {
        id: 'evt_1041',
        timestamp: minutesAgo(14.2),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'person_detected',
        confidence: 0.96,
        durationSeconds: 14,
      },
      {
        id: 'evt_1040',
        timestamp: minutesAgo(14.5),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'motion',
        confidence: 0.92,
      },

      // Visitor events (5)
      {
        id: 'evt_1035',
        timestamp: minutesAgo(45),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'visitor_detected',
        confidence: 0.98,
        metadata: { chimeDurationMs: 4000 },
      },
      {
        id: 'evt_1030',
        timestamp: minutesAgo(110),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'visitor_detected',
        confidence: 0.97,
      },
      {
        id: 'evt_1025',
        timestamp: minutesAgo(180),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'visitor_detected',
        confidence: 0.95,
      },
      {
        id: 'evt_1020',
        timestamp: minutesAgo(240),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'visitor_detected',
        confidence: 0.96,
      },
      {
        id: 'evt_1015',
        timestamp: minutesAgo(320),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'visitor_detected',
        confidence: 0.98,
      },

      // Package events (3)
      {
        id: 'evt_1032',
        timestamp: minutesAgo(65),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'package_detected',
        confidence: 0.94,
        metadata: { courier: 'Amazon Prime', boxDimensions: 'medium' },
      },
      {
        id: 'evt_1028',
        timestamp: minutesAgo(140),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'package_detected',
        confidence: 0.91,
      },
      {
        id: 'evt_1012',
        timestamp: minutesAgo(400),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'package_detected',
        confidence: 0.95,
      },

      // Door events (2)
      {
        id: 'evt_1038',
        timestamp: minutesAgo(30),
        source: 'demo',
        deviceId: 'ring-contact-sensor-04',
        deviceName: 'Side Door Sensor',
        location: 'Side Door',
        eventType: 'door_opened',
        confidence: 0.99,
      },
      {
        id: 'evt_1037',
        timestamp: minutesAgo(28),
        source: 'demo',
        deviceId: 'ring-contact-sensor-04',
        deviceName: 'Side Door Sensor',
        location: 'Side Door',
        eventType: 'door_closed',
        confidence: 0.99,
      },

      // Second safety scenario event: Prolonged presence / unusual dwell
      {
        id: 'evt_1022',
        timestamp: minutesAgo(210),
        source: 'demo',
        deviceId: 'ring-stickup-cam-02',
        deviceName: 'Backyard Cam',
        location: 'Backyard Patio',
        eventType: 'prolonged_presence',
        confidence: 0.89,
        durationSeconds: 45,
        metadata: { nightMode: true },
      },
      {
        id: 'evt_1018',
        timestamp: minutesAgo(270),
        source: 'demo',
        deviceId: 'ring-doorbell-pro-01',
        deviceName: 'Front Entrance Doorbell',
        location: 'Front Entrance',
        eventType: 'unknown_person',
        confidence: 0.87,
        durationSeconds: 22,
      },

      // 20 normal ambient motion & person events
      ...Array.from({ length: 20 }).map((_, i) => ({
        id: `evt_norm_${1000 + i}`,
        timestamp: minutesAgo(50 + i * 25),
        source: 'demo' as const,
        deviceId: i % 2 === 0 ? 'ring-stickup-cam-02' : 'ring-indoor-cam-03',
        deviceName: i % 2 === 0 ? 'Backyard Patio Cam' : 'Living Room Cam',
        location: i % 2 === 0 ? 'Backyard Patio' : 'Living Room',
        eventType: (i % 3 === 0 ? 'person_detected' : 'motion') as any,
        confidence: 0.88 + (i % 10) * 0.01,
        durationSeconds: 6 + (i % 8),
      })),
    ];

    this.localEvents = sampleEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Seed 1 prominent high-priority incident corresponding to #1042
    this.localIncidents = [
      {
        id: 'inc_1042',
        title: 'Possible Fall Incident — Front Entrance',
        createdAt: minutesAgo(14),
        updatedAt: minutesAgo(12),
        status: 'open',
        severity: 'high',
        location: 'Front Entrance',
        events: [
          sampleEvents[2], // motion
          sampleEvents[1], // person
          sampleEvents[0], // possible fall
        ],
        aiAnalysis: {
          summary:
            'Possible safety incident detected near the front entrance. The person appears to have fallen and has not responded to the voice prompt.',
          severity: 'high',
          confidence: 0.94,
          reasoning:
            'Continuous Ring doorbell video telemetry registered abrupt downwards motion followed by complete immobility. Automatic voice assistance triggered through two-way audio; no audio response detected after 15 seconds.',
          recommendedAction: 'Check on person immediately or contact secondary caregiver.',
          requiresAttention: true,
          sourceModel: 'Amazon Bedrock (Claude 3 Haiku / GuardianX Safe Fall Engine)',
        },
        escalationHistory: [
          {
            timestamp: minutesAgo(14),
            action: 'Event detected by Ring Doorbell Pro 2',
            actor: 'Ring Sensor Gateway',
          },
          {
            timestamp: minutesAgo(13.8),
            action: 'Amazon Bedrock AI reasoning completed with 94% confidence',
            actor: 'GuardianX AI Engine',
          },
          {
            timestamp: minutesAgo(13.5),
            action: 'Automated two-way audio voice check prompt initiated',
            actor: 'GuardianX Voice Intercom',
          },
          {
            timestamp: minutesAgo(13),
            action: 'No verbal response detected from resident within 15 seconds',
            actor: 'Voice Telemetry',
          },
          {
            timestamp: minutesAgo(12.5),
            action: 'Simulated high-priority push notification dispatched to Sarah Mitchell (Primary)',
            actor: 'Caregiver Dispatcher',
          },
        ],
        caregiversNotified: ['Sarah Mitchell', 'David Mitchell'],
      },
    ];
  }
}

export const dynamoDbService = new DynamoDbService();
