import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', description: 'Open Global Command Palette' },
    { key: 'Esc', description: 'Close active modal / dialog' },
    { key: 'Space', description: 'Toggle speech recognition in Assistant' },
    { key: 'Enter', description: 'Submit conversational query' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0c1220] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase font-mono text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 border border-white/5 text-xs font-mono"
            >
              <span className="text-slate-300">{s.description}</span>
              <kbd className="rounded bg-slate-800 px-2 py-1 text-cyan-300 border border-slate-700 font-bold">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 py-2 text-xs font-mono font-bold transition-all"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
