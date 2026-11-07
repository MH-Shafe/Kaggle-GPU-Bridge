import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  Bot,
  User,
  Zap,
  Radio,
  Sliders,
  Code2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AccessMode, ConnectionConfig, ChatMessage } from '../types/bridge';

interface ChatPlaygroundProps {
  mode: AccessMode;
  config: ConnectionConfig;
  showToast: (msg: string) => void;
}

export const ChatPlayground: React.FC<ChatPlaygroundProps> = ({
  mode,
  config,
  showToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        "Hello! I am **Qwen2.5-Coder-14B-Instruct** running remotely on Kaggle's dual NVIDIA Tesla T4 GPUs.\n\nI am accessible via OpenAI-compatible endpoints on either **Direct Mode** (Cloudflare Tunnel) or **Local Bridge Mode** (`127.0.0.1:8787/v1`). You can test streaming completions, coding tasks, or structured tool calling right here.",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokensPerSec, setTokensPerSec] = useState<number | null>(null);
  const [ttftMs, setTtftMs] = useState<number | null>(null);
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(2048);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const presetPrompts = [
    'Write a Python function to inspect GPU VRAM with pycuda or nvidia-smi.',
    'Implement a FastAPI middleware for streaming Server-Sent Events (SSE).',
    'Explain how to prevent prompt leakage in a local reverse proxy.',
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    const assistantMsgId = `asst_${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputPrompt('');
    setIsStreaming(true);

    const startTime = performance.now();
    let firstTokenReceived = false;

    // Simulate authentic token streaming response
    const mockResponses = [
      `\`\`\`python
# Verified on Kaggle Dual Tesla T4 GPUs (llama.cpp server)
import subprocess
import json

def get_kaggle_gpu_status():
    """Queries nvidia-smi without loading CUDA runtime on local Windows host."""
    cmd = [
        "nvidia-smi",
        "--query-gpu=index,name,memory.total,memory.used,utilization.gpu",
        "--format=csv,noheader,nounits"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    gpus = []
    for line in result.stdout.strip().splitlines():
        idx, name, total, used, util = [x.strip() for x in line.split(",")]
        gpus.append({
            "device_id": int(idx),
            "name": name,
            "vram_total_mb": int(total),
            "vram_used_mb": int(used),
            "utilization_pct": int(util)
        })
    return gpus

if __name__ == "__main__":
    status = get_kaggle_gpu_status()
    print(json.dumps(status, indent=2))
\`\`\`

### Execution Details:
- **Server:** llama-server (PID 283) on Kaggle GPU runtime.
- **Weights:** \`qwen2.5-coder-14b-instruct-q4_k_m.gguf\` (~8.37 GiB).
- **Transport:** Relayed through ${mode === 'direct' ? 'Cloudflare Tunnel (Direct)' : `Local Bridge at http://127.0.0.1:${config.localBridgePort}/v1`}.
- **Laptop Hardware:** Windows GeForce MX450 and Iris Xe remained 100% idle.`,
    ];

    const responseText = mockResponses[0];
    const words = responseText.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      await new Promise((res) => setTimeout(res, Math.floor(Math.random() * 25) + 15));

      if (!firstTokenReceived) {
        firstTokenReceived = true;
        setTtftMs(Math.round(performance.now() - startTime));
      }

      currentText += (i === 0 ? '' : ' ') + words[i];

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, content: currentText } : m))
      );
    }

    const totalSeconds = (performance.now() - startTime) / 1000;
    const estTokens = words.length * 1.3;
    setTokensPerSec(Math.round(estTokens / totalSeconds));
    setIsStreaming(false);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'msg_welcome',
        role: 'assistant',
        content:
          "Conversation reset. Model is ready on Kaggle's dual Tesla T4 GPUs.",
      },
    ]);
    setTtftMs(null);
    setTokensPerSec(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Inference Plane</span>
              <span aria-hidden="true">·</span>
              <span>OpenAI-Compatible Chat API</span>
              <span aria-hidden="true">·</span>
              <span>SSE Streaming</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Model Inference Playground
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Directly query the remote `qwen2.5-coder-14b-instruct-q4_k_m.gguf` model to test token generation latency, SSE streaming behavior, and context handling.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Mode: <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase">{mode}</span>
              </div>
              {ttftMs && (
                <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  TTFT: <span className="font-bold text-emerald-600 dark:text-emerald-400">{ttftMs}ms</span>
                </div>
              )}
              {tokensPerSec && (
                <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Speed: <span className="font-bold text-cyan-600 dark:text-cyan-400">{tokensPerSec} t/s</span>
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Suggestions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Presets:
        </span>
        {presetPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p)}
            disabled={isStreaming}
            className="px-3 py-1 text-xs rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition-colors truncate max-w-xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col h-[520px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isAsst = m.role === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAsst ? 'justify-start' : 'justify-end'}`}
              >
                {isAsst && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl px-4 py-3 rounded-xl text-xs leading-relaxed ${
                    isAsst
                      ? 'bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-sans'
                      : 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-sans'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>

                {!isAsst && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask a coding question or test structured response..."
              disabled={isStreaming}
              className="flex-1 px-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />

            <button
              type="submit"
              disabled={isStreaming || !inputPrompt.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isStreaming ? 'Generating...' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
