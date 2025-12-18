import { Sparkles } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ChartRenderer } from '../../../../components/ChartRenderer';
import { ChartConfig } from '../../types';
import { LoadingDots, TypingCaret } from '../ui';

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
    <div className="space-y-6">
      {/* User Message */}
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-[#e8e7e2] rounded-3xl px-5 py-3">
          <p className="text-[#1a1a1a] text-[15px] leading-relaxed">{pendingMessage}</p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#d97757] flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {!response && isStreaming ? (
            <LoadingDots />
          ) : (
            <>
              {/* Streaming Text */}
              <div className="prose prose-sm max-w-none text-[#1a1a1a] leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
                {isStreaming && response && <TypingCaret />}
              </div>

              {/* Charts */}
              {charts.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  {charts.map((chart, index) => (
                    <div key={index} className="border border-[#d4d3ce] rounded-xl p-4 bg-white">
                      <ChartRenderer chart={chart} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
