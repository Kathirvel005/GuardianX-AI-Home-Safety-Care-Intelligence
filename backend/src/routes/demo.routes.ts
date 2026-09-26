import { Router } from 'express';
import { scenarioEngine } from '../demo/scenarioEngine';

const router = Router();

router.get('/demo/scenarios', (_req, res) => {
  res.json({
    success: true,
    scenarios: scenarioEngine.getScenarios(),
    status: scenarioEngine.getStatus(),
  });
});

router.post('/demo/scenario', async (req, res) => {
  try {
    const { scenarioId, delayMs } = req.body;
    if (!scenarioId) {
      return res.status(400).json({ success: false, error: 'scenarioId is required' });
    }

    await scenarioEngine.runScenario(scenarioId, delayMs ? parseInt(delayMs, 10) : undefined);
    res.json({
      success: true,
      message: `Scenario '${scenarioId}' started`,
      delayMs: delayMs || 1500,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/demo/stop', (_req, res) => {
  scenarioEngine.stop();
  res.json({
    success: true,
    message: 'Demo scenario stopped',
  });
});

export default router;
