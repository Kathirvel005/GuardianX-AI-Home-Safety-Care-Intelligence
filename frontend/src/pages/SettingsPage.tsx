import React, { useState } from 'react';
import { Settings, Sliders, Volume2, ShieldCheck, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [delay, setDelay] = useState('1500');
  const [model, setModel] = useState('anthropic.claude-3-haiku-20240307-v1:0');
  const [sensitivity, setSensitivity] = useState('high');
  const [voiceVolume, setVoiceVolume] = useState('80');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
          System Configuration
        </span>
        <h1 className="text-2xl font-black text-white mt-0.5">
          PREFERENCES & SETTINGS
        </h1>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Demo Simulation Controls */}
        <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase font-mono text-white">
              Demo Simulation Timing
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block">
              Event Step Interval (Milliseconds)
            </label>
            <select
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/40"
            >
              <option value="1000">1000ms (Fast Pace for Quick Demo)</option>
              <option value="1500">1500ms (Recommended for Presentation)</option>
              <option value="2500">2500ms (Extended for Detailed Narration)</option>
            </select>
          </div>
        </div>

        {/* AI & Safety Sensitivity */}
        <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold uppercase font-mono text-white">
              AI Model & Safety Parameters
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block">
                Amazon Bedrock Model ID
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/40"
              >
                <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku (Fast & Responsive)</option>
                <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet (Deep Reasoning)</option>
                <option value="amazon.nova-micro-v1:0">Amazon Nova Micro (Ultra Low Latency)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 block">
                Fall Detection Sensitivity
              </label>
              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/40"
              >
                <option value="high">High (Prompt on any vertical deceleration)</option>
                <option value="medium">Medium (Standard Home Profile)</option>
                <option value="conservative">Conservative (Require 30s immobility)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Prompt Volume */}
        <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Volume2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase font-mono text-white">
              Ring Intercom Voice Prompts
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Speaker Output Volume:</span>
              <span className="text-white font-bold">{voiceVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(e.target.value)}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 text-xs font-mono transition-all active:scale-95"
        >
          SAVE PREFERENCES
        </button>
      </form>
    </div>
  );
};
