import { describe, it, expect } from 'vitest';
import { getRingProvider, RingSimulatorProvider } from '../src/integrations/ring/ringAdapter';

describe('Ring Adapter Architecture', () => {
  it('returns an active provider conforming to RingEventProvider interface', async () => {
    const provider = getRingProvider();
    expect(provider).toBeDefined();
    expect(provider.mode).toBeDefined();

    const devices = await provider.getDevices();
    expect(Array.isArray(devices)).toBe(true);
    expect(devices.length).toBeGreaterThan(0);
  });

  it('simulator provider produces valid mock devices with battery levels', async () => {
    const sim = new RingSimulatorProvider();
    const devices = await sim.getDevices();

    expect(devices.length).toBe(4);
    const doorbell = devices.find((d) => d.type === 'doorbell');
    expect(doorbell).toBeDefined();
    expect(doorbell?.batteryLevel).toBeGreaterThan(0);
  });
});
