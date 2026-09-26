import { eventProcessor } from '../services/eventProcessor';
import { socketServer } from '../websocket/socketServer';
import { HomeEvent, SeverityLevel } from '../types';

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  targetSeverity: SeverityLevel;
  steps: {
    name: string;
    description: string;
    eventType: HomeEvent['eventType'];
    location: string;
    deviceId: string;
    deviceName: string;
    confidence: number;
    durationSeconds?: number;
    delayMs?: number;
  }[];
}

export class ScenarioEngine {
  private isRunning = false;
  private currentTimeout: NodeJS.Timeout | null = null;
  private defaultDelay = parseInt(process.env.DEMO_EVENT_DELAY_MS || '1500', 10);

  public scenarios: ScenarioDefinition[] = [
    {
      id: 'possibleSafetyIncident',
      name: 'Possible Safety Incident (Fall Detection)',
      description: 'Primary hackathon scenario: Person falls near entrance, voice prompt fails to elicit response, AI escalates incident to caregiver.',
      targetSeverity: 'high',
      steps: [
        {
          name: 'Motion Detected',
          description: 'PIR motion sensor detects initial movement near the front walkway.',
          eventType: 'motion',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.92,
          durationSeconds: 4,
        },
        {
          name: 'Person Detected',
          description: 'Camera computer vision confirms adult person approaching doorway.',
          eventType: 'person_detected',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.97,
          durationSeconds: 12,
        },
        {
          name: 'Possible Fall Detected',
          description: 'Sudden rapid downward trajectory detected followed by zero vertical movement.',
          eventType: 'possible_fall',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.94,
          durationSeconds: 18,
        },
      ],
    },
    {
      id: 'visitorArrives',
      name: 'Visitor Arrives (Doorbell Chime)',
      description: 'A guest approaches front porch, presses the Ring doorbell, and prompts a welcoming status.',
      targetSeverity: 'low',
      steps: [
        {
          name: 'Motion on Porch',
          description: 'Footstep motion detected on porch steps.',
          eventType: 'motion',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.89,
        },
        {
          name: 'Person Approaching',
          description: 'Person detected directly in front of the camera lens.',
          eventType: 'person_detected',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.96,
        },
        {
          name: 'Doorbell Rang',
          description: 'Physical doorbell button pressed, chime sounded inside home.',
          eventType: 'visitor_detected',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.99,
        },
      ],
    },
    {
      id: 'packageDetected',
      name: 'Package Delivery Detected',
      description: 'Courier places parcel on front porch, AI confirms delivery and updates parcel log.',
      targetSeverity: 'low',
      steps: [
        {
          name: 'Courier Arrival',
          description: 'Motion registered as delivery vehicle arrives.',
          eventType: 'motion',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.91,
        },
        {
          name: 'Delivery in Progress',
          description: 'Person carrying object observed near doorway.',
          eventType: 'person_detected',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.95,
        },
        {
          name: 'Package Placed',
          description: 'Object detector registers package remaining on porch mat.',
          eventType: 'package_detected',
          location: 'Front Entrance',
          deviceId: 'ring-doorbell-pro-01',
          deviceName: 'Ring Video Doorbell Pro 2',
          confidence: 0.94,
        },
      ],
    },
    {
      id: 'normalHome',
      name: 'Normal Home Activity',
      description: 'Routine movement and normal door entry with zero safety anomalies.',
      targetSeverity: 'low',
      steps: [
        {
          name: 'Living Room Movement',
          description: 'Interior indoor cam observes routine ambient movement.',
          eventType: 'motion',
          location: 'Living Room',
          deviceId: 'ring-indoor-cam-03',
          deviceName: 'Ring Indoor Cam (2nd Gen)',
          confidence: 0.91,
        },
        {
          name: 'Resident Observed',
          description: 'Family member walking through living area.',
          eventType: 'person_detected',
          location: 'Living Room',
          deviceId: 'ring-indoor-cam-03',
          deviceName: 'Ring Indoor Cam (2nd Gen)',
          confidence: 0.96,
        },
      ],
    },
    {
      id: 'unknownVisitor',
      name: 'Unknown Visitor / Dwell',
      description: 'Unrecognized individual loiters on patio for prolonged duration without ringing.',
      targetSeverity: 'medium',
      steps: [
        {
          name: 'Perimeter Motion',
          description: 'Motion detected along backyard perimeter fence.',
          eventType: 'motion',
          location: 'Backyard Patio',
          deviceId: 'ring-stickup-cam-02',
          deviceName: 'Ring Stick Up Cam Battery',
          confidence: 0.88,
        },
        {
          name: 'Unrecognized Individual',
          description: 'Person detected with no matched household profile.',
          eventType: 'unknown_person',
          location: 'Backyard Patio',
          deviceId: 'ring-stickup-cam-02',
          deviceName: 'Ring Stick Up Cam Battery',
          confidence: 0.87,
        },
        {
          name: 'Prolonged Dwell Time',
          description: 'Subject has remained stationary in private zone for 35 seconds.',
          eventType: 'prolonged_presence',
          location: 'Backyard Patio',
          deviceId: 'ring-stickup-cam-02',
          deviceName: 'Ring Stick Up Cam Battery',
          confidence: 0.91,
          durationSeconds: 35,
        },
      ],
    },
    {
      id: 'doorLeftOpen',
      name: 'Door Left Open',
      description: 'Side entry door opened and remains unclosed.',
      targetSeverity: 'medium',
      steps: [
        {
          name: 'Contact Sensor Triggered',
          description: 'Side Door contact sensor transitions to OPEN.',
          eventType: 'door_opened',
          location: 'Side Door',
          deviceId: 'ring-contact-sensor-04',
          deviceName: 'Ring Alarm Contact Sensor',
          confidence: 0.99,
        },
        {
          name: 'Unusual Dwell Alert',
          description: 'Door has remained open beyond threshold time.',
          eventType: 'unusual_activity',
          location: 'Side Door',
          deviceId: 'ring-contact-sensor-04',
          deviceName: 'Ring Alarm Contact Sensor',
          confidence: 0.90,
          durationSeconds: 60,
        },
      ],
    },
  ];

  public getScenarios() {
    return this.scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      targetSeverity: s.targetSeverity,
      stepCount: s.steps.length,
    }));
  }

  public async runScenario(scenarioId: string, customDelayMs?: number): Promise<boolean> {
    const scenario = this.scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    const delay = customDelayMs || this.defaultDelay;

    // Run steps asynchronously with delays
    this.executeSteps(scenario, 0, delay);
    return true;
  }

  private executeSteps(scenario: ScenarioDefinition, stepIdx: number, delayMs: number) {
    if (!this.isRunning || stepIdx >= scenario.steps.length) {
      this.isRunning = false;
      return;
    }

    const step = scenario.steps[stepIdx];
    const event: HomeEvent = {
      id: `evt_demo_${Date.now()}_${stepIdx}`,
      timestamp: new Date().toISOString(),
      source: 'demo',
      deviceId: step.deviceId,
      deviceName: step.deviceName,
      location: step.location,
      eventType: step.eventType,
      confidence: step.confidence,
      durationSeconds: step.durationSeconds,
      metadata: {
        demoScenario: scenario.id,
        stepName: step.name,
        stepIndex: stepIdx + 1,
        totalSteps: scenario.steps.length,
      },
    };

    // Broadcast simulation step progress
    socketServer.broadcastSimulationStep({
      scenarioId: scenario.id,
      stepIndex: stepIdx + 1,
      totalSteps: scenario.steps.length,
      stepName: step.name,
      description: step.description,
      event,
    });

    // Process event through standard pipeline
    eventProcessor.processEvent(event).catch((err) => {
      console.error('[ScenarioEngine] Error processing step:', err);
    });

    // Schedule next step
    this.currentTimeout = setTimeout(() => {
      this.executeSteps(scenario, stepIdx + 1, delayMs);
    }, delayMs);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      scenariosAvailable: this.scenarios.length,
    };
  }
}

export const scenarioEngine = new ScenarioEngine();
