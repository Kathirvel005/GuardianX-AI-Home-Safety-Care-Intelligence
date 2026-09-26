import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Cpu,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  Volume2,
  Clock,
} from 'lucide-react';
import { CameraFeedMock } from '../components/CameraFeedMock';
import { AiInsightCard } from '../components/AiInsightCard';
import { fetchEvents, fetchIncidents, fetchDevices, createEvent } from '../services/api';
import { HomeEvent, Incident, Device, AIAnalysisResult } from '../types';

interface DashboardPageProps {
  latestEvent: HomeEvent | null;
  latestIncident: Incident | null;
  aiThinking: { isThinking: boolean; eventId?: string };
  latestAiResult: { eventId: string; analysis: AIAnalysisResult } | null;
  mode?: 'live' | 'simulator' | 'demo';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  latestEvent,
  latestIncident,
  aiThinking,
  latestAiResult,
  mode = 'demo',
}) => {
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [evs, incs, devs] = await Promise.all([
          fetchEvents(20),
          fetchIncidents(),
          fetchDevices(),
        ]);
        setEvents(evs);
        setIncidents(incs);
        setDevices(devs);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update events when WebSocket pushes a new one
  useEffect(() => {
    if (latestEvent) {
      setEvents((prev) => {
        const exists = prev.some((e) => e.id === latestEvent.id);
        if (exists) return prev;
        return [latestEvent, ...prev.slice(0, 24)];
      });
    }
  }, [latestEvent]);

  // Update incidents when WebSocket pushes a new or updated incident
  useEffect(() => {
    if (latestIncident) {
      setIncidents((prev) => {
        const idx = prev.findIndex((i) => i.id === latestIncident.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = latestIncident;
          return updated;
        }
        return [latestIncident, ...prev];
      });
    }
  }, [latestIncident]);

  // Calculate Home Status
  const activeCriticalIncidents = incidents.filter((i) => i.status === 'open' && (i.severity === 'high' || i.severity === 'critical'));
  const activeAttentionIncidents = incidents.filter((i) => i.status === 'open' && i.severity === 'medium');

  let homeStatus: 'SAFE' | 'ATTENTION REQUIRED' | 'CRITICAL' = 'SAFE';
  if (activeCriticalIncidents.length > 0) {
    homeStatus = 'CRITICAL';
  } else if (activeAttentionIncidents.length > 0) {
    homeStatus = 'ATTENTION REQUIRED';
  }

  // Interactive quick triggers
  const handleQuickTrigger = async (type: 'visitor_detected' | 'motion' | 'possible_fall') => {
    try {
      await createEvent({
        eventType: type,
        location: 'Front Entrance',
        deviceId: 'ring-doorbell-pro-01',
        source: 'demo',
      });
    } catch (err) {
      console.error('Quick trigger failed:', err);
    }
  };

  const currentDisplayEvent = latestEvent || events[0] || null;
  const currentAiInsight = latestAiResult?.analysis || (currentDisplayEvent ? null : null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Dashboard Hero Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Real-Time Safety Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
            AI HOME SAFETY COMMAND CENTER
          </h1>
        </div>

        {/* Global Home Status Indicator Badge */}
        <div
          className={`flex items-center gap-2.5 rounded-2xl px-4 py-2 border backdrop-blur-md transition-all ${
            homeStatus === 'CRITICAL'
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
              : homeStatus === 'ATTENTION REQUIRED'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          }`}
        >
          {homeStatus === 'CRITICAL' && <AlertOctagon className="h-5 w-5 text-rose-400" />}
          {homeStatus === 'ATTENTION REQUIRED' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
          {homeStatus === 'SAFE' && <ShieldCheck className="h-5 w-5 text-emerald-400" />}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Home Status
            </div>
            <div className="text-sm font-black font-mono tracking-wider">
              {homeStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Stats Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Devices */}
        <div className="rounded-2xl glass-panel p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Devices</span>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {String(devices.length || 3).padStart(2, '0')}
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-400">ONLINE</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ring Doorbell + Stick Up + Indoor</span>
        </div>

        {/* People */}
        <div className="rounded-2xl glass-panel p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">People</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {String(events.filter((e) => e.eventType === 'person_detected' || e.eventType === 'possible_fall').length || 2).padStart(2, '0')}
            </span>
            <span className="text-xs font-mono font-semibold text-purple-400">DETECTED</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Household & Front Entrance</span>
        </div>

        {/* Events */}
        <div className="rounded-2xl glass-panel p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Events</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {String(events.length).padStart(2, '0')}
            </span>
            <span className="text-xs font-mono font-semibold text-cyan-400">TODAY</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Processed through AI Pipeline</span>
        </div>

        {/* AI Status */}
        <div className="rounded-2xl glass-panel p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">AI Status</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-white truncate">
              {aiThinking.isThinking ? 'REASONING' : 'READY'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {aiThinking.isThinking ? 'Processing telemetry...' : 'Bedrock Pipeline Active'}
          </span>
        </div>
      </div>

      {/* Main Center Grid: Live Camera Stream + Live Event Telemetry Stream */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Camera Stream & Interactive Hardware Triggers */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl glass-panel p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold tracking-wider text-white uppercase font-mono">
                  LIVE ACTIVITY MONITOR
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Ring Protocol v2.4 (Encrypted)
              </span>
            </div>

            <CameraFeedMock
              latestEvent={currentDisplayEvent}
              mode={mode}
              location={currentDisplayEvent?.location || 'Front Entrance'}
              isAiThinking={aiThinking.isThinking}
            />

            {/* Manual Hardware Trigger Simulation Buttons */}
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Direct Sensor Trigger:
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Instant Event Injection</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickTrigger('motion')}
                  className="rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 p-2.5 text-xs font-mono font-medium text-slate-200 transition-all active:scale-95"
                >
                  🚶 Motion Event
                </button>
                <button
                  onClick={() => handleQuickTrigger('visitor_detected')}
                  className="rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 p-2.5 text-xs font-mono font-medium text-slate-200 transition-all active:scale-95"
                >
                  🔔 Ring Doorbell
                </button>
                <button
                  onClick={() => handleQuickTrigger('possible_fall')}
                  className="rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/40 p-2.5 text-xs font-mono font-bold text-rose-300 transition-all active:scale-95"
                >
                  🚨 Fall Incident
                </button>
              </div>
            </div>
          </div>

          {/* AI Hero Insight Card */}
          <AiInsightCard
            insight={currentAiInsight}
            location={currentDisplayEvent?.location || 'Front Entrance'}
            isThinking={aiThinking.isThinking}
          />
        </div>

        {/* Right Column (5 cols): Live Telemetry Event Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl glass-panel p-5 border border-white/10 flex flex-col h-full max-h-[780px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold tracking-wider text-white uppercase font-mono">
                  LIVE EVENT STREAM
                </h3>
              </div>
              <Link
                to="/history"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                <span>Full Log</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Scrollable event list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {loading ? (
                <div className="p-8 text-center text-sm font-mono text-slate-500">
                  Connecting to Ring Gateway...
                </div>
              ) : events.length === 0 ? (
                <div className="p-8 text-center text-sm font-mono text-slate-500">
                  No events logged yet. Trigger a scenario above.
                </div>
              ) : (
                events.slice(0, 15).map((ev) => {
                  const isFall = ev.eventType === 'possible_fall';
                  const isDing = ev.eventType === 'visitor_detected';
                  const isPkg = ev.eventType === 'package_detected';

                  return (
                    <div
                      key={ev.id}
                      className={`rounded-xl border p-3 transition-all ${
                        isFall
                          ? 'border-rose-500/50 bg-rose-950/20'
                          : isDing
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : isPkg
                          ? 'border-amber-500/40 bg-amber-950/20'
                          : 'border-white/5 bg-slate-900/40 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold uppercase rounded px-2 py-0.5 ${
                            isFall
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isDing
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isPkg
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ev.eventType.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {ev.location}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {(ev.confidence * 100).toFixed(0)}% conf
                        </span>
                      </div>

                      {Boolean(ev.metadata?.voicePromptInitiated) && (
                        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-black/50 px-2 py-1 text-[11px] font-mono text-rose-300">
                          <Volume2 className="h-3 w-3 text-rose-400" />
                          <span>Voice Prompt: No response received</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Incident Summary Card at bottom of right column */}
            {incidents.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 uppercase">Active Incidents</span>
                  <Link to="/incidents" className="text-cyan-400 hover:underline font-mono">
                    View All ({incidents.length})
                  </Link>
                </div>
                <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span className="text-xs text-rose-200 font-medium truncate max-w-[200px]">
                      {incidents[0].title}
                    </span>
                  </div>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono text-rose-300 font-bold uppercase">
                    {incidents[0].status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
