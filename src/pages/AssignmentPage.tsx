import {
    Add as AddIcon,
    Assignment as AssignmentIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FileCopy as FileCopyIcon,
    FileDownload as FileDownloadIcon,
    Publish as PublishIcon,
    UnpublishedOutlined as UnpublishedIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { assignmentApi, downloadAssignmentPdf, type Assignment, type CloneAssignmentPayload } from '../apis/assignment';
import { getClassrooms } from '../apis/classroom';
import CreateAssignmentModal from '../components/classroom/CreateAssignmentModal';
import { DataTable, PageHeader, PaginationBar, type ActionButton, type TableColumn } from '../components/ui';
import type { Classroom } from '../interface/classroom.interface';
import type { AssignmentFormValues } from '../schemas/assignment.schema';

export default function AssignmentPage() {
    const navigate = useNavigate();

    // State
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [reuseAssignment, setReuseAssignment] = useState<Assignment | null>(null);
    const [isReuseDialogOpen, setIsReuseDialogOpen] = useState(false);
    const [isCloning, setIsCloning] = useState(false);
    const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormValues, setEditFormValues] = useState<AssignmentFormValues | null>(null);

    // Load assignments
    const loadAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await assignmentApi.getMyAssignments({
                page: page + 1,
                limit: rowsPerPage,
            });

            if (response.data) {
                setAssignments(response.data.assignments || []);
                setTotal(response.data.total || 0);
            }
        } catch (err: any) {
            console.error('Error loading assignments:', err);
            setError(err?.response?.data?.message || 'Tải danh sách bài tập thất bại');
            toast.error('Tải danh sách bài tập thất bại');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage]);

    // Load data on mount and when params change
    useEffect(() => {
        loadAssignments();
    }, [loadAssignments]);

    // Handle page change
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenReuseDialog = (assignment: Assignment) => {
        setReuseAssignment(assignment);
        setIsReuseDialogOpen(true);
    };

    const handleCloseReuseDialog = () => {
        setIsReuseDialogOpen(false);
        setReuseAssignment(null);
    };

    const handleCloneAssignment = async (payload: CloneAssignmentPayload) => {
        if (!reuseAssignment) return;
        try {
            setIsCloning(true);
            await assignmentApi.cloneAssignment(reuseAssignment.id, payload);
            toast.success('Sao chép bài tập thành công');
            handleCloseReuseDialog();
            loadAssignments();
        } catch (err: any) {
            console.error('Clone assignment error:', err);
            toast.error(err?.response?.data?.message || 'Sao chép bài tập thất bại');
        } finally {
            setIsCloning(false);
        }
    };

    const { data: classroomsResponse, isLoading: classroomsLoading } = useQuery({
        queryKey: ['classrooms', 'assignment-reuse'],
        queryFn: () => getClassrooms({ page: 1, limit: 100 }),
        enabled: isReuseDialogOpen,
        staleTime: 1000 * 60 * 10,
    });

    const classrooms: Classroom[] = useMemo(
        () => classroomsResponse?.data?.data || [],
        [classroomsResponse],
    );

    // Handle delete assignment
    const handleDeleteAssignment = async () => {
        if (!selectedAssignment) return;

        try {
            await assignmentApi.deleteAssignment(selectedAssignment.id);
            toast.success('Xóa bài tập thành công');
            setShowDeleteDialog(false);
            setSelectedAssignment(null);
            loadAssignments();
        } catch (err: any) {
            console.error('Error deleting assignment:', err);
            toast.error(err?.response?.data?.message || 'Xóa bài tập thất bại');
        }
    };

    // Handle toggle publish status
    const handleTogglePublish = async (assignment: Assignment) => {
        try {
            if (assignment.isPublished) {
                toast('Không thể hủy xuất bản bài tập qua giao diện này');
                return;
            } else {
                await assignmentApi.publishAssignment(assignment.id);
                toast.success('Xuất bản bài tập thành công');
                loadAssignments();
            }
        } catch (err: any) {
            console.error('Error toggling publish status:', err);
            toast.error(err?.response?.data?.message || 'Cập nhật bài tập thất bại');
        }
    };

    // Handle download PDF
    const handleDownloadPdf = async (assignment: Assignment) => {
        try {
            setDownloading(assignment.id);
            await downloadAssignmentPdf(assignment.id, assignment.title);
            toast.success('Tải PDF thành công');
        } catch (err: any) {
            console.error('Error downloading PDF:', err);
            toast.error(err.message || 'Tải PDF thất bại');
        } finally {
            setDownloading(null);
        }
    };

    // Get status chip
    const getStatusChip = (assignment: Assignment) => {
        if (assignment.isPublished) {
            return <Chip label="Đã xuất bản" color="success" size="small" />;
        } else {
            return <Chip label="Bản nháp" color="default" size="small" />;
        }
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Không có hạn nộp';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Filter assignments client-side
    const filteredAssignments = useMemo(
        () =>
            assignments.filter((assignment) =>
                assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [assignments, searchTerm]
    );

    // Calculate pagination for filtered results
    const totalPages = Math.ceil(total / rowsPerPage);
    const paginatedAssignments = useMemo(() => {
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredAssignments.slice(startIndex, endIndex);
    }, [filteredAssignments, page, rowsPerPage]);

    const columns: TableColumn<Assignment>[] = [
        {
            id: 'title',
            label: 'Tiêu đề',
            render: (assignment) => (
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {assignment.title}
                    </Typography>
                    {assignment.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {assignment.description.substring(0, 100)}
                            {assignment.description.length > 100 && '...'}
                        </Typography>
                    )}
                </Stack>
            ),
        },
        {
            id: 'classroom',
            label: 'Lớp học',
            render: (assignment) => (
                <Stack spacing={0.5}>
                    <Typography variant="body2">
                        {assignment.classroom?.name || 'Không xác định'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {assignment.classroom?.classCode || 'N/A'}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'status',
            label: 'Trạng thái',
            render: (assignment) => getStatusChip(assignment),
        },
        {
            id: 'dueDate',
            label: 'Hạn nộp',
            render: (assignment) => (
                <Typography variant="body2">
                    {formatDate(assignment.dueDate)}
                </Typography>
            ),
        },
        {
            id: 'points',
            label: 'Điểm',
            render: (assignment) => (
                <Typography variant="body2">
                    {assignment.totalPoints || 'N/A'} pts
                </Typography>
            ),
        },
        {
            id: 'activities',
            label: 'Hoạt động',
            render: (assignment) => (
                <Typography variant="body2">
                    {assignment.assignmentActivities?.length || 0} hoạt động
                </Typography>
            ),
        },
        {
            id: 'createdAt',
            label: 'Ngày tạo',
            render: (assignment) => (
                <Typography variant="body2">
                    {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
                </Typography>
            ),
        },
    ];

    const actions: ActionButton<Assignment>[] = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: 'Xem chi tiết',
            color: 'primary',
            onClick: (assignment) => {
                setSelectedAssignment(assignment);
                setShowViewDialog(true);
            },
        },
        {
            icon: <FileDownloadIcon fontSize="small" />,
            label: 'Tải PDF',
            color: 'primary',
            onClick: handleDownloadPdf,
        },
        {
            icon: <FileCopyIcon fontSize="small" />,
            label: 'Sử dụng lại',
            color: 'info',
            onClick: handleOpenReuseDialog,
        },
        {
            icon: <EditIcon fontSize="small" />,
            label: 'Chỉnh sửa',
            color: 'warning',
            onClick: async (assignment) => {
                try {
                    const response = await assignmentApi.getAssignmentById(assignment.id);
                    if (response.data) {
                        const assignmentData = response.data;
                        const formValues: AssignmentFormValues = {
                            title: assignmentData.title,
                            description: assignmentData.description || '',
                            instructions: assignmentData.instructions || '',
                            dueDate: assignmentData.dueDate || '',
                            totalPoints: assignmentData.totalPoints || 100,
                            timeLimit: assignmentData.timeLimit || undefined,
                            maxAttempts: assignmentData.maxAttempts || 1,
                            isPublished: assignmentData.isPublished || false,
                            activities: (assignmentData.assignmentActivities || []).map((activity: any) => ({
                                id: activity.id,
                                type: activity.type,
                                title: activity.title,
                                instructions: activity.instructions,
                                content: activity.content || {},
                                points: activity.points || 10,
                                passingScore: activity.passingScore,
                                difficulty: activity.difficulty as any,
                                hints: activity.hints || [],
                            })),
                        };
                        setEditFormValues(formValues);
                        setEditAssignment(assignmentData);
                        setIsEditModalOpen(true);
                    }
                } catch (err: any) {
                    console.error('Error loading assignment:', err);
                    toast.error(err?.response?.data?.message || 'Tải bài tập thất bại');
                }
            },
        },
        {
            icon: <PublishIcon fontSize="small" />,
            label: 'Xuất bản',
            color: 'success',
            onClick: handleTogglePublish,
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            label: 'Xóa',
            color: 'error',
            onClick: (assignment) => {
                setSelectedAssignment(assignment);
                setShowDeleteDialog(true);
            },
        },
    ];

    if (loading && assignments.length === 0) {
        return (
            <Container maxWidth="xl">
                <Stack spacing={3} sx={{ py: 3 }}>
                    <PageHeader title="Quản lý bài tập" />
                    <Typography>Đang tải bài tập...</Typography>
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Quản lý bài tập"
                    actionButton={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/classrooms')}
                        >
                            Tạo bài tập
                        </Button>
                    }
                />

                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="Tìm kiếm bài tập..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ maxWidth: 400 }}
                />

                <DataTable
                    columns={columns}
                    data={paginatedAssignments}
                    isLoading={loading}
                    actions={actions}
                    getRowId={(assignment) => assignment.id}
                    emptyState={{
                        icon: <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'Không tìm thấy bài tập nào',
                        description: 'Tạo một bài tập mới để bắt đầu.',
                        actionButton: (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/classrooms')}
                            >
                                Tạo bài tập đầu tiên
                            </Button>
                        ),
                    }}
                />

                {total > 0 && (
                    <PaginationBar
                        page={page + 1}
                        totalPages={totalPages}
                        totalItems={total}
                        limit={rowsPerPage}
                        onPageChange={(newPage) => setPage(newPage - 1)}
                    />
                )}
            </Stack>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Xóa bài tập</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa bài tập "{selectedAssignment?.title}"?
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
                    <Button onClick={handleDeleteAssignment} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Assignment Dialog */}
            <Dialog
                open={showViewDialog}
                onClose={() => setShowViewDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Chi tiết bài tập
                    <Box display="flex" gap={1} mt={1}>
                        {selectedAssignment && getStatusChip(selectedAssignment)}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedAssignment && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    {selectedAssignment.title}
                                </Typography>
                            </Grid>

                            {selectedAssignment.description && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Mô tả:
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedAssignment.description}
                                    </Typography>
                                </Grid>
                            )}

                            {selectedAssignment.instructions && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Hướng dẫn:
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedAssignment.instructions}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Lớp học:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.classroom?.name} ({selectedAssignment.classroom?.classCode})
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Hạn nộp:
                                </Typography>
                                <Typography variant="body2">
                                    {formatDate(selectedAssignment.dueDate)}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Tổng điểm:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.totalPoints || 'N/A'} points
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Thời gian làm bài:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.timeLimit ? `${selectedAssignment.timeLimit} phút` : 'Không giới hạn'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Hoạt động:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.assignmentActivities?.length || 0} hoạt động
                                </Typography>
                                {selectedAssignment.assignmentActivities?.map((activity, index) => (
                                    <Card key={activity.id} variant="outlined" sx={{ mt: 1, p: 2 }}>
                                        <Typography variant="subtitle2">
                                            {index + 1}. {activity.title} ({activity.type})
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Điểm: {activity.points} | Độ khó: {activity.difficulty || 'N/A'}
                                        </Typography>
                                    </Card>
                                ))}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => selectedAssignment && handleDownloadPdf(selectedAssignment)}
                        startIcon={<FileDownloadIcon />}
                        disabled={downloading === selectedAssignment?.id}
                    >
                        Tải PDF
                    </Button>
                    <Button onClick={() => setShowViewDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>

            <ReuseAssignmentDialog
                open={isReuseDialogOpen}
                assignment={reuseAssignment}
                classrooms={classrooms}
                classroomsLoading={classroomsLoading}
                submitting={isCloning}
                onClose={handleCloseReuseDialog}
                onSubmit={handleCloneAssignment}
            />

            {/* Edit Assignment Modal */}
            {editAssignment && editFormValues && (
                <CreateAssignmentModal
                    open={isEditModalOpen}
                    classroomId={editAssignment.classroomId}
                    mode="edit"
                    assignmentId={editAssignment.id}
                    initialValues={editFormValues}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditAssignment(null);
                        setEditFormValues(null);
                    }}
                    onSubmitted={() => {
                        loadAssignments();
                        setIsEditModalOpen(false);
                        setEditAssignment(null);
                        setEditFormValues(null);
                    }}
                />
            )}
        </Container>
    );
}

type ReuseAssignmentDialogProps = {
    open: boolean;
    assignment: Assignment | null;
    classrooms: Classroom[];
    classroomsLoading: boolean;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (payload: CloneAssignmentPayload) => void;
};

const toDateTimeLocal = (iso?: string | null) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
};

function ReuseAssignmentDialog({
    open,
    assignment,
    classrooms,
    classroomsLoading,
    submitting,
    onClose,
    onSubmit,
}: ReuseAssignmentDialogProps) {
    const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
    const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(new Set());
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    useEffect(() => {
        if (open && assignment) {
            setTitle(assignment.title || '');
            setDueDate(assignment.dueDate ? toDateTimeLocal(assignment.dueDate) : '');
            setIsPublished(false);

            const activities = assignment.assignmentActivities || [];
            setSelectedActivityIds(new Set(activities.map((activity) => activity.id)));

            const fallbackClassroomId = classrooms[0]?.id || '';
            setSelectedClassroomId((prev) => (prev ? prev : fallbackClassroomId));
        } else if (!open) {
            setSelectedActivityIds(new Set());
            setSelectedClassroomId('');
            setTitle('');
            setDueDate('');
            setIsPublished(false);
        }
    }, [open, assignment, classrooms]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignment || !selectedClassroomId) return;

        onSubmit({
            classroomId: selectedClassroomId,
            title,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            isPublished,
            activityIds: Array.from(selectedActivityIds),
        });
    };

    if (!assignment) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Sử dụng lại bài tập cho lớp khác</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Bài tập gốc: {assignment.title}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tiêu đề mới"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Lớp học mục tiêu"
                                value={selectedClassroomId}
                                onChange={(e) => setSelectedClassroomId(e.target.value)}
                                SelectProps={{
                                    native: true,
                                }}
                                required
                                disabled={classroomsLoading}
                            >
                                <option value="">Chọn một lớp học</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name} ({classroom.classCode})
                                    </option>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Hạn nộp"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Chọn các hoạt động bao gồm:
                            </Typography>
                            {assignment.assignmentActivities?.map((activity) => (
                                <Box key={activity.id} sx={{ mb: 1 }}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedActivityIds.has(activity.id)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedActivityIds);
                                                if (e.target.checked) {
                                                    newSet.add(activity.id);
                                                } else {
                                                    newSet.delete(activity.id);
                                                }
                                                setSelectedActivityIds(newSet);
                                            }}
                                        />
                                        <span style={{ marginLeft: 8 }}>
                                            {activity.title} ({activity.type}) - {activity.points} pts
                                        </span>
                                    </label>
                                </Box>
                            ))}
                        </Grid>

                        <Grid item xs={12}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                />
                                <span style={{ marginLeft: 8 }}>Xuất bản ngay</span>
                            </label>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={submitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="contained" disabled={submitting || !selectedClassroomId}>
                        {submitting ? 'Đang sao chép...' : 'Sao chép bài tập'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
