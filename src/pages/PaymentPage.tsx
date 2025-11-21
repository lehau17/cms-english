import { getAllTransactions } from "@/apis/payment";
import { PaymentStatus } from "@/interface/payment.interface";
import {
    Box,
    Chip,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.SUCCESS:
            return "success";
        case PaymentStatus.PENDING:
            return "warning";
        case PaymentStatus.FAILED:
            return "error";
        case PaymentStatus.CANCELLED:
            return "default";
        default:
            return "default";
    }
};

export default function PaymentPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => getAllTransactions({ limit: 50 }),
    });

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4, mt: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Quản lý Giao dịch
                </Typography>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Học viên</TableCell>
                            <TableCell>Khóa học / Lớp học</TableCell>
                            <TableCell>Số tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.data.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {transaction.id.slice(0, 8)}...
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2">
                                        {transaction.student?.displayName || transaction.student?.firstName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {transaction.student?.email}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {transaction.course?.title || transaction.classroom?.name || "N/A"}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight="bold">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: transaction.currency }).format(transaction.amount)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={transaction.status}
                                        color={getStatusColor(transaction.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(transaction.createdAt).toLocaleString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
