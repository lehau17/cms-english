import { CheckCircle, FileText, Headphones, Layers, MessageSquare, Mic, Pencil, Volume2 } from 'lucide-react';
import React from 'react';

interface ActivityContentRendererProps {
    type: string;
    content: Record<string, any>;
}

const ActivityContentRenderer: React.FC<ActivityContentRendererProps> = ({ type, content }) => {
    const renderQuizContent = () => (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Câu hỏi:</p>
                <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded">{content.question}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Các lựa chọn:</p>
                <div className="space-y-2">
                    {content.options?.map((option: string, idx: number) => (
                        <div
                            key={idx}
                            className={`flex items-center p-2 rounded ${idx === content.correctIndex
                                ? 'bg-green-50 border border-green-300'
                                : 'bg-gray-50'
                                }`}
                        >
                            <span className="font-semibold mr-2 text-sm">
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className="text-sm text-gray-700">{option}</span>
                            {idx === content.correctIndex && (
                                <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {content.explanation && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Giải thích:</p>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">{content.explanation}</p>
                </div>
            )}
        </div>
    );

    const renderVocabContent = () => (
        <div className="space-y-3">
            {content.items?.map((item: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h4 className="text-base font-bold text-gray-900">{item.word}</h4>
                            <p className="text-sm text-gray-700 mt-1">{item.definition}</p>
                        </div>
                        {item.audioUrl && (
                            <Volume2 className="w-5 h-5 text-purple-600" />
                        )}
                    </div>
                    {item.examples && item.examples.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs font-medium text-gray-600 mb-1">Ví dụ:</p>
                            {item.examples.map((example: string, exIdx: number) => (
                                <p key={exIdx} className="text-xs text-gray-600 italic ml-3">• {example}</p>
                            ))}
                        </div>
                    )}
                    {item.imageUrl && (
                        <div className="mt-2">
                            <img src={item.imageUrl} alt={item.word} className="w-full h-32 object-cover rounded" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderListeningContent = () => (
        <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center">
                <Headphones className="w-5 h-5 text-blue-600 mr-2" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Audio:</p>
                    <a href={content.audioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {content.audioUrl}
                    </a>
                </div>
            </div>
            {content.instructions && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{content.instructions}</p>
            )}
            {content.questions && content.questions.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Câu hỏi:</p>
                    <div className="space-y-3">
                        {content.questions.map((q: any, idx: number) => (
                            <div key={idx} className="border border-gray-200 rounded p-3">
                                <p className="text-sm font-medium text-gray-900 mb-2">{idx + 1}. {q.question}</p>
                                <div className="space-y-1 ml-4">
                                    {q.options?.map((opt: string, optIdx: number) => (
                                        <div
                                            key={optIdx}
                                            className={`text-sm p-2 rounded ${optIdx === q.correctIndex
                                                ? 'bg-green-50 text-green-800 font-medium'
                                                : 'text-gray-600'
                                                }`}
                                        >
                                            {String.fromCharCode(65 + optIdx)}. {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderPronunciationContent = () => (
        <div className="space-y-3">
            <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Cụm từ cần phát âm:</p>
                <p className="text-lg font-bold text-purple-900">{content.phrase}</p>
            </div>
            {content.tips && content.tips.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Mẹo phát âm:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {content.tips.map((tip: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600">{tip}</li>
                        ))}
                    </ul>
                </div>
            )}
            {content.sampleUrl && (
                <div className="bg-blue-50 p-3 rounded flex items-center">
                    <Mic className="w-5 h-5 text-blue-600 mr-2" />
                    <a href={content.sampleUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Audio mẫu
                    </a>
                </div>
            )}
        </div>
    );

    const renderSpeakingContent = () => (
        <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Chủ đề:</p>
                <p className="text-sm text-gray-900">{content.prompt}</p>
            </div>
            <div className="flex items-center text-sm text-gray-600">
                <MessageSquare className="w-4 h-4 mr-2" />
                Thời gian tối thiểu: {content.minSeconds} giây
            </div>
            {content.tips && content.tips.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Gợi ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {content.tips.map((tip: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600">{tip}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    const renderReadingContent = () => (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Đoạn văn:</p>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800 leading-relaxed">
                    {content.passage}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Câu hỏi:</p>
                <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded">{content.question}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Các lựa chọn:</p>
                <div className="space-y-2">
                    {content.options?.map((option: string, idx: number) => (
                        <div
                            key={idx}
                            className={`flex items-center p-2 rounded ${idx === content.correctIndex
                                ? 'bg-green-50 border border-green-300'
                                : 'bg-gray-50'
                                }`}
                        >
                            <span className="font-semibold mr-2 text-sm">
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className="text-sm text-gray-700">{option}</span>
                            {idx === content.correctIndex && (
                                <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderWritingContent = () => (
        <div className="space-y-3">
            <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Đề bài:</p>
                <p className="text-sm text-gray-900">{content.prompt}</p>
            </div>
            <div className="flex items-center text-sm text-gray-600">
                <Pencil className="w-4 h-4 mr-2" />
                Số từ tối thiểu: {content.minWords} từ
            </div>
            {content.rubric && content.rubric.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Tiêu chí chấm điểm:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {content.rubric.map((criterion: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600">{criterion}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    const renderGrammarContent = () => (
        <div className="space-y-3">
            <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Quy tắc ngữ pháp:</p>
                <p className="text-sm text-gray-900">{content.rule}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Câu hỏi:</p>
                <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded">{content.question}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Các lựa chọn:</p>
                <div className="space-y-2">
                    {content.options?.map((option: string, idx: number) => (
                        <div
                            key={idx}
                            className={`flex items-center p-2 rounded ${idx === content.correctIndex
                                ? 'bg-green-50 border border-green-300'
                                : 'bg-gray-50'
                                }`}
                        >
                            <span className="font-semibold mr-2 text-sm">
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className="text-sm text-gray-700">{option}</span>
                            {idx === content.correctIndex && (
                                <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFlashcardContent = () => (
        <div className="space-y-3">
            {content.cards?.map((card: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 p-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Mặt trước:</p>
                        <p className="text-sm font-bold text-gray-900">{card.front}</p>
                    </div>
                    <div className="bg-green-50 p-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Mặt sau:</p>
                        <p className="text-sm text-gray-900">{card.back}</p>
                    </div>
                    {card.imageUrl && (
                        <img src={card.imageUrl} alt="Flashcard" className="w-full h-32 object-cover" />
                    )}
                </div>
            ))}
        </div>
    );

    const renderFillBlankContent = () => (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Đoạn văn:</p>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800 leading-relaxed">
                    {content.passage}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Đáp án điền vào chỗ trống:</p>
                <div className="space-y-1">
                    {content.blanks?.map((blank: string, idx: number) => (
                        <div key={idx} className="flex items-center bg-green-50 p-2 rounded">
                            <span className="font-semibold text-sm text-gray-700 mr-2">Chỗ trống {idx + 1}:</span>
                            <span className="text-sm text-green-800 font-medium">{blank}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderDictationContent = () => (
        <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center">
                <Headphones className="w-5 h-5 text-blue-600 mr-2" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Audio:</p>
                    <a href={content.audioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {content.audioUrl}
                    </a>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Nội dung đúng:</p>
                <div className="bg-green-50 p-3 rounded-lg text-sm text-gray-800">
                    {content.transcript}
                </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                Số từ tối thiểu: {content.minWords} từ
            </div>
        </div>
    );

    const renderMatchingContent = () => (
        <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Cặp ghép nối:</p>
            {content.pairs?.map((pair: any, idx: number) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-3 rounded text-sm text-gray-900">{pair.left}</div>
                    <div className="bg-green-50 p-3 rounded text-sm text-gray-900">{pair.right}</div>
                </div>
            ))}
        </div>
    );

    const renderConversationContent = () => (
        <div className="space-y-3">
            <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Tình huống:</p>
                <p className="text-sm text-gray-900">{content.scenario}</p>
            </div>
            {content.initialDialog && content.initialDialog.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Đoạn hội thoại mẫu:</p>
                    <div className="space-y-2">
                        {content.initialDialog.map((msg: any, idx: number) => (
                            <div
                                key={idx}
                                className={`p-2 rounded text-sm ${msg.role === 'user'
                                    ? 'bg-blue-50 text-blue-900 ml-8'
                                    : 'bg-gray-100 text-gray-900 mr-8'
                                    }`}
                            >
                                <span className="font-medium">{msg.role === 'user' ? 'Bạn' : 'AI'}:</span> {msg.text}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {content.suggestions && content.suggestions.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Gợi ý câu trả lời:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {content.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600">{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    const renderMiniGameContent = () => (
        <div className="space-y-3">
            <div className="bg-pink-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Từ mục tiêu:</p>
                <p className="text-lg font-bold text-pink-900">{content.target}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Bộ từ:</p>
                <div className="flex flex-wrap gap-2">
                    {content.pool?.map((word: string, idx: number) => (
                        <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                            {word}
                        </span>
                    ))}
                </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
                <Layers className="w-4 h-4 mr-2" />
                Số vòng chơi: {content.rounds}
            </div>
        </div>
    );

    // Main render logic
    switch (type.toLowerCase()) {
        case 'quiz':
            return renderQuizContent();
        case 'vocab':
            return renderVocabContent();
        case 'listening':
            return renderListeningContent();
        case 'pronunciation':
            return renderPronunciationContent();
        case 'speaking':
            return renderSpeakingContent();
        case 'reading':
            return renderReadingContent();
        case 'writing':
            return renderWritingContent();
        case 'grammar':
            return renderGrammarContent();
        case 'flashcard':
            return renderFlashcardContent();
        case 'fill_blank':
            return renderFillBlankContent();
        case 'dictation':
            return renderDictationContent();
        case 'matching':
            return renderMatchingContent();
        case 'conversation':
            return renderConversationContent();
        case 'mini_game':
            return renderMiniGameContent();
        default:
            return (
                <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-2">Loại activity: {type}</p>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                        {JSON.stringify(content, null, 2)}
                    </pre>
                </div>
            );
    }
};

export default ActivityContentRenderer;
