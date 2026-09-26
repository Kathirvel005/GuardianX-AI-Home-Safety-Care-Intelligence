import { Router } from 'express';
import { getRingProvider } from '../integrations/ring/ringAdapter';
import { bedrockService } from '../ai/bedrockService';
import { dynamoDbService } from '../database/dynamoDbService';
import { s3Service } from '../services/s3Service';
import { socketServer } from '../websocket/socketServer';

const router = Router();

router.get('/integrations/status', async (_req, res) => {
  try {
    const ringProvider = getRingProvider();
    const ringCheck = await ringProvider.verifyConnection();
    const devices = await ringProvider.getDevices();

    let ringStatus: 'CONNECTED' | 'SIMULATOR' | 'DEMO' | 'ERROR' = 'DEMO';
    if (ringProvider.mode === 'live') {
      ringStatus = ringCheck.connected ? 'CONNECTED' : 'ERROR';
    } else if (ringProvider.mode === 'simulator') {
      ringStatus = 'SIMULATOR';
    } else {
      ringStatus = 'DEMO';
    }

    const bedrockStatus = bedrockService.getStatus();
    const dynamodbStatus = dynamoDbService.getStatus();
    const s3Status = s3Service.getStatus();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      integrations: {
        ring: {
          status: ringStatus,
          mode: ringProvider.mode,
          message: ringCheck.message,
          verified: ringCheck.connected,
          deviceCount: devices.length,
        },
        bedrock: bedrockStatus,
        dynamodb: dynamodbStatus,
        s3: s3Status,
        websocket: {
          status: socketServer.isOnline() ? 'ONLINE' : 'OFFLINE',
          connectedClients: socketServer.getConnectedCount(),
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
