import { Menu } from 'lucide-react';
import React from 'react';

interface ChatHeaderProps {
  onToggleSidebar?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onToggleSidebar }) => {
  return (
    <div className="flex-shrink-0 border-b border-gray-200/80 bg-white/80 backdrop-blur">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {/* Sidebar Toggle Button - Mobile only */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden flex-shrink-0"
              title="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>


      </div>
    </div>
  );
};
