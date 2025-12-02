import { useEffect, useState } from 'react';

import { AgentStats, ChatMessage } from '../types';

const initialStats: AgentStats = {
  totalChats: 0,
  avgConfidence: 0,
  totalProcessingTime: 0,
  toolsUsed: {},
};

export const useChatStats = (chatHistory: ChatMessage[]): AgentStats => {
  const [stats, setStats] = useState<AgentStats>(initialStats);

  useEffect(() => {
    const totalChats = chatHistory.length;

    const avgConfidence =
      totalChats > 0 ? chatHistory.reduce((sum, chat) => sum + chat.confidence, 0) / totalChats : 0;

    const totalProcessingTime = chatHistory.reduce(
      (sum, chat) => sum + (chat.processingTime || 0),
      0
    );

    const toolsUsed = chatHistory.reduce(
      (acc, chat) => {
        (chat.toolsUsed || []).forEach((tool) => {
          acc[tool] = (acc[tool] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    setStats({ totalChats, avgConfidence, totalProcessingTime, toolsUsed });
  }, [chatHistory]);

  return stats;
};
