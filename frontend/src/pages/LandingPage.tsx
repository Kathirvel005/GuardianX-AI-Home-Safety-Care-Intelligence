import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  HeartPulse,
  Eye,
  CheckCircle,
  Play,
  Terminal,
} from 'lucide-react';
import { runScenario } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRunDemo = async () => {
    try {
      await runScenario('possibleSafetyIncident');
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-mono text-cyan-300 mb-8 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Amazon Developer Hackathon Submission • Ring Track + AWS Builder Challenge</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight">
          GUARDIAN<span className="text-cyan-400">X</span>
        </h1>
        <p className="mt-3 text-lg sm:text-2xl font-bold uppercase tracking-widest text-slate-300 font-mono">
          AI Home Safety & Care Intelligence
        </p>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
          "GuardianX understands what is happening at home and turns events into intelligent, actionable safety assistance."
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3.5 text-sm shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>OPEN COMMAND CENTER</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            onClick={handleRunDemo}
            className="flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 font-bold px-6 py-3.5 text-sm transition-all transform hover:-translate-y-0.5"
          >
            <Play className="h-4 w-4 fill-current text-rose-400" />
            <span>RUN SAFETY DEMO</span>
          </button>

          <Link
            to="/integrations"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium px-6 py-3.5 text-sm transition-all"
          >
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>VIEW ARCHITECTURE</span>
          </Link>
        </div>

        {/* Live Status Ticker */}
        <div className="mt-14 inline-flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/10 bg-slate-900/40 px-6 py-3 text-xs font-mono backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Ring Gateway:</span>
            <span className="text-white font-bold">Simulator / Live Ready</span>
          </div>
          <div className="hidden sm:block text-slate-700">|</div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span className="text-slate-400">AI Reasoning:</span>
            <span className="text-white font-bold">Amazon Bedrock</span>
          </div>
          <div className="hidden sm:block text-slate-700">|</div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Storage:</span>
            <span className="text-white font-bold">Amazon DynamoDB</span>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Today's Broken Experience */}
          <div className="rounded-2xl border border-rose-500/20 bg-slate-900/30 p-6 sm:p-8 backdrop-blur-md">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold block mb-2">
              The Connected Home Problem
            </span>
            <h3 className="text-2xl font-bold text-white mb-4">
              Alert Fatigue & Meaningless Notifications
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Modern smart doorbells flood homeowners and caregivers with dozens of identical alerts every day:
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-lg bg-black/40 border border-white/5 p-3 text-slate-400">
                🔔 14:02:18 — <span className="text-white">Motion detected</span>
              </div>
              <div className="rounded-lg bg-black/40 border border-white/5 p-3 text-slate-400">
                🔔 14:02:24 — <span className="text-white">Motion detected</span>
              </div>
              <div className="rounded-lg bg-black/40 border border-white/5 p-3 text-slate-400">
                🔔 14:02:30 — <span className="text-white">Motion detected</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-6">
              When an elderly relative trips or someone loiters suspiciously, the critical signal is buried in raw sensor noise. Caregivers can't watch cameras 24/7.
            </p>
          </div>

          {/* The GuardianX Solution */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_rgba(0,229,255,0.05)]">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-2">
              The GuardianX Solution
            </span>
            <h3 className="text-2xl font-bold text-white mb-4">
              Contextual Understanding & Human Insights
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              GuardianX introduces an intelligent interpretation layer between connected Ring hardware and humans:
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-xl border border-cyan-500/40 bg-slate-900/90 p-4 text-cyan-300 shadow-lg">
                <div className="flex items-center gap-2 mb-1 text-cyan-400 font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>GUARDIANX CONTEXTUAL INTERPRETATION</span>
                </div>
                "Motion was detected near the front entrance. A person was subsequently detected and remained near the entrance for approximately 18 seconds."
              </div>
              <div className="rounded-xl border border-rose-500/40 bg-slate-900/90 p-4 text-rose-300 shadow-lg">
                <div className="flex items-center gap-2 mb-1 text-rose-400 font-bold">
                  <HeartPulse className="h-4 w-4" />
                  <span>SAFETY ESCALATION (FALL DETECTION)</span>
                </div>
                "Possible safety incident detected near front entrance. The event requires attention. Voice check initiated."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Production Engineering
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            Built for Ring & AWS Ecosystems
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl glass-panel p-6 border border-white/10">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Ring Adapter Pattern</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized <code className="text-cyan-300">RingEventProvider</code> supporting official Ring APIs, a high-fidelity simulator gateway, and deterministic demo modes.
            </p>
          </div>

          <div className="rounded-2xl glass-panel p-6 border border-white/10">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Amazon Bedrock</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Claude 3 / Nova models guided by strict conservative safety principles. Validated with Zod schemas to ensure deterministic reliability.
            </p>
          </div>

          <div className="rounded-2xl glass-panel p-6 border border-white/10">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Amazon DynamoDB</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-throughput single-digit millisecond document store for home telemetry, caregiver availability, and escalation audit records.
            </p>
          </div>

          <div className="rounded-2xl glass-panel p-6 border border-white/10">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Terminal className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">AWS Lambda</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serverless event processors, AI analyzers, and notification dispatchers independently deployable for low-cost cloud scaling.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs font-mono text-slate-500">
        <p>GuardianX — AI Home Safety & Care Intelligence • MIT License • Built for Hackathon Excellence</p>
      </footer>
    </div>
  );
};
