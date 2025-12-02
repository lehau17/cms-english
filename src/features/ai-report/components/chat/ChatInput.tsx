import { Send } from 'lucide-react';
import React, { useCallback } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  language: string;
  onLanguageChange: (language: string) => void;
}

const LANGUAGES = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
  { value: 'es', label: 'ES' },
  { value: 'fr', label: 'FR' },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  language,
  onLanguageChange,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend]
  );

  return (
    <div className="flex-shrink-0 bg-[#f7f7f8] border-t border-gray-200/80">
      <div className="max-w-5xl mx-auto px-3 sm:px-5 py-1 sm:py-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-[0_10px_50px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-3 sm:px-4 py-1 border-b border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                AI Report Assistant
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 hidden sm:inline">Language</span>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="text-xs sm:text-sm px-3 py-1 border border-gray-200 rounded-full bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative px-3 sm:px-4 pt-2.5 pb-2">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI Assistant..."
              rows={1}
              disabled={disabled}
              className="w-full bg-transparent px-1 sm:px-2 pr-16 sm:pr-20  text-sm sm:text-base leading-relaxed placeholder:text-gray-400 focus:outline-none resize-none min-h-[36px] max-h-44"
            />

            <div className="absolute right-4 bottom-4 flex items-center gap-2 sm:gap-3">
              <button
                onClick={onSend}
                disabled={disabled || !value.trim()}
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-800 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Send Message"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-gray-500 mt-1.5 px-1">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Ready to answer
              </span>
              <span className="hidden sm:flex items-center gap-3">
                <span>Enter to send</span>
                <span>Shift + Enter for newline</span>
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-2 px-2">
          AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};
