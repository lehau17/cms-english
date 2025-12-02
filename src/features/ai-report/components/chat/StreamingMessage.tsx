import { Bot } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ChartRenderer } from '../../../../components/ChartRenderer';
import { ChartConfig } from '../../types';
import { Avatar, LoadingDots, TypingCaret } from '../ui';

interface StreamingMessageProps {
  pendingMessage: string;
  response: string;
  charts: ChartConfig[];
  isStreaming: boolean;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  pendingMessage,
  response,
  charts,
  isStreaming,
}) => {
  if (!pendingMessage) return null;

  return (
    <div className="space-y-5">
      {/* User Message */}
      <div className="flex gap-3 items-start">
        <Avatar variant="user" />
        <div className="flex-1 min-w-0 pt-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3">
            <p className="text-gray-900 break-words leading-relaxed">{pendingMessage}</p>
          </div>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex gap-3 items-start">
        <Avatar variant="assistant">
          <Bot className="h-5 w-5 text-white" />
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm px-4 sm:px-5 py-4 sm:py-5">
            {!response && isStreaming ? (
              <LoadingDots />
            ) : (
              <div className="space-y-3">
                {/* Streaming Text */}
                <div className="prose prose-sm max-w-none text-gray-900 leading-relaxed break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
                  {isStreaming && response && <TypingCaret />}
                </div>

                {/* Streaming Charts - Grid layout: max 2 per row */}
                {charts.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {charts.map((chart, index) => (
                      <div
                        key={index}
                        className="border border-dashed border-gray-200 rounded-xl p-4 bg-white"
                      >
                        <ChartRenderer chart={chart} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
