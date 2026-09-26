import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Volume2,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { fetchIncidents, resolveIncident, notifyCaregiver } from '../services/api';
import { Incident } from '../types';

interface IncidentsPageProps {
  latestIncident: Incident | null;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ latestIncident }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchIncidents().then((incs) => {
      setIncidents(incs);
      if (incs.length > 0) setSelectedIncident(incs[0]);
    }).catch(console.error);
  }, []);

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
      setSelectedIncident(latestIncident);
    }
  }, [latestIncident]);

  const handleResolve = async (id: string) => {
    try {
      setResolving(true);
      const updated = await resolveIncident(id, 'Resolved via Caregiver Command Center confirmation.');
      setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setSelectedIncident(updated);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00e5ff', '#10b981', '#ffffff'],
      });
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    } finally {
      setResolving(false);
    }
  };

  const handleSimulateAlert = async () => {
    if (!selectedIncident) return;
    await notifyCaregiver('cg_01', selectedIncident.title, selectedIncident.aiAnalysis.summary);
  };

  const active = selectedIncident || incidents[0] || null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold">
            Safety Escalation Architecture
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            INCIDENT TIMELINE & DISPATCH
          </h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left (4 cols): Incident Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold">
            Incidents Log ({incidents.length})
          </div>
          <div className="space-y-2.5">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  active?.id === inc.id
                    ? 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                    : 'border-white/10 bg-slate-900/60 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">
                    {new Date(inc.createdAt).toLocaleTimeString()}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      inc.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : inc.severity === 'high' || inc.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
                <div className="mt-2 font-bold text-sm text-white truncate">
                  {inc.title}
                </div>
                <div className="mt-1 text-xs text-slate-400 line-clamp-2">
                  {inc.aiAnalysis.summary}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right (8 cols): Deep Vertical Incident Timeline */}
        <div className="lg:col-span-8">
          {active ? (
            <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold uppercase">
                      INCIDENT #{active.id.replace('inc_', '')}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        active.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {active.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">{active.title}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Location: {active.location} • Created: {new Date(active.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Resolve Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateAlert}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 hover:border-cyan-500/40"
                  >
                    <Users className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Dispatch Simulated Alert</span>
                  </button>
                  {active.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(active.id)}
                      disabled={resolving}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 text-xs shadow-md transition-all active:scale-95"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{resolving ? 'Resolving...' : 'MARK RESOLVED'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* AI Context Box */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>AI REASONING & RECOMMENDED INTERVENTION</span>
                </div>
                <p className="text-sm font-medium text-slate-200">{active.aiAnalysis.summary}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono text-slate-400 border-t border-cyan-500/20 pt-2.5">
                  <span>Confidence: {(active.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                  <span>Model: {active.aiAnalysis.sourceModel || 'Amazon Bedrock'}</span>
                  <span className="text-rose-300 font-bold">Action: {active.aiAnalysis.recommendedAction}</span>
                </div>
              </div>

              {/* Vertical Chronological Timeline */}
              <div>
                <h3 className="text-sm font-bold uppercase font-mono text-slate-300 tracking-wider mb-4">
                  CHRONOLOGICAL ESCALATION SEQUENCE
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-rose-500 before:to-emerald-400">
                  {active.escalationHistory.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 group">
                      {/* Node Bullet */}
                      <div className="absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-slate-950 bg-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.6)]">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                      </div>

                      <div className="flex-1 rounded-xl border border-white/5 bg-slate-900/60 p-3.5 group-hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-400">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            {step.actor || 'System'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-200 mt-1">{step.action}</p>
                        {step.note && (
                          <p className="text-xs text-slate-400 italic mt-1 border-t border-white/5 pt-1">
                            Note: {step.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl glass-panel p-12 text-center text-slate-400">
              No incidents registered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
