import React from 'react';
import { Bot, ShieldCheck, Sparkles, AlertOctagon, CheckCircle2, Info } from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface AiInsightCardProps {
  insight: AIAnalysisResult | null;
  location?: string;
  isThinking?: boolean;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({
  insight,
  location = 'Front Entrance',
  isThinking = false,
}) => {
  const defaultInsight: AIAnalysisResult = {
    summary:
      'Possible safety incident detected near the front entrance. The person appears to have fallen and has not responded to the voice prompt.',
    severity: 'high',
    confidence: 0.94,
    reasoning:
      'Sudden vertical descent detected on Ring Doorbell Pro 2 optical stream. Intercom voice ping yielded no audio response within 15 seconds.',
    recommendedAction: 'Check on person immediately or contact secondary caregiver.',
    requiresAttention: true,
    sourceModel: 'Amazon Bedrock (Claude 3 Haiku / GuardianX Fall Engine)',
  };

  const active = insight || defaultInsight;

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'critical':
      case 'high':
        return 'glass-badge-critical';
      case 'medium':
        return 'glass-badge-attention';
      case 'low':
      default:
        return 'glass-badge-safe';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel border border-cyan-500/20 p-5 sm:p-6 shadow-2xl">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <Bot className="h-5 w-5" />
            {isThinking && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-wide text-white">AI INSIGHT</h3>
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-purple-300 border border-purple-500/20">
                {active.sourceModel || 'Amazon Bedrock'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Contextual Interpretation Layer</p>
          </div>
        </div>

        {/* Live Thinking Status */}
        {isThinking ? (
          <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 border border-cyan-500/30 text-xs font-mono text-cyan-400 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Reasoning...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/30 text-xs font-mono text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Assessed</span>
          </div>
        )}
      </div>

      {/* Main Context Summary */}
      <div className="my-5">
        <blockquote className="rounded-xl border-l-4 border-cyan-400 bg-slate-900/60 p-4 text-sm sm:text-base font-medium leading-relaxed text-slate-100">
          "{active.summary}"
        </blockquote>
      </div>

      {/* Grid of Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Confidence
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">
              {(active.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${active.confidence * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Severity
          </span>
          <span
            className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold uppercase font-mono ${getSeverityStyle(
              active.severity
            )}`}
          >
            {active.severity}
          </span>
        </div>

        <div className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Location
          </span>
          <span className="text-sm font-semibold text-slate-200 block truncate">
            {location}
          </span>
        </div>

        <div className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Attention
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold uppercase font-mono ${
              active.requiresAttention ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {active.requiresAttention ? (
              <>
                <AlertOctagon className="h-3.5 w-3.5" />
                Required
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Normal
              </>
            )}
          </span>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="mt-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 p-3.5 flex items-start gap-3">
        <div className="rounded-lg bg-cyan-500/20 p-2 text-cyan-300 mt-0.5">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 block">
            Recommended Action
          </span>
          <p className="text-sm text-slate-200 mt-0.5">{active.recommendedAction}</p>
        </div>
      </div>

      {/* Safety Compliance & Non-Diagnostic Disclaimer */}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 border-t border-white/5 pt-2.5">
        <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>
          Safety Principle: GuardianX provides conservative situational interpretation and does not make medical diagnoses or legal declarations.
        </span>
      </div>
    </div>
  );
};
