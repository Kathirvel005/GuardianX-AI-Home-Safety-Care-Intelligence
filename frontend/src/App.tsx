import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DemoBar } from './components/DemoBar';
import { CommandPalette } from './components/CommandPalette';
import { NotificationToast } from './components/NotificationToast';
import { useSocket } from './hooks/useSocket';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveEventsPage } from './pages/LiveEventsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { AssistantPage } from './pages/AssistantPage';
import { CaregiversPage } from './pages/CaregiversPage';
import { HistoryPage } from './pages/HistoryPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const {
    latestEvent,
    latestIncident,
    aiThinkingState,
    latestAiResult,
    currentSimStep,
    latestNotification,
  } = useSocket();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans">
        {/* Top Navbar */}
        <Navbar
          systemMode="demo"
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          hasUnreadIncident={Boolean(latestIncident && latestIncident.status === 'open')}
        />

        {/* Floating Demo Scenario Toolbar */}
        <DemoBar currentStep={currentSimStep} />

        {/* Global Toast for real-time notifications */}
        <NotificationToast notification={latestNotification} />

        {/* Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        {/* App Routes */}
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  latestEvent={latestEvent}
                  latestIncident={latestIncident}
                  aiThinking={aiThinkingState}
                  latestAiResult={latestAiResult}
                  mode="demo"
                />
              }
            />
            <Route
              path="/events"
              element={
                <LiveEventsPage
                  latestEvent={latestEvent}
                  mode="demo"
                />
              }
            />
            <Route
              path="/incidents"
              element={<IncidentsPage latestIncident={latestIncident} />}
            />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/caregivers" element={<CaregiversPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
