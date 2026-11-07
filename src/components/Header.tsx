import React from 'react';
import { Terminal, Shield, Sun, Moon, Radio, Zap, Server } from 'lucide-react';
import { AccessMode, AppStatus } from '../types/bridge';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: AppStatus;
  mode: AccessMode;
  onToggleMode: (newMode: AccessMode) => void;
  isDark: boolean;
  toggleDark: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  status,
  mode,
  onToggleMode,
  isDark,
  toggleDark,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Console Dashboard' },
    { id: 'connection', label: 'Kaggle Connection' },
    { id: 'bridge', label: 'Local Bridge (8787)' },
    { id: 'tester', label: 'Model Playground' },
    { id: 'dsh', label: 'Tool Calling Gate' },
    { id: 'dsh-config', label: 'DSH Config' },
    { id: 'diagnostics', label: 'Diagnostics & Audit' },
  ];

  const getStatusColor = () => {
    switch (status) {
      case 'LOCAL_READY':
      case 'DIRECT_READY':
      case 'MODEL_LOADED':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'CONNECTING':
      case 'MODEL_DISCOVERING':
      case 'TUNNEL_CONNECTING':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'SESSION_EXPIRED':
      case 'ERROR':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Zone 1: Wordmark & Live Hardware State */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/10 dark:bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                Kaggle GPU Bridge
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getStatusColor()} font-medium hidden sm:inline-block`}>
                {status}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 -mt-0.5">
              <span>2 × Tesla T4</span>
              <span aria-hidden="true">·</span>
              <span>PID 283 (Port 8000)</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Laptop GPU: Idle</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800/80">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Connection Mode Selector & Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dual Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onToggleMode('direct')}
              title="DSH connects directly to Cloudflare HTTPS endpoint"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                mode === 'direct'
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Radio className="w-3 h-3 text-cyan-500" />
              <span>Direct Mode</span>
            </button>
            <button
              onClick={() => onToggleMode('local')}
              title="DSH connects to 127.0.0.1:8787 local proxy"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                mode === 'local'
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Local Bridge</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDark}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto pt-2.5 pb-1 border-t border-slate-200 dark:border-slate-800 mt-2.5 text-xs scrollbar-none">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
