import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { HomeEvent, Incident, AIAnalysisResult } from '../types';

export interface SimulationStepData {
  scenarioId: string;
  stepIndex: number;
  totalSteps: number;
  stepName: string;
  description: string;
  event?: HomeEvent;
}

export interface CaregiverNotificationData {
  id: string;
  timestamp: string;
  caregiverName: string;
  severity: string;
  title: string;
  message: string;
  simulated: boolean;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<HomeEvent | null>(null);
  const [latestIncident, setLatestIncident] = useState<Incident | null>(null);
  const [aiThinkingState, setAiThinkingState] = useState<{ isThinking: boolean; eventId?: string }>({ isThinking: false });
  const [latestAiResult, setLatestAiResult] = useState<{ eventId: string; analysis: AIAnalysisResult } | null>(null);
  const [currentSimStep, setCurrentSimStep] = useState<SimulationStepData | null>(null);
  const [latestNotification, setLatestNotification] = useState<CaregiverNotificationData | null>(null);

  useEffect(() => {
    // In Vite dev, proxy routes /socket.io to backend localhost:5000
    const s = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    s.on('connect', () => {
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('event:new', (event: HomeEvent) => {
      setLatestEvent(event);
    });

    s.on('incident:new', (incident: Incident) => {
      setLatestIncident(incident);
    });

    s.on('incident:update', (incident: Incident) => {
      setLatestIncident(incident);
    });

    s.on('ai:thinking', (data: { eventId: string; status: 'started' | 'completed' }) => {
      setAiThinkingState({
        isThinking: data.status === 'started',
        eventId: data.eventId,
      });
    });

    s.on('ai:result', (data: { eventId: string; analysis: AIAnalysisResult }) => {
      setLatestAiResult(data);
    });

    s.on('simulation:step', (data: SimulationStepData) => {
      setCurrentSimStep(data);
    });

    s.on('caregiver:notification', (data: CaregiverNotificationData) => {
      setLatestNotification(data);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    latestEvent,
    latestIncident,
    aiThinkingState,
    latestAiResult,
    currentSimStep,
    latestNotification,
  };
}
