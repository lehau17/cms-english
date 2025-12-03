import { getClassrooms } from '@/apis/classroom';
import CreateClassroomModal from '@/components/classroom/CreateClassroomModal';
import DeleteClassroomModal from '@/components/classroom/DeleteClassroomModal';
import EditClassroomModal from '@/components/classroom/EditClassroomModal';
import { DataTable, PageHeader, PaginationBar, SearchFilterBar, type ActionButton, type TableColumn } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { useUpdateClassroomStatus } from '@/hooks/useClassroom';
import { Classroom, ClassroomStatus } from '@/interface/classroom.interface';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MoreVert as MoreVertIcon,
    Person as PersonIcon,
    Visibility as VisibilityIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import {
    Button,
    Chip,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ClassroomPage: React.FC = () => {
    const {
        data: classroomData,
        isLoading,
        setPage,
        setLimit,
        setSearch,
        request,
    } = useBaseRequestQuery<Classroom>({
        queryKey: ['classrooms'],
        queryFn: getClassrooms,
    });

    const navigate = useNavigate();
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [statusMenuAnchor, setStatusMenuAnchor] = useState<{ element: HTMLElement; classroomId: string } | null>(null);

    const updateStatusMutation = useUpdateClassroomStatus();

    const handleView = (classroom: Classroom) => {
        navigate(`/classrooms/${classroom.id}`);
    };

    const handleEdit = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsEditModalOpen(true);
    };

    const handleDelete = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsCreateModalOpen(false);
        setSelectedClassroom(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (classroomData?.data.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const formatDate = (dateString: string | Date | null | undefined): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusChip = (status: ClassroomStatus) => {
        const statusConfig = {
            [ClassroomStatus.upcoming]: { color: 'info' as const, label: 'Upcoming' },
            [ClassroomStatus.ongoing]: { color: 'success' as const, label: 'Ongoing' },
            [ClassroomStatus.completed]: { color: 'default' as const, label: 'Completed' },
            [ClassroomStatus.cancelled]: { color: 'error' as const, label: 'Cancelled' },
        };
        const config = statusConfig[status] || statusConfig[ClassroomStatus.upcoming];
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, classroomId: string) => {
        setStatusMenuAnchor({ element: event.currentTarget, classroomId });
    };

    const handleStatusMenuClose = () => {
        setStatusMenuAnchor(null);
    };

    const handleStatusChange = async (classroomId: string, newStatus: ClassroomStatus) => {
        try {
            await updateStatusMutation.mutateAsync({ classroomId, status: newStatus });
            toast.success('Classroom status updated successfully!');
            handleStatusMenuClose();
        } catch (error: any) {
            toast.error(`Failed to update status: ${error?.response?.data?.message || error.message}`);
        }
    };

    const classrooms = classroomData?.data.data || [];
    const pagination = classroomData?.data;

    const columns: TableColumn<Classroom>[] = [
        {
            id: 'name',
            label: 'Classroom',
            render: (classroom) => (
                <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                        {classroom.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Code: {classroom.classCode}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'teacher',
            label: 'Teacher',
            render: (classroom) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                        {classroom.teacher?.firstName} {classroom.teacher?.lastName}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'status',
            label: 'Status',
            render: (classroom) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    {getStatusChip(classroom.status)}
                    <IconButton
                        size="small"
                        onClick={(e) => handleStatusMenuOpen(e, classroom.id)}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ),
        },
        {
            id: 'enrollment',
            label: 'Enrollment',
            render: (classroom) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                        {classroom.students?.length || 0} / {classroom.maxStudents || '∞'}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'createdAt',
            label: 'Created At',
            render: (classroom) => (
                <Typography variant="body2" color="text.secondary">
                    {formatDate(classroom.createdAt)}
                </Typography>
            ),
        },
    ];

    const actions: ActionButton<Classroom>[] = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: 'View Details',
            color: 'primary',
            onClick: handleView,
        },
        {
            icon: <EditIcon fontSize="small" />,
            label: 'Edit Classroom',
            color: 'success',
            onClick: handleEdit,
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            label: 'Delete Classroom',
            color: 'error',
            onClick: handleDelete,
        },
    ];

    const currentClassroom = statusMenuAnchor
        ? classrooms.find((c) => c.id === statusMenuAnchor.classroomId)
        : null;

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Classroom Management"
                    description="Oversee all classrooms and their activities."
                    createButtonLabel="Create Classroom"
                    onCreateClick={handleCreate}
                />

                <SearchFilterBar
                    searchValue={request.search || ''}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by classroom name..."
                    limitValue={request.limit || 10}
                    onLimitChange={setLimit}
                    isLoading={isLoading}
                />

                <DataTable
                    columns={columns}
                    data={classrooms}
                    isLoading={isLoading}
                    actions={actions}
                    getRowId={(classroom) => classroom.id}
                    emptyState={{
                        icon: <GroupIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'No Classrooms Found',
                        description: 'Create a new classroom to get started.',
                        actionButton: (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                            >
                                Create Your First Classroom
                            </Button>
                        ),
                    }}
                />

                {pagination && (
                    <PaginationBar
                        page={pagination.page}
                        totalPages={pagination.totalPages ?? 1}
                        totalItems={pagination.totalItems ?? 0}
                        limit={pagination.limit}
                        onPageChange={handlePageChange}
                    />
                )}
            </Stack>

            <Menu
                anchorEl={statusMenuAnchor?.element}
                open={Boolean(statusMenuAnchor)}
                onClose={handleStatusMenuClose}
            >
                <MenuItem disabled>
                    <Typography variant="caption" fontWeight={600}>
                        Change Status
                    </Typography>
                </MenuItem>
                {Object.values(ClassroomStatus).map((status) => (
                    <MenuItem
                        key={status}
                        onClick={() => statusMenuAnchor && handleStatusChange(statusMenuAnchor.classroomId, status)}
                        disabled={updateStatusMutation.isPending || currentClassroom?.status === status}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                ))}
            </Menu>

            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModals}
            />

            <EditClassroomModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                classroom={selectedClassroom}
            />

            <DeleteClassroomModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                classroom={selectedClassroom}
            />
        </Container>
    );
};

export default ClassroomPage;
