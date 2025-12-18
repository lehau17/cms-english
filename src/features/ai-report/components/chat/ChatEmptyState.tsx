import { Sparkles } from 'lucide-react';
import React from 'react';

interface ExamplePrompt {
  title: string;
  message: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  { title: 'Student enrollment stats', message: 'How many students are enrolled this semester?' },
  { title: 'Course completion rates', message: 'Show me course completion rates' },
  { title: 'Hard statistics', message: 'Analyze student learning patterns with hard statistics' },
  { title: 'Learning analytics', message: 'Analyze student learning patterns' },
];

interface ChatEmptyStateProps {
  onSelectPrompt: (message: string) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* Logo */}
      <div className="w-12 h-12 rounded-full bg-[#d97757] flex items-center justify-center mb-6">
        <Sparkles className="h-6 w-6 text-white" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-medium text-[#1a1a1a] mb-2">
        How can I help you today?
      </h1>
      <p className="text-[15px] text-[#6b6b6b] mb-8 max-w-md">
        Ask about student analytics, export reports, or get learning insights
      </p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
        {EXAMPLE_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt.message)}
            className="p-4 text-left bg-white border border-[#d4d3ce] rounded-2xl hover:bg-[#faf9f6] transition-colors"
          >
            <p className="text-[14px] text-[#1a1a1a]">{prompt.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
