import { useMutation, useQuery } from '@tanstack/react-query';
import {
    BookOpen,
    Bot,
    CheckCircle,
    Clock,
    Code,
    Download,
    FileSpreadsheet,
    FileText,
    Lightbulb,
    Menu,
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
import {
    agentChat,
    deleteConversation,
    getAgentRecommendations,
    getConversation,
    getConversations,
    streamAgentChat,
    uploadDocument,
    type AgentConversation
} from '../apis/agent';
import { ChartRenderer } from '../components/ChartRenderer';
import { ConversationSidebar } from '../components/ConversationSidebar';

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
    chart?: any; // Chart config for visualization
    files?: Array<{
        filename: string;
        downloadUrl: string;
        recordCount?: number;
    }>; // File downloads info (supports multiple files)
}

interface AgentStats {
    totalChats: number;
    avgConfidence: number;
    totalProcessingTime: number;
    toolsUsed: Record<string, number>;
}

// Helper function to get API base URL
const getApiBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    // Remove /api suffix to get base URL
    return apiUrl.replace(/\/api$/, '');
};

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
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingResponse, setStreamingResponse] = useState('');
    const [streamingChart, setStreamingChart] = useState<any>(null); // Chart during streaming
    const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
    const [pendingMessage, setPendingMessage] = useState<string>(''); // User message waiting for AI response
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const streamControllerRef = useRef<{ abort: () => void } | null>(null);
    const streamingBufferRef = useRef<string>('');
    const streamingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ✅ Multi-conversation state
    const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
    const [conversations, setConversations] = useState<AgentConversation[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ✅ Load conversations from backend
    const conversationsQuery = useQuery({
        queryKey: ['agent-conversations'],
        queryFn: () => getConversations(50, 0),
        refetchInterval: 30000, // Refresh every 30s
    });

    // ✅ Update conversations list when data changes
    useEffect(() => {
        if (conversationsQuery.data?.conversations) {
            setConversations(conversationsQuery.data.conversations);
        }
    }, [conversationsQuery.data]);

    // Auto scroll to bottom when new messages arrive or streaming updates
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, streamingResponse]);

    // Cleanup streaming timer on unmount
    useEffect(() => {
        return () => {
            if (streamingTimerRef.current) {
                clearInterval(streamingTimerRef.current);
            }
            if (streamControllerRef.current) {
                streamControllerRef.current.abort();
            }
        };
    }, []);

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

        const messageToSend = message.trim();

        // Immediately show user message and AI placeholder
        setPendingMessage(messageToSend);
        setMessage(''); // Clear input immediately
        setIsStreaming(true);
        setStreamingResponse('');
        setStreamingChart(null); // Clear previous chart

        // Close previous connection if exists
        if (streamControllerRef.current) {
            streamControllerRef.current.abort();
        }

        const startTime = Date.now();

        // Use ref to track accumulated response
        const accumulatedResponse = { current: '' };
        const metadata = {
            toolsUsed: [] as string[],
            reasoning: '',
            processingTime: 0,
            chart: null as any,
            files: [] as any[],
        };

        console.log('🎬 Starting stream for message:', messageToSend);

        // Clear any existing streaming timer
        if (streamingTimerRef.current) {
            clearInterval(streamingTimerRef.current);
            streamingTimerRef.current = null;
        }
        streamingBufferRef.current = '';

        // Batch update streaming response every 50ms for smooth rendering
        streamingTimerRef.current = setInterval(() => {
            if (streamingBufferRef.current) {
                setStreamingResponse((prev) => prev + streamingBufferRef.current);
                streamingBufferRef.current = '';
            }
        }, 50); // Update UI every 50ms

        (async () => {
            try {
                const controller = await streamAgentChat(
                    {
                        message: messageToSend,
                        context: activeConversationId, // ✅ Use activeConversationId instead of currentConversationId
                        language: selectedLanguage,
                    },
                    (chunk) => {
                        console.log('🔥 Chunk received in component:', chunk);

                        if (chunk.type === 'metadata' && chunk.data?.conversationId) {
                            console.log('📊 Setting conversation ID:', chunk.data.conversationId);
                            setCurrentConversationId(chunk.data.conversationId);
                            setActiveConversationId(chunk.data.conversationId); // ✅ Also set active conversation ID
                        } else if (chunk.type === 'token' && chunk.content) {
                            console.log('💬 Token content:', chunk.content);
                            accumulatedResponse.current += chunk.content;
                            // Buffer tokens for batched rendering
                            streamingBufferRef.current += chunk.content;
                        } else if (chunk.type === 'tool' && chunk.tool) {
                            console.log('🔧 Tool used:', chunk.tool);
                            metadata.toolsUsed.push(chunk.tool);
                            toast(`Using tool: ${chunk.tool}`);
                        } else if (chunk.type === 'chart' && chunk.chart) {
                            console.log('📊 Chart received:', chunk.chart);
                            metadata.chart = chunk.chart;
                            setStreamingChart(chunk.chart); // Show chart immediately
                            toast.success('📊 Chart generated!');
                        } else if (chunk.type === 'file' && chunk.file) {
                            console.log('📄 File received:', chunk.file);
                            metadata.files.push(chunk.file);
                            toast.success(`📄 File ready: ${chunk.file.filename}`);
                        } else if (chunk.type === 'complete' && chunk.data) {
                            console.log('✅ Complete chunk received:', chunk.data);
                            metadata.toolsUsed = chunk.data.toolsUsed || [];
                            metadata.reasoning = chunk.data.reasoning || '';
                            metadata.processingTime = chunk.data.processingTime || Date.now() - startTime;
                        } else if (chunk.type === 'error') {
                            console.error('❌ Error chunk:', chunk.content);
                            toast.error(chunk.content || 'Error occurred');
                        }
                    },
                    (error) => {
                        console.error('💥 Streaming error:', error);
                        toast.error('Failed to communicate with AI');

                        // Clear streaming timer
                        if (streamingTimerRef.current) {
                            clearInterval(streamingTimerRef.current);
                            streamingTimerRef.current = null;
                        }

                        setPendingMessage(''); // Clear pending on error
                        setStreamingResponse('');
                        setIsStreaming(false);
                    },
                    () => {
                        console.log('🏁 Stream complete callback');
                        console.log('📊 Accumulated response:', accumulatedResponse.current);

                        // Clear streaming timer and flush any remaining buffer
                        if (streamingTimerRef.current) {
                            clearInterval(streamingTimerRef.current);
                            streamingTimerRef.current = null;
                        }
                        if (streamingBufferRef.current) {
                            accumulatedResponse.current += streamingBufferRef.current;
                            streamingBufferRef.current = '';
                        }

                        // Clear streaming states FIRST to avoid showing duplicate
                        setPendingMessage(''); // Clear pending message
                        setStreamingResponse(''); // Clear streaming response
                        setStreamingChart(null); // Clear streaming chart
                        setIsStreaming(false);

                        // Then save to history
                        const newMessage: ChatMessage = {
                            id: Date.now().toString(),
                            message: messageToSend,
                            response: accumulatedResponse.current, // Only use accumulated, not streamingResponse
                            timestamp: new Date(),
                            confidence: 0.9,
                            toolsUsed: metadata.toolsUsed,
                            reasoning: metadata.reasoning,
                            processingTime: metadata.processingTime,
                            sources: ['Knowledge Base', 'Database', 'API Documentation'],
                            suggestions: [],
                            executionSteps: [],
                            chart: metadata.chart, // Save chart config
                            files: metadata.files.length > 0 ? metadata.files : undefined, // Save files info
                        };

                        console.log('💾 Saving message to history:', newMessage);
                        setChatHistory((prev) => [newMessage, ...prev]);
                        toast.success('AI response complete!');

                        // ✅ Refresh conversations list after successful chat
                        conversationsQuery.refetch();
                    },
                );

                streamControllerRef.current = controller;
            } catch (err) {
                console.error('💥 Failed to start streaming:', err);
                toast.error('Failed to start chat');
                setStreamingResponse('');
                setIsStreaming(false);
            }
        })();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ✅ Handler: New Chat
    const handleNewChat = () => {
        setActiveConversationId(undefined);
        setCurrentConversationId(undefined);
        setChatHistory([]);
        setMessage('');
        setPendingMessage('');
        setStreamingResponse('');
        setStreamingChart(null);
        toast.success('Started new chat');
    };

    // ✅ Handler: Select Conversation
    const handleSelectConversation = async (conversationId: string) => {
        try {
            setActiveConversationId(conversationId);
            setCurrentConversationId(conversationId);

            // Load conversation messages
            const conversation = await getConversation(conversationId);

            // Convert to ChatMessage format
            const messages: ChatMessage[] = [];
            if (conversation.messages) {
                for (let i = 0; i < conversation.messages.length; i += 2) {
                    const userMsg = conversation.messages[i];
                    const aiMsg = conversation.messages[i + 1];

                    if (userMsg && aiMsg) {
                        messages.push({
                            id: userMsg.id,
                            message: userMsg.role === 'user' ? userMsg.content : '',
                            response: aiMsg.role === 'assistant' ? aiMsg.content : '',
                            timestamp: new Date(userMsg.createdAt),
                            confidence: 0.9,
                            toolsUsed: [],
                            sources: [],
                            suggestions: [],
                        });
                    }
                }
            }

            setChatHistory(messages);
            toast.success('Conversation loaded');
        } catch (error: any) {
            console.error('Failed to load conversation:', error);
            toast.error(error.message || 'Failed to load conversation');
        }
    };

    // ✅ Handler: Delete Conversation
    const handleDeleteConversation = async (conversationId: string) => {
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            await deleteConversation(conversationId);
            toast.success('Conversation deleted');

            // Refresh list
            conversationsQuery.refetch();

            // If active conversation was deleted, start new chat
            if (activeConversationId === conversationId) {
                handleNewChat();
            }
        } catch (error: any) {
            console.error('Failed to delete conversation:', error);
            toast.error(error.message || 'Failed to delete conversation');
        }
    };

    const clearHistory = () => {
        handleNewChat(); // Use new chat handler instead
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Conversation Sidebar */}
            <ConversationSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewChat={handleNewChat}
                onDeleteConversation={handleDeleteConversation}
                isLoading={conversationsQuery.isLoading}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header - Aligned with Sidebar */}
                <div className="flex-shrink-0 border-b border-gray-200 bg-white">
                    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            {/* Sidebar Toggle Button */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden flex-shrink-0"
                                title="Toggle sidebar"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900 truncate text-sm sm:text-base">AI Assistant</span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* The "New Chat" button was removed from here to avoid duplication.
                  The primary "New Chat" button is in the ConversationSidebar. */}
                        </div>
                    </div>
                </div>

                {/* Chat Area - Scrollable */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto relative">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        {chatHistory.length === 0 && !pendingMessage ? (
                            // Empty State - ChatGPT Style
                            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] sm:min-h-[60vh] text-center px-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                                    <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">How can I help you today?</h2>
                                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Ask me about student analytics, database queries, or learning insights</p>

                                {/* Example Prompts */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl">
                                    <button
                                        onClick={() => setMessage("How many students are enrolled this semester?")}
                                        className="p-3 sm:p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 text-xs sm:text-sm">Student Enrollment</p>
                                                <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">Check current semester statistics</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setMessage("Show me course completion rates")}
                                        className="p-3 sm:p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 text-xs sm:text-sm">Course Analytics</p>
                                                <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">View completion trends</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setMessage("Export top 10 students to Excel")}
                                        className="p-3 sm:p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 text-xs sm:text-sm">Export Data</p>
                                                <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">Download reports to Excel</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setMessage("What are the graduation requirements?")}
                                        className="p-3 sm:p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 text-xs sm:text-sm">Policy Questions</p>
                                                <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">Ask about rules and requirements</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Chat Messages
                            <div className="space-y-8">
                                {[...chatHistory].reverse().map((chat) => (
                                    <div key={chat.id} className="space-y-4">
                                        {/* User Message */}
                                        <div className="flex gap-3 items-start">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">You</span>
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-gray-900 break-words">{chat.message}</p>
                                            </div>
                                        </div>

                                        {/* AI Response */}
                                        <div className="flex gap-3 items-start">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                                <Bot className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="text-gray-900 leading-relaxed whitespace-pre-wrap break-words">{chat.response}</div>

                                                {/* Chart */}
                                                {chat.chart && (
                                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                        <ChartRenderer chart={chat.chart} />
                                                    </div>
                                                )}

                                                {/* File Downloads */}
                                                {chat.files && chat.files.length > 0 && (
                                                    <div className="space-y-2">
                                                        {chat.files.map((file, idx) => {
                                                            const isExcel = file.filename.endsWith('.xlsx');
                                                            const isPdf = file.filename.endsWith('.pdf');
                                                            const isWord = file.filename.endsWith('.docx');

                                                            return (
                                                                <a
                                                                    key={idx}
                                                                    href={`${getApiBaseUrl()}${file.downloadUrl}`}
                                                                    download={file.filename}
                                                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md ${isExcel ? 'bg-green-600 hover:bg-green-700 text-white' :
                                                                            isPdf ? 'bg-red-600 hover:bg-red-700 text-white' :
                                                                                isWord ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                                                                    'bg-gray-900 hover:bg-gray-800 text-white'
                                                                        }`}
                                                                >
                                                                    {isExcel ? <FileSpreadsheet className="h-4 w-4" /> :
                                                                        isPdf ? <FileText className="h-4 w-4" /> :
                                                                            isWord ? <FileText className="h-4 w-4" /> :
                                                                                <Download className="h-4 w-4" />}
                                                                    <span className="truncate max-w-xs">{file.filename}</span>
                                                                    {file.recordCount && (
                                                                        <span className="text-xs opacity-90 bg-white/20 px-2 py-0.5 rounded">
                                                                            {file.recordCount} rows
                                                                        </span>
                                                                    )}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Metadata */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                                    {chat.toolsUsed && chat.toolsUsed.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Zap className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">{chat.toolsUsed.join(', ')}</span>
                                                        </div>
                                                    )}
                                                    {chat.processingTime && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3 flex-shrink-0" />
                                                            <span>{chat.processingTime}ms</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Streaming Message */}
                                {pendingMessage && (
                                    <div className="space-y-4">
                                        {/* User Message */}
                                        <div className="flex gap-3 items-start">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">You</span>
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-gray-900 break-words">{pendingMessage}</p>
                                            </div>
                                        </div>

                                        {/* AI Response */}
                                        <div className="flex gap-3 items-start">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                                <Bot className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {!streamingResponse && isStreaming ? (
                                                    // Loading dots when waiting for response
                                                    <div className="flex items-center gap-2 py-2">
                                                        <div className="flex gap-1">
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 ml-2">Thinking...</span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                                                            {streamingResponse}
                                                            {isStreaming && streamingResponse && (
                                                                <span className="inline-block w-0.5 h-4 ml-0.5 bg-gray-900 animate-pulse"></span>
                                                            )}
                                                        </div>
                                                        {streamingChart && (
                                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                                <ChartRenderer chart={streamingChart} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area - Fixed at Bottom */}
                <div className="flex-shrink-0 border-t border-gray-200 bg-white">
                    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                        <div className="relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Message AI Assistant..."
                                rows={1}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-20 sm:pr-24 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                                style={{ minHeight: '48px', maxHeight: '200px' }}
                                disabled={chatMutation.isPending || isStreaming}
                            />
                            <div className="absolute right-2 bottom-2 flex items-center gap-1.5 sm:gap-2">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="px-1.5 sm:px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="en">EN</option>
                                    <option value="vi">VI</option>
                                    <option value="es">ES</option>
                                    <option value="fr">FR</option>
                                </select>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={chatMutation.isPending || !message.trim() || isStreaming}
                                    className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                    aria-label="Send Message"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2 px-2">
                            AI can make mistakes. Check important info.
                        </p>
                    </div>
                </div>
                {/* End Main Chat Area */}
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
    isStreaming: boolean;
    streamingResponse: string;
    streamingChart: any;
    pendingMessage: string;
}> = ({
    chatHistory,
    message,
    selectedLanguage,
    chatMutation,
    chatContainerRef,
    setMessage,
    setSelectedLanguage,
    handleSendMessage,
    handleKeyPress,
    isStreaming,
    streamingResponse,
    streamingChart,
    pendingMessage
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
            <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 space-y-4 smooth-scroll">
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
                    <>
                        {/* Chat History - Show old messages first */}
                        {[...chatHistory].reverse().map((chat) => (
                            <div key={chat.id} className="space-y-3 mb-6"
                            >
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-md shadow-sm">
                                        <p className="text-sm leading-relaxed">{chat.message}</p>
                                    </div>
                                </div>

                                {/* AI Response */}
                                <div className="flex justify-start items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3 max-w-2xl shadow-sm">
                                        <div className="text-sm text-gray-800 whitespace-pre-wrap">{chat.response}</div>

                                        {/* Chart */}
                                        {chat.chart && (
                                            <div className="mt-4">
                                                <ChartRenderer chart={chat.chart} />
                                            </div>
                                        )}

                                        {/* File Downloads */}
                                        {chat.files && chat.files.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {chat.files.map((file, idx) => {
                                                    const isExcel = file.filename.endsWith('.xlsx');
                                                    const isPdf = file.filename.endsWith('.pdf');
                                                    const isWord = file.filename.endsWith('.docx');

                                                    return (
                                                        <a
                                                            key={idx}
                                                            href={`${getApiBaseUrl()}${file.downloadUrl}`}
                                                            download={file.filename}
                                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isExcel ? 'bg-green-600 hover:bg-green-700 text-white' :
                                                                    isPdf ? 'bg-red-600 hover:bg-red-700 text-white' :
                                                                        isWord ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                                                            'bg-gray-600 hover:bg-gray-700 text-white'
                                                                }`}
                                                        >
                                                            {isExcel ? <FileSpreadsheet className="h-4 w-4" /> :
                                                                isPdf ? <FileText className="h-4 w-4" /> :
                                                                    isWord ? <FileText className="h-4 w-4" /> :
                                                                        <Download className="h-4 w-4" />}
                                                            <span>Download {file.filename}</span>
                                                            {file.recordCount && (
                                                                <span className="text-xs opacity-75">
                                                                    ({file.recordCount} records)
                                                                </span>
                                                            )}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}

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
                        ))}

                        {/* Pending Message + AI Streaming Response - Show at the bottom */}
                        {pendingMessage && (
                            <div className="space-y-3 mb-6">
                                {/* User Message */}
                                <div className="flex justify-end animate-slideInRight">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-md shadow-sm">
                                        <p className="text-sm leading-relaxed">{pendingMessage}</p>
                                    </div>
                                </div>

                                {/* AI Response */}
                                <div className="flex justify-start items-start gap-3 animate-slideInLeft">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3 max-w-2xl shadow-sm">
                                        {!streamingResponse ? (
                                            // Loading dots
                                            <div className="flex items-center gap-2 py-2">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                                <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
                                            </div>
                                        ) : (
                                            // Streaming text
                                            <>
                                                <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                    {streamingResponse}
                                                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-blue-600 animate-pulse"></span>
                                                </div>

                                                {/* Streaming Chart */}
                                                {streamingChart && (
                                                    <div className="mt-4 animate-fadeIn">
                                                        <ChartRenderer chart={streamingChart} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
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
