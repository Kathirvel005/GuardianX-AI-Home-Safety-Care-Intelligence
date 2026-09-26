import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Activity,
  AlertTriangle,
  Bot,
  History,
  Cpu,
  Play,
  X,
  ShieldAlert,
} from 'lucide-react';
import { runScenario } from '../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered by parent state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'cmd_safety',
      title: 'Run Possible Safety Incident Scenario (Fall Detection)',
      category: 'Demo Scenarios',
      icon: ShieldAlert,
      action: async () => {
        await runScenario('possibleSafetyIncident');
        navigate('/dashboard');
        onClose();
      },
    },
    {
      id: 'cmd_visitor',
      title: 'Run Visitor Arrives Scenario',
      category: 'Demo Scenarios',
      icon: Play,
      action: async () => {
        await runScenario('visitorArrives');
        navigate('/dashboard');
        onClose();
      },
    },
    {
      id: 'cmd_package',
      title: 'Run Package Detected Scenario',
      category: 'Demo Scenarios',
      icon: Play,
      action: async () => {
        await runScenario('packageDetected');
        navigate('/dashboard');
        onClose();
      },
    },
    {
      id: 'cmd_dashboard',
      title: 'Return to Command Center Dashboard',
      category: 'Navigation',
      icon: Activity,
      action: () => {
        navigate('/dashboard');
        onClose();
      },
    },
    {
      id: 'cmd_incidents',
      title: 'Open Incident Timeline & Escalations',
      category: 'Navigation',
      icon: AlertTriangle,
      action: () => {
        navigate('/incidents');
        onClose();
      },
    },
    {
      id: 'cmd_assistant',
      title: 'Open Ask GuardianX AI Assistant',
      category: 'Navigation',
      icon: Bot,
      action: () => {
        navigate('/assistant');
        onClose();
      },
    },
    {
      id: 'cmd_history',
      title: 'View Event History & Audit Log',
      category: 'Navigation',
      icon: History,
      action: () => {
        navigate('/history');
        onClose();
      },
    },
    {
      id: 'cmd_integrations',
      title: 'Check Ring & AWS Integrations Status',
      category: 'Navigation',
      icon: Cpu,
      action: () => {
        navigate('/integrations');
        onClose();
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0c1220] shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="relative flex items-center border-b border-white/10 px-4 py-3">
          <Search className="h-5 w-5 text-cyan-400 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or jump to page... (e.g., 'safety', 'dashboard', 'assistant')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List of actions */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-800 p-2 text-slate-300 group-hover:text-cyan-400 group-hover:bg-cyan-950/40">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-200 group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {item.category}
                    </div>
                  </div>
                </div>
                <kbd className="hidden sm:inline rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
                  ↵ Select
                </kbd>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-white/5 bg-slate-950/60 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>GuardianX Command Palette</span>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
