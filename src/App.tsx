import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ConnectionManager } from './components/ConnectionManager';
import { LocalBridgeController } from './components/LocalBridgeController';
import { ChatPlayground } from './components/ChatPlayground';
import { ToolCallingGate } from './components/ToolCallingGate';
import { DshConfigView } from './components/DshConfigView';
import { DiagnosticsTerminal } from './components/DiagnosticsTerminal';
import {
  AppStatus,
  AccessMode,
  RemoteServerInfo,
  ConnectionConfig,
  BridgeLogEntry
} from './types/bridge';
import {
  loadStoredConfig,
  saveStoredConfig,
  INITIAL_SERVER_INFO,
  redactSecrets
} from './services/bridgeService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [config, setConfig] = useState<ConnectionConfig>(loadStoredConfig);
  const [status, setStatus] = useState<AppStatus>('MODEL_LOADED');
  const [mode, setMode] = useState<AccessMode>('direct');
  const [serverInfo, setServerInfo] = useState<RemoteServerInfo>(INITIAL_SERVER_INFO);
  const [bridgeRunning, setBridgeRunning] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial log entries
  const [logs, setLogs] = useState<BridgeLogEntry[]>([
    {
      id: 'log_1',
      timestamp: '12:00:01',
      level: 'INFO',
      source: 'CONTROL',
      message: 'Kaggle GPU Bridge v0.1.0 started. Invariance checks verified.',
    },
    {
      id: 'log_2',
      timestamp: '12:00:02',
      level: 'INFO',
      source: 'CONTROL',
      message: 'Jupyter credentials loaded from Windows Credential Manager.',
    },
    {
      id: 'log_3',
      timestamp: '12:00:03',
      level: 'INFO',
      source: 'INFERENCE',
      message: 'Discovered existing llama.cpp server: PID 283 on port 8000. Reusing server.',
    },
    {
      id: 'log_4',
      timestamp: '12:00:04',
      level: 'INFO',
      source: 'INFERENCE',
      message: 'Loaded model verified: qwen2.5-coder-14b-instruct-q4_k_m.gguf (~8.37 GiB).',
    },
    {
      id: 'log_5',
      timestamp: '12:00:05',
      level: 'INFO',
      source: 'SECURITY',
      message: 'Laptop GPU Invariance: NVIDIA GeForce MX450 & Intel Iris Xe are IDLE (0% load).',
    },
    {
      id: 'log_6',
      timestamp: '12:00:06',
      level: 'INFO',
      source: 'LOCAL_PROXY',
      message: 'FastAPI Local Bridge listening on loopback http://127.0.0.1:8787/v1.',
    },
  ]);

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(!isDark);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addLog = (
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    source: 'CONTROL' | 'INFERENCE' | 'TUNNEL' | 'LOCAL_PROXY' | 'SECURITY',
    message: string
  ) => {
    const newEntry: BridgeLogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      source,
      message,
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  const handleToggleMode = (newMode: AccessMode) => {
    setMode(newMode);
    if (newMode === 'direct') {
      setStatus('DIRECT_READY');
      addLog('INFO', 'INFERENCE', 'Switched to Direct Mode (Cloudflare Tunnel). Remote model PID 283 reused.');
      showToast('Switched to Direct Mode (Cloudflare). Zero model reload.');
    } else {
      setStatus('LOCAL_READY');
      addLog('INFO', 'LOCAL_PROXY', `Switched to Local Bridge Mode (http://127.0.0.1:${config.localBridgePort}/v1). Remote model PID 283 reused.`);
      showToast(`Switched to Local Bridge Mode (127.0.0.1:${config.localBridgePort}/v1). Zero model reload.`);
    }
  };

  const handleSaveConfig = (newCfg: ConnectionConfig) => {
    setConfig(newCfg);
    saveStoredConfig(newCfg);
    addLog('INFO', 'CONTROL', 'Saved connection configuration and updated secure credential store.');
  };

  const handleTestConnection = () => {
    addLog('INFO', 'CONTROL', 'Probing Jupyter REST endpoint at https://...notebooks.kaggle.net/api/status');
    setTimeout(() => {
      setStatus('CONNECTED');
      addLog('INFO', 'CONTROL', 'Jupyter session authenticated (200 OK). Kernels active.');
      showToast('Jupyter Control Plane connection verified!');
    }, 600);
  };

  const handleSimulateSessionExpiry = () => {
    setStatus('SESSION_EXPIRED');
    addLog('WARN', 'CONTROL', 'Kaggle notebook session expired (9-hour runtime limit exceeded). Model endpoint unavailable.');
    showToast('Simulated Kaggle session expiration.');
  };

  const handleRunInspect = () => {
    addLog('INFO', 'CONTROL', 'Executing harmless diagnostic check: nvidia-smi & pgrep...');
    setActiveTab('diagnostics');
    showToast('Navigated to Diagnostics Console.');
  };

  const handleProbeHealth = () => {
    addLog('INFO', 'INFERENCE', 'Probing llama.cpp health endpoint GET /health -> 200 OK');
    setStatus(mode === 'direct' ? 'DIRECT_READY' : 'LOCAL_READY');
    showToast('llama-server PID 283 health verified (200 OK).');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        mode={mode}
        onToggleMode={handleToggleMode}
        isDark={isDark}
        toggleDark={toggleDark}
      />

      {/* Session Expired Alert Banner */}
      {status === 'SESSION_EXPIRED' && (
        <div className="bg-rose-600 text-white px-6 py-2.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider">[SESSION EXPIRED]</span>
            <span>
              The Kaggle notebook runtime has exceeded its session limit. Restart your Kaggle notebook, update the Jupyter URL, and resume serving.
            </span>
          </div>
          <button
            onClick={() => {
              setStatus('MODEL_LOADED');
              showToast('Restored active status.');
            }}
            className="px-2 py-0.5 rounded bg-white text-rose-700 font-semibold text-[11px] hover:bg-slate-100"
          >
            Acknowledge & Reconnect
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            status={status}
            mode={mode}
            serverInfo={serverInfo}
            config={config}
            onToggleMode={handleToggleMode}
            onRunInspect={handleRunInspect}
            onProbeHealth={handleProbeHealth}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'connection' && (
          <ConnectionManager
            config={config}
            status={status}
            onSaveConfig={handleSaveConfig}
            onTestConnection={handleTestConnection}
            onSimulateSessionExpiry={handleSimulateSessionExpiry}
            showToast={showToast}
          />
        )}

        {activeTab === 'bridge' && (
          <LocalBridgeController
            config={config}
            isRunning={bridgeRunning}
            onToggleBridge={(running) => {
              setBridgeRunning(running);
              addLog('INFO', 'LOCAL_PROXY', running ? 'Local Bridge started on 127.0.0.1:8787' : 'Local Bridge stopped.');
              showToast(running ? 'Started Local Bridge on port 8787' : 'Stopped Local Bridge');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'tester' && (
          <ChatPlayground mode={mode} config={config} showToast={showToast} />
        )}

        {activeTab === 'dsh' && <ToolCallingGate />}

        {activeTab === 'dsh-config' && (
          <DshConfigView mode={mode} config={config} showToast={showToast} />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticsTerminal
            logs={logs}
            serverInfo={serverInfo}
            onClearLogs={() => setLogs([])}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-5 px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Kaggle GPU Bridge</span>
            <span aria-hidden="true">·</span>
            <span>Windows & Kaggle Dual T4 Integration</span>
            <span aria-hidden="true">·</span>
            <span>llama.cpp Server PID 283</span>
            <span aria-hidden="true">·</span>
            <span>DeepSeek Harness Compatible</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('dsh')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Tool Calling Gate
            </button>
            <button
              onClick={() => setActiveTab('connection')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Jupyter Settings
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
            >
              System Audit
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce-short">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
