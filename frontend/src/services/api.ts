import {
  Caregiver,
  Device,
  HomeEvent,
  Incident,
  IntegrationStatus,
  DemoScenarioInfo,
  AIAnalysisResult,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDevices(): Promise<Device[]> {
  const res = await fetch(`${API_BASE}/devices`);
  const data = await res.json();
  return data.devices || [];
}

export async function fetchEvents(limit = 50, type = ''): Promise<HomeEvent[]> {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (type) params.set('type', type);

  const res = await fetch(`${API_BASE}/events?${params.toString()}`);
  const data = await res.json();
  return data.events || [];
}

export async function createEvent(eventData: Partial<HomeEvent>): Promise<{ event: HomeEvent; incident?: Incident }> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  return res.json();
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  const data = await res.json();
  return data.incidents || [];
}

export async function resolveIncident(id: string, note?: string): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
  const data = await res.json();
  return data.incident;
}

export async function analyzeEvent(event: HomeEvent): Promise<AIAnalysisResult> {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
  });
  const data = await res.json();
  return data.result;
}

export async function fetchIntegrationsStatus(): Promise<IntegrationStatus> {
  const res = await fetch(`${API_BASE}/integrations/status`);
  const data = await res.json();
  return data.integrations;
}

export async function fetchCaregivers(): Promise<Caregiver[]> {
  const res = await fetch(`${API_BASE}/caregivers`);
  const data = await res.json();
  return data.caregivers || [];
}

export async function notifyCaregiver(caregiverId: string, title?: string, message?: string) {
  const res = await fetch(`${API_BASE}/caregivers/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caregiverId, title, message }),
  });
  return res.json();
}

export async function queryAssistant(query: string): Promise<{ answer: string; relatedEventIds: string[] }> {
  const res = await fetch(`${API_BASE}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

export async function fetchScenarios(): Promise<{ scenarios: DemoScenarioInfo[]; status: { isRunning: boolean } }> {
  const res = await fetch(`${API_BASE}/demo/scenarios`);
  return res.json();
}

export async function runScenario(scenarioId: string, delayMs = 1500) {
  const res = await fetch(`${API_BASE}/demo/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId, delayMs }),
  });
  return res.json();
}

export async function stopScenario() {
  const res = await fetch(`${API_BASE}/demo/stop`, {
    method: 'POST',
  });
  return res.json();
}
