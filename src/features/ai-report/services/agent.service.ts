// ===================== API SERVICE =====================
// Tất cả API calls được tập trung tại đây


// Re-export types từ apis/agent để backward compatible
export type {
    AgentChatRequest,
    AgentChatResponse,
    AgentConversation,
    AgentMessage,
    AgentRecommendation,
    ConversationsResponse,
    DocumentUploadRequest,
    HealthStatus
} from '../../../apis/agent';

// Re-export functions từ apis/agent
export {
    agentChat,
    deleteConversation,
    getAgentRecommendations,
    getConversation,
    getConversations,
    streamAgentChat,
    uploadDocument
} from '../../../apis/agent';

// Helper function to get API base URL
export const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api$/, '');
};

// File type detection helpers
export const getFileType = (filename: string): 'excel' | 'pdf' | 'word' | 'other' => {
  if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) return 'excel';
  if (filename.endsWith('.pdf')) return 'pdf';
  if (filename.endsWith('.docx') || filename.endsWith('.doc')) return 'word';
  return 'other';
};

export const getFileButtonColor = (fileType: 'excel' | 'pdf' | 'word' | 'other'): string => {
  const colors = {
    excel: 'bg-green-600 hover:bg-green-700',
    pdf: 'bg-red-600 hover:bg-red-700',
    word: 'bg-blue-600 hover:bg-blue-700',
    other: 'bg-gray-900 hover:bg-gray-800',
  };
  return colors[fileType];
};
