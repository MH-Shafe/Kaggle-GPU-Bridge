import React from 'react';
import {
  Server,
  Cpu,
  ShieldCheck,
  Zap,
  Radio,
  ArrowRight,
  Activity,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileCode,
  HardDrive
} from 'lucide-react';
import { AppStatus, AccessMode, RemoteServerInfo, ConnectionConfig } from '../types/bridge';

interface DashboardViewProps {
  status: AppStatus;
  mode: AccessMode;
  serverInfo: RemoteServerInfo;
  config: ConnectionConfig;
  onToggleMode: (mode: AccessMode) => void;
  onRunInspect: () => void;
  onProbeHealth: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  mode,
  serverInfo,
  config,
  onToggleMode,
  onRunInspect,
  onProbeHealth,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Welcome / Executive Summary Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Live Control Plane</span>
              <span aria-hidden="true">·</span>
              <span>Kaggle Dual Tesla T4 GPUs</span>
              <span aria-hidden="true">·</span>
              <span>llama.cpp Server PID 283</span>
              <span aria-hidden="true">·</span>
              <span>DeepSeek Harness Ready</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Kaggle GPU Bridge Console
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
              Central management console coordinating the Kaggle Jupyter control plane, remote llama.cpp model server, and Windows OpenAI-compatible forwarding proxy for DeepSeek Harness (DSH).
            </p>
          </div>

          {/* Mode Switch Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Active Access Mode:
              </span>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                {mode === 'direct' ? 'Direct (Cloudflare)' : 'Local Bridge (8787)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleMode('direct')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  mode === 'direct'
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Direct Mode</span>
              </button>

              <button
                onClick={() => onToggleMode('local')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  mode === 'local'
                    ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Local Bridge</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              ✓ Single instance: zero model reloads on mode toggle.
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Remote Model Server */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-500" />
              llama.cpp Server
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              PID {serverInfo.pid}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {serverInfo.modelFile}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Port: {serverInfo.port} · Size: ~{serverInfo.modelSizeGiB} GiB
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Context: {serverInfo.contextLength.toLocaleString()} tokens</span>
            <span className="text-purple-600 dark:text-purple-400">Policy: reuse</span>
          </div>
        </div>

        {/* Card 2: Remote Compute (2x Tesla T4) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-500" />
              Remote Compute
            </span>
            <span className="text-[11px] font-mono font-semibold text-cyan-600 dark:text-cyan-400">
              2 × Tesla T4
            </span>
          </div>
          <div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
              16.74 / 30.22 GiB
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Combined VRAM Allocation (55%)
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Temp: ~55°C</span>
            <span>Power: ~46W avg</span>
          </div>
        </div>

        {/* Card 3: Laptop GPU Invariance Guard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Laptop GPU Guard
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              PASS
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              GeForce MX450 / Iris Xe
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              0% Compute Usage · Zero CUDA Load
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Local RAM: 82 MB</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Invariance OK</span>
          </div>
        </div>

        {/* Card 4: Local Bridge / Tunnel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-500" />
              Inference Endpoint
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20">
              Port {config.localBridgePort}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate">
              {mode === 'direct' ? 'Cloudflare Tunnel' : `127.0.0.1:${config.localBridgePort}/v1`}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              OpenAI /v1/chat/completions
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Streaming: SSE Enabled</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">Ready</span>
          </div>
        </div>
      </div>

      {/* Subsystem Status Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            Subsystem Operational Health Matrix
          </h2>
          <span className="text-xs font-mono text-slate-400">All 6 Core Planes Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Subsystem 1: Jupyter Control Plane */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Jupyter Control Plane
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                REST & WebSocket connected. Tokens stored in Credential Store.
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              Nominal
            </span>
          </div>

          {/* Subsystem 2: Remote Model Server */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                llama.cpp Server
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                PID 283 on port 8000 responding with 200 OK on /health.
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              Loaded
            </span>
          </div>

          {/* Subsystem 3: Dual Tesla T4 GPUs */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Dual Tesla T4 Compute
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Both GPUs detected. Memory split across GPU 0 & GPU 1 evenly.
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              Active
            </span>
          </div>

          {/* Subsystem 4: Cloudflare Tunnel */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Cloudflare Tunnel
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                HTTPS public route active to llama-server port 8000.
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              Online
            </span>
          </div>

          {/* Subsystem 5: Windows Local Bridge */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Local Loopback Bridge
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Bound to 127.0.0.1:{config.localBridgePort}. Header & error preservation active.
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              Listening
            </span>
          </div>

          {/* Subsystem 6: DeepSeek Harness Compatibility */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                DSH Tool-Calling Compatibility
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Structured message.tool_calls JSON verified. Provider configs ready.
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Console Quick Controls
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRunInspect}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>Inspect Kaggle GPUs</span>
            </button>

            <button
              onClick={onProbeHealth}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
              <span>Probe Model /health</span>
            </button>

            <button
              onClick={() => onNavigateTab('tester')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-purple-500" />
              <span>Open Model Playground</span>
            </button>

            <button
              onClick={() => onNavigateTab('dsh')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 transition-colors flex items-center gap-1.5"
            >
              <span>Get DSH Config</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
