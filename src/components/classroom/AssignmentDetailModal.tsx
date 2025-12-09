import { Assignment, AssignmentType } from '@/apis/assignment';
import { AlertCircle, BookOpen, ChevronDown, ChevronUp, Edit, FileText, Target, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityContentRenderer from './ActivityContentRenderer';

interface AssignmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: Assignment | null;
}

const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
    isOpen,
    onClose,
    assignment
}) => {
    const navigate = useNavigate();
    const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

    if (!isOpen || !assignment) return null;

    const toggleActivity = (activityId: string) => {
        setExpandedActivities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(activityId)) {
                newSet.delete(activityId);
            } else {
                newSet.add(activityId);
            }
            return newSet;
        });
    };

    const getAssignmentTypeInfo = (type?: AssignmentType) => {
        switch (type) {
            case AssignmentType.HOMEWORK:
                return {
                    label: 'Bài tập về nhà',
                    color: 'bg-blue-100 text-blue-800',
                    icon: BookOpen
                };
            case AssignmentType.QUIZ:
                return {
                    label: 'Bài kiểm tra ngắn',
                    color: 'bg-green-100 text-green-800',
                    icon: Target
                };
            case AssignmentType.MIDTERM_EXAM:
                return {
                    label: 'Bài thi giữa kỳ',
                    color: 'bg-orange-100 text-orange-800',
                    icon: AlertCircle
                };
            case AssignmentType.FINAL_EXAM:
                return {
                    label: 'Bài thi cuối kỳ',
                    color: 'bg-red-100 text-red-800',
                    icon: AlertCircle
                };
            default:
                return {
                    label: 'Bài tập',
                    color: 'bg-gray-100 text-gray-800',
                    icon: FileText
                };
        }
    };

    const typeInfo = getAssignmentTypeInfo(assignment.type);
    const TypeIcon = typeInfo.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with light opacity */}
            <div
                className="absolute inset-0 bg-black/20"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-5xl max-h-[90vh] m-4 bg-white rounded-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-gray-800 text-white px-6 py-4 flex items-center justify-between gap-3 z-20">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold break-words">{assignment.title}</h2>
                        <div className="flex items-center flex-wrap gap-2 mt-2">
                            <span className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
                                <TypeIcon className="w-3 h-3" />
                                <span>{typeInfo.label}</span>
                            </span>
                            {assignment.weight && (
                                <span className="bg-gray-700 px-2.5 py-1 rounded text-xs font-medium text-gray-200">
                                    Trọng số: {(assignment.weight * 100).toFixed(0)}%
                                </span>
                            )}
                            <span className={`px-2.5 py-1 rounded text-xs font-medium ${assignment.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {assignment.isPublished ? 'Đã xuất bản' : 'Nháp'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                onClose();
                                navigate(`/classrooms/${assignment.classroomId}/edit-assignment/${assignment.id}`);
                            }}
                            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Chỉnh sửa</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-2 hover:bg-gray-700 rounded transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Description */}
                            {assignment.description && (
                                <div className="bg-white rounded p-4 border border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                        Mô tả
                                    </h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                                </div>
                            )}

                            {/* Instructions */}
                            {assignment.instructions && (
                                <div className="bg-white rounded p-4 border border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                                        <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                                        Hướng dẫn
                                    </h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
                                </div>
                            )}

                            {/* Activities */}
                            {assignment.assignmentActivities && assignment.assignmentActivities.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                        <Target className="w-5 h-5 mr-2 text-gray-700" />
                                        Hoạt động ({assignment.assignmentActivities.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {assignment.assignmentActivities.map((activity, index) => {
                                            const isExpanded = expandedActivities.has(activity.id);
                                            return (
                                                <div key={activity.id} className="bg-white rounded border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                                                    {/* Activity Header - Clickable */}
                                                    <button
                                                        onClick={() => toggleActivity(activity.id)}
                                                        className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                                                #{index + 1}
                                                            </span>
                                                            <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                                                            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded border border-gray-200">
                                                                {activity.type}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-600">
                                                                {activity.points} điểm
                                                            </span>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {/* Activity Details - Collapsible */}
                                                    {isExpanded && (
                                                        <div className="p-4 bg-white space-y-3 border-t border-gray-200">
                                                            {activity.instructions && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-700 mb-1">Hướng dẫn:</p>
                                                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{activity.instructions}</p>
                                                                </div>
                                                            )}

                                                            {/* Activity Metadata */}
                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                                                {activity.difficulty && (
                                                                    <span>• Độ khó: {activity.difficulty}</span>
                                                                )}
                                                            </div>

                                                            {/* Activity Content - Rendered by Type */}
                                                            <div className="pt-2">
                                                                <p className="text-xs font-semibold text-gray-700 mb-2">Nội dung:</p>
                                                                <ActivityContentRenderer
                                                                    type={activity.type}
                                                                    content={activity.content}
                                                                />
                                                            </div>

                                                            {/* Hints */}
                                                            {activity.hints && activity.hints.length > 0 && (
                                                                <div className="pt-2 border-t border-gray-100">
                                                                    <p className="text-xs font-semibold text-gray-700 mb-2">Gợi ý:</p>
                                                                    <ul className="space-y-1">
                                                                        {activity.hints.map((hint, hintIndex) => (
                                                                            <li key={hintIndex} className="flex items-start text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                                                <span className="font-medium mr-1">{hintIndex + 1}.</span>
                                                                                <span>{hint}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-3">
                            {/* Assignment Info */}
                            <div className="bg-white rounded p-3 border border-gray-300">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin bài tập</h3>
                                <div className="space-y-2 text-xs">
                                    {assignment.startTime && (
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                            <span className="text-gray-600">Bắt đầu:</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(assignment.startTime).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                    )}
                                    {assignment.dueDate && (
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                            <span className="text-gray-600">Hạn nộp:</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(assignment.dueDate).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                        <span className="text-gray-600">Tổng điểm:</span>
                                        <span className="font-semibold text-gray-900">{assignment.totalPoints}</span>
                                    </div>
                                    {assignment.timeLimit && (
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                            <span className="text-gray-600">Thời gian:</span>
                                            <span className="font-medium text-gray-900">{assignment.timeLimit} phút</span>
                                        </div>
                                    )}
                                    {assignment.maxAttempts && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Số lần làm:</span>
                                            <span className="font-medium text-gray-900">{assignment.maxAttempts}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Teacher Info */}
                            {assignment.teacher && (
                                <div className="bg-white rounded p-3 border border-gray-300">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Giáo viên</h3>
                                    <div className="space-y-1 text-xs">
                                        <p className="font-medium text-gray-900">
                                            {assignment.teacher.displayName ||
                                                `${assignment.teacher.firstName} ${assignment.teacher.lastName}`}
                                        </p>
                                        {assignment.teacher.email && (
                                            <p className="text-gray-600">{assignment.teacher.email}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Classroom Info */}
                            {assignment.classroom && (
                                <div className="bg-white rounded p-3 border border-gray-300">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Lớp học</h3>
                                    <div className="space-y-1 text-xs">
                                        <p className="font-medium text-gray-900">{assignment.classroom.name}</p>
                                        <p className="text-gray-600">Mã: {assignment.classroom.classCode}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetailModal;
