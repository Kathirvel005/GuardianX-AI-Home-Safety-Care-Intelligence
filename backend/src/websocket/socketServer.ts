import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { HomeEvent, Incident, AIAnalysisResult } from '../types';

export class SocketServer {
  private io: SocketIOServer | null = null;
  private clientCount = 0;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      this.clientCount++;
      // Send initial welcome/ping
      socket.emit('system:connected', {
        serverTime: new Date().toISOString(),
        clientCount: this.clientCount,
      });

      socket.on('disconnect', () => {
        this.clientCount = Math.max(0, this.clientCount - 1);
      });
    });

    return this.io;
  }

  public getConnectedCount(): number {
    return this.clientCount;
  }

  public isOnline(): boolean {
    return this.io !== null;
  }

  public broadcastEvent(event: HomeEvent): void {
    if (!this.io) return;
    this.io.emit('event:new', event);
  }

  public broadcastIncident(incident: Incident, isUpdate = false): void {
    if (!this.io) return;
    this.io.emit(isUpdate ? 'incident:update' : 'incident:new', incident);
  }

  public broadcastAiThinking(data: { eventId: string; status: 'started' | 'completed'; timestamp: string }): void {
    if (!this.io) return;
    this.io.emit('ai:thinking', data);
  }

  public broadcastAiResult(data: { eventId: string; analysis: AIAnalysisResult }): void {
    if (!this.io) return;
    this.io.emit('ai:result', data);
  }

  public broadcastSimulationStep(data: {
    scenarioId: string;
    stepIndex: number;
    totalSteps: number;
    stepName: string;
    description: string;
    event?: HomeEvent;
  }): void {
    if (!this.io) return;
    this.io.emit('simulation:step', data);
  }

  public broadcastCaregiverNotification(notification: {
    id: string;
    timestamp: string;
    caregiverName: string;
    severity: string;
    title: string;
    message: string;
    simulated: boolean;
  }): void {
    if (!this.io) return;
    this.io.emit('caregiver:notification', notification);
  }
}

export const socketServer = new SocketServer();
