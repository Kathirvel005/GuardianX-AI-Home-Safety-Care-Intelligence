import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Bot,
  Users,
  History,
  Cpu,
  Settings,
  Search,
} from 'lucide-react';

interface NavbarProps {
  systemMode?: 'live' | 'simulator' | 'demo';
  onOpenCommandPalette?: () => void;
  hasUnreadIncident?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  systemMode = 'demo',
  onOpenCommandPalette,
  hasUnreadIncident = false,
}) => {
  const navItems = [
    { label: 'Command Center', path: '/dashboard', icon: Activity },
    { label: 'Live Events', path: '/events', icon: ShieldAlert },
    { label: 'Incidents', path: '/incidents', icon: AlertTriangle, badge: hasUnreadIncident },
    { label: 'AI Assistant', path: '/assistant', icon: Bot },
    { label: 'Caregivers', path: '/caregivers', icon: Users },
    { label: 'History', path: '/history', icon: History },
    { label: 'Integrations', path: '/integrations', icon: Cpu },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070a12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Status */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 transition-all">
              <ShieldAlert className="h-5 w-5 text-cyan-400 transition-transform group-hover:scale-110" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white">
                GUARDIAN<span className="text-cyan-400">X</span>
              </span>
              <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-400">
                AI Home Safety & Care
              </span>
            </div>
          </Link>

          {/* System Online & Mode Badges */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono font-medium text-emerald-400">
                SYSTEM ONLINE
              </span>
            </div>

            <div
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold tracking-wider uppercase border ${
                systemMode === 'live'
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                  : systemMode === 'simulator'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
              }`}
            >
              MODE: {systemMode.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions & Command Palette Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-500/40 hover:text-slate-200 transition-all"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Commands</span>
            <kbd className="hidden sm:inline rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-white/5 bg-[#070a12]/80">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <item.icon className="h-3 w-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </header>
  );
};
