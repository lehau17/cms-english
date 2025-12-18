/**
 * AI Report Page - Claude-style Chat Interface
 * Clean, minimal design inspired by claude.ai
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ConversationSidebar } from '../../components/ConversationSidebar';
import { ChatInput, ChatList } from './components';
import { useConversations, useStreamChat } from './hooks';

const AiReportPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const { streaming, sendMessage } = useStreamChat({
    onMessageComplete: (newMessage) => {
      setChatHistory((prev) => {
        // Prevent duplicate messages (React.StrictMode double-invoke protection)
        if (prev.some((msg) => msg.id === newMessage.id)) return prev;
        return [newMessage, ...prev];
      });
      refetchConversations();
    },
    onConversationIdChange: setActiveConversationId,
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, streaming.response]);

  const handleSend = useCallback(() => {
    if (!message.trim() || streaming.isStreaming) return;
    sendMessage(message.trim(), activeConversationId, language);
    setMessage('');
  }, [message, activeConversationId, language, streaming.isStreaming, sendMessage]);

  const handleSelectPrompt = useCallback((prompt: string) => {
    setMessage(prompt);
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#f5f4ef] overflow-hidden mb-0">
      {/* Dark Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isLoading={conversationsLoading}
      />

      {/* Main Chat Area - Warm Beige Background */}
      <div className="flex-1 flex flex-col bg-[#f5f4ef]">
        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <ChatList
              chatHistory={chatHistory}
              streaming={streaming}
              onSelectPrompt={handleSelectPrompt}
            />
          </div>
        </div>

        {/* Input Area */}
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
