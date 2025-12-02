import { Bot, Clock, Zap } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ChartRenderer } from '../../../../components/ChartRenderer';
import { ChatMessage } from '../../types';
import { Avatar, FileList } from '../ui';

interface ChatMessageItemProps {
  chat: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ chat }) => {
  return (
    <div className="space-y-5">
      {/* User Message */}
      <div className="flex gap-3 items-start">
        <Avatar variant="user" />
        <div className="flex-1 min-w-0 pt-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3">
            <p className="text-gray-900 break-words leading-relaxed">{chat.message}</p>
          </div>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex gap-3 items-start">
        <Avatar variant="assistant">
          <Bot className="h-5 w-5 text-white" />
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm px-4 sm:px-5 py-4 sm:py-5 space-y-3">
            {/* Response Text */}
            <div className="prose prose-sm max-w-none text-gray-900 leading-relaxed break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.response}</ReactMarkdown>
            </div>

            {/* Charts - Grid layout: max 2 per row */}
            {chat.charts && chat.charts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {chat.charts.map((chart, idx) => (
                  <div
                    key={idx}
                    className="border border-dashed border-gray-200 rounded-xl p-4 bg-white"
                  >
                    <ChartRenderer chart={chart} />
                  </div>
                ))}
              </div>
            )}

            {/* File Downloads */}
            {chat.files && <FileList files={chat.files} />}

            {/* Metadata */}
            <MessageMetadata chat={chat} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== MESSAGE METADATA =====================
interface MessageMetadataProps {
  chat: ChatMessage;
}

const MessageMetadata: React.FC<MessageMetadataProps> = ({ chat }) => {
  const hasTools = chat.toolsUsed && chat.toolsUsed.length > 0;
  const hasTime = chat.processingTime;

  if (!hasTools && !hasTime) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
      {hasTools && (
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{chat.toolsUsed!.join(', ')}</span>
        </div>
      )}
      {hasTime && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>{chat.processingTime}ms</span>
        </div>
      )}
    </div>
  );
};
