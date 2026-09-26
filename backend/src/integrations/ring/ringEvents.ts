import { EventType, HomeEvent } from '../../types';
import { RawRingWebhookPayload } from './ringTypes';

/**
 * Normalizes raw vendor events (Ring webhook, simulator payload, or hardware trigger)
 * into a standardized GuardianX HomeEvent schema.
 */
export function normalizeRingEvent(raw: RawRingWebhookPayload, sourceMode: 'ring' | 'simulator' | 'demo' = 'ring'): HomeEvent {
  const timestamp = raw.created_at || new Date().toISOString();
  const id = raw.event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const deviceId = raw.doorbot_id ? String(raw.doorbot_id) : 'front-door-bell';
  const location = raw.doorbot_description || 'Front Entrance';

  let eventType: EventType = 'motion';
  let confidence = 0.85;

  if (raw.kind === 'ding') {
    eventType = 'visitor_detected';
    confidence = 0.98;
  } else if (raw.kind === 'motion') {
    if (raw.person_detected) {
      eventType = 'person_detected';
      confidence = 0.95;
    } else {
      eventType = 'motion';
      confidence = 0.88;
    }
  } else if (raw.kind === 'package_detected') {
    eventType = 'package_detected';
    confidence = 0.92;
  } else if (raw.kind === 'door_opened') {
    eventType = 'door_opened';
    confidence = 0.99;
  } else if (raw.kind === 'door_closed') {
    eventType = 'door_closed';
    confidence = 0.99;
  } else if (raw.kind === 'possible_fall') {
    eventType = 'possible_fall';
    confidence = 0.91;
  }

  return {
    id,
    timestamp,
    source: sourceMode,
    deviceId,
    deviceName: location,
    location,
    eventType,
    confidence,
    durationSeconds: eventType === 'motion' ? 12 : undefined,
    rawEventPayload: raw,
  };
}
