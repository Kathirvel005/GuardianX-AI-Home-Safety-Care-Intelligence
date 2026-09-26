# Ring Integration Architecture

## Philosophy: Authentic Adapter Pattern
In compliance with Hackathon rules, GuardianX never invents nonexistent Ring endpoints or claims a live camera connection when one does not exist.

We implement the `RingEventProvider` interface:
```typescript
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
```

## Providers
1. **`RingLiveProvider`**:
   - Integrates with official Ring REST API endpoints (`/ring_devices`, webhook subscriptions).
   - Validates OAuth Bearer token before setting status to `CONNECTED`.
2. **`RingSimulatorProvider`**:
   - Emulates 4 virtual Ring devices: Video Doorbell Pro 2, Stick Up Cam Battery, Indoor Cam 2nd Gen, and Alarm Contact Sensor.
   - Emulates battery drain, RSSI signals, and push triggers.
3. **`DemoProvider`**:
   - Deterministic engine for pitch video presentations.
