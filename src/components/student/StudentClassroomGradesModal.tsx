import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assignmentApi, Assignment } from '@/apis/assignment';
import { Classroom } from '@/interface/classroom.interface';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Stack,
    Box,
    Skeleton,
    Avatar,
} from '@mui/material';
import { X, BookOpen, Calendar, User, ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface StudentClassroomGradesModalProps {
    isOpen: boolean;
    onClose: () => void;
    classroom: Classroom;
    studentId: string;
}

interface AssignmentWithSubmission extends Assignment {
    studentSubmission?: {
        id: string;
        score: number | null;
        status: string;
        submittedAt: string;
        isLate: boolean;
    } | null;
}

const StudentClassroomGradesModal: React.FC<StudentClassroomGradesModalProps> = ({
    isOpen,
    onClose,
    classroom,
    studentId,
}) => {
    // Fetch assignments for this classroom
    const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
        queryKey: ['classroom-assignments', classroom.id],
        queryFn: () => assignmentApi.getClassroomAssignments(classroom.id),
        enabled: isOpen && !!classroom.id,
    });

    // Fetch submissions for all assignments in parallel
    const { data: submissionsMap, isLoading: submissionsLoading } = useQuery({
        queryKey: ['student-submissions', classroom.id, studentId],
        queryFn: async () => {
            const assignments = assignmentsData?.data?.assignments || [];
            const submissionPromises = assignments.map(async (assignment: Assignment) => {
                try {
                    const res = await assignmentApi.getAssignmentSubmissions(assignment.id);
                    const submissions = res?.data || [];
                    // Find this student's submission
                    const studentSubmission = submissions.find(
                        (s: any) => s.studentId === studentId
                    );
                    return { assignmentId: assignment.id, submission: studentSubmission || null };
                } catch {
                    return { assignmentId: assignment.id, submission: null };
                }
            });
            const results = await Promise.all(submissionPromises);
            const map: Record<string, any> = {};
            results.forEach((r) => {
                map[r.assignmentId] = r.submission;
            });
            return map;
        },
        enabled: isOpen && !!assignmentsData?.data?.assignments?.length,
    });

    const assignments: Assignment[] = assignmentsData?.data?.assignments || [];
    const isLoading = assignmentsLoading || submissionsLoading;

    const getStatusChip = (submission: any) => {
        if (!submission) {
            return <Chip label="Chưa nộp" size="small" color="default" />;
        }
        if (submission.score !== null && submission.score !== undefined) {
            return <Chip label="Đã chấm" size="small" color="success" icon={<CheckCircle className="w-3 h-3" />} />;
        }
        if (submission.isLate) {
            return <Chip label="Nộp muộn" size="small" color="warning" icon={<AlertCircle className="w-3 h-3" />} />;
        }
        return <Chip label="Đã nộp" size="small" color="info" icon={<Clock className="w-3 h-3" />} />;
    };

    const getScoreDisplay = (submission: any, totalPoints?: number) => {
        if (!submission || submission.score === null || submission.score === undefined) {
            return <Typography color="text.secondary">-</Typography>;
        }
        const score = submission.score;
        const max = totalPoints || 100;
        const percentage = Math.round((score / max) * 100);
        let color: 'success' | 'warning' | 'error' = 'success';
        if (percentage < 50) color = 'error';
        else if (percentage < 70) color = 'warning';

        return (
            <Typography fontWeight={600} color={`${color}.main`}>
                {score}/{max} ({percentage}%)
            </Typography>
        );
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <BookOpen className="w-5 h-5" />
                        </Avatar>
                        <Box>
                            <Typography variant="h6">{classroom.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Mã lớp: {classroom.classCode}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <X className="w-5 h-5" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {/* Classroom Info Summary */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Stack direction="row" spacing={4} flexWrap="wrap">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            <Typography variant="body2">
                                <strong>Khóa học:</strong> {classroom.course?.title || 'N/A'}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <User className="w-4 h-4 text-green-500" />
                            <Typography variant="body2">
                                <strong>Giáo viên:</strong> {classroom.teacher?.displayName || classroom.teacher?.firstName || 'N/A'}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <Typography variant="body2">
                                <strong>Thời gian:</strong>{' '}
                                {classroom.periodStart ? new Date(classroom.periodStart).toLocaleDateString() : '?'} -{' '}
                                {classroom.periodEnd ? new Date(classroom.periodEnd).toLocaleDateString() : '?'}
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>

                {/* Assignments Table */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    Danh sách bài tập & Điểm số
                </Typography>

                {isLoading ? (
                    <Stack spacing={1}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                        ))}
                    </Stack>
                ) : assignments.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <Typography color="text.secondary">Chưa có bài tập nào trong lớp này.</Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell><strong>Bài tập</strong></TableCell>
                                    <TableCell><strong>Hạn nộp</strong></TableCell>
                                    <TableCell><strong>Điểm</strong></TableCell>
                                    <TableCell><strong>Trạng thái</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assignments.map((assignment) => {
                                    const submission = submissionsMap?.[assignment.id];
                                    return (
                                        <TableRow key={assignment.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {assignment.title}
                                                </Typography>
                                                {assignment.type && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {assignment.type}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {assignment.dueDate
                                                        ? new Date(assignment.dueDate).toLocaleDateString('vi-VN')
                                                        : 'Không có hạn'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {getScoreDisplay(submission, assignment.totalPoints)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusChip(submission)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default StudentClassroomGradesModal;
