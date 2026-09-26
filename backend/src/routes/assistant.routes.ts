import { Router } from 'express';
import { z } from 'zod';
import { bedrockService } from '../ai/bedrockService';
import { dynamoDbService } from '../database/dynamoDbService';

const router = Router();

const AssistantQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
});

router.post('/assistant/query', async (req, res) => {
  try {
    const { query } = AssistantQuerySchema.parse(req.body);
    const events = await dynamoDbService.getEvents(20);
    const incidents = await dynamoDbService.getIncidents(10);

    const answerData = await bedrockService.answerQuestion(query, events, incidents);

    res.json({
      success: true,
      query,
      answer: answerData.answer,
      relatedEventIds: answerData.relatedEventIds,
      timestamp: new Date().toISOString(),
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
