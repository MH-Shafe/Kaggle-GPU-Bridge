import React, { useState } from 'react';
import {
  Zap,
  Radio,
  Shield,
  Activity,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ConnectionConfig } from '../types/bridge';

interface LocalBridgeControllerProps {
  config: ConnectionConfig;
  isRunning: boolean;
  onToggleBridge: (running: boolean) => void;
  showToast: (msg: string) => void;
}

interface RequestLog {
  id: string;
  time: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  streaming: boolean;
  model: string;
}

export const LocalBridgeController: React.FC<LocalBridgeControllerProps> = ({
  config,
  isRunning,
  onToggleBridge,
  showToast,
}) => {
  const [requests, setRequests] = useState<RequestLog[]>([
    {
      id: 'req_1',
      time: '12:34:10',
      method: 'GET',
      path: '/v1/models',
      status: 200,
      durationMs: 42,
      streaming: false,
      model: 'qwen25-coder',
    },
    {
      id: 'req_2',
      time: '12:34:15',
      method: 'POST',
      path: '/v1/chat/completions',
      status: 200,
      durationMs: 1420,
      streaming: true,
      model: 'qwen25-coder',
    },
    {
      id: 'req_3',
      time: '12:35:02',
      method: 'POST',
      path: '/v1/chat/completions',
      status: 200,
      durationMs: 910,
      streaming: true,
      model: 'qwen25-coder',
    },
  ]);

  const [simulatingReq, setSimulatingReq] = useState(false);

  const simulateIncomingRequest = () => {
    setSimulatingReq(true);
    setTimeout(() => {
      const newReq: RequestLog = {
        id: `req_${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        method: 'POST',
        path: '/v1/chat/completions',
        status: 200,
        durationMs: Math.floor(Math.random() * 800) + 400,
        streaming: true,
        model: 'qwen25-coder',
      };
      setRequests((prev) => [newReq, ...prev.slice(0, 19)]);
      setSimulatingReq(false);
      showToast('Simulated incoming DeepSeek Harness request on port 8787');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Subsystem 4.5 & 4.6</span>
              <span aria-hidden="true">·</span>
              <span>FastAPI Local Proxy</span>
              <span aria-hidden="true">·</span>
              <span>Loopback 127.0.0.1:8787</span>
              <span aria-hidden="true">·</span>
              <span>SSE Streaming</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Windows Local Bridge (Port {config.localBridgePort})
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
              Listens on local loopback `http://127.0.0.1:{config.localBridgePort}/v1` and forwards OpenAI-compatible requests to the remote Kaggle llama.cpp model server over the Cloudflare tunnel.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onToggleBridge(!isRunning)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Local Bridge</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Local Bridge</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bridge Operational Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Listener Status
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
                isRunning
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
              }`}
            >
              {isRunning ? 'LISTENING' : 'STOPPED'}
            </span>
          </div>
          <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
            http://{config.localBridgeHost}:{config.localBridgePort}/v1
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Strict loopback constraint enforced (Section 4.8 Rule 6).
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Remote Forward Target
            </span>
            <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
              Cloudflare Tunnel
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
            {config.cloudflareUrl}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Transparently relays to Kaggle PID 283 on port 8000.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              SSE Stream Engine
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Non-buffering
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Chunk Buffer: 4096 bytes
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Immediate delta flushes with zero memory accumulation.
          </div>
        </div>
      </div>

      {/* Live Request Inspector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              Live Request Inspector & Forwarding Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time HTTP requests dispatched by DeepSeek Harness to `http://127.0.0.1:{config.localBridgePort}/v1`.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={simulateIncomingRequest}
              disabled={simulatingReq || !isRunning}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            >
              {simulatingReq ? 'Sending...' : 'Simulate DSH Completion Request'}
            </button>
            <button
              onClick={() => setRequests([])}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-2 font-semibold">Time</th>
                <th className="pb-2 font-semibold">Method</th>
                <th className="pb-2 font-semibold">Endpoint</th>
                <th className="pb-2 font-semibold">Model</th>
                <th className="pb-2 font-semibold">Stream</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No active requests logged yet. Start bridge and send requests from DSH.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                    <td className="py-2.5 text-slate-500">{r.time}</td>
                    <td className="py-2.5 font-bold text-cyan-600 dark:text-cyan-400">{r.method}</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-200">{r.path}</td>
                    <td className="py-2.5 text-purple-600 dark:text-purple-400">{r.model}</td>
                    <td className="py-2.5">
                      {r.streaming ? (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px]">
                          SSE Stream
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">JSON</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {r.status} OK
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {r.durationMs}ms
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
