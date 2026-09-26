export type EventType =
  | 'motion'
  | 'person_detected'
  | 'package_detected'
  | 'door_opened'
  | 'door_closed'
  | 'visitor_detected'
  | 'unknown_person'
  | 'possible_fall'
  | 'prolonged_presence'
  | 'unusual_activity'
  | 'system_event';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HomeEvent {
  id: string;
  timestamp: string;
  source: 'ring' | 'simulator' | 'demo';
  deviceId: string;
  deviceName?: string;
  location: string;
  eventType: EventType;
  confidence: number;
  durationSeconds?: number;
  responseDetected?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AIAnalysisResult {
  summary: string;
  severity: SeverityLevel;
  confidence: number;
  reasoning: string;
  recommendedAction: string;
  requiresAttention: boolean;
  sourceModel?: string;
}

export interface EscalationStep {
  timestamp: string;
  action: string;
  note?: string;
  actor?: string;
}

export interface Incident {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'investigating' | 'escalated' | 'resolved';
  severity: SeverityLevel;
  location: string;
  events: HomeEvent[];
  aiAnalysis: AIAnalysisResult;
  escalationHistory: EscalationStep[];
  caregiversNotified: string[];
}

export interface Device {
  id: string;
  name: string;
  type: 'doorbell' | 'stick_up_cam' | 'floodlight_cam' | 'contact_sensor' | 'motion_detector';
  location: string;
  batteryLevel?: number;
  status: 'online' | 'offline' | 'warning';
  lastHeartbeat: string;
  firmware?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'online' | 'busy' | 'offline';
  isPrimary: boolean;
  lastNotification?: string;
}

export interface IntegrationStatus {
  ring: {
    status: 'CONNECTED' | 'SIMULATOR' | 'DEMO' | 'ERROR';
    mode: 'live' | 'simulator' | 'demo';
    message: string;
    verified: boolean;
    deviceCount: number;
  };
  bedrock: {
    status: 'CONNECTED' | 'LOCAL MOCK' | 'NOT CONFIGURED' | 'ERROR';
    mode: 'bedrock' | 'mock';
    message: string;
    modelId: string;
    verified: boolean;
  };
  dynamodb: {
    status: 'CONNECTED' | 'LOCAL STORAGE' | 'ERROR';
    mode: 'dynamodb' | 'local';
    message: string;
    verified: boolean;
  };
  s3: {
    status: 'CONNECTED' | 'LOCAL STORAGE' | 'NOT CONFIGURED';
    mode: 's3' | 'local';
    message: string;
    bucket?: string;
    verified: boolean;
  };
  websocket: {
    status: 'ONLINE' | 'OFFLINE';
    connectedClients: number;
  };
}

export interface DemoScenarioInfo {
  id: string;
  name: string;
  description: string;
  targetSeverity: SeverityLevel;
  stepCount: number;
}
