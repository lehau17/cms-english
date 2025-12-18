import { MessageSquare, PenSquare, Trash2 } from 'lucide-react';
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

  const todayList: AgentConversation[] = [];
  const yesterdayList: AgentConversation[] = [];
  const lastWeekList: AgentConversation[] = [];
  const olderList: AgentConversation[] = [];

  conversations.forEach((conv) => {
    const date = new Date(conv.updatedAt);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) todayList.push(conv);
    else if (date.getTime() === yesterday.getTime()) yesterdayList.push(conv);
    else if (date >= lastWeek) lastWeekList.push(conv);
    else olderList.push(conv);
  });

  return [
    { label: 'Today', conversations: todayList },
    { label: 'Yesterday', conversations: yesterdayList },
    { label: 'Previous 7 Days', conversations: lastWeekList },
    { label: 'Older', conversations: olderList },
  ].filter((group) => group.conversations.length > 0);
};

const ConversationItem: React.FC<{
  conversation: AgentConversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ conversation, isActive, onSelect, onDelete }) => (
  <div
    onClick={onSelect}
    className={`group px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
      isActive ? 'bg-[#3d3d3d]' : 'hover:bg-[#3d3d3d]/50'
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-[#ececec] truncate flex-1">
        {conversation.title || 'New chat'}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 text-[#8e8e8e] hover:text-[#ececec] transition-opacity"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
);

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
    <div className="w-64 bg-[#2d2d2d] h-full max-h-full flex flex-col">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <span className="text-[#ececec] font-medium text-sm">Chats</span>
        <button
          onClick={onNewChat}
          className="p-2 text-[#ececec] hover:bg-[#3d3d3d] rounded-lg transition-colors"
          title="New chat"
        >
          <PenSquare className="h-4 w-4" />
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#8e8e8e] border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#5a5a5a]" />
            <p className="text-sm text-[#8e8e8e]">No conversations</p>
          </div>
        ) : (
          groupedConversations.map((group) => (
            <div key={group.label} className="mb-3">
              <h3 className="text-xs font-medium text-[#8e8e8e] px-3 py-2">
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
          ))
        )}
      </div>
    </div>
  );
};
