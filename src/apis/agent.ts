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
