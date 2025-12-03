import { DataTable, PageHeader, PaginationBar, type ActionButton, type TableColumn } from '@/components/ui';
import { useApproveLinkRequest, useGetPendingRequests, useRejectLinkRequest } from '@/hooks/useLinkRequest';
import { ParentChildLinkRequest } from '@/interface/parent-child.interface';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

const LinkRequestsPage = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const { data, isLoading, refetch } = useGetPendingRequests({ page, limit });
    const approveMutation = useApproveLinkRequest();
    const rejectMutation = useRejectLinkRequest();

    const handleApprove = async (request: ParentChildLinkRequest) => {
        if (!confirm('Bạn có chắc chắn muốn duyệt yêu cầu liên kết này?')) return;

        try {
            await approveMutation.mutateAsync(request.id);
            toast.success('Duyệt yêu cầu thành công!');
            refetch();
        } catch (error: any) {
            toast.error('Lỗi: ' + (error?.response?.data?.message || 'Không thể duyệt yêu cầu'));
        }
    };

    const handleReject = async (request: ParentChildLinkRequest) => {
        if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu liên kết này?')) return;

        try {
            await rejectMutation.mutateAsync(request.id);
            toast.success('Từ chối yêu cầu thành công!');
            refetch();
        } catch (error: any) {
            toast.error('Lỗi: ' + (error?.response?.data?.message || 'Không thể từ chối yêu cầu'));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getUserName = (request: ParentChildLinkRequest, type: 'parent' | 'student') => {
        const user = type === 'parent' ? request.parent : request.student;
        return user.displayName || (user.firstName && user.lastName)
            ? `${user.firstName} ${user.lastName}`.trim()
            : user.email || 'N/A';
    };

    const requests = data?.data || [];
    const meta = data?.meta;

    const columns: TableColumn<ParentChildLinkRequest>[] = [
        {
            id: 'parent',
            label: 'Phụ huynh',
            render: (request) => (
                <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                        {getUserName(request, 'parent')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {request.parent.email}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'student',
            label: 'Học sinh',
            render: (request) => (
                <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                        {getUserName(request, 'student')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {request.student.email}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'requestedAt',
            label: 'Ngày yêu cầu',
            render: (request) => (
                <Typography variant="body2">
                    {formatDate(request.requestedAt)}
                </Typography>
            ),
        },
        {
            id: 'status',
            label: 'Trạng thái',
            render: () => (
                <Chip label="Đang chờ" color="warning" size="small" />
            ),
        },
    ];

    const actions: ActionButton<ParentChildLinkRequest>[] = [
        {
            icon: <CheckCircleIcon fontSize="small" />,
            label: 'Duyệt',
            color: 'success',
            onClick: handleApprove,
        },
        {
            icon: <CancelIcon fontSize="small" />,
            label: 'Từ chối',
            color: 'error',
            onClick: handleReject,
        },
    ];

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <PageHeader
                        title="Yêu cầu liên kết Phụ huynh - Học sinh"
                        description="Duyệt các yêu cầu liên kết giữa phụ huynh và học sinh"
                    />
                    {meta && (
                        <Box
                            sx={{
                                bgcolor: 'info.light',
                                color: 'info.contrastText',
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <LinkIcon />
                            <Typography variant="body2" fontWeight={600}>
                                {meta.total || 0} yêu cầu đang chờ
                            </Typography>
                        </Box>
                    )}
                </Box>

                <DataTable
                    columns={columns}
                    data={requests}
                    isLoading={isLoading}
                    actions={actions}
                    getRowId={(request) => request.id}
                    emptyState={{
                        icon: <LinkIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'Không có yêu cầu nào',
                        description: 'Không có yêu cầu liên kết nào đang chờ duyệt.',
                    }}
                />

                {meta && meta.totalPages > 1 && (
                    <PaginationBar
                        page={page}
                        totalPages={meta.totalPages}
                        totalItems={meta.total}
                        limit={limit}
                        onPageChange={handlePageChange}
                    />
                )}
            </Stack>
        </Container>
    );
};

export default LinkRequestsPage;
