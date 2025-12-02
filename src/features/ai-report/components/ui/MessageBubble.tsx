import React from 'react';

// ===================== MESSAGE BUBBLE =====================
interface MessageBubbleProps {
  variant: 'user' | 'assistant';
  children: React.ReactNode;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  variant,
  children,
  className = '',
}) => {
  const baseClasses = 'flex-1 min-w-0 space-y-3';

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
};

// ===================== AVATAR =====================
interface AvatarProps {
  variant: 'user' | 'assistant';
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ variant, children }) => {
  if (variant === 'user') {
    return (
      <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">You</span>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
      {children}
    </div>
  );
};

// ===================== LOADING DOTS =====================
interface LoadingDotsProps {
  text?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ text = 'Thinking...' }) => {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex gap-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-xs text-gray-500 ml-2">{text}</span>
    </div>
  );
};

// ===================== TYPING CARET =====================
export const TypingCaret: React.FC = () => {
  return <span className="inline-block w-0.5 h-4 ml-0.5 bg-gray-900 animate-pulse" />;
};
