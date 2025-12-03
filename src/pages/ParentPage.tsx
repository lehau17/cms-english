import {
    bulkActivateParents,
    bulkDeactivateParents,
    bulkDeleteParents,
    downloadImportTemplate,
    exportParents,
    getParentStats,
    getParents,
    importParents
} from '@/apis/parent';
import AssignParentModal from '@/components/parent/AssignParentModal';
import CreateParentModal from '@/components/parent/CreateParentModal';
import DeleteParentModal from '@/components/parent/DeleteParentModal';
import EditParentModal from '@/components/parent/EditParentModal';
import ViewParentModal from '@/components/parent/ViewParentModal';
import { DataTable, PageHeader, PaginationBar, SearchFilterBar, type ActionButton, type TableColumn } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { Parent } from '@/interface/parent.interface';
import {
    Add as AddIcon,
    CloudDownload as CloudDownloadIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    People as PeopleIcon,
    PersonAdd as PersonAddIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
    Avatar,
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

const ParentPage: React.FC = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: parentData,
        isLoading,
        setPage,
        setLimit,
        setSearch,
        request,
        setRequest,
    } = useBaseRequestQuery<Parent>({
        queryKey: ['parents'],
        queryFn: getParents,
    });

    // Stats query
    const { data: statsData } = useQuery({
        queryKey: ['parent-stats'],
        queryFn: async () => {
            const response = await getParentStats();
            return response;
        },
    });

    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [selectedParents, setSelectedParents] = useState<(string | number)[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>('');

    const handleView = (parent: Parent) => {
        setSelectedParent(parent);
        setIsViewModalOpen(true);
    };

    const handleEdit = (parent: Parent) => {
        setSelectedParent(parent);
        setIsEditModalOpen(true);
    };

    const handleDelete = (parent: Parent) => {
        setSelectedParent(parent);
        setIsDeleteModalOpen(true);
    };

    const handleAssign = (parent: Parent) => {
        setSelectedParent(parent);
        setIsAssignModalOpen(true);
    };

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const closeModal = () => {
        setSelectedParent(null);
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsCreateModalOpen(false);
        setIsAssignModalOpen(false);
    };

    const onSuccess = () => {
        closeModal();
        queryClient.invalidateQueries({ queryKey: ['parents'] });
        queryClient.invalidateQueries({ queryKey: ['parent-stats'] });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= (parentData?.data.totalPages || 1)) {
            setPage(newPage);
        }
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setRequest({
            ...request,
            isActive: value === 'active' ? true : value === 'inactive' ? false : undefined,
        } as any);
    };


    const handleExport = async () => {
        try {
            const blob = await exportParents(request);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `parents-${new Date().toISOString()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Parents exported successfully');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to export parents');
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
            a.download = 'parents-import-template.csv';
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
            const response = await importParents(file);
            toast.success(`Imported ${response.created} parents successfully`);
            if (response.errors.length > 0) {
                toast.error(`${response.errors.length} errors occurred`);
            }
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            queryClient.invalidateQueries({ queryKey: ['parent-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to import parents');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedParents.length === 0) {
            toast.error('Vui lòng chọn phụ huynh để xóa');
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedParents.length} phụ huynh?`)) {
            return;
        }

        try {
            await bulkDeleteParents(selectedParents.map(id => String(id)));
            toast.success(`Đã xóa ${selectedParents.length} phụ huynh thành công`);
            setSelectedParents([]);
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            queryClient.invalidateQueries({ queryKey: ['parent-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Lỗi khi xóa phụ huynh');
        }
    };

    const handleBulkActivate = async () => {
        if (selectedParents.length === 0) {
            toast.error('Vui lòng chọn phụ huynh để kích hoạt');
            return;
        }

        try {
            await bulkActivateParents(selectedParents.map(id => String(id)));
            toast.success(`Đã kích hoạt ${selectedParents.length} phụ huynh thành công`);
            setSelectedParents([]);
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            queryClient.invalidateQueries({ queryKey: ['parent-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Lỗi khi kích hoạt phụ huynh');
        }
    };

    const handleBulkDeactivate = async () => {
        if (selectedParents.length === 0) {
            toast.error('Vui lòng chọn phụ huynh để vô hiệu hóa');
            return;
        }

        try {
            await bulkDeactivateParents(selectedParents.map(id => String(id)));
            toast.success(`Đã vô hiệu hóa ${selectedParents.length} phụ huynh thành công`);
            setSelectedParents([]);
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            queryClient.invalidateQueries({ queryKey: ['parent-stats'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Lỗi khi vô hiệu hóa phụ huynh');
        }
    };

    const parents = parentData?.data.data || [];
    const pagination = parentData?.data;

    const columns: TableColumn<Parent>[] = [
        {
            id: 'name',
            label: 'Phụ huynh',
            render: (parent) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                        <PeopleIcon />
                    </Avatar>
                    <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                            {parent.firstName} {parent.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ID: {parent.id.slice(0, 8)}...
                        </Typography>
                    </Stack>
                </Stack>
            ),
        },
        {
            id: 'email',
            label: 'Email',
            render: (parent) => (
                <Typography variant="body2">
                    {parent.email}
                </Typography>
            ),
        },
        {
            id: 'phoneNumber',
            label: 'Số điện thoại',
            render: (parent) => (
                <Typography variant="body2">
                    {parent.phoneNumber || 'Chưa có'}
                </Typography>
            ),
        },
        {
            id: 'children',
            label: 'Học sinh liên kết',
            render: (parent) => (
                <Typography variant="body2">
                    {parent.children?.length || 0} học sinh
                </Typography>
            ),
        },
        {
            id: 'isActive',
            label: 'Trạng thái',
            render: (parent) => (
                <Chip
                    label={parent.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    color={parent.isActive ? 'success' : 'error'}
                    size="small"
                />
            ),
        },
    ];

    const actions: ActionButton<Parent>[] = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: 'Xem chi tiết',
            color: 'primary',
            onClick: handleView,
        },
        {
            icon: <EditIcon fontSize="small" />,
            label: 'Chỉnh sửa',
            color: 'warning',
            onClick: handleEdit,
        },
        {
            icon: <PersonAddIcon fontSize="small" />,
            label: 'Gán học sinh',
            color: 'success',
            onClick: handleAssign,
        },
        {
            icon: <DeleteIcon fontSize="small" />,
            label: 'Xóa',
            color: 'error',
            onClick: handleDelete,
        },
    ];

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Quản lý phụ huynh"
                    description="Quản lý thông tin phụ huynh và liên kết với học sinh"
                    createButtonLabel="Thêm phụ huynh"
                    onCreateClick={handleCreate}
                    actionButton={
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadTemplate}
                                disabled={isLoading}
                            >
                                Tải mẫu
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
                                Nhập file
                            </Button>
                            {selectedParents.length > 0 && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<AddIcon />}
                                        onClick={handleBulkActivate}
                                        disabled={isLoading}
                                    >
                                        Kích hoạt ({selectedParents.length})
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleBulkDeactivate}
                                        disabled={isLoading}
                                    >
                                        Vô hiệu hóa ({selectedParents.length})
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleBulkDelete}
                                        disabled={isLoading}
                                    >
                                        Xóa ({selectedParents.length})
                                    </Button>
                                </>
                            )}
                        </Stack>
                    }
                />

                {/* Stats Cards */}
                {statsData && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    Tổng số phụ huynh
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {statsData.total ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    Đang hoạt động
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {statsData.active ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    Có học sinh
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {statsData.withChildren ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    TB học sinh/phụ huynh
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="info.main">
                                    {statsData.avgChildrenPerParent ? statsData.avgChildrenPerParent.toFixed(1) : '0.0'}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                <SearchFilterBar
                    searchValue={request.search || ''}
                    onSearchChange={setSearch}
                    searchPlaceholder="Tìm kiếm phụ huynh..."
                    limitValue={request.limit || 10}
                    onLimitChange={setLimit}
                    isLoading={isLoading}
                />

                {/* Advanced Filters */}
                <Paper sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Trạng thái"
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="active">Hoạt động</MenuItem>
                                <MenuItem value="inactive">Không hoạt động</MenuItem>
                            </Select>
                        </FormControl>

                        {statusFilter && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    setStatusFilter('');
                                    setRequest({
                                        ...request,
                                        isActive: undefined,
                                    } as any);
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </Stack>
                </Paper>

                <DataTable
                    columns={columns}
                    data={parents}
                    isLoading={isLoading}
                    actions={actions}
                    getRowId={(parent) => parent.id}
                    selectedRows={selectedParents}
                    onSelectionChange={setSelectedParents}
                    emptyState={{
                        icon: <PeopleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'Không tìm thấy phụ huynh',
                        description: 'Tạo phụ huynh mới để bắt đầu.',
                        actionButton: (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                            >
                                Tạo phụ huynh đầu tiên
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

            <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <CreateParentModal
                isOpen={isCreateModalOpen}
                onClose={closeModal}
                onSuccess={onSuccess}
            />

            {selectedParent && (
                <>
                    <ViewParentModal
                        isOpen={isViewModalOpen}
                        onClose={closeModal}
                        parent={selectedParent}
                    />
                    <EditParentModal
                        isOpen={isEditModalOpen}
                        onClose={closeModal}
                        parent={selectedParent}
                        onSuccess={onSuccess}
                    />
                    <DeleteParentModal
                        isOpen={isDeleteModalOpen}
                        onClose={closeModal}
                        parent={selectedParent}
                        onSuccess={onSuccess}
                    />
                    <AssignParentModal
                        isOpen={isAssignModalOpen}
                        onClose={closeModal}
                        parent={selectedParent}
                        onSuccess={onSuccess}
                    />
                </>
            )}
        </Container>
    );
};

export default ParentPage;
