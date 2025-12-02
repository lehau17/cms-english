import React from 'react';

import { ChatMessage, StreamingState } from '../../types';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatMessageItem } from './ChatMessageItem';
import { StreamingMessage } from './StreamingMessage';

interface ChatListProps {
  chatHistory: ChatMessage[];
  streaming: StreamingState;
  onSelectPrompt: (message: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chatHistory, streaming, onSelectPrompt }) => {
  const { pendingMessage, response, charts, isStreaming } = streaming;
  const hasMessages = chatHistory.length > 0 || pendingMessage;

  if (!hasMessages) {
    return <ChatEmptyState onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <div className="space-y-8">
      {/* Historical Messages - Reversed to show oldest first */}
      {[...chatHistory].reverse().map((chat) => (
        <ChatMessageItem key={chat.id} chat={chat} />
      ))}

      {/* Streaming Message */}
      <StreamingMessage
        pendingMessage={pendingMessage}
        response={response}
        charts={charts}
        isStreaming={isStreaming}
      />
    </div>
  );
};
