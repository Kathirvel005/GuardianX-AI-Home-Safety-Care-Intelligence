import React, { useState, useEffect } from 'react';
import { History, Search, Download, Filter, Eye } from 'lucide-react';
import { fetchEvents } from '../services/api';
import { HomeEvent } from '../types';

export const HistoryPage: React.FC = () => {
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents(100)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filterTabs = [
    { id: 'all', label: 'All Events' },
    { id: 'safety', label: 'Safety (Falls)' },
    { id: 'visitors', label: 'Visitors' },
    { id: 'packages', label: 'Packages' },
    { id: 'doors', label: 'Doors' },
    { id: 'motion', label: 'Motion' },
  ];

  const filtered = events.filter((ev) => {
    if (filter === 'safety' && ev.eventType !== 'possible_fall') return false;
    if (filter === 'visitors' && ev.eventType !== 'visitor_detected' && ev.eventType !== 'person_detected') return false;
    if (filter === 'packages' && ev.eventType !== 'package_detected') return false;
    if (filter === 'doors' && ev.eventType !== 'door_opened' && ev.eventType !== 'door_closed') return false;
    if (filter === 'motion' && ev.eventType !== 'motion') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        ev.location.toLowerCase().includes(q) ||
        ev.eventType.toLowerCase().includes(q) ||
        ev.deviceId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'EventType', 'Location', 'Device', 'Confidence', 'Source'];
    const rows = filtered.map((e) => [
      e.id,
      e.timestamp,
      e.eventType,
      `"${e.location}"`,
      e.deviceId,
      e.confidence,
      e.source,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guardianx-event-history-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Historical Audit Log
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            EVENT HISTORY & AUDIT
          </h1>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-200 px-4 py-2 text-xs font-mono transition-all hover:border-cyan-500/40"
        >
          <Download className="h-4 w-4 text-cyan-400" />
          <span>Export CSV Log</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium font-mono transition-all ${
                filter === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by location or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/40"
          />
        </div>
      </div>

      {/* Events Table / Card View */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    Loading event history...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    No matching events found.
                  </td>
                </tr>
              ) : (
                filtered.map((ev) => {
                  const isFall = ev.eventType === 'possible_fall';
                  const isDing = ev.eventType === 'visitor_detected';
                  const isPkg = ev.eventType === 'package_detected';

                  return (
                    <tr
                      key={ev.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isFall ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {new Date(ev.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isFall
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isDing
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isPkg
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ev.eventType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white">{ev.location}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{ev.deviceId}</td>
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {(ev.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 font-mono uppercase text-slate-400">
                        {ev.source}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
