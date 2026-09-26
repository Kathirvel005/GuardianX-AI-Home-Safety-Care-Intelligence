import { Device } from '../../types';

export interface RingClientConfig {
  apiUrl?: string;
  apiToken?: string;
  refreshToken?: string;
}

export class RingClient {
  private apiUrl: string;
  private apiToken?: string;
  private refreshToken?: string;

  constructor(config: RingClientConfig) {
    this.apiUrl = config.apiUrl || 'https://api.ring.com/clients_api/';
    this.apiToken = config.apiToken;
    this.refreshToken = config.refreshToken;
  }

  public hasCredentials(): boolean {
    return Boolean(this.apiToken || this.refreshToken);
  }

  public async verifyCredentials(): Promise<{ valid: boolean; error?: string }> {
    if (!this.hasCredentials()) {
      return { valid: false, error: 'No Ring API credentials configured in environment variables' };
    }

    try {
      // In production with live Ring credentials:
      // Calls official Ring REST API endpoint /ring_devices with authorization header
      const res = await fetch(`${this.apiUrl}ring_devices`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'User-Agent': 'GuardianX-AI-Safety/1.0',
        },
      });

      if (!res.ok) {
        return { valid: false, error: `Ring API returned status ${res.status}: ${res.statusText}` };
      }

      return { valid: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { valid: false, error: `Ring connection failed: ${message}` };
    }
  }

  public async fetchDevices(): Promise<Device[]> {
    if (!this.hasCredentials()) {
      throw new Error('Ring credentials not configured');
    }

    const res = await fetch(`${this.apiUrl}ring_devices`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'User-Agent': 'GuardianX-AI-Safety/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Ring devices: ${res.statusText}`);
    }

    const data = await res.json() as { doorbots?: Array<{ id: string; description: string; battery_life?: number; kind?: string }> };
    const devices: Device[] = [];

    if (data.doorbots && Array.isArray(data.doorbots)) {
      for (const d of data.doorbots) {
        devices.push({
          id: String(d.id),
          name: d.description || `Ring Device ${d.id}`,
          type: 'doorbell',
          location: d.description || 'Front Entrance',
          batteryLevel: d.battery_life,
          status: 'online',
          lastHeartbeat: new Date().toISOString(),
        });
      }
    }

    return devices;
  }
}
