import React, { useState, useEffect } from 'react';
import { Camera, Volume2, ShieldAlert, Wifi, Battery, Eye } from 'lucide-react';
import { HomeEvent } from '../types';

interface CameraFeedMockProps {
  latestEvent: HomeEvent | null;
  mode?: 'live' | 'simulator' | 'demo';
  location?: string;
  isAiThinking?: boolean;
}

export const CameraFeedMock: React.FC<CameraFeedMockProps> = ({
  latestEvent,
  mode = 'demo',
  location = 'Front Entrance',
  isAiThinking = false,
}) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0'));
    };
    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, []);

  const isFall = latestEvent?.eventType === 'possible_fall';
  const isPerson = latestEvent?.eventType === 'person_detected' || isFall;
  const isPackage = latestEvent?.eventType === 'package_detected';
  const isDoorbell = latestEvent?.eventType === 'visitor_detected';

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl flex flex-col justify-between p-4 sm:p-5">
      {/* Visual background simulation */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0c1220] to-[#060913] opacity-90" />

      {/* Grid line overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Camera HUD Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/10 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold text-white tracking-wider">REC</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/10 text-xs font-mono text-slate-300">
            <Camera className="h-3.5 w-3.5 text-cyan-400" />
            <span>RING PRO 2 — {location.toUpperCase()}</span>
          </div>
        </div>

        {/* Clear DEMO / SIMULATOR / LIVE watermark (per Hackathon compliance) */}
        <div className="flex items-center gap-2">
          <div
            className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold tracking-widest uppercase border backdrop-blur-md ${
              mode === 'live'
                ? 'bg-purple-900/60 border-purple-500 text-purple-300'
                : 'bg-amber-950/60 border-amber-500/80 text-amber-300'
            }`}
          >
            {mode === 'live' ? 'LIVE RING FEED' : 'DEMO MODE SIMULATOR'}
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/10 text-xs font-mono text-slate-300">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span>-58 dBm</span>
            <Battery className="h-3.5 w-3.5 text-emerald-400 ml-1" />
            <span>94%</span>
          </div>
        </div>
      </div>

      {/* Center Computer Vision Bounding Box Overlay */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        {isPerson && (
          <div
            className={`relative rounded-lg border-2 p-3 transition-all duration-300 backdrop-blur-[2px] ${
              isFall
                ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_24px_rgba(244,63,94,0.4)] w-64 sm:w-80 h-32 sm:h-40'
                : 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_24px_rgba(0,229,255,0.3)] w-48 sm:w-56 h-48 sm:h-56'
            }`}
          >
            {/* Box label */}
            <div
              className={`absolute -top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                isFall ? 'bg-rose-500 text-white' : 'bg-cyan-500 text-slate-950'
              }`}
            >
              {isFall ? 'POSSIBLE FALL DETECTED (CONF: 94%)' : 'PERSON DETECTED (CONF: 97%)'}
            </div>

            {/* Target Reticle Corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />

            <div className="flex h-full flex-col justify-end text-[11px] font-mono text-slate-200">
              {isFall ? (
                <div className="bg-black/70 p-2 rounded border border-rose-500/40">
                  <p className="text-rose-300 font-bold">ATTENTION: Non-Responsive Resident</p>
                  <p className="text-[10px] text-slate-400">Vertical Deceleration: 2.8m/s² | Voice Prompt: Sent</p>
                </div>
              ) : (
                <div className="bg-black/60 p-1.5 rounded border border-cyan-500/30">
                  <p className="text-cyan-300">Dwell Time: {latestEvent?.durationSeconds || 14}s</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isPackage && (
          <div className="relative rounded-lg border-2 border-amber-400 bg-amber-400/10 p-3 w-40 h-28 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <div className="absolute -top-3 left-3 bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
              PACKAGE DETECTED (94%)
            </div>
            <div className="flex h-full items-end justify-center text-[10px] font-mono text-amber-200">
              Parcel on Porch Mat
            </div>
          </div>
        )}

        {isDoorbell && (
          <div className="relative rounded-lg border-2 border-emerald-400 bg-emerald-400/10 p-3 w-48 h-36 animate-pulse">
            <div className="absolute -top-3 left-3 bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
              DOORBELL CHIME (99%)
            </div>
            <div className="flex h-full items-center justify-center text-xs font-mono text-emerald-300">
              Visitor Active at Entrance
            </div>
          </div>
        )}

        {!isPerson && !isPackage && !isDoorbell && (
          <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
            <Eye className="h-8 w-8 text-slate-600 animate-pulse-slow" />
            <span className="text-xs font-mono tracking-widest uppercase">Perimeter Clear — Monitoring Active</span>
          </div>
        )}
      </div>

      {/* Bottom Camera Telemetry Bar */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/10 pt-3 bg-black/40 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 px-4 sm:px-5 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-semibold">{timeString}</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline">1080p HDR • 30 FPS • H.264</span>
        </div>

        <div className="flex items-center gap-3">
          {isAiThinking && (
            <div className="flex items-center gap-1.5 text-purple-400">
              <ShieldAlert className="h-3.5 w-3.5 animate-spin" />
              <span>Bedrock Analyzing Telemetry...</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-slate-400">
            <Volume2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Two-Way Talk Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
