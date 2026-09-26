import { Router } from 'express';
import { dynamoDbService } from '../database/dynamoDbService';
import { socketServer } from '../websocket/socketServer';
import { Incident } from '../types';

const router = Router();

router.get('/incidents', async (_req, res) => {
  try {
    const incidents = await dynamoDbService.getIncidents();
    res.json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/incidents/:id', async (req, res) => {
  try {
    const incident = await dynamoDbService.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, incident });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/incidents/:id/resolve', async (req, res) => {
  try {
    const incident = await dynamoDbService.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const updated: Incident = {
      ...incident,
      status: 'resolved',
      updatedAt: new Date().toISOString(),
      escalationHistory: [
        ...incident.escalationHistory,
        {
          timestamp: new Date().toISOString(),
          action: 'Incident marked as resolved by operator/caregiver',
          actor: req.body?.actor || 'Dashboard Operator',
          note: req.body?.note,
        },
      ],
    };

    await dynamoDbService.saveIncident(updated);
    socketServer.broadcastIncident(updated, true);

    res.json({ success: true, incident: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
