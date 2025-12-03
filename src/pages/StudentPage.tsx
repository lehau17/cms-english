import {
    bulkDeleteStudents,
    downloadImportTemplate,
    exportStudents,
    getStudentStats,
    getStudents,
    importStudents
} from '@/apis/student';
import CreateStudentModal from '@/components/student/CreateStudentModal';
import DeleteStudentModal from '@/components/student/DeleteStudentModal';
import EditStudentModal from '@/components/student/EditStudentModal';
import ViewStudentModal from '@/components/student/ViewStudentModal';
import { DataTable, PageHeader, PaginationBar, SearchFilterBar, type ActionButton, type TableColumn } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { Student } from '@/interface/student.interface';
import {
    Add as AddIcon,
    CloudDownload as CloudDownloadIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

const StudentPage: React.FC = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: studentData,
        isLoading,
        setPage,
        setLimit,
        setSearch,
        request,
        setRequest,
    } = useBaseRequestQuery<Student>({
        queryKey: ['students'],
        queryFn: getStudents,
    });

    // Stats query
    const { data: statsData } = useQuery({
        queryKey: ['student-stats'],
        queryFn: async () => {
            const response = await getStudentStats();
            return response.data;
        },
    });

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<(string | number)[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [genderFilter, setGenderFilter] = useState<string>('');

    const handleView = (student: Student) => {
        setSelectedStudent(student);
        setIsViewModalOpen(true);
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };

    const handleDelete = (student: Student) => {
        setSelectedStudent(student);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsCreateModalOpen(false);
        setSelectedStudent(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (studentData?.data.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setRequest({ ...request, status: value || undefined });
    };

    const handleGenderFilterChange = (value: string) => {
        setGenderFilter(value);
        setRequest({ ...request, gender: value || undefined });
    };

    const handleExport = async () => {
        try {
            const blob = await exportStudents(request);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students-${new Date().toISOString()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Students exported successfully');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to export students');
        }
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await downloadImportTemplate();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'students-import-template.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Template downloaded successfully');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to download template');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const response = await importStudents(file);
            toast.success(`Imported ${response.data.created} students successfully`);
            if (response.data.errors.length > 0) {
                toast.error(`${response.data.errors.length} errors occurred`);
            }
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['student-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to import students');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select students to delete');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) {
            return;
        }

        try {
            await bulkDeleteStudents(selectedStudents.map(id => String(id)));
            toast.success(`Deleted ${selectedStudents.length} students successfully`);
            setSelectedStudents([]);
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['student-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete students');
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

    const students = studentData?.data.data || [];
    const pagination = studentData?.data;

    const getStudentDisplayName = (student: Student): string => {
        if (student.username) return student.username;
        if (student.firstName && student.lastName) {
            return `${student.firstName} ${student.lastName}`.trim();
        }
        if (student.firstName) return student.firstName;
        if (student.lastName) return student.lastName;
        return student.email || 'N/A';
    };

    const columns: TableColumn<Student>[] = [
        {
            id: 'name',
            label: 'Name',
            render: (student) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={student.avatarUrl}
                        sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}
                    >
                        {getStudentDisplayName(student).charAt(0).toUpperCase()}
                    </Avatar>
                    <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                            {getStudentDisplayName(student)}
                        </Typography>
                        {student.username && student.username !== getStudentDisplayName(student) && (
                            <Typography variant="caption" color="text.secondary">
                                @{student.username}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            ),
        },
        {
            id: 'email',
            label: 'Email',
            render: (student) => (
                <Typography variant="body2" color="text.secondary">
                    {student.email}
                </Typography>
            ),
        },
        {
            id: 'phone',
            label: 'Phone',
            render: (student) => (
                <Typography variant="body2" color="text.secondary">
                    {student.phone || 'N/A'}
                </Typography>
            ),
        },
        {
            id: 'status',
            label: 'Status',
            render: (student) => (
                <Chip
                    label={student.status}
                    color={student.status === 'active' ? 'success' : 'error'}
                    size="small"
                />
            ),
        },
        {
            id: 'createdAt',
            label: 'Created At',
            render: (student) => (
                <Typography variant="body2" color="text.secondary">
                    {formatDate(student.createdAt)}
                </Typography>
            ),
        },
    ];

    const actions: ActionButton<Student>[] = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: 'View Details',
            color: 'primary',
            onClick: handleView,
        },
        {
            icon: <EditIcon fontSize="small" />,
            label: 'Edit Student',
            color: 'success',
            onClick: handleEdit,
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            label: 'Delete Student',
            color: 'error',
            onClick: handleDelete,
        },
    ];

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Student Management"
                    description="Oversee all students and their activities."
                    createButtonLabel="Create Student"
                    onCreateClick={handleCreate}
                    actionButton={
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadTemplate}
                                disabled={isLoading}
                            >
                                Download Template
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CloudDownloadIcon />}
                                onClick={handleExport}
                                disabled={isLoading}
                            >
                                Export
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleImport}
                                disabled={isLoading}
                            >
                                Import
                            </Button>
                            {selectedStudents.length > 0 && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleBulkDelete}
                                    disabled={isLoading}
                                >
                                    Delete ({selectedStudents.length})
                                </Button>
                            )}
                        </Stack>
                    }
                />

                {/* Stats Cards */}
                {statsData && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Students
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {statsData.total}
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ bgcolor: 'primary.light', borderRadius: '50%', p: 1.5 }}>
                                        <PersonIcon sx={{ color: 'primary.main' }} />
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                            Active
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="success.main">
                                            {statsData.active}
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ bgcolor: 'success.light', borderRadius: '50%', p: 1.5 }}>
                                        <PersonIcon sx={{ color: 'success.main' }} />
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                            Inactive
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="error.main">
                                            {statsData.inactive}
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ bgcolor: 'error.light', borderRadius: '50%', p: 1.5 }}>
                                        <PersonIcon sx={{ color: 'error.main' }} />
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                            By Gender
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {Object.entries(statsData.byGender).map(([key, value]) => (
                                                <span key={key} style={{ marginRight: 8 }}>
                                                    {key}: {value}
                                                </span>
                                            ))}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Filters */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="banned">Banned</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Gender</InputLabel>
                        <Select
                            value={genderFilter}
                            label="Gender"
                            onChange={(e) => handleGenderFilterChange(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                            <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <SearchFilterBar
                    searchValue={request.search || ''}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name, email, phone..."
                    limitValue={request.limit || 10}
                    onLimitChange={setLimit}
                    isLoading={isLoading}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                <DataTable
                    columns={columns}
                    data={students}
                    isLoading={isLoading}
                    actions={actions}
                    getRowId={(student) => student.id}
                    selectedRows={selectedStudents}
                    onSelectionChange={setSelectedStudents}
                    emptyState={{
                        icon: <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'No Students Found',
                        description: 'Create a new student to get started.',
                        actionButton: (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                            >
                                Create Your First Student
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

            <CreateStudentModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModals}
            />

            <EditStudentModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                student={selectedStudent}
            />

            <DeleteStudentModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                student={selectedStudent}
            />

            <ViewStudentModal
                isOpen={isViewModalOpen}
                onClose={handleCloseModals}
                student={selectedStudent}
            />
        </Container>
    );
};

export default StudentPage;
