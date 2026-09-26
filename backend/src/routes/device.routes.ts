import { Router } from 'express';
import { getRingProvider } from '../integrations/ring/ringAdapter';

const router = Router();

router.get('/devices', async (_req, res) => {
  try {
    const provider = getRingProvider();
    const devices = await provider.getDevices();
    res.json({
      success: true,
      provider: provider.name,
      mode: provider.mode,
      count: devices.length,
      devices,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/devices/:id', async (req, res) => {
  try {
    const provider = getRingProvider();
    const device = await provider.getDeviceStatus(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, device });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
