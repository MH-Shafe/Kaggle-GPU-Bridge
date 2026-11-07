export type AppStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RUNTIME_READY'
  | 'MODEL_DISCOVERING'
  | 'MODEL_LOADED'
  | 'TUNNEL_CONNECTING'
  | 'DIRECT_READY'
  | 'LOCAL_READY'
  | 'DEGRADED'
  | 'SESSION_EXPIRED'
  | 'ERROR';

export type AccessMode = 'direct' | 'local';

export interface GPUStats {
  id: number;
  name: string;
  vramTotalMb: number;
  vramUsedMb: number;
  utilizationPct: number;
  temperatureC: number;
  powerDrawWatts: number;
}

export interface RemoteServerInfo {
  pid: number;
  port: number;
  binary: string;
  modelFile: string;
  modelAlias: string;
  modelSizeGiB: number;
  isHealthy: boolean;
  contextLength: number;
  gpus: GPUStats[];
  diagnosticPid?: number;
  diagnosticPort?: number;
}

export interface ConnectionConfig {
  jupyterUrl: string;
  jupyterToken: string;
  cloudflareUrl: string;
  localBridgeHost: string;
  localBridgePort: number;
  timeoutSeconds: number;
  retryAttempts: number;
  autoReconnect: boolean;
}

export interface BridgeLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: 'CONTROL' | 'INFERENCE' | 'TUNNEL' | 'LOCAL_PROXY' | 'SECURITY';
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AcceptanceCriterion {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  category: 'core' | 'security' | 'network' | 'model' | 'dsh';
}
