import { useGetSubmissionDetails, useGradeSubmission } from '@/hooks/useAssignmentSubmission';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    AlertCircle,
    Award,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Loader2,
    Save,
    User,
    X
} from 'lucide-react';
import { Check, Close, Warning } from '@mui/icons-material';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface GradeSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    submissionId: string | null;
}

interface GradeFormData {
    grade: number;
    feedback: string;
}

const GradeSubmissionModal: React.FC<GradeSubmissionModalProps> = ({
    isOpen,
    onClose,
    submissionId,
}) => {
    const { data: submission, isLoading, error } = useGetSubmissionDetails(submissionId);
    const gradeSubmissionMutation = useGradeSubmission();

    const schema = yup.object({
        grade: yup
            .number()
            .required('Điểm là bắt buộc')
            .min(0, 'Điểm tối thiểu là 0')
            .max(submission?.assignment?.totalPoints || 100, `Điểm tối đa là ${submission?.assignment?.totalPoints || 100}`)
            .integer('Điểm phải là số nguyên'),
        feedback: yup.string(),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<GradeFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            grade: submission?.score || 0,
            feedback: submission?.feedback || '',
        },
    });

    // Update form when submission data loads
    useEffect(() => {
        if (submission) {
            reset({
                grade: submission.score || 0,
                feedback: submission.feedback || '',
            });
        }
    }, [submission, reset]);

    const onSubmit = async (data: GradeFormData) => {
        if (!submissionId) return;

        await gradeSubmissionMutation.mutateAsync({
            submissionId,
            payload: {
                grade: data.grade,
                feedback: data.feedback || undefined,
            },
        });
        onClose();
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStudentName = () => {
        if (!submission) return 'N/A';
        const student = submission.student;
        return (
            student.displayName ||
            `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
            student.email ||
            'N/A'
        );
    };

    const renderAnswers = () => {
        if (!submission?.answers) return null;

        // answers is JSON, try to render it nicely
        try {
            const answersData = submission.answers;

            // If it's an array of activities with answers
            if (Array.isArray(answersData)) {
                return (
                    <div className="space-y-4">
                        {answersData.map((activity: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Câu {index + 1}: {activity.title || activity.type}
                                </h4>
                                <div className="text-sm text-gray-700">
                                    {renderActivityAnswer(activity)}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            // Otherwise, just show as formatted JSON
            return (
                <pre className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 overflow-auto max-h-96">
                    {JSON.stringify(answersData, null, 2)}
                </pre>
            );
        } catch (error) {
            return (
                <p className="text-gray-600 text-sm">Không thể hiển thị câu trả lời</p>
            );
        }
    };

    const renderActivityAnswer = (activity: any) => {
        // Handle different activity types
        if (activity.type === 'multiple_choice' || activity.type === 'MULTIPLE_CHOICE') {
            return (
                <div>
                    <p className="mb-1">
                        <strong>Câu trả lời:</strong> {activity.selectedAnswer || activity.answer || 'Chưa trả lời'}
                    </p>
                    {activity.isCorrect !== undefined && (
                        <p className={`flex items-center gap-1 ${activity.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {activity.isCorrect ? <><Check fontSize="small" /> Đúng</> : <><Close fontSize="small" /> Sai</>}
                        </p>
                    )}
                </div>
            );
        }

        if (activity.type === 'essay' || activity.type === 'ESSAY') {
            return (
                <div>
                    <p className="whitespace-pre-wrap">{activity.answer || activity.text || 'Chưa trả lời'}</p>
                </div>
            );
        }

        // Default: show answer field
        return (
            <p className="whitespace-pre-wrap">
                {activity.answer || activity.text || JSON.stringify(activity, null, 2)}
            </p>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <Award className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Chấm điểm bài tập</h3>
                        <p className="text-sm text-gray-500">
                            {submission?.assignment?.title || 'Đang tải...'}
                        </p>
                    </div>
                </div>
            }
        >
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            )}

            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">Lỗi tải dữ liệu: {error.message}</p>
                    </div>
                </div>
            )}

            {submission && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Student Info */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Học sinh</p>
                                <p className="text-base font-semibold text-gray-900">
                                    {getStudentName()}
                                </p>
                                {submission.student.email && (
                                    <p className="text-xs text-gray-600">{submission.student.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submission Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Nộp lúc: {formatDateTime(submission.submittedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                                Thời gian làm: {submission.timeSpent ? `${Math.floor(submission.timeSpent / 60)} phút` : 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>Lần nộp thứ: {submission.attemptCount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            {submission.isLate ? (
                                <span className="text-red-600 font-medium flex items-center gap-1"><Warning fontSize="small" /> Nộp trễ</span>
                            ) : (
                                <span className="text-green-600 font-medium flex items-center gap-1"><Check fontSize="small" /> Đúng hạn</span>
                            )}
                        </div>
                    </div>

                    {/* Current Status */}
                    {submission.status === 'GRADED' && submission.score !== null && (
                        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                            <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">Đã chấm điểm</p>
                                    <p className="text-sm">
                                        Điểm: {submission.score}/{submission.assignment.totalPoints}
                                        {submission.gradedAt && ` - Chấm lúc: ${formatDateTime(submission.gradedAt)}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Answers */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            Bài làm của học sinh
                        </h4>
                        <div className="max-h-96 overflow-y-auto">
                            {renderAnswers()}
                        </div>
                    </div>

                    {/* Grading Form */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Chấm điểm</h4>
                        <div className="space-y-4">
                            <FormField
                                label={`Điểm (tối đa ${submission.assignment.totalPoints})`}
                                name="grade"
                                type="number"
                                register={register}
                                error={errors.grade}
                                placeholder="Nhập điểm"
                                min={0}
                                max={submission.assignment.totalPoints}
                            />
                            <FormField
                                label="Nhận xét"
                                name="feedback"
                                register={register}
                                error={errors.feedback}
                                isTextArea
                                rows={4}
                                placeholder="Nhập nhận xét cho học sinh..."
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={gradeSubmissionMutation.isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={gradeSubmissionMutation.isPending}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            {gradeSubmissionMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Lưu điểm
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default GradeSubmissionModal;

