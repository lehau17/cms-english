/**
 * AI Report Page - Clean Architecture Version
 *
 * Refactored from ~1400 lines to ~120 lines
 * - Logic tách vào hooks: useStreamChat, useConversations, useChatStats
 * - UI tách thành components nhỏ: ChatHeader, ChatList, ChatInput, etc.
 * - API layer tách vào services/agent.service.ts
 * - Types tập trung tại types/index.ts
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ConversationSidebar } from '../../components/ConversationSidebar';
import { ChatInput, ChatList } from './components';
import { useChatStats, useConversations, useStreamChat } from './hooks';

const AiReportPage: React.FC = () => {
  // ===================== STATE =====================
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ===================== HOOKS =====================
  const {
    conversations,
    activeConversationId,
    isLoading: conversationsLoading,
    chatHistory,
    setChatHistory,
    handleNewChat,
    handleSelectConversation,
    handleDeleteConversation,
    setActiveConversationId,
    refetchConversations,
  } = useConversations();

  const { streaming, sendMessage, cancelStream } = useStreamChat({
    onMessageComplete: (newMessage) => {
      setChatHistory((prev) => [newMessage, ...prev]);
      refetchConversations();
    },
    onConversationIdChange: (id) => {
      setActiveConversationId(id);
    },
  });

  const stats = useChatStats(chatHistory);

  // ===================== AUTO SCROLL =====================
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, streaming.response]);

  // ===================== HANDLERS =====================
  const handleSend = useCallback(() => {
    if (!message.trim() || streaming.isStreaming) return;

    sendMessage(message.trim(), activeConversationId, language);
    setMessage('');
  }, [message, activeConversationId, language, streaming.isStreaming, sendMessage]);

  const handleSelectPrompt = useCallback((prompt: string) => {
    setMessage(prompt);
  }, []);

  // ===================== RENDER =====================
  return (
    <div className="flex min-h-full max-h-[calc(100vh-140px)] bg-gradient-to-b from-[#f7f7f8] via-white to-[#f7f7f8] overflow-hidden rounded-2xl shadow-inner">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isLoading={conversationsLoading}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {/* <ChatHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} /> */}

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 ">
            <ChatList
              chatHistory={chatHistory}
              streaming={streaming}
              onSelectPrompt={handleSelectPrompt}
            />
          </div>
        </div>

        {/* Input */}
        <ChatInput
          value={message}
          onChange={setMessage}
          onSend={handleSend}
          disabled={streaming.isStreaming}
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>
    </div>
  );
};

export default AiReportPage;
