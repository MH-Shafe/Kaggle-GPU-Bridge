import React, { useState } from 'react';
import {
  Link2,
  Key,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Terminal,
  ExternalLink,
  Wifi,
  Lock,
  Clock,
  Server
} from 'lucide-react';
import { ConnectionConfig, AppStatus } from '../types/bridge';
import { redactSecrets } from '../services/bridgeService';

interface ConnectionManagerProps {
  config: ConnectionConfig;
  status: AppStatus;
  onSaveConfig: (cfg: ConnectionConfig) => void;
  onTestConnection: () => void;
  onSimulateSessionExpiry: () => void;
  showToast: (msg: string) => void;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  config,
  status,
  onSaveConfig,
  onTestConnection,
  onSimulateSessionExpiry,
  showToast,
}) => {
  const [formData, setFormData] = useState<ConnectionConfig>(config);
  const [isTesting, setIsTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleUrlChange = (url: string) => {
    let token = formData.jupyterToken;
    // Auto-extract token from URL if present
    const match = url.match(/[?&]token=([a-zA-Z0-9_\-\.]+)/i);
    if (match && match[1]) {
      token = match[1];
    }
    setFormData({
      ...formData,
      jupyterUrl: url,
      jupyterToken: token,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    showToast('Saved connection settings & vaulted token.');
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      onTestConnection();
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-cyan-600 dark:text-cyan-400">Control Plane Subsystem 4.2</span>
          <span aria-hidden="true">·</span>
          <span>Jupyter REST / WebSocket</span>
          <span aria-hidden="true">·</span>
          <span>Session Watchdog</span>
          <span aria-hidden="true">·</span>
          <span>Windows Credential Manager</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Kaggle Jupyter Connection Manager
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
          Configure and monitor the authenticated Jupyter Server control channel. The Windows app queries this channel to monitor kernel lifecycles, detect 2× Tesla T4 GPUs, and enforce model process reuse without exposing credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-500" />
              Jupyter Server Credentials
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5" />
              Vaulted in Windows Credential Manager
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                VSCode-Compatible Jupyter Server URL
              </label>
              <input
                type="text"
                value={formData.jupyterUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://...notebooks.kaggle.net/?token=..."
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-cyan-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Copy from VSCode "Connect to Existing Jupyter Server" or Kaggle notebook interface.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Extracted Jupyter Authentication Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={formData.jupyterToken}
                    onChange={(e) => setFormData({ ...formData, jupyterToken: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-2 text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {showToken ? 'Hide' : 'Reveal'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cloudflare Remote Inference URL
                </label>
                <input
                  type="text"
                  value={formData.cloudflareUrl}
                  onChange={(e) => setFormData({ ...formData, cloudflareUrl: e.target.value })}
                  placeholder="https://....trycloudflare.com/v1"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Timeout (Seconds)
                </label>
                <input
                  type="number"
                  value={formData.timeoutSeconds}
                  onChange={(e) => setFormData({ ...formData, timeoutSeconds: parseInt(e.target.value) || 120 })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Retry Attempts
                </label>
                <input
                  type="number"
                  value={formData.retryAttempts}
                  onChange={(e) => setFormData({ ...formData, retryAttempts: parseInt(e.target.value) || 3 })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.autoReconnect}
                    onChange={(e) => setFormData({ ...formData, autoReconnect: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
                  />
                  <span>Auto-reconnect on drop</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing Probe...' : 'Test Jupyter Authentication'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 transition-colors shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right: Section 9 Failure & Recovery Strategy Watchdog */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Section 9: Connection Failure Matrix
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Automated Handling</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                1. Windows Laptop Loses WiFi / Internet
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Application holds remote server in state `CONNECTED`; keeps retrying with bounded backoff. NEVER restarts remote llama-server or kernel.
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                2. Kaggle Session Expiration (9-Hour Limit)
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Watchdog marks state `SESSION_EXPIRED`. Does not falsely claim model is available. Alerts user to restart Kaggle notebook session.
              </div>
              <div className="mt-2">
                <button
                  onClick={onSimulateSessionExpiry}
                  className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline"
                >
                  [Simulate Kaggle Session Expiry Trigger]
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                3. Cloudflare Tunnel Interruption
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Reconnects tunnel process only. Remote llama-server process (PID 283) continues serving without reloading the 8.37 GiB weights.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
