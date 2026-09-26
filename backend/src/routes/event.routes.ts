import { Router } from 'express';
import { z } from 'zod';
import { dynamoDbService } from '../database/dynamoDbService';
import { eventProcessor } from '../services/eventProcessor';
import { HomeEvent } from '../types';

const router = Router();

const CreateEventSchema = z.object({
  eventType: z.enum([
    'motion',
    'person_detected',
    'package_detected',
    'door_opened',
    'door_closed',
    'visitor_detected',
    'unknown_person',
    'possible_fall',
    'prolonged_presence',
    'unusual_activity',
    'system_event',
  ]),
  deviceId: z.string().default('ring-doorbell-pro-01'),
  deviceName: z.string().optional(),
  location: z.string().default('Front Entrance'),
  confidence: z.number().min(0).max(1).default(0.9),
  durationSeconds: z.number().optional(),
  source: z.enum(['ring', 'simulator', 'demo']).default('demo'),
  metadata: z.record(z.unknown()).optional(),
});

router.get('/events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const filter = (req.query.type as string) || '';
    const events = await dynamoDbService.getEvents(limit);

    const filtered = filter ? events.filter((e) => e.eventType === filter) : events;

    res.json({
      success: true,
      count: filtered.length,
      events: filtered,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const event = await dynamoDbService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/events', async (req, res) => {
  try {
    const parsed = CreateEventSchema.parse(req.body);
    const event: HomeEvent = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      source: parsed.source,
      deviceId: parsed.deviceId,
      deviceName: parsed.deviceName || parsed.location,
      location: parsed.location,
      eventType: parsed.eventType,
      confidence: parsed.confidence,
      durationSeconds: parsed.durationSeconds,
      metadata: parsed.metadata,
    };

    const result = await eventProcessor.processEvent(event);
    res.status(201).json({
      success: true,
      event: result.event,
      incident: result.incident,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
