import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Bell, Shield, CheckCircle2, Clock, Send } from 'lucide-react';
import { fetchCaregivers, notifyCaregiver } from '../services/api';
import { Caregiver } from '../types';

export const CaregiversPage: React.FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingAlert, setSendingAlert] = useState<string | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCaregivers()
      .then(setCaregivers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDispatchTest = async (cg: Caregiver) => {
    try {
      setSendingAlert(cg.id);
      await notifyCaregiver(
        cg.id,
        'High-Priority Incident Alert (Simulated)',
        'GuardianX detected a possible safety incident. Voice prompt yielded no response. Verification requested.'
      );
      setAlertSuccess(`Simulated push notification dispatched to ${cg.name}`);
      setTimeout(() => setAlertSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to dispatch alert:', err);
    } finally {
      setSendingAlert(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Care Network & Escalation
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            CAREGIVER CENTER
          </h1>
        </div>

        <div className="rounded-xl bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 text-xs font-mono text-purple-300">
          SIMULATED NOTIFICATIONS ONLY (Safe Hackathon Mode)
        </div>
      </div>

      {alertSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* Care Team Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {caregivers.map((cg) => (
          <div
            key={cg.id}
            className={`rounded-2xl glass-panel p-6 border transition-all ${
              cg.isPrimary
                ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                : 'border-white/10'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{cg.name}</span>
                  {cg.isPrimary && (
                    <span className="rounded bg-cyan-500/20 text-cyan-300 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                      Primary
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 block mt-0.5">{cg.role}</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{cg.status.toUpperCase()}</span>
              </div>
            </div>

            {/* Contact details */}
            <div className="mt-5 space-y-2 text-xs font-mono text-slate-300 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-cyan-400" />
                <span>{cg.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-cyan-400" />
                <span>{cg.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-400">
                  Last notification: {cg.lastNotification ? new Date(cg.lastNotification).toLocaleTimeString() : 'None today'}
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => handleDispatchTest(cg)}
                disabled={sendingAlert === cg.id}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-mono text-xs py-2.5 transition-all hover:border-cyan-500/40 active:scale-95"
              >
                <Bell className="h-3.5 w-3.5 text-cyan-400" />
                <span>{sendingAlert === cg.id ? 'Dispatching...' : 'Simulate Escalation Alert'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Policy info box */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-3">
        <h3 className="text-sm font-bold uppercase font-mono text-slate-200 tracking-wider">
          AUTOMATED SAFETY ESCALATION PROTOCOL
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          GuardianX follows a tiered verification ladder designed to prevent false alarms while guaranteeing rapid intervention:
        </p>
        <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono pt-2">
          <div className="rounded-xl bg-slate-900/60 p-3 border border-white/5">
            <span className="text-cyan-400 font-bold block mb-1">Level 1: Local Voice Ping</span>
            <span className="text-slate-300">Two-way audio query dispatched via Ring speaker: "Are you okay?"</span>
          </div>
          <div className="rounded-xl bg-slate-900/60 p-3 border border-white/5">
            <span className="text-amber-400 font-bold block mb-1">Level 2: Primary Contact</span>
            <span className="text-slate-300">If no response in 15s, high-priority push alert dispatches to primary family caregiver.</span>
          </div>
          <div className="rounded-xl bg-slate-900/60 p-3 border border-white/5">
            <span className="text-rose-400 font-bold block mb-1">Level 3: Secondary Escalation</span>
            <span className="text-slate-300">If unacknowledged within 3 minutes, escalates to secondary family and healthcare provider.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
