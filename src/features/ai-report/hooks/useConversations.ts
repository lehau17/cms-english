import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import {
    AgentConversation,
    deleteConversation,
    getConversation,
    getConversations,
} from '../services/agent.service';
import { ChatMessage } from '../types';

interface UseConversationsReturn {
  conversations: AgentConversation[];
  activeConversationId: string | undefined;
  isLoading: boolean;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  handleNewChat: () => void;
  handleSelectConversation: (id: string) => Promise<void>;
  handleDeleteConversation: (id: string) => Promise<void>;
  setActiveConversationId: (id: string | undefined) => void;
  refetchConversations: () => void;
}

export const useConversations = (): UseConversationsReturn => {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Query conversations
  const conversationsQuery = useQuery({
    queryKey: ['agent-conversations'],
    queryFn: () => getConversations(50, 0),
    refetchInterval: 30000,
  });

  const conversations = conversationsQuery.data?.conversations || [];

  // New chat handler
  const handleNewChat = useCallback(() => {
    setActiveConversationId(undefined);
    setChatHistory([]);
    toast.success('Started new chat');
  }, []);

  // Select conversation handler
  const handleSelectConversation = useCallback(async (conversationId: string) => {
    try {
      setActiveConversationId(conversationId);

      const conversation = await getConversation(conversationId);

      // Convert to ChatMessage format
      const messages: ChatMessage[] = [];
      if (conversation.messages) {
        for (let i = 0; i < conversation.messages.length; i += 2) {
          const userMsg = conversation.messages[i];
          const aiMsg = conversation.messages[i + 1];

          if (userMsg && aiMsg) {
            messages.push({
              id: userMsg.id,
              message: userMsg.role === 'user' ? userMsg.content : '',
              response: aiMsg.role === 'assistant' ? aiMsg.content : '',
              timestamp: new Date(userMsg.createdAt),
              confidence: 0.9,
              toolsUsed: [],
              sources: [],
              suggestions: [],
            });
          }
        }
      }

      setChatHistory(messages);
      toast.success('Conversation loaded');
    } catch (error: any) {
      console.error('Failed to load conversation:', error);
      toast.error(error.message || 'Failed to load conversation');
    }
  }, []);

  // Delete conversation handler
  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      if (!confirm('Are you sure you want to delete this conversation?')) return;

      try {
        await deleteConversation(conversationId);
        toast.success('Conversation deleted');

        queryClient.invalidateQueries({ queryKey: ['agent-conversations'] });

        if (activeConversationId === conversationId) {
          handleNewChat();
        }
      } catch (error: any) {
        console.error('Failed to delete conversation:', error);
        toast.error(error.message || 'Failed to delete conversation');
      }
    },
    [activeConversationId, handleNewChat, queryClient]
  );

  const refetchConversations = useCallback(() => {
    conversationsQuery.refetch();
  }, [conversationsQuery]);

  return {
    conversations,
    activeConversationId,
    isLoading: conversationsQuery.isLoading,
    chatHistory,
    setChatHistory,
    handleNewChat,
    handleSelectConversation,
    handleDeleteConversation,
    setActiveConversationId,
    refetchConversations,
  };
};
