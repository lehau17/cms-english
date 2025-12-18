import { downloadImportTemplate, exportTeachers, getTeachers, importTeachers } from '@/apis/teacher';
import CreateTeacherModal from '@/components/teacher/CreateTeacherModal';
import DeleteTeacherModal from '@/components/teacher/DeleteTeacherModal';
import EditTeacherModal from '@/components/teacher/EditTeacherModal';
import ViewTeacherModal from '@/components/teacher/ViewTeacherModal';
import { DataTable, PageHeader, PaginationBar, SearchFilterBar, type ActionButton, type TableColumn } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { UserResponse } from '@/interface/user.interface';
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
import { Button, Chip, Container, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TeacherPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: teacherData,
        isLoading,
        setPage,
        setLimit,
        setSearch,
        request,
    } = useBaseRequestQuery<UserResponse>({
        queryKey: ['teachers'],
        queryFn: getTeachers,
    });

    const [selectedTeacher, setSelectedTeacher] = useState<UserResponse | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const handleView = (teacher: UserResponse) => {
        // Navigate to teacher detail page instead of opening modal
        navigate(`/teachers/${teacher.id}`);
    };

    const handleEdit = (teacher: UserResponse) => {
        setSelectedTeacher(teacher);
        setIsEditModalOpen(true);
    };

    const handleDelete = (teacher: UserResponse) => {
        setSelectedTeacher(teacher);
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
        setSelectedTeacher(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (teacherData?.data.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await exportTeachers(request);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teachers-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Xuat danh sach giao vien thanh cong');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Xuat danh sach giao vien that bai');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await downloadImportTemplate();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'teachers-import-template.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Tai mau thanh cong');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Tai mau that bai');
        }
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const response = await importTeachers(file);
            toast.success(`Da import thanh cong ${response.data.created} giao vien`);
            if (response.data.errors.length > 0) {
                toast.error(`${response.data.errors.length} loi xay ra`);
            }
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Import giao vien that bai');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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

    const teachers = teacherData?.data.data || [];
    const pagination = teacherData?.data;

    const columns: TableColumn<UserResponse>[] = [
        {
            id: 'displayName',
            label: 'Tên',
            render: (teacher) => (
                <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                        {teacher.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {teacher.firstName} {teacher.lastName}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'email',
            label: 'Email',
            render: (teacher) => (
                <Typography variant="body2" color="text.secondary">
                    {teacher.email}
                </Typography>
            ),
        },
        {
            id: 'phone',
            label: 'Số điện thoại',
            render: (teacher) => (
                <Typography variant="body2" color="text.secondary">
                    {teacher.phone || 'N/A'}
                </Typography>
            ),
        },
        {
            id: 'status',
            label: 'Trạng thái',
            render: (teacher) => (
                <Chip
                    label={teacher.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    color={teacher.status === 'active' ? 'success' : 'error'}
                    size="small"
                />
            ),
        },
        {
            id: 'createdAt',
            label: 'Ngày tạo',
            render: (teacher) => (
                <Typography variant="body2" color="text.secondary">
                    {formatDate(teacher.createdAt)}
                </Typography>
            ),
        },
    ];

    const actions: ActionButton<UserResponse>[] = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: 'Xem chi tiết',
            color: 'primary',
            onClick: handleView,
        },
        {
            icon: <EditIcon fontSize="small" />,
            label: 'Chỉnh sửa giáo viên',
            color: 'success',
            onClick: handleEdit,
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            label: 'Xóa giáo viên',
            color: 'error',
            onClick: handleDelete,
        },
    ];

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Quản lý giáo viên"
                    description="Quản lý tất cả giáo viên và hoạt động giảng dạy."
                    createButtonLabel="Tạo giáo viên"
                    onCreateClick={handleCreate}
                    actionButton={
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadTemplate}
                                disabled={isLoading}
                            >
                                Tải file mẫu
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CloudDownloadIcon />}
                                onClick={handleExport}
                                disabled={isLoading}
                            >
                                Xuất file
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleImport}
                                disabled={isLoading}
                            >
                                Import
                            </Button>
                        </Stack>
                    }
                />

                <SearchFilterBar
                    searchValue={request.search || ''}
                    onSearchChange={setSearch}
                    searchPlaceholder="Tìm kiếm theo tên, email..."
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
                    data={teachers}
                    isLoading={isLoading}
                    actions={actions}
                    getRowId={(teacher) => teacher.id}
                    emptyState={{
                        icon: <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'Không tìm thấy giáo viên nào',
                        description: 'Tạo giáo viên mới để bắt đầu.',
                        actionButton: (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                            >
                                Tạo giáo viên đầu tiên
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

            <CreateTeacherModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModals}
            />

            <EditTeacherModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                teacher={selectedTeacher}
            />

            <DeleteTeacherModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                teacher={selectedTeacher}
            />

            <ViewTeacherModal
                isOpen={isViewModalOpen}
                onClose={handleCloseModals}
                teacher={selectedTeacher}
            />
        </Container>
    );
};

export default TeacherPage;
