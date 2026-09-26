import { Router } from 'express';
import { z } from 'zod';
import { dynamoDbService } from '../database/dynamoDbService';
import { socketServer } from '../websocket/socketServer';
import { Caregiver } from '../types';

const router = Router();

const CaregiverSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  isPrimary: z.boolean().default(false),
  status: z.enum(['online', 'busy', 'offline']).default('online'),
});

router.get('/caregivers', async (_req, res) => {
  try {
    const caregivers = await dynamoDbService.getCaregivers();
    res.json({
      success: true,
      count: caregivers.length,
      caregivers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/caregivers', async (req, res) => {
  try {
    const parsed = CaregiverSchema.parse(req.body);
    const caregiver: Caregiver = {
      id: `cg_${Date.now()}`,
      name: parsed.name,
      role: parsed.role,
      phone: parsed.phone,
      email: parsed.email,
      status: parsed.status,
      isPrimary: parsed.isPrimary,
    };

    await dynamoDbService.saveCaregiver(caregiver);
    res.status(201).json({ success: true, caregiver });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/caregivers/notify', async (req, res) => {
  try {
    const { caregiverId, title, message, severity } = req.body;
    const caregivers = await dynamoDbService.getCaregivers();
    const target = caregivers.find((c) => c.id === caregiverId) || caregivers[0];

    const notification = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      caregiverName: target ? target.name : 'Primary Caregiver',
      severity: severity || 'high',
      title: title || 'Simulated Safety Escalation Alert',
      message: message || 'GuardianX has flagged an event requiring caregiver verification.',
      simulated: true,
    };

    socketServer.broadcastCaregiverNotification(notification);

    res.json({
      success: true,
      mode: 'SIMULATED_NOTIFICATION',
      notification,
      notice: 'In compliance with hackathon safety rules, real SMS/calls are never sent without live AWS SNS/Pinpoint production setup.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
