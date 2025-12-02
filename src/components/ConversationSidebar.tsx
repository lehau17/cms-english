import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { AgentConversation } from '../apis/agent';

interface ConversationSidebarProps {
  conversations: AgentConversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isLoading?: boolean;
}

interface ConversationGroup {
  label: string;
  conversations: AgentConversation[];
}

const groupConversationsByDate = (conversations: AgentConversation[]): ConversationGroup[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  const groups: Record<string, AgentConversation[]> = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };

  conversations.forEach((conv) => {
    const date = new Date(conv.updatedAt);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      groups.today.push(conv);
    } else if (date.getTime() === yesterday.getTime()) {
      groups.yesterday.push(conv);
    } else if (date >= lastWeek) {
      groups.lastWeek.push(conv);
    } else if (date >= lastMonth) {
      groups.lastMonth.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  return [
    { label: 'Today', conversations: groups.today },
    { label: 'Yesterday', conversations: groups.yesterday },
    { label: 'Last 7 Days', conversations: groups.lastWeek },
    { label: 'Last 30 Days', conversations: groups.lastMonth },
    { label: 'Older', conversations: groups.older },
  ].filter((group) => group.conversations.length > 0);
};

const ConversationItem: React.FC<{
  conversation: AgentConversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ conversation, isActive, onSelect, onDelete }) => {
  const firstMessage = conversation.messages?.[0]?.content || '';
  const preview = firstMessage.length > 60 ? `${firstMessage.substring(0, 60)}...` : firstMessage;

  return (
    <div
      onClick={onSelect}
      className={`
        group px-3 py-2 rounded-lg cursor-pointer mb-1 transition-colors
        ${isActive ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium truncate">
              {conversation.title || 'New Chat'}
            </p>
          </div>
          {preview && (
            <p className="text-xs text-gray-500 truncate mt-1 pl-6">
              {preview}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity flex-shrink-0"
          title="Delete conversation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoading,
}) => {
  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <div className="w-64 bg-gray-50 border-r h-full max-h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <>
            {groupedConversations.map((group) => (
              <div key={group.label} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 px-2 mb-2 uppercase">
                  {group.label}
                </h3>
                {group.conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeConversationId === conv.id}
                    onSelect={() => onSelectConversation(conv.id)}
                    onDelete={() => onDeleteConversation(conv.id)}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
