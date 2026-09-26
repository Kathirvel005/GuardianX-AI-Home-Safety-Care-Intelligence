import { Router } from 'express';
import { z } from 'zod';
import { bedrockService } from '../ai/bedrockService';
import { dynamoDbService } from '../database/dynamoDbService';
import { HomeEvent } from '../types';

const router = Router();

const AnalyzeRequestSchema = z.object({
  event: z.object({
    id: z.string(),
    timestamp: z.string(),
    source: z.enum(['ring', 'simulator', 'demo']),
    deviceId: z.string(),
    deviceName: z.string().optional(),
    location: z.string(),
    eventType: z.any(),
    confidence: z.number(),
    durationSeconds: z.number().optional(),
  }),
});

router.post('/ai/analyze', async (req, res) => {
  try {
    const { event } = AnalyzeRequestSchema.parse(req.body);
    const history = await dynamoDbService.getEvents(5);
    const result = await bedrockService.analyzeEvent(event as HomeEvent, history);

    res.json({
      success: true,
      result,
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
