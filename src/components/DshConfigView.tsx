import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Bot,
  Radio,
  Zap,
  Sliders,
  FileCode2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { AccessMode, ConnectionConfig } from '../types/bridge';
import { generateDshYaml, generateDshJson } from '../services/bridgeService';

interface DshConfigViewProps {
  mode: AccessMode;
  config: ConnectionConfig;
  showToast: (msg: string) => void;
}

export const DshConfigView: React.FC<DshConfigViewProps> = ({
  mode,
  config,
  showToast,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'yaml' | 'json'>('yaml');
  const [activeMode, setActiveMode] = useState<AccessMode>(mode);
  const [copied, setCopied] = useState(false);

  const activeContent =
    selectedFormat === 'yaml'
      ? generateDshYaml(activeMode, config)
      : generateDshJson(activeMode, config);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    showToast(`Copied DSH ${selectedFormat.toUpperCase()} configuration!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `dsh_provider_${activeMode}.${selectedFormat}`;
    const blob = new Blob([activeContent], {
      type: selectedFormat === 'yaml' ? 'text/yaml' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Subsystem 4.7</span>
              <span aria-hidden="true">·</span>
              <span>DeepSeek Harness Integration</span>
              <span aria-hidden="true">·</span>
              <span>OpenAI Compatible</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              DeepSeek Harness (DSH) Provider Configuration
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
              Export verified provider templates for DeepSeek Harness. Both Direct mode and Local Bridge mode expose the identical remote Kaggle Qwen model with zero weights reloading.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{selectedFormat}</span>
            </button>

            <button
              onClick={handleCopy}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Config Viewer Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {/* Controls Toolbar */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Mode:</span>
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setActiveMode('local')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeMode === 'local'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Local Bridge (127.0.0.1:{config.localBridgePort})
              </button>
              <button
                onClick={() => setActiveMode('direct')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeMode === 'direct'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Direct Mode (Cloudflare HTTPS)
              </button>
            </div>
          </div>

          {/* Format Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Format:</span>
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setSelectedFormat('yaml')}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  selectedFormat === 'yaml'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                YAML
              </button>
              <button
                onClick={() => setSelectedFormat('json')}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  selectedFormat === 'json'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Code Block */}
        <div className="p-5 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[480px]">
          <pre>{activeContent}</pre>
        </div>
      </div>

      {/* DSH Setup Instructions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-500" />
          How to Load in DeepSeek Harness
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              1. Open DSH Providers File
            </div>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Navigate to your DSH configuration path at `~/.dsh/providers.yaml` or open the DSH Settings &rarr; Providers UI.
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              2. Paste the Generated Block
            </div>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Append the copied configuration under the `providers:` list. Select either Local Bridge or Direct Mode.
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              3. Set Active Model
            </div>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Select `qwen25-coder` as your active coding model. DSH will now execute agent loops on Kaggle GPUs!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
