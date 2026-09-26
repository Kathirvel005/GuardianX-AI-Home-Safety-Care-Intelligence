import React, { useState } from 'react';
import { Play, Square, Sparkles, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { runScenario, stopScenario } from '../services/api';
import { SimulationStepData } from '../hooks/useSocket';

interface DemoBarProps {
  currentStep: SimulationStepData | null;
  onScenarioTriggered?: (scenarioId: string) => void;
}

export const DemoBar: React.FC<DemoBarProps> = ({ currentStep, onScenarioTriggered }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('possibleSafetyIncident');
  const [delayMs, setDelayMs] = useState(1500);

  const scenarios = [
    { id: 'possibleSafetyIncident', label: '🚨 Safety Incident (Fall)', highlight: true },
    { id: 'visitorArrives', label: '🔔 Visitor Arrives', highlight: false },
    { id: 'packageDetected', label: '📦 Package Detected', highlight: false },
    { id: 'doorLeftOpen', label: '🚪 Door Left Open', highlight: false },
    { id: 'unknownVisitor', label: '👤 Unknown Visitor', highlight: false },
    { id: 'normalHome', label: '🏡 Normal Routine', highlight: false },
  ];

  const handleRun = async () => {
    try {
      setIsRunning(true);
      await runScenario(selectedScenario, delayMs);
      if (onScenarioTriggered) onScenarioTriggered(selectedScenario);
    } catch (err) {
      console.error('Failed to run scenario:', err);
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await stopScenario();
      setIsRunning(false);
    } catch (err) {
      console.error('Failed to stop scenario:', err);
    }
  };

  return (
    <div className="w-full bg-slate-900/95 border-b border-cyan-500/20 px-4 py-2.5 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Scenario Selector & Run Control */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            <Sparkles className="h-4 w-4" />
            <span>Demo Scenarios:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedScenario === sc.id
                    ? sc.highlight
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-800/80 text-slate-300 border border-white/5 hover:border-white/20'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            {!isRunning ? (
              <button
                onClick={handleRun}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 text-xs shadow-md transition-all active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>RUN SCENARIO</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 text-xs transition-all active:scale-95"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>STOP</span>
              </button>
            )}

            {/* Delay selector */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 pl-2">
              <Clock className="h-3 w-3" />
              <select
                aria-label="Simulation speed delay in milliseconds"
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                className="bg-slate-800 border border-white/10 rounded px-1.5 py-0.5 text-slate-300 text-xs focus:outline-none"
              >
                <option value={1000}>1.0s / step</option>
                <option value={1500}>1.5s / step (Standard)</option>
                <option value={2500}>2.5s / step (Slow)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Step Progression Indicator */}
        {currentStep && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 border border-cyan-500/30 px-3 py-1 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 font-bold">
              Step {currentStep.stepIndex}/{currentStep.totalSteps}:
            </span>
            <span className="text-white truncate max-w-[200px] sm:max-w-xs">{currentStep.stepName}</span>
            {currentStep.stepIndex === currentStep.totalSteps ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
