import { Device, HomeEvent } from '../../types';

export interface RawRingWebhookPayload {
  event_id?: string;
  kind?: string; // 'motion', 'ding', 'doorbot', etc.
  created_at?: string;
  doorbot_id?: string;
  doorbot_description?: string;
  state?: string;
  battery_life?: number;
  person_detected?: boolean;
}

export interface RingEventProvider {
  name: string;
  mode: 'live' | 'simulator' | 'demo';
  init(): Promise<boolean>;
  getDevices(): Promise<Device[]>;
  getRecentEvents(limit?: number): Promise<HomeEvent[]>;
  subscribeToEvents(callback: (event: HomeEvent) => void): () => void;
  getDeviceStatus(deviceId: string): Promise<Device | null>;
  verifyConnection(): Promise<{ connected: boolean; message: string }>;
}
