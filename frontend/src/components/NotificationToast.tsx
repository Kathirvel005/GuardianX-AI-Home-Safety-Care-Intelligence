import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { CaregiverNotificationData } from '../hooks/useSocket';

interface NotificationToastProps {
  notification: CaregiverNotificationData | null;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<CaregiverNotificationData | null>(null);

  useEffect(() => {
    if (notification) {
      setCurrent(notification);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!visible || !current) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-rose-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-rose-500/20 p-2 text-rose-400 border border-rose-500/30 mt-0.5">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
              SIMULATED NOTIFICATION
            </span>
            <button
              onClick={() => setVisible(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5">{current.title}</h4>
          <p className="text-xs text-slate-300 mt-1">{current.message}</p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/10 pt-1.5">
            <span>Recipient: {current.caregiverName}</span>
            <span className="flex items-center gap-1 text-cyan-400">
              <Bell className="h-3 w-3" />
              Dispatched
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
