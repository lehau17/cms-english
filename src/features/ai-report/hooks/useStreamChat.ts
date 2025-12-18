import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { streamAgentChat } from '../services/agent.service';
import {
  ChartConfig,
  ChatMessage,
  FileDownload,
  StreamingState,
} from '../types';

interface UseStreamChatOptions {
  onMessageComplete?: (message: ChatMessage) => void;
  onConversationIdChange?: (id: string) => void;
}

interface UseStreamChatReturn {
  streaming: StreamingState;
  sendMessage: (
    message: string,
    conversationId?: string,
    language?: string,
  ) => void;
  cancelStream: () => void;
}

export const useStreamChat = (
  options: UseStreamChatOptions = {},
): UseStreamChatReturn => {
  const { onMessageComplete, onConversationIdChange } = options;

  const [streaming, setStreaming] = useState<StreamingState>({
    isStreaming: false,
    response: '',
    charts: [],
    pendingMessage: '',
  });

  // Refs for streaming management
  const streamControllerRef = useRef<{ abort: () => void } | null>(null);
  const streamingBufferRef = useRef<string>('');
  const streamingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedResponseRef = useRef<string>('');

  const clearStreamingTimer = useCallback(() => {
    if (streamingTimerRef.current) {
      clearInterval(streamingTimerRef.current);
      streamingTimerRef.current = null;
    }
  }, []);

  const resetStreamingState = useCallback(() => {
    setStreaming({
      isStreaming: false,
      response: '',
      charts: [],
      pendingMessage: '',
    });
    streamingBufferRef.current = '';
    accumulatedResponseRef.current = '';
    clearStreamingTimer();
  }, [clearStreamingTimer]);

  const cancelStream = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
    }
    resetStreamingState();
  }, [resetStreamingState]);

  const sendMessage = useCallback(
    async (
      message: string,
      conversationId?: string,
      language: string = 'en',
    ) => {
      if (!message.trim()) {
        toast.error('Please enter a message');
        return;
      }

      const messageToSend = message.trim();

      // Reset and start streaming
      setStreaming({
        isStreaming: true,
        response: '',
        charts: [],
        pendingMessage: messageToSend,
      });

      // Close previous connection
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
      }

      const startTime = Date.now();
      accumulatedResponseRef.current = '';
      streamingBufferRef.current = '';

      // MOCK DATA INTERCEPT
      if (
        messageToSend.toLowerCase().includes('analyze student learning patterns') ||
        messageToSend.toLowerCase().includes('hard statistics')
      ) {
        // Import mock data dynamically to avoid heavy initial bundle if this grows
        const { MOCK_CHART_RESPONSE, MOCK_ANALYSIS_TEXT, simulateTokenStream } = await import('../services/mockAnalytics');

        // 1. Simulate chart generation delay
        setTimeout(() => {
          setStreaming(prev => ({ ...prev, charts: MOCK_CHART_RESPONSE }));
        }, 1500);

        // 2. Simulate text streaming
        try {
          await simulateTokenStream(MOCK_ANALYSIS_TEXT, (token) => {
            accumulatedResponseRef.current += token;
            setStreaming((prev) => ({
              ...prev,
              response: prev.response + token,
            }));
          });

          // 3. Complete
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            message: messageToSend,
            response: accumulatedResponseRef.current,
            timestamp: new Date(),
            confidence: 0.95,
            toolsUsed: ['Analytics Engine', 'Chart Generator'],
            reasoning: 'Generated from mock dataset for demonstration.',
            processingTime: Date.now() - startTime,
            sources: ['Student Database', 'Learning Management System'],
            charts: MOCK_CHART_RESPONSE,
          };

          resetStreamingState();
          onMessageComplete?.(newMessage);
          toast.success('Analysis complete!');

        } catch (e) {
          console.error("Mock stream error", e);
          resetStreamingState();
        }
        return;
      }

      const metadata = {
        toolsUsed: [] as string[],
        reasoning: '',
        processingTime: 0,
        charts: [] as ChartConfig[],
        files: [] as FileDownload[],
      };

      // Batch update streaming response every 50ms
      clearStreamingTimer();
      streamingTimerRef.current = setInterval(() => {
        if (streamingBufferRef.current) {
          setStreaming((prev) => ({
            ...prev,
            response: prev.response + streamingBufferRef.current,
          }));
          streamingBufferRef.current = '';
        }
      }, 50);

      try {
        const controller = await streamAgentChat(
          {
            message: messageToSend,
            context: conversationId,
            language,
          },
          (chunk) => {
            if (chunk.type === 'metadata' && chunk.data?.conversationId) {
              onConversationIdChange?.(chunk.data.conversationId);
            } else if (chunk.type === 'token' && chunk.content) {
              accumulatedResponseRef.current += chunk.content;
              streamingBufferRef.current += chunk.content;
            } else if (chunk.type === 'tool' && chunk.tool) {
              metadata.toolsUsed.push(chunk.tool);
              toast(`Using tool: ${chunk.tool}`);
            } else if (chunk.type === 'chart' && chunk.chart) {
              metadata.charts.push(chunk.chart);
              setStreaming((prev) => ({
                ...prev,
                charts: [...prev.charts, chunk.chart!],
              }));
              toast.success(`Chart ${metadata.charts.length} generated!`);
            } else if (chunk.type === 'file' && chunk.file) {
              metadata.files.push(chunk.file);
              toast.success(`File ready: ${chunk.file.filename}`);
            } else if (chunk.type === 'complete' && chunk.data) {
              // Use complete answer from server - authoritative source, avoids accumulation bugs
              if (chunk.data.answer) {
                accumulatedResponseRef.current = chunk.data.answer;
              }
              metadata.toolsUsed = chunk.data.toolsUsed || [];
              metadata.reasoning = chunk.data.reasoning || '';
              metadata.processingTime =
                chunk.data.processingTime || Date.now() - startTime;
            } else if (chunk.type === 'error') {
              toast.error(chunk.content || 'Error occurred');
            }
          },
          (error) => {
            console.error('Streaming error:', error);
            toast.error('Failed to communicate with AI');
            resetStreamingState();
          },
          () => {
            // Clear timer and buffer (no need to flush - complete event has final answer)
            clearStreamingTimer();
            streamingBufferRef.current = '';

            // Create final message
            const newMessage: ChatMessage = {
              id: Date.now().toString(),
              message: messageToSend,
              response: accumulatedResponseRef.current,
              timestamp: new Date(),
              confidence: 0.9,
              toolsUsed: metadata.toolsUsed,
              reasoning: metadata.reasoning,
              processingTime: metadata.processingTime,
              sources: ['Knowledge Base', 'Database', 'API Documentation'],
              suggestions: [],
              executionSteps: [],
              charts: metadata.charts.length > 0 ? metadata.charts : undefined,
              files: metadata.files.length > 0 ? metadata.files : undefined,
            };

            // Reset streaming state
            resetStreamingState();

            // Callback with completed message
            onMessageComplete?.(newMessage);
            toast.success('AI response complete!');
          },
        );

        streamControllerRef.current = controller;
      } catch (err) {
        console.error('Failed to start streaming:', err);
        toast.error('Failed to start chat');
        resetStreamingState();
      }
    },
    [
      onMessageComplete,
      onConversationIdChange,
      clearStreamingTimer,
      resetStreamingState,
    ],
  );

  return {
    streaming,
    sendMessage,
    cancelStream,
  };
};
