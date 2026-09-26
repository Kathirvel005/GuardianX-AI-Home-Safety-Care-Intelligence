import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { socketServer } from './websocket/socketServer';
import healthRoutes from './routes/health.routes';
import deviceRoutes from './routes/device.routes';
import eventRoutes from './routes/event.routes';
import incidentRoutes from './routes/incident.routes';
import aiRoutes from './routes/ai.routes';
import demoRoutes from './routes/demo.routes';
import integrationsRoutes from './routes/integrations.routes';
import caregiverRoutes from './routes/caregiver.routes';
import assistantRoutes from './routes/assistant.routes';

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
socketServer.init(server);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api', deviceRoutes);
app.use('/api', eventRoutes);
app.use('/api', incidentRoutes);
app.use('/api', aiRoutes);
app.use('/api', demoRoutes);
app.use('/api', integrationsRoutes);
app.use('/api', caregiverRoutes);
app.use('/api', assistantRoutes);

// Global Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[GuardianX Server Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

const PORT = parseInt(process.env.PORT || '5000', 10);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  GUARDIANX BACKEND SERVER OPERATIONAL`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`⚡ Ring Mode: ${process.env.RING_MODE || 'demo'}`);
    console.log(`🧠 AI Mode: ${process.env.AI_MODE || 'mock'}`);
    console.log(`💾 Storage Mode: ${process.env.STORAGE_MODE || 'local'}`);
    console.log(`=======================================================`);
  });
}

export { app, server };
