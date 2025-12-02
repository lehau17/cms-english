import { BookOpen, Bot, FileText, TrendingUp, Users } from 'lucide-react';
import React from 'react';

interface ExamplePrompt {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  message: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
    iconColor: 'text-blue-600',
    title: 'Student Enrollment',
    subtitle: 'Check current semester statistics',
    message: 'How many students are enrolled this semester?',
  },
  {
    icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />,
    iconColor: 'text-green-600',
    title: 'Course Analytics',
    subtitle: 'View completion trends',
    message: 'Show me course completion rates',
  },
  {
    icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5" />,
    iconColor: 'text-purple-600',
    title: 'Export Data',
    subtitle: 'Download reports to Excel',
    message: 'Export top 10 students to Excel',
  },
  {
    icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />,
    iconColor: 'text-orange-600',
    title: 'Policy Questions',
    subtitle: 'Ask about rules and requirements',
    message: 'What are the graduation requirements?',
  },
];

interface ChatEmptyStateProps {
  onSelectPrompt: (message: string) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] sm:min-h-[60vh] text-center px-4">
      {/* Logo */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
        <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
        How can I help you today?
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
        Ask me about student analytics, database queries, or learning insights
      </p>

      {/* Example Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl">
        {EXAMPLE_PROMPTS.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt.message)}
            className="p-3 sm:p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <span className={`${prompt.iconColor} flex-shrink-0 mt-0.5`}>{prompt.icon}</span>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-xs sm:text-sm">{prompt.title}</p>
                <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">{prompt.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
