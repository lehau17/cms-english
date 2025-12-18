import React from 'react';

// ===================== MESSAGE BUBBLE =====================
interface MessageBubbleProps {
  variant: 'user' | 'assistant';
  children: React.ReactNode;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  children,
  className = '',
}) => {
  return <div className={`flex-1 min-w-0 ${className}`}>{children}</div>;
};

// ===================== AVATAR =====================
interface AvatarProps {
  variant: 'user' | 'assistant';
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ variant, children }) => {
  if (variant === 'user') {
    return (
      <div className="flex-shrink-0 w-7 h-7 bg-[#1a1a1a] rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-medium">U</span>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-7 h-7 bg-[#d97757] rounded-full flex items-center justify-center">
      {children}
    </div>
  );
};

// ===================== LOADING DOTS =====================
export const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="w-2 h-2 bg-[#9b9a95] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-[#9b9a95] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-[#9b9a95] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

// ===================== TYPING CARET =====================
export const TypingCaret: React.FC = () => {
  return <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#d97757] animate-pulse" />;
};
