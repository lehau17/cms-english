import { broadcastNotification } from "@/apis/notification"; // Hàm gọi API gửi thông báo broadcast
import { UserRole } from "@/interface/enum.interface"; // Enum vai trò người dùng
import { CreateBroadcastNotificationDto, NotificationChannel } from "@/interface/notification.interface"; // Interface và enum cho thông báo
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    TextField,
    Typography
} from "@mui/material"; // Component UI từ Material-UI
import { useMutation } from "@tanstack/react-query"; // Hook mutation để gửi request
import { useState } from "react"; // Hook quản lý state
import { useNavigate } from "react-router-dom"; // Hook điều hướng trang

export default function CreateNotificationPage() { // Component trang tạo/gửi thông báo mới
    const navigate = useNavigate(); // Dùng để chuyển trang sau khi gửi thành công
    const [formData, setFormData] = useState<CreateBroadcastNotificationDto>({
        target: 'all', // Đối tượng nhận: 'all' (tất cả), 'role' (theo vai trò), 'users' (danh sách user)
        title: "", // Tiêu đề thông báo
        body: "", // Nội dung thông báo
        channel: NotificationChannel.in_app, // Kênh gửi mặc định: trong app
        targetRoles: [], // Danh sách vai trò (nếu target = 'role')
        targetUserIds: [], // Danh sách user IDs (nếu target = 'users')
    });

    const createMutation = useMutation({
        mutationFn: broadcastNotification, // Hàm gọi API gửi thông báo
        onSuccess: (data) => {
            alert(`Gửi thông báo thành công! Đã tạo ${data.data.count} thông báo.`); // Thông báo số lượng thông báo đã gửi
            navigate("/notifications"); // Quay lại trang danh sách thông báo
        },
        onError: (error) => {
            console.error(error);
            alert("Có lỗi xảy ra khi gửi thông báo"); // Thông báo lỗi
        }
    });

    const handleChange = (field: keyof CreateBroadcastNotificationDto, value: any) => { // Cập nhật giá trị field trong form
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => { // Xử lý khi submit form
        createMutation.mutate(formData); // Gọi mutation để gửi thông báo
    };

    return (
        <Container maxWidth="md"> {/* Container giới hạn chiều rộng */}
            {/* Header */}
            <Box sx={{ mb: 4, mt: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Gửi Thông báo Mới {/* Tiêu đề trang */}
                </Typography>
            </Box>

            {/* Form tạo thông báo */}
            <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Input tiêu đề */}
                <TextField
                    label="Tiêu đề"
                    fullWidth
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)} // Cập nhật tiêu đề
                />
                {/* Input nội dung */}
                <TextField
                    label="Nội dung"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.body}
                    onChange={(e) => handleChange("body", e.target.value)} // Cập nhật nội dung
                />

                {/* Dropdown chọn đối tượng nhận */}
                <FormControl fullWidth>
                    <InputLabel>Đối tượng nhận</InputLabel>
                    <Select
                        value={formData.target}
                        label="Đối tượng nhận"
                        onChange={(e) => handleChange("target", e.target.value)} // Đổi loại đối tượng
                    >
                        <MenuItem value="all">Tất cả người dùng</MenuItem>
                        <MenuItem value="role">Theo vai trò (Role)</MenuItem>
                        <MenuItem value="users">Danh sách người dùng cụ thể</MenuItem>
                    </Select>
                </FormControl>

                {/* Hiển thị khi chọn target = 'role' */}
                {formData.target === 'role' && (
                    <FormControl fullWidth>
                        <InputLabel>Chọn vai trò</InputLabel>
                        <Select
                            multiple // Cho phép chọn nhiều vai trò
                            value={formData.targetRoles || []}
                            onChange={(e) => handleChange("targetRoles", e.target.value)} // Cập nhật danh sách vai trò
                            input={<OutlinedInput label="Chọn vai trò" />}
                            renderValue={(selected) => selected.join(', ')} // Hiển thị các vai trò đã chọn
                        >
                            {Object.values(UserRole).map((role) => ( // Lặp qua tất cả vai trò
                                <MenuItem key={role} value={role}>
                                    <Checkbox checked={(formData.targetRoles || []).indexOf(role) > -1} /> {/* Checkbox cho mỗi vai trò */}
                                    <ListItemText primary={role} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* Hiển thị khi chọn target = 'users' */}
                {formData.target === 'users' && (
                    <TextField
                        label="Danh sách User IDs (phân cách bằng dấu phẩy)"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="uuid1, uuid2, ..."
                        onChange={(e) => {
                            // Parse chuỗi thành mảng IDs (bỏ khoảng trắng, lọc rỗng)
                            const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                            handleChange("targetUserIds", ids); // Cập nhật danh sách user IDs
                        }}
                    />
                )}

                {/* Dropdown chọn kênh gửi */}
                <FormControl fullWidth>
                    <InputLabel>Kênh gửi</InputLabel>
                    <Select
                        value={formData.channel}
                        label="Kênh gửi"
                        onChange={(e) => handleChange("channel", e.target.value)} // Đổi kênh gửi
                    >
                        {Object.values(NotificationChannel).map((channel) => ( // Lặp qua tất cả kênh
                            <MenuItem key={channel} value={channel}>{channel}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Nút hành động: Hủy và Gửi */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                    <Button variant="outlined" onClick={() => navigate("/notifications")}>
                        Hủy {/* Quay lại trang danh sách */}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit} // Gửi thông báo
                        disabled={createMutation.isPending || !formData.title} // Disable nếu đang gửi hoặc chưa có tiêu đề
                    >
                        {createMutation.isPending ? "Đang gửi..." : "Gửi Thông báo"} {/* Đổi text theo trạng thái */}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
