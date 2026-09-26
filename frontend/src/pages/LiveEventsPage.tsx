import React, { useState, useEffect } from 'react';
import { ShieldAlert, Camera, Filter, Play, CheckCircle2 } from 'lucide-react';
import { CameraFeedMock } from '../components/CameraFeedMock';
import { fetchEvents, fetchDevices, createEvent } from '../services/api';
import { HomeEvent, Device } from '../types';

interface LiveEventsPageProps {
  latestEvent: HomeEvent | null;
  mode?: 'live' | 'simulator' | 'demo';
}

export const LiveEventsPage: React.FC<LiveEventsPageProps> = ({ latestEvent, mode = 'demo' }) => {
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  useEffect(() => {
    fetchEvents(40).then(setEvents).catch(console.error);
    fetchDevices().then(setDevices).catch(console.error);
  }, []);

  useEffect(() => {
    if (latestEvent) {
      setEvents((prev) => [latestEvent, ...prev.filter((e) => e.id !== latestEvent.id)]);
    }
  }, [latestEvent]);

  const filteredEvents = events.filter((ev) => {
    if (selectedDevice !== 'all' && ev.deviceId !== selectedDevice) return false;
    if (selectedEventType !== 'all' && ev.eventType !== selectedEventType) return false;
    return true;
  });

  const handleSimulate = async (type: any, location = 'Front Entrance') => {
    await createEvent({
      eventType: type,
      location,
      deviceId: 'ring-doorbell-pro-01',
      source: 'demo',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Real-Time Video Telemetry
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            LIVE EVENT MONITOR
          </h1>
        </div>

        {/* Quick Simulation Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-1">Simulate Sensor:</span>
          <button
            onClick={() => handleSimulate('motion')}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-cyan-500/40"
          >
            Motion
          </button>
          <button
            onClick={() => handleSimulate('visitor_detected')}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-mono text-emerald-400 hover:border-emerald-500/40"
          >
            Doorbell
          </button>
          <button
            onClick={() => handleSimulate('package_detected')}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-mono text-amber-400 hover:border-amber-500/40"
          >
            Package
          </button>
          <button
            onClick={() => handleSimulate('possible_fall')}
            className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 text-xs font-mono text-rose-300 font-bold hover:bg-rose-900/50"
          >
            Possible Fall
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stream + Filterable Event Stream */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <CameraFeedMock
            latestEvent={latestEvent || events[0] || null}
            mode={mode}
            location="Front Entrance"
          />

          {/* Device Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="rounded-xl glass-panel p-3 border border-white/10"
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="truncate">{dev.location}</span>
                  <span className="text-emerald-400">●</span>
                </div>
                <div className="mt-1 font-semibold text-xs text-white truncate">
                  {dev.name}
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Battery: {dev.batteryLevel ?? 100}%</span>
                  <span>{dev.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Event Log with Filter Selectors */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-2xl glass-panel p-4 border border-white/10">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                <Filter className="h-3.5 w-3.5 text-cyan-400" />
                <span>Filters:</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Filter events by type"
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 font-mono"
                >
                  <option value="all">All Event Types</option>
                  <option value="motion">Motion</option>
                  <option value="person_detected">Person</option>
                  <option value="visitor_detected">Visitor (Ding)</option>
                  <option value="package_detected">Package</option>
                  <option value="possible_fall">Possible Fall</option>
                  <option value="door_opened">Door Open</option>
                </select>
              </div>
            </div>

            {/* Event List */}
            <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-white/10 bg-slate-900/60 p-3 hover:border-cyan-500/30 transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-cyan-300 uppercase font-semibold">
                      {ev.eventType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-slate-200">
                    <span className="font-medium">{ev.location}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {(ev.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
