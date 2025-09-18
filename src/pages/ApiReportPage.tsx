import { useMutation } from '@tanstack/react-query';
import {
  BookOpen,
  Bot,
  CheckCircle,
  Clock,
  Code,
  FileText,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Send,
  Settings,
  TrendingUp,
  Upload,
  Users,
  Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { agentChat, getAgentRecommendations, uploadDocument } from '../apis/agent';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  confidence: number;
  toolsUsed?: string[];
  reasoning?: string;
  processingTime?: number;
  sources?: string[];
  suggestions?: string[];
  executionSteps?: any[];
}

interface AgentStats {
  totalChats: number;
  avgConfidence: number;
  totalProcessingTime: number;
  toolsUsed: Record<string, number>;
}

const ApiReportPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'analytics' | 'documents'>('chat');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentType, setDocumentType] = useState('regulation');
  const [documentSource, setDocumentSource] = useState('');
  const [agentStats, setAgentStats] = useState<AgentStats>({
    totalChats: 0,
    avgConfidence: 0,
    totalProcessingTime: 0,
    toolsUsed: {}
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Update stats when chat history changes
  useEffect(() => {
    const totalChats = chatHistory.length;
    const avgConfidence = totalChats > 0
      ? chatHistory.reduce((sum, chat) => sum + chat.confidence, 0) / totalChats
      : 0;
    const totalProcessingTime = chatHistory.reduce((sum, chat) => sum + (chat.processingTime || 0), 0);
    const toolsUsed = chatHistory.reduce((acc, chat) => {
      (chat.toolsUsed || []).forEach(tool => {
        acc[tool] = (acc[tool] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    setAgentStats({ totalChats, avgConfidence, totalProcessingTime, toolsUsed });
  }, [chatHistory]);

  const chatMutation = useMutation({
    mutationFn: agentChat,
    onSuccess: (data) => {
      if (data.statusCode === 200 || data.statusCode === 201) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          message,
          response: data.data.answer || data.data.response || "",
          timestamp: new Date(),
          confidence: data.data.confidence || 0.9,
          toolsUsed: data.data.toolsUsed || [],
          reasoning: data.data.reasoning || '',
          processingTime: data.data.processingTime || 0,
          sources: data.data.sources || [],
          suggestions: data.data.suggestions || [],
          executionSteps: data.data.executionSteps || [],
        };
        setChatHistory(prev => [newMessage, ...prev]);
        setMessage('');
        toast.success('AI response received!');
      } else {
        toast.error(data.message || 'Failed to get AI response');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to communicate with AI');
    },
  });

  const recommendationsMutation = useMutation({
    mutationFn: getAgentRecommendations,
    onSuccess: (data: any) => {
      if (data.statusCode === 200) {
        toast.success(`Got ${data.data.length} recommendations`);
      }
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      toast.success('Document uploaded successfully!');
      setDocumentTitle('');
      setDocumentContent('');
      setDocumentSource('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    },
  });



  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    chatMutation.mutate({
      message: message.trim(),
      language: selectedLanguage,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = () => {
    setChatHistory([]);
    toast.success('Chat history cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            AI Agent Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced AI assistant with multi-tool capabilities for English learning insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'chat', label: 'AI Chat', icon: MessageSquare },
                { id: 'tools', label: 'Tool Analytics', icon: Settings },
                { id: 'analytics', label: 'Performance', icon: TrendingUp },
                { id: 'documents', label: 'Knowledge Base', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'chat' && (
              <ChatInterface
                chatHistory={chatHistory}
                message={message}
                selectedLanguage={selectedLanguage}
                chatMutation={chatMutation}
                chatContainerRef={chatContainerRef}
                setMessage={setMessage}
                setSelectedLanguage={setSelectedLanguage}
                handleSendMessage={handleSendMessage}
                handleKeyPress={handleKeyPress}
              />
            )}
            {activeTab === 'tools' && <ToolsAnalytics agentStats={agentStats} />}
            {activeTab === 'analytics' && <PerformanceAnalytics agentStats={agentStats} />}
            {activeTab === 'documents' && (
              <DocumentsManager
                documentTitle={documentTitle}
                documentContent={documentContent}
                documentType={documentType}
                documentSource={documentSource}
                uploadMutation={uploadMutation}
                setDocumentTitle={setDocumentTitle}
                setDocumentContent={setDocumentContent}
                setDocumentType={setDocumentType}
                setDocumentSource={setDocumentSource}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* <AgentStatus /> */}
            <QuickStats agentStats={agentStats} selectedLanguage={selectedLanguage} />
            <QuickActions
              recommendationsMutation={recommendationsMutation}
              clearHistory={clearHistory}
            />
            <RecentActivity chatHistory={chatHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Interface Component
const ChatInterface: React.FC<{
  chatHistory: ChatMessage[];
  message: string;
  selectedLanguage: string;
  chatMutation: any;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  setMessage: (message: string) => void;
  setSelectedLanguage: (language: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}> = ({
  chatHistory,
  message,
  selectedLanguage,
  chatMutation,
  chatContainerRef,
  setMessage,
  setSelectedLanguage,
  handleSendMessage,
  handleKeyPress
}) => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Chat Interface
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Advanced AI assistant with multi-tool capabilities
        </p>
      </div>

      {/* Chat History */}
      <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation with the AI agent</p>
            <p className="text-sm mt-2">Ask about student data, analytics, or get learning recommendations</p>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500">Example queries:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMessage("How many students are enrolled this semester?")}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200"
                >
                  Student count
                </button>
                <button
                  onClick={() => setMessage("What are the graduation requirements?")}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200"
                >
                  Graduation rules
                </button>
                <button
                  onClick={() => setMessage("Show me the latest course statistics")}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
                >
                  Course stats
                </button>
              </div>
            </div>
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-3">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-md">
                  <p className="text-sm">{chat.message}</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-2xl">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">{chat.response}</div>

                  {/* Tools Used */}
                  {chat.toolsUsed && chat.toolsUsed.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {chat.toolsUsed.map((tool, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          <Zap className="h-3 w-3 mr-1" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Sources */}
                  {chat.sources && chat.sources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {chat.sources.map((source, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            <FileText className="h-3 w-3 mr-1" />
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {Math.round(chat.confidence * 100)}% confidence
                    </div>
                    {chat.processingTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {chat.processingTime}ms
                      </div>
                    )}
                    <div>{chat.timestamp.toLocaleTimeString()}</div>
                  </div>

                  {/* Reasoning Steps */}
                  {chat.reasoning && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <div className="flex items-center gap-1 mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Reasoning</span>
                      </div>
                      <div className="text-sm text-blue-700 whitespace-pre-wrap">
                        {chat.reasoning}
                      </div>
                    </div>
                  )}

                  {/* Execution Steps */}
                  {chat.executionSteps && chat.executionSteps.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-md">
                      <div className="flex items-center gap-1 mb-2">
                        <Code className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Execution Steps</span>
                      </div>
                      <div className="space-y-2">
                        {chat.executionSteps.map((step: any, index: number) => (
                          <div key={index} className="text-sm text-purple-700">
                            <div className="font-medium">Step {index + 1}: {step.action?.tool || step.tool || 'thinking'}</div>
                            {step.action?.toolInput && (
                              <div className="text-xs text-purple-600 mt-1">
                                Input: {typeof step.action.toolInput === 'object'
                                  ? JSON.stringify(step.action.toolInput, null, 2)
                                  : step.action.toolInput}
                              </div>
                            )}
                            {step.toolInput && !step.action?.toolInput && (
                              <div className="text-xs text-purple-600 mt-1">
                                Input: {typeof step.toolInput === 'object'
                                  ? JSON.stringify(step.toolInput, null, 2)
                                  : step.toolInput}
                              </div>
                            )}
                            {step.text && (
                              <div className="text-xs text-purple-600 mt-1">
                                Result: {typeof step.text === 'object'
                                  ? JSON.stringify(step.text, null, 2)
                                  : step.text}
                              </div>
                            )}
                            {step.result && (
                              <div className="text-xs text-purple-600 mt-1">
                                Result: {typeof step.result === 'object'
                                  ? JSON.stringify(step.result, null, 2)
                                  : step.result}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="en">English</option>
            <option value="vi">Vietnamese</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about student analytics, API data, system policies, or upload documents..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={chatMutation.isPending}
          />

          <button
            onClick={handleSendMessage}
            disabled={chatMutation.isPending || !message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {chatMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );

// Tools Analytics Component
const ToolsAnalytics: React.FC<{ agentStats: AgentStats }> = ({ agentStats }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Tool Usage Analytics
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(agentStats.toolsUsed).map(([tool, count]) => (
          <div key={tool} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{tool}</p>
                <p className="text-2xl font-bold text-blue-600">{count as number}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(agentStats.toolsUsed).length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No tool usage data yet</p>
          <p className="text-sm">Start chatting to see tool analytics</p>
        </div>
      )}
    </div>
  </div>
);

// Performance Analytics Component
const PerformanceAnalytics: React.FC<{ agentStats: AgentStats }> = ({ agentStats }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Performance Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Chats</p>
              <p className="text-2xl font-bold">{agentStats.totalChats}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Avg Confidence</p>
              <p className="text-2xl font-bold">{Math.round(agentStats.avgConfidence * 100)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg Response Time</p>
              <p className="text-2xl font-bold">
                {agentStats.totalChats > 0 ? Math.round(agentStats.totalProcessingTime / agentStats.totalChats) : 0}ms
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// // Sidebar Components
// const AgentStatus: React.FC = () => {
//   const healthQuery = useQuery({
//     queryKey: ['agent-health'],
//     queryFn: getHealthStatus,
//     refetchInterval: 30000, // Refresh every 30 seconds
//   });

//   const healthData = healthQuery.data?.data || healthQuery.data;

//   return (
//     <div className="bg-white rounded-lg shadow-sm border p-6">
//       <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//         <Bot className="h-5 w-5" />
//         Agent Status
//       </h3>
//       <div className="space-y-3">
//         <div className="flex items-center justify-between">
//           <span className="text-gray-600">Status</span>
//           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${healthData?.status === 'OK'
//             ? 'bg-green-100 text-green-800'
//             : 'bg-red-100 text-red-800'
//             }`}>
//             <div className={`w-2 h-2 rounded-full mr-1.5 ${healthData?.status === 'OK' ? 'bg-green-400' : 'bg-red-400'
//               }`}></div>
//             {healthData?.status || 'Checking...'}
//           </span>
//         </div>

//         {healthData?.services && (
//           <>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">LangChain Agent</span>
//               <span className={`text-xs font-medium ${healthData.services.langchainAgent === 'running'
//                 ? 'text-green-600'
//                 : 'text-red-600'
//                 }`}>
//                 {healthData.services.langchainAgent}
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">RAG Service</span>
//               <span className={`text-xs font-medium ${healthData.services.ragService === 'running'
//                 ? 'text-green-600'
//                 : 'text-red-600'
//                 }`}>
//                 {healthData.services.ragService}
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">SQL Service</span>
//               <span className={`text-xs font-medium ${healthData.services.sqlService === 'running'
//                 ? 'text-green-600'
//                 : 'text-red-600'
//                 }`}>
//                 {healthData.services.sqlService}
//               </span>
//             </div>
//           </>
//         )}

//         {healthData?.timestamp && (
//           <div className="text-xs text-gray-500 pt-2 border-t">
//             Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

const QuickStats: React.FC<{ agentStats: AgentStats; selectedLanguage: string }> = ({ agentStats, selectedLanguage }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <TrendingUp className="h-5 w-5" />
      Quick Stats
    </h3>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Total Chats</span>
        <span className="font-semibold">{agentStats.totalChats}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Avg Confidence</span>
        <span className="font-semibold">
          {agentStats.totalChats > 0 ? Math.round(agentStats.avgConfidence * 100) : 0}%
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Language</span>
        <span className="font-semibold capitalize">{selectedLanguage}</span>
      </div>
    </div>
  </div>
);

const QuickActions: React.FC<{
  recommendationsMutation: any;
  clearHistory: () => void;
}> = ({ recommendationsMutation, clearHistory }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <BookOpen className="h-5 w-5" />
      Quick Actions
    </h3>
    <div className="space-y-3">
      <button
        onClick={() => recommendationsMutation.mutate()}
        disabled={recommendationsMutation.isPending}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {recommendationsMutation.isPending ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Users className="h-4 w-4" />
        )}
        Get Recommendations
      </button>

      <button
        onClick={clearHistory}
        className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Clear History
      </button>
    </div>
  </div>
);

const RecentActivity: React.FC<{ chatHistory: ChatMessage[] }> = ({ chatHistory }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
    <div className="space-y-2">
      {chatHistory.slice(0, 3).map((chat) => (
        <div key={chat.id} className="text-sm text-gray-600">
          <p className="truncate">{chat.message}</p>
          <p className="text-xs text-gray-400">
            {chat.timestamp.toLocaleTimeString()}
          </p>
        </div>
      ))}
      {chatHistory.length === 0 && (
        <p className="text-sm text-gray-500">No recent activity</p>
      )}
    </div>
  </div>
);

// Documents Manager Component
const DocumentsManager: React.FC<{
  documentTitle: string;
  documentContent: string;
  documentType: string;
  documentSource: string;
  uploadMutation: any;
  setDocumentTitle: (title: string) => void;
  setDocumentContent: (content: string) => void;
  setDocumentType: (type: string) => void;
  setDocumentSource: (source: string) => void;
}> = ({
  documentTitle,
  documentContent,
  documentType,
  documentSource,
  uploadMutation,
  setDocumentTitle,
  setDocumentContent,
  setDocumentType,
  setDocumentSource,
}) => {
    const handleUpload = () => {
      if (!documentTitle.trim() || !documentContent.trim()) {
        toast.error('Please fill in both title and content');
        return;
      }

      uploadMutation.mutate({
        title: documentTitle.trim(),
        content: documentContent.trim(),
        documentType,
        source: documentSource.trim() || 'CMS Upload',
      });
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Knowledge Base Management
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload documents to enhance the AI's knowledge base for better responses
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter document title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="regulation">Regulation</option>
                  <option value="policy">Policy</option>
                  <option value="guide">Guide</option>
                  <option value="faq">FAQ</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={documentSource}
                  onChange={(e) => setDocumentSource(e.target.value)}
                  placeholder="e.g., Phòng CTSV, Admin Department..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Content
                </label>
                <textarea
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  placeholder="Enter the document content here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Document
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Document Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Best Practices:</h4>
              <ul className="space-y-1">
                <li>• Use clear, descriptive titles</li>
                <li>• Include relevant keywords</li>
                <li>• Keep content focused and concise</li>
                <li>• Specify the source department</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supported Types:</h4>
              <ul className="space-y-1">
                <li>• Regulations and policies</li>
                <li>• User guides and manuals</li>
                <li>• FAQ documents</li>
                <li>• Administrative procedures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default ApiReportPage;
