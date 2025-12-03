import { getAllTransactions } from '@/apis/payment';
import { DataTable, PageHeader, type TableColumn } from '@/components/ui';
import { PaymentStatus } from '@/interface/payment.interface';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { Chip, Container, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.SUCCESS:
            return 'success';
        case PaymentStatus.PENDING:
            return 'warning';
        case PaymentStatus.FAILED:
            return 'error';
        case PaymentStatus.CANCELLED:
            return 'default';
        default:
            return 'default';
    }
};

export default function PaymentPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getAllTransactions({ limit: 50 }),
    });

    const transactions = data?.data || [];

    const columns: TableColumn<any>[] = [
        {
            id: 'id',
            label: 'ID',
            render: (transaction) => (
                <Typography variant="body2" color="text.secondary">
                    {transaction.id.slice(0, 8)}...
                </Typography>
            ),
        },
        {
            id: 'student',
            label: 'Học viên',
            render: (transaction) => (
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                        {transaction.student?.displayName || transaction.student?.firstName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {transaction.student?.email}
                    </Typography>
                </Stack>
            ),
        },
        {
            id: 'course',
            label: 'Khóa học / Lớp học',
            render: (transaction) => (
                <Typography variant="body2">
                    {transaction.course?.title || transaction.classroom?.name || 'N/A'}
                </Typography>
            ),
        },
        {
            id: 'amount',
            label: 'Số tiền',
            render: (transaction) => (
                <Typography fontWeight="bold">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: transaction.currency,
                    }).format(transaction.amount)}
                </Typography>
            ),
        },
        {
            id: 'status',
            label: 'Trạng thái',
            render: (transaction) => (
                <Chip
                    label={transaction.status}
                    color={getStatusColor(transaction.status)}
                    size="small"
                />
            ),
        },
        {
            id: 'createdAt',
            label: 'Ngày tạo',
            render: (transaction) => (
                <Typography variant="body2">
                    {new Date(transaction.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Typography>
            ),
        },
    ];

    return (
        <Container maxWidth="xl">
            <Stack spacing={3} sx={{ py: 3 }}>
                <PageHeader
                    title="Quản lý Giao dịch"
                    description="Xem và quản lý tất cả các giao dịch thanh toán"
                />

                <DataTable
                    columns={columns}
                    data={transactions}
                    isLoading={isLoading}
                    getRowId={(transaction) => transaction.id}
                    emptyState={{
                        icon: <ReceiptIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
                        title: 'Không có giao dịch',
                        description: 'Chưa có giao dịch nào trong hệ thống.',
                    }}
                />
            </Stack>
        </Container>
    );
}
