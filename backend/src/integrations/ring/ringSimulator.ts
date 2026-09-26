import { Device, HomeEvent } from '../../types';

export class RingSimulator {
  private devices: Device[] = [
    {
      id: 'ring-doorbell-pro-01',
      name: 'Ring Video Doorbell Pro 2',
      type: 'doorbell',
      location: 'Front Entrance',
      batteryLevel: 94,
      status: 'online',
      lastHeartbeat: new Date().toISOString(),
      firmware: 'v12.4.1',
    },
    {
      id: 'ring-stickup-cam-02',
      name: 'Ring Stick Up Cam Battery',
      type: 'stick_up_cam',
      location: 'Backyard Patio',
      batteryLevel: 81,
      status: 'online',
      lastHeartbeat: new Date().toISOString(),
      firmware: 'v11.8.0',
    },
    {
      id: 'ring-indoor-cam-03',
      name: 'Ring Indoor Cam (2nd Gen)',
      type: 'floodlight_cam',
      location: 'Living Room',
      batteryLevel: 100, // Wired
      status: 'online',
      lastHeartbeat: new Date().toISOString(),
      firmware: 'v13.1.2',
    },
    {
      id: 'ring-contact-sensor-04',
      name: 'Ring Alarm Contact Sensor',
      type: 'contact_sensor',
      location: 'Side Door',
      batteryLevel: 88,
      status: 'online',
      lastHeartbeat: new Date().toISOString(),
      firmware: 'v2.0.4',
    },
  ];

  public getDevices(): Device[] {
    return this.devices.map((d) => ({
      ...d,
      lastHeartbeat: new Date().toISOString(),
    }));
  }

  public getDeviceById(id: string): Device | null {
    const found = this.devices.find((d) => d.id === id);
    return found ? { ...found, lastHeartbeat: new Date().toISOString() } : null;
  }

  public createSimulatedEvent(
    type: 'motion' | 'person_detected' | 'package_detected' | 'visitor_detected' | 'possible_fall' | 'door_opened' | 'door_closed',
    location = 'Front Entrance'
  ): HomeEvent {
    const device = this.devices.find((d) => d.location === location) || this.devices[0];
    const timestamp = new Date().toISOString();

    return {
      id: `evt_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp,
      source: 'simulator',
      deviceId: device.id,
      deviceName: device.name,
      location,
      eventType: type,
      confidence: 0.94,
      durationSeconds: type === 'motion' || type === 'person_detected' ? 18 : undefined,
      metadata: {
        simulated: true,
        protocol: 'Ring WebSocket/RTSP Gateway',
        rssi: -58,
      },
    };
  }
}
