import { getNotifications } from "@/apis/notification"; // Hàm gọi API lấy danh sách thông báo
import { NotificationChannel } from "@/interface/notification.interface"; // Enum kênh và loại thông báo
import { Add, Notifications } from "@mui/icons-material"; // Icon từ Material-UI
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
} from "@mui/material"; // Component UI từ Material-UI
import { useQuery } from "@tanstack/react-query"; // Hook fetch dữ liệu + cache
import { Link } from "react-router-dom"; // Component điều hướng

const getChannelColor = (channel: NotificationChannel) => { // Hàm trả về màu chip theo kênh thông báo
    switch (channel) {
        case NotificationChannel.email: return "info"; // Xanh dương cho email
        case NotificationChannel.fcm: return "warning"; // Vàng cho FCM (Firebase Cloud Messaging)
        case NotificationChannel.sms: return "error"; // Đỏ cho SMS
        case NotificationChannel.in_app: return "success"; // Xanh lá cho thông báo trong app
        case NotificationChannel.socket: return "primary"; // Xanh đậm cho WebSocket
        default: return "default"; // Mặc định
    }
};

export default function NotificationPage() { // Component trang quản lý thông báo
    const { data, isLoading } = useQuery({
        queryKey: ["notifications"], // Key cache cho React Query
        queryFn: () => getNotifications({ limit: 50 }), // Hàm gọi API lấy danh sách thông báo (tối đa 50)
    });

    if (isLoading) { // Nếu đang tải dữ liệu
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="xl"> {/* Container giới hạn chiều rộng */}
            {/* Header: tiêu đề + nút tạo thông báo */}
            <Box sx={{ mb: 4, mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                    Quản lý Thông báo {/* Tiêu đề trang */}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    to="/notifications/create" // Điều hướng sang trang tạo thông báo
                >
                    Gửi Thông báo {/* Nút tạo thông báo mới */}
                </Button>
            </Box>

            {/* Bảng danh sách thông báo */}
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
                        {data?.data.data.map((notification) => ( // Lặp qua từng thông báo
                            <TableRow key={notification.id}>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Notifications color="action" /> {/* Icon thông báo */}
                                        <Typography variant="subtitle2">{notification.title}</Typography> {/* Tiêu đề thông báo */}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {notification.body || "N/A"} {/* Nội dung thông báo (nếu có) */}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={notification.type} size="small" variant="outlined" /> {/* Chip loại thông báo */}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={notification.channel}
                                        color={getChannelColor(notification.channel)} // Màu theo kênh
                                        size="small"
                                    /> {/* Chip kênh gửi: email, SMS, in-app, ... */}
                                </TableCell>
                                <TableCell>
                                    {new Date(notification.createdAt).toLocaleString("vi-VN")} {/* Ngày tạo (format vi-VN) */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
