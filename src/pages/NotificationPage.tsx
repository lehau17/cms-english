import { getNotifications } from "@/apis/notification";
import { NotificationChannel, NotificationType } from "@/interface/notification.interface";
import { Add, Notifications } from "@mui/icons-material";
import {
    Box,
    Button,
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
import { Link } from "react-router-dom";

const getChannelColor = (channel: NotificationChannel) => {
    switch (channel) {
        case NotificationChannel.email: return "info";
        case NotificationChannel.fcm: return "warning";
        case NotificationChannel.sms: return "error";
        case NotificationChannel.in_app: return "success";
        case NotificationChannel.socket: return "primary";
        default: return "default";
    }
};

export default function NotificationPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => getNotifications({ limit: 50 }),
    });

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4, mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                    Quản lý Thông báo
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    to="/notifications/create"
                >
                    Gửi Thông báo
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tiêu đề</TableCell>
                            <TableCell>Nội dung</TableCell>
                            <TableCell>Loại</TableCell>
                            <TableCell>Kênh</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.data.data.map((notification) => (
                            <TableRow key={notification.id}>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Notifications color="action" />
                                        <Typography variant="subtitle2">{notification.title}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {notification.body || "N/A"}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={notification.type} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={notification.channel}
                                        color={getChannelColor(notification.channel)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(notification.createdAt).toLocaleString("vi-VN")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
