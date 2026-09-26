import { Device, HomeEvent } from '../../types';
import { RingEventProvider } from './ringTypes';
import { RingClient } from './ringClient';
import { RingSimulator } from './ringSimulator';
import { normalizeRingEvent } from './ringEvents';

/**
 * RingLiveProvider: Connects to official Ring APIs when credentials exist.
 * Never fabricates or claims connected if credentials or responses fail.
 */
export class RingLiveProvider implements RingEventProvider {
  public name = 'Ring Official API';
  public mode: 'live' = 'live';
  private client: RingClient;
  private listeners: ((event: HomeEvent) => void)[] = [];

  constructor() {
    this.client = new RingClient({
      apiUrl: process.env.RING_API_URL,
      apiToken: process.env.RING_API_TOKEN,
      refreshToken: process.env.RING_REFRESH_TOKEN,
    });
  }

  public async init(): Promise<boolean> {
    const check = await this.client.verifyCredentials();
    return check.valid;
  }

  public async verifyConnection(): Promise<{ connected: boolean; message: string }> {
    const check = await this.client.verifyCredentials();
    return {
      connected: check.valid,
      message: check.valid
        ? 'Successfully authenticated with Ring Official API'
        : check.error || 'Live Ring credentials missing or invalid',
    };
  }

  public async getDevices(): Promise<Device[]> {
    return this.client.fetchDevices();
  }

  public async getRecentEvents(): Promise<HomeEvent[]> {
    // In live mode, events are pushed via webhook handler
    return [];
  }

  public subscribeToEvents(callback: (event: HomeEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public dispatchWebhookEvent(raw: unknown): void {
    const event = normalizeRingEvent(raw as Parameters<typeof normalizeRingEvent>[0], 'ring');
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public async getDeviceStatus(deviceId: string): Promise<Device | null> {
    const devices = await this.getDevices();
    return devices.find((d) => d.id === deviceId) || null;
  }
}

/**
 * RingSimulatorProvider: Emulates a local Ring hub/gateway with active devices.
 */
export class RingSimulatorProvider implements RingEventProvider {
  public name = 'Ring Local Simulator';
  public mode: 'simulator' = 'simulator';
  private simulator: RingSimulator;
  private listeners: ((event: HomeEvent) => void)[] = [];

  constructor() {
    this.simulator = new RingSimulator();
  }

  public async init(): Promise<boolean> {
    return true;
  }

  public async verifyConnection(): Promise<{ connected: boolean; message: string }> {
    return {
      connected: true,
      message: 'Ring Simulator Gateway is operational (4 virtual devices online)',
    };
  }

  public async getDevices(): Promise<Device[]> {
    return this.simulator.getDevices();
  }

  public async getRecentEvents(): Promise<HomeEvent[]> {
    return [];
  }

  public subscribeToEvents(callback: (event: HomeEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public emitSimulatedEvent(
    type: 'motion' | 'person_detected' | 'package_detected' | 'visitor_detected' | 'possible_fall' | 'door_opened' | 'door_closed',
    location?: string
  ): HomeEvent {
    const event = this.simulator.createSimulatedEvent(type, location);
    for (const listener of this.listeners) {
      listener(event);
    }
    return event;
  }

  public async getDeviceStatus(deviceId: string): Promise<Device | null> {
    return this.simulator.getDeviceById(deviceId);
  }
}

/**
 * DemoProvider: Optimized for instant hackathon evaluation without external hardware.
 */
export class DemoProvider implements RingEventProvider {
  public name = 'GuardianX Demo Mode Provider';
  public mode: 'demo' = 'demo';
  private simulator: RingSimulator;
  private listeners: ((event: HomeEvent) => void)[] = [];

  constructor() {
    this.simulator = new RingSimulator();
  }

  public async init(): Promise<boolean> {
    return true;
  }

  public async verifyConnection(): Promise<{ connected: boolean; message: string }> {
    return {
      connected: true,
      message: 'Demo Mode Active — Realistic deterministic event pipeline ready',
    };
  }

  public async getDevices(): Promise<Device[]> {
    return this.simulator.getDevices();
  }

  public async getRecentEvents(): Promise<HomeEvent[]> {
    return [];
  }

  public subscribeToEvents(callback: (event: HomeEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public pushDemoEvent(event: HomeEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public async getDeviceStatus(deviceId: string): Promise<Device | null> {
    return this.simulator.getDeviceById(deviceId);
  }
}

let activeProvider: RingEventProvider | null = null;

export function getRingProvider(): RingEventProvider {
  if (activeProvider) {
    return activeProvider;
  }

  const ringMode = (process.env.RING_MODE || 'demo').toLowerCase();

  if (ringMode === 'live') {
    activeProvider = new RingLiveProvider();
  } else if (ringMode === 'simulator') {
    activeProvider = new RingSimulatorProvider();
  } else {
    activeProvider = new DemoProvider();
  }

  return activeProvider;
}

export function setRingProvider(provider: RingEventProvider): void {
  activeProvider = provider;
}
