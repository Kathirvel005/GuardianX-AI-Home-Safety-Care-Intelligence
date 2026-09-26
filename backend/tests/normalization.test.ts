import { describe, it, expect } from 'vitest';
import { normalizeRingEvent } from '../src/integrations/ring/ringEvents';

describe('Event Normalization Pipeline', () => {
  it('normalizes a doorbell ding payload to visitor_detected', () => {
    const raw = {
      event_id: 'raw_ding_01',
      kind: 'ding',
      doorbot_id: 'front-door',
      doorbot_description: 'Front Porch Doorbell',
    };

    const normalized = normalizeRingEvent(raw, 'ring');

    expect(normalized.id).toBe('raw_ding_01');
    expect(normalized.eventType).toBe('visitor_detected');
    expect(normalized.location).toBe('Front Porch Doorbell');
    expect(normalized.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('normalizes motion with person_detected flag to person_detected', () => {
    const raw = {
      kind: 'motion',
      person_detected: true,
      doorbot_description: 'Backyard Cam',
    };

    const normalized = normalizeRingEvent(raw, 'ring');

    expect(normalized.eventType).toBe('person_detected');
    expect(normalized.confidence).toBe(0.95);
    expect(normalized.location).toBe('Backyard Cam');
  });

  it('normalizes possible_fall events correctly', () => {
    const raw = {
      kind: 'possible_fall',
      doorbot_description: 'Living Room Sensor',
    };

    const normalized = normalizeRingEvent(raw, 'simulator');

    expect(normalized.eventType).toBe('possible_fall');
    expect(normalized.source).toBe('simulator');
  });
});
