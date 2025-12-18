import { ArrowUp } from 'lucide-react';
import React, { useCallback, useEffect, useRef } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  language: string;
  onLanguageChange: (language: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend]
  );

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className="flex-shrink-0 pb-4 pt-2 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-white rounded-3xl border border-[#d4d3ce] shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI EduliaAI..."
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent pl-5 pr-14 py-4 text-[15px] leading-relaxed placeholder:text-[#9b9a95] focus:outline-none resize-none min-h-[56px] max-h-[200px]"
          />
          <button
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="absolute right-3 bottom-3 h-8 w-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center transition-all hover:bg-[#333] disabled:bg-[#d4d3ce] disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[11px] text-[#9b9a95] text-center mt-2">
          AI can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  );
};
