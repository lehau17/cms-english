// ===================== TYPES =====================

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  confidence: number;
  toolsUsed?: string[];
  reasoning?: string;
  processingTime?: number;
  sources?: string[];
  suggestions?: string[];
  executionSteps?: ExecutionStep[];
  charts?: ChartConfig[];
  files?: FileDownload[];
}

export interface ExecutionStep {
  tool?: string;
  action?: {
    tool?: string;
    toolInput?: any;
  };
  toolInput?: any;
  text?: string;
  result?: any;
}

export interface ChartConfig {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'radar' | 'scatter';
  title: string;
  data: any[];
  config: {
    xLabel?: string;
    yLabel?: string;
    colors?: string[];
    responsive?: boolean;
    legend?: boolean;
  };
}

export interface FileDownload {
  filename: string;
  downloadUrl: string;
  recordCount?: number;
}

export interface AgentStats {
  totalChats: number;
  avgConfidence: number;
  totalProcessingTime: number;
  toolsUsed: Record<string, number>;
}

export interface StreamingState {
  isStreaming: boolean;
  response: string;
  charts: ChartConfig[];
  pendingMessage: string;
}

// Streaming chunk types
export type StreamChunkType = 'token' | 'tool' | 'complete' | 'error' | 'metadata' | 'chart' | 'file';

export interface StreamChunk {
  type: StreamChunkType;
  content?: string;
  tool?: string;
  toolInput?: any;
  data?: any;
  chart?: ChartConfig;
  file?: FileDownload;
}
