import { certificateApi } from '@/apis/certificate.api';
import { DataTable, PageHeader, PaginationBar, type ActionButton, type TableColumn } from '@/components/ui';
import {
    EmojiEvents as AwardIcon,
    Download as DownloadIcon,
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
    TextField,
    Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CertificatesPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRevoked, setFilterRevoked] = useState<boolean | undefined>(false);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['certificates', page, filterRevoked],
        queryFn: () =>
            certificateApi.getAll({
                skip: (page - 1) * pageSize,
                take: pageSize,
                includeRevoked: filterRevoked,
            }),
    });

    const filteredData = data?.data?.filter((cert) =>
        cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDownloadCertificate = async (certificateId: string, certificateNumber: string) => {
        try {
            const blob = await certificateApi.downloadCertificate(certificateId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate-${certificateNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Tải chứng chỉ thành công');
        } catch (error: any) {
            console.error('Download certificate error:', error);
            toast.error(error?.response?.data?.message || 'Tải chứng chỉ thất bại');
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const certificates = filteredData || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const columns: TableColumn<any>[] = [
        {
            id: 'certificateNumber',
            label: 'Số chứng chỉ',
            render: (certificate) => (
                <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                    {certificate.certificateNumber}
                </Typography>
            ),
        },
        {
            id: 'student',
            label: 'Học viên',
            render: (certificate) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                        {certificate.studentName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                            {certificate.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {certificate.studentEmail}
                        </Typography>
                    </Stack>
                </Stack>
            ),
        },
        {
            id: 'courseName',
            label: 'Khóa học',
            render: (certificate) => (
                <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {certificate.courseName}
                </Typography>
            ),
        },
        {
            id: 'issueDate',
            label: 'Ngày cấp',
            render: (certificate) => (
                <Typography variant="body2">
                    {formatDate(certificate.issueDate)}
                </Typography>
            ),
        },
        {
            id: 'finalScore',
            label: 'Điểm',
            render: (certificate) => (
                <Typography variant="body2" fontWeight={600}>
                    {certificate.finalScore ? `${certificate.finalScore}%` : '-'}
                </Typography>
            ),
        },
        {
            id: 'status',
            label: 'Trạng thái',
            render: (certificate) => (
                <Chip
                    label={certificate.isRevoked ? 'Đã thu hồi' : 'Hợp lệ'}
                    color={certificate.isRevoked ? 'error' : 'success'}
                    size="small"
                />
            ),
        },
    ];

    const actions: ActionButton<any>[] = [
        {
            icon: <VisibilityIcon fontSize="small" />,
            label: 'Xem chi tiết',
            color: 'primary',
            onClick: (certificate) => navigate(`/certificates/${certificate.id}`),
        },
        {
            icon: <DownloadIcon fontSize="small" />,
            label: 'Tải xuống',
            color: 'primary',
            onClick: (certificate) => handleDownloadCertificate(certificate.id, certificate.certificateNumber),
        },
    ];

    const validCount = data?.data?.filter((c) => !c.isRevoked).length || 0;
    const revokedCount = data?.data?.filter((c) => c.isRevoked).length || 0;
    const thisMonthCount = data?.data?.filter((c) => {
        const issueDate = new Date(c.issueDate);
        const now = new Date();
        return (
            issueDate.getMonth() === now.getMonth() &&
            issueDate.getFullYear() === now.getFullYear()
        );
    }).length || 0;

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Quản Lý Chứng Chỉ"
                    description="Quản lý và theo dõi tất cả chứng chỉ đã cấp"
                    actionButton={
                        <Button
                            variant="contained"
                            onClick={() => navigate('/certificate-templates')}
                        >
                            Quản lý Templates
                        </Button>
                    }
                />

                {/* Stats Cards */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                        Tổng cấp
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {total}
                                    </Typography>
                                </Stack>
                                <Box sx={{ bgcolor: 'primary.light', borderRadius: '50%', p: 1.5 }}>
                                    <AwardIcon sx={{ color: 'primary.main' }} />
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                        Hợp lệ
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold" color="success.main">
                                        {validCount}
                                    </Typography>
                                </Stack>
                                <Box sx={{ bgcolor: 'success.light', borderRadius: '50%', p: 1.5 }}>
                                    <AwardIcon sx={{ color: 'success.main' }} />
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                        Đã thu hồi
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold" color="error.main">
                                        {revokedCount}
                                    </Typography>
                                </Stack>
                                <Box sx={{ bgcolor: 'error.light', borderRadius: '50%', p: 1.5 }}>
                                    <AwardIcon sx={{ color: 'error.main' }} />
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                        Tháng này
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                                        {thisMonthCount}
                                    </Typography>
                                </Stack>
                                <Box sx={{ bgcolor: 'secondary.light', borderRadius: '50%', p: 1.5 }}>
                                    <AwardIcon sx={{ color: 'secondary.main' }} />
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Filters & Search */}
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            fullWidth
                            placeholder="Tìm theo tên học viên, khóa học hoặc số chứng chỉ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ maxWidth: { xs: '100%', sm: 400 } }}
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={filterRevoked === undefined ? 'all' : filterRevoked ? 'revoked' : 'valid'}
                                label="Trạng thái"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFilterRevoked(value === 'all' ? undefined : value === 'revoked');
                                    setPage(1);
                                }}
                            >
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="valid">Hợp lệ</MenuItem>
                                <MenuItem value="revoked">Đã thu hồi</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>

                <DataTable
                    columns={columns}
                    data={certificates}
                    isLoading={isLoading}
                    actions={actions}
                    getRowId={(certificate) => certificate.id}
                    emptyState={{
                        icon: <AwardIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'Không tìm thấy chứng chỉ',
                        description: searchQuery
                            ? 'Thử tìm kiếm với từ khóa khác'
                            : 'Chưa có chứng chỉ nào được cấp',
                    }}
                />

                {totalPages > 1 && (
                    <PaginationBar
                        page={page}
                        totalPages={totalPages}
                        totalItems={total}
                        limit={pageSize}
                        onPageChange={handlePageChange}
                    />
                )}
            </Stack>
        </Container>
    );
};

export default CertificatesPage;
