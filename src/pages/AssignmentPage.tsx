import {
    Add as AddIcon,
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Checkbox
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assignmentApi, downloadAssignmentPdf, type Assignment, type CloneAssignmentPayload } from '../apis/assignment';
import { getClassrooms } from '../apis/classroom';
import type { Classroom } from '../interface/classroom.interface';
import CreateAssignmentModal from '../components/classroom/CreateAssignmentModal';
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
            setError(err?.response?.data?.message || 'Failed to load assignments');
            toast.error('Failed to load assignments');
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
            toast.success('Assignment cloned successfully');
            handleCloseReuseDialog();
            loadAssignments();
        } catch (err: any) {
            console.error('Clone assignment error:', err);
            toast.error(err?.response?.data?.message || 'Failed to clone assignment');
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
            toast.success('Assignment deleted successfully');
            setShowDeleteDialog(false);
            setSelectedAssignment(null);
            loadAssignments();
        } catch (err: any) {
            console.error('Error deleting assignment:', err);
            toast.error(err?.response?.data?.message || 'Failed to delete assignment');
        }
    };

    // Handle toggle publish status
    const handleTogglePublish = async (assignment: Assignment) => {
        try {
            if (assignment.isPublished) {
                // Cannot unpublish via API, would need separate endpoint
                toast('Cannot unpublish assignment via this interface');
                return;
            } else {
                await assignmentApi.publishAssignment(assignment.id);
                toast.success('Assignment published successfully');
                loadAssignments();
            }
        } catch (err: any) {
            console.error('Error toggling publish status:', err);
            toast.error(err?.response?.data?.message || 'Failed to update assignment');
        }
    };

    // Handle download PDF
    const handleDownloadPdf = async (assignment: Assignment) => {
        try {
            setDownloading(assignment.id);
            await downloadAssignmentPdf(assignment.id, assignment.title);
            toast.success('PDF downloaded successfully');
        } catch (err: any) {
            console.error('Error downloading PDF:', err);
            toast.error(err.message || 'Failed to download PDF');
        } finally {
            setDownloading(null);
        }
    };

    // Get status chip
    const getStatusChip = (assignment: Assignment) => {
        if (assignment.isPublished) {
            return <Chip label="Published" color="success" size="small" />;
        } else {
            return <Chip label="Draft" color="default" size="small" />;
        }
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No due date';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading && assignments.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Assignment Management
                </Typography>
                <Typography>Loading assignments...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Assignment Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/classrooms')}
                >
                    Create Assignment
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Search */}
            <Box mb={2}>
                <TextField
                    fullWidth
                    label="Search assignments..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ maxWidth: 400 }}
                />
            </Box>

            {/* Assignments Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Classroom</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Points</TableCell>
                            <TableCell>Activities</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments
                            .filter((assignment) =>
                                assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((assignment) => (
                                <TableRow key={assignment.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {assignment.title}
                                        </Typography>
                                        {assignment.description && (
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {assignment.description.substring(0, 100)}
                                                {assignment.description.length > 100 && '...'}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assignment.classroom?.name || 'Unknown'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {assignment.classroom?.classCode || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{getStatusChip(assignment)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(assignment.dueDate)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assignment.totalPoints || 'N/A'} pts
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assignment.assignmentActivities?.length || 0} activities
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" gap={1} justifyContent="center">
                                            {/* View Details */}
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedAssignment(assignment);
                                                        setShowViewDialog(true);
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Download PDF */}
                                            <Tooltip title="Download PDF">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDownloadPdf(assignment)}
                                                    disabled={downloading === assignment.id}
                                                >
                                                    <FileDownloadIcon
                                                        fontSize="small"
                                                        color={downloading === assignment.id ? 'disabled' : 'primary'}
                                                    />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Reuse */}
                                            <Tooltip title="Reuse in another classroom">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenReuseDialog(assignment)}
                                                >
                                                    <FileCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Edit */}
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={async () => {
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
                                                                    activities: (assignmentData.assignmentActivities || []).map((activity) => ({
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
                                                            toast.error(err?.response?.data?.message || 'Failed to load assignment');
                                                        }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Publish/Unpublish */}
                                            <Tooltip title={assignment.isPublished ? 'Published' : 'Publish'}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleTogglePublish(assignment)}
                                                    disabled={assignment.isPublished}
                                                >
                                                    {assignment.isPublished ? (
                                                        <PublishIcon fontSize="small" color="success" />
                                                    ) : (
                                                        <UnpublishedIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Tooltip>

                                            {/* Delete */}
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedAssignment(assignment);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                    sx={{ color: 'error.main' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Delete Assignment</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the assignment "{selectedAssignment?.title}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDeleteAssignment} color="error" variant="contained">
                        Delete
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
                    Assignment Details
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
                                        Description:
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedAssignment.description}
                                    </Typography>
                                </Grid>
                            )}

                            {selectedAssignment.instructions && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Instructions:
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedAssignment.instructions}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Classroom:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.classroom?.name} ({selectedAssignment.classroom?.classCode})
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Due Date:
                                </Typography>
                                <Typography variant="body2">
                                    {formatDate(selectedAssignment.dueDate)}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Points:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.totalPoints || 'N/A'} points
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Time Limit:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.timeLimit ? `${selectedAssignment.timeLimit} minutes` : 'No limit'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Activities:
                                </Typography>
                                <Typography variant="body2">
                                    {selectedAssignment.assignmentActivities?.length || 0} activities
                                </Typography>
                                {selectedAssignment.assignmentActivities?.map((activity, index) => (
                                    <Card key={activity.id} variant="outlined" sx={{ mt: 1, p: 2 }}>
                                        <Typography variant="subtitle2">
                                            {index + 1}. {activity.title} ({activity.type})
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Points: {activity.points} | Difficulty: {activity.difficulty || 'N/A'}
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
                        Download PDF
                    </Button>
                    <Button onClick={() => setShowViewDialog(false)}>Close</Button>
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
        </Box>
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

    const toggleActivity = (activityId: string) => {
        setSelectedActivityIds((prev) => {
            const next = new Set(prev);
            if (next.has(activityId)) {
                next.delete(activityId);
            } else {
                next.add(activityId);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (!assignment) return;
        const allIds = new Set(
            (assignment.assignmentActivities || []).map((activity) => activity.id),
        );
        setSelectedActivityIds(allIds);
    };

    const handleSubmit = () => {
        if (!assignment) return;
        if (!selectedClassroomId) {
            toast.error('Please select a classroom to clone the assignment into');
            return;
        }

        const activityIds = Array.from(selectedActivityIds);
        if (activityIds.length === 0) {
            toast.error('Select at least one activity to clone');
            return;
        }

        const payload: CloneAssignmentPayload = {
            targetClassroomId: selectedClassroomId,
            activityIds,
            title: title.trim() || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            isPublished,
        };

        onSubmit(payload);
    };

    const activities = assignment?.assignmentActivities || [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Reuse Assignment</DialogTitle>
            <DialogContent dividers>
                {!assignment ? (
                    <DialogContentText>Select an assignment to reuse.</DialogContentText>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {assignment.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {assignment.description || 'No description'}
                            </Typography>
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel id="reuse-classroom-label">Classroom</InputLabel>
                            <Select
                                labelId="reuse-classroom-label"
                                label="Classroom"
                                value={selectedClassroomId}
                                onChange={(event) => setSelectedClassroomId(event.target.value)}
                                disabled={classroomsLoading || classrooms.length === 0}
                            >
                                {classroomsLoading && (
                                    <MenuItem value="">
                                        <em>Loading...</em>
                                    </MenuItem>
                                )}
                                {classrooms.map((classroom) => (
                                    <MenuItem key={classroom.id} value={classroom.id}>
                                        {classroom.name} ({classroom.classCode || 'N/A'})
                                    </MenuItem>
                                ))}
                            </Select>
                            {classrooms.length === 0 && !classroomsLoading && (
                                <Typography variant="caption" color="text.secondary">
                                    You do not have any classrooms available.
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            label="New Title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Due Date"
                            type="datetime-local"
                            value={dueDate}
                            onChange={(event) => setDueDate(event.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isPublished}
                                    onChange={(event) => setIsPublished(event.target.checked)}
                                />
                            }
                            label="Publish immediately"
                        />

                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">
                                    Activities ({selectedActivityIds.size}/{activities.length})
                                </Typography>
                                <Button size="small" onClick={handleSelectAll}>
                                    Select all
                                </Button>
                            </Box>
                            <Box
                                sx={{
                                    maxHeight: 260,
                                    overflowY: 'auto',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 1,
                                }}
                            >
                                {activities.map((activity) => (
                                    <Box
                                        key={activity.id}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: selectedActivityIds.has(activity.id)
                                                ? 'primary.main'
                                                : 'divider',
                                            borderRadius: 1,
                                            p: 1,
                                            mb: 1,
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedActivityIds.has(activity.id)}
                                                    onChange={() => toggleActivity(activity.id)}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="subtitle2">
                                                        {activity.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Type: {activity.type} · {activity.points || 0} pts
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Box>
                                ))}
                                {activities.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                        This assignment has no activities to reuse.
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting || !assignment || classrooms.length === 0}
                >
                    {submitting ? 'Cloning...' : 'Clone Assignment'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
