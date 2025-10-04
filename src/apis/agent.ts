import axiosInstance from "../config/axiosConfig";
import { ApiResponse } from "../interface/base-response.interface";

export interface AgentChatRequest {
  message: string;
  context?: string;
  language?: string;
}

export interface AgentChatResponse {
  answer?: string;
  response?: string;
  confidence?: number;
  sources?: string[];
  suggestions?: string[];
  toolsUsed?: string[];
  reasoning?: string;
  processingTime?: number;
  executionSteps?: any[];
}

export interface AgentRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
}

export const agentChat = async (request: AgentChatRequest): Promise<ApiResponse<AgentChatResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AgentChatResponse>>('/public/v1/ai/query', {
    question: request.message
  });
  return response.data;
};

// SSE streaming chat using fetch with ReadableStream
export const streamAgentChat = async (
  request: AgentChatRequest,
  onChunk: (chunk: {
    type: 'token' | 'tool' | 'complete' | 'error' | 'metadata' | 'chart' | 'file';
    content?: string;
    tool?: string;
    toolInput?: any;
    data?: any;
    chart?: any;
    file?: any;
  }) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void,
): Promise<{ abort: () => void }> => {
  console.log('🚀 Starting stream request:', { message: request.message, context: request.context });

  // Get token from localStorage (format: {token: "..."})
  const raw = localStorage.getItem('cms_auth');
  let token = '';
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      token = parsed.token || '';
    } catch {
      token = raw; // Fallback if not JSON
    }
  }

  if (!token) {
    console.error('❌ No token found in localStorage');
    const error = new Error('Authentication required');
    if (onError) onError(error);
    throw error;
  }

  const baseURL = axiosInstance.defaults.baseURL || 'http://localhost:3334/api';

  const params = new URLSearchParams();
  params.append('message', request.message);
  if (request.context) {
    params.append('conversationId', request.context);
  }

  const url = `${baseURL}/private/v1/agent/chat/stream?${params.toString()}`;
  console.log('🔗 Request URL:', url);
  console.log('🔑 Token:', token.substring(0, 20) + '...');

  const controller = new AbortController();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
      },
      signal: controller.signal,
    });

    console.log('📡 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ HTTP error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.error('❌ No response body');
      throw new Error('No readable stream');
    }

    // Process stream
    (async () => {
      try {
        let buffer = '';
        let chunkCount = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('✅ Stream completed:', chunkCount, 'chunks received');
            if (onComplete) onComplete();
            break;
          }

          const text = decoder.decode(value, { stream: true });
          console.log('📦 Raw chunk received:', text);
          buffer += text;

          // Split by double newline (SSE format)
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || ''; // Keep incomplete message in buffer

          for (const message of messages) {
            const lines = message.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              console.log('🔍 Processing line:', trimmed);

              if (trimmed.startsWith('data: ')) {
                const data = trimmed.substring(6);
                console.log('📨 Data extracted:', data);

                if (data === '[DONE]') {
                  console.log('🏁 Received [DONE] signal');
                  if (onComplete) onComplete();
                  return;
                }

                try {
                  const chunk = JSON.parse(data);
                  chunkCount++;
                  console.log(`✨ Parsed chunk #${chunkCount}:`, chunk);
                  onChunk(chunk);

                  if (chunk.type === 'complete' || chunk.type === 'error') {
                    console.log('🏁 Received completion/error chunk');
                    if (onComplete) onComplete();
                    return;
                  }
                } catch (err) {
                  console.error('⚠️ Failed to parse chunk:', data, err);
                }
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('💥 Stream processing error:', err);
          if (onError) onError(err);
        }
      }
    })();

    return {
      abort: () => {
        console.log('⛔ Aborting stream');
        controller.abort();
      },
    };
  } catch (err: any) {
    console.error('💥 Fetch error:', err);
    if (onError) onError(err);
    return {
      abort: () => {},
    };
  }
};

export interface DocumentUploadRequest {
  title: string;
  content: string;
  documentType: string;
  source: string;
}

export interface HealthStatus {
  status: string;
  services: {
    langchainAgent: string;
    ragService: string;
    sqlService: string;
    geminiService: string;
  };
  timestamp: string;
}

export const uploadDocument = async (request: DocumentUploadRequest): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post('/public/v1/ai/documents', request);
  return response.data;
};

export const getAgentRecommendations = async (): Promise<ApiResponse<AgentRecommendation[]>> => {
  const response = await axiosInstance.get('/public/v1/ai/health');
  // Transform health response to recommendations format
  const healthData = response.data.data;
  return {
    statusCode: response.data.statusCode,
    message: response.data.message,
    data: [
      {
        id: '1',
        type: 'system',
        title: 'AI System Status',
        description: `All services are ${healthData.status.toLowerCase()}`,
        confidence: 0.95
      },
      {
        id: '2',
        type: 'tools',
        title: 'Available Tools',
        description: `LangChain: ${healthData.services.langchainAgent}, RAG: ${healthData.services.ragService}, SQL: ${healthData.services.sqlService}`,
        confidence: 0.90
      }
    ]
  };
};
